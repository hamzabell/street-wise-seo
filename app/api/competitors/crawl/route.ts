import { NextRequest, NextResponse } from 'next/server';
import { getCompetitorMonitoringById, updateCompetitorMonitoring } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';
import { CompetitorAnalyzer, analyzeCompetitor } from '@/lib/seo/competitor-analysis';
import { ChangeDetectionEngine } from '@/lib/seo/change-detection';
import { z } from 'zod';

const crawlSchema = z.object({
  competitorMonitoringId: z.number(),
  analysisType: z.enum(['content_gap', 'performance_comparison', 'keyword_overlap']).default('content_gap'),
  maxPages: z.number().min(1).max(30).default(15),
  forceRefresh: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = crawlSchema.parse(body);

    // Get competitor monitoring record
    const monitoring = await getCompetitorMonitoringById(validatedData.competitorMonitoringId, supabaseUserId);
    if (!monitoring) {
      return NextResponse.json(
        { error: 'Competitor monitoring record not found' },
        { status: 404 }
      );
    }

    // Check if we need to respect crawl delay
    if (!validatedData.forceRefresh && monitoring.lastCrawlDate) {
      const lastCrawl = new Date(monitoring.lastCrawlDate);
      const now = new Date();
      const hoursSinceLastCrawl = (now.getTime() - lastCrawl.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastCrawl < 24) {
        return NextResponse.json(
          { error: 'Competitor was crawled recently. Please wait at least 24 hours between crawls or use forceRefresh.' },
          { status: 429 }
        );
      }
    }

    // Get user's primary website URL
    const primaryWebsiteUrl = await getUserPrimaryWebsite(supabaseUserId);
    if (!primaryWebsiteUrl) {
      return NextResponse.json(
        { error: 'Primary website URL not found. Please analyze your website first.' },
        { status: 400 }
      );
    }

    // Perform competitor analysis
    console.log(`🔍 [COMPETITOR CRAWL] Starting crawl for: ${monitoring.competitorDomain}`);

    let analysisResult;
    let changeResult = null;

    try {
      console.log('🚀 [COMPETITOR CRAWL] Starting competitor analysis with parameters:', {
        competitorUrl: monitoring.competitorUrl,
        primaryWebsiteUrl,
        maxPages: validatedData.maxPages,
        analysisType: validatedData.analysisType
      });

      analysisResult = await analyzeCompetitor({
        competitorUrl: monitoring.competitorUrl,
        primaryWebsiteUrl,
        maxPages: validatedData.maxPages,
        analysisType: validatedData.analysisType
      });

      console.log('✅ [COMPETITOR CRAWL] Analysis completed successfully:', {
        hasContentGapAnalysis: !!analysisResult.contentGapAnalysis,
        competitorTopicsCount: analysisResult.contentGapAnalysis?.competitorTopics?.length || 0,
        missingFromOurSiteCount: analysisResult.contentGapAnalysis?.missingFromOurSite?.length || 0,
        ourAdvantageCount: analysisResult.contentGapAnalysis?.ourAdvantage?.length || 0,
        opportunityScore: analysisResult.contentGapAnalysis?.opportunityScore || 0
      });

      // Get previous analysis for change detection
      const previousAnalysis = await getPreviousAnalysis(monitoring.id);

      if (previousAnalysis) {
        // Detect changes
        changeResult = await ChangeDetectionEngine.detectChanges(
          monitoring.competitorUrl,
          previousAnalysis,
          analysisResult
        );

        console.log(`📊 [COMPETITOR CRAWL] Changes detected:`, {
          contentChanges: changeResult.contentChanges.length,
          keywordChanges: changeResult.keywordChanges.length,
          changeScore: changeResult.overallChangeScore
        });
      }

      // Prepare data for database update with complete analysis storage
      const updateData = {
        lastCrawlDate: new Date(),
        previousPageCount: monitoring.currentPageCount || 0,
        currentPageCount: analysisResult.contentGapAnalysis?.competitorTopics?.length || 0,
        newContentDetected: JSON.stringify(analysisResult.contentGapAnalysis?.competitorTopics || []),
        keywordChanges: JSON.stringify({
          missingFromOurSite: analysisResult.contentGapAnalysis?.missingFromOurSite || [],
          competitorAdvantage: analysisResult.contentGapAnalysis?.competitorAdvantage || [],
          ourAdvantage: analysisResult.contentGapAnalysis?.ourAdvantage || []
        }),
        changeScore: changeResult?.overallChangeScore || analysisResult.contentGapAnalysis?.opportunityScore || 0,
        alertsSent: (monitoring.alertsSent || 0) + (changeResult?.alerts?.length || 0),
        // Enhanced analysis storage
        analysisData: JSON.stringify(analysisResult),
        contentGapAnalysis: JSON.stringify(analysisResult.contentGapAnalysis),
        performanceComparison: JSON.stringify(analysisResult.performanceComparison),
        keywordOverlapAnalysis: JSON.stringify(analysisResult.keywordOverlapAnalysis),
        recommendations: JSON.stringify(analysisResult.recommendations),
        lastAnalysisAt: new Date()
      };

      console.log('💾 [COMPETITOR CRAWL] Preparing to update database with data:', {
        currentPageCount: updateData.currentPageCount,
        newContentDetectedLength: updateData.newContentDetected.length,
        keywordChangesLength: updateData.keywordChanges.length,
        changeScore: updateData.changeScore,
        competitorTopicsSample: analysisResult.contentGapAnalysis?.competitorTopics?.slice(0, 3) || [],
        missingFromOurSiteSample: analysisResult.contentGapAnalysis?.missingFromOurSite?.slice(0, 3) || []
      });

      // Update monitoring record with analysis results
      await updateCompetitorMonitoring(monitoring.id, supabaseUserId, updateData);

      console.log('✅ [COMPETITOR CRAWL] Database update completed successfully');

      // Save analysis for future change detection
      await saveAnalysisData(monitoring.id, analysisResult, changeResult);

      console.log(`✅ [COMPETITOR CRAWL] Successfully crawled: ${monitoring.competitorDomain}`);
      console.log('📊 Crawl Analysis Results:', {
        competitorTopicsCount: analysisResult.contentGapAnalysis?.competitorTopics?.length || 0,
        missingFromOurSiteCount: analysisResult.contentGapAnalysis?.missingFromOurSite?.length || 0,
        ourAdvantageCount: analysisResult.contentGapAnalysis?.ourAdvantage?.length || 0,
        opportunityScore: analysisResult.contentGapAnalysis?.opportunityScore || 0,
        changeScore: changeResult?.overallChangeScore || 0
      });

      // Format response for frontend consumption
      const responseData = {
        crawledAt: analysisResult.analyzedAt,
        pageCount: analysisResult.contentGapAnalysis?.competitorTopics?.length || 0,
        pageChange: (analysisResult.contentGapAnalysis?.competitorTopics?.length || 0) - (monitoring.currentPageCount || 0),
        newContentCount: changeResult?.contentChanges?.length || 0,
        removedContentCount: changeResult?.contentChanges?.filter((c: any) => c.type === 'removed')?.length || 0,
        changeScore: changeResult?.overallChangeScore || analysisResult.contentGapAnalysis?.opportunityScore || 0,
        contentGaps: analysisResult.contentGapAnalysis?.missingFromOurSite?.length || 0,
        opportunityScore: analysisResult.contentGapAnalysis?.opportunityScore || 0,
        analysisSummary: {
          competitorTopics: analysisResult.contentGapAnalysis?.competitorTopics?.length || 0,
          missingFromOurSite: analysisResult.contentGapAnalysis?.missingFromOurSite?.length || 0,
          ourAdvantage: analysisResult.contentGapAnalysis?.ourAdvantage?.length || 0,
          sharedTopics: analysisResult.contentGapAnalysis?.sharedTopics?.length || 0,
        },
        newContentDetected: analysisResult.contentGapAnalysis?.competitorTopics?.slice(0, 5) || [],
        removedContentDetected: changeResult?.contentChanges?.filter((c: any) => c.type === 'removed')?.map((c: any) => c.content).slice(0, 5) || [],
        recommendations: analysisResult.recommendations || []
      };

      return NextResponse.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error(`❌ [COMPETITOR CRAWL] Error crawling ${monitoring.competitorDomain}:`, error);

      // Update monitoring record with error info
      await updateCompetitorMonitoring(monitoring.id, supabaseUserId, {
        lastCrawlDate: new Date(),
        currentPageCount: 0,
        changeScore: 0
      });

      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('network')) {
          return NextResponse.json(
            { error: 'Failed to crawl competitor website. The site may be temporarily unavailable or blocking our requests.' },
            { status: 503 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to analyze competitor website. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in competitor crawl API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while crawling competitor' },
      { status: 500 }
    );
  }
}

/**
 * Get previous analysis for change detection
 * This would fetch from storage where previous analyses are saved
 */
async function getPreviousAnalysis(competitorMonitoringId: number): Promise<any> {
  try {
    // This would fetch the previous analysis from storage
    // For now, return null (no previous analysis)
    return null;
  } catch (error) {
    console.error('Error getting previous analysis:', error);
    return null;
  }
}

/**
 * Save analysis data for future change detection
 */
async function saveAnalysisData(
  competitorMonitoringId: number,
  analysisResult: any,
  changeResult: any
): Promise<void> {
  try {
    // This would save the analysis to storage (file, database, etc.)
    console.log(`💾 [COMPETITOR CRAWL] Saving analysis data for competitor ID: ${competitorMonitoringId}`);

    // Store with timestamp for change detection
    const analysisData = {
      competitorMonitoringId,
      analysisResult,
      changeResult,
      savedAt: new Date().toISOString()
    };

    // Implementation would save to database or file system
  } catch (error) {
    console.error('Error saving analysis data:', error);
  }
}

/**
 * Helper function to get user's primary website URL
 */
async function getUserPrimaryWebsite(supabaseUserId: string): Promise<string | null> {
  try {
    const { getUserPrimaryWebsiteUrl } = await import('@/lib/db/queries');
    return await getUserPrimaryWebsiteUrl(supabaseUserId);
  } catch (error) {
    console.error('Error getting user primary website:', error);
    return null;
  }
}