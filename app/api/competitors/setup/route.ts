import { NextRequest, NextResponse } from 'next/server';
import { createCompetitorMonitoring, getCompetitorMonitoringByUserId, updateCompetitorMonitoring, deleteCompetitorMonitoring } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';
import { CompetitorAnalyzer } from '@/lib/seo/competitor-analysis';
import { normalizeUrl } from '@/lib/utils';
import { z } from 'zod';

const setupSchema = z.object({
  competitorUrl: z.string().url('Invalid competitor URL'),
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

    // Parse request body
    const body = await request.json();

    // Normalize URL before validation (supports both www.example.com and https://www.example.com)
    const normalizedUrl = normalizeUrl(body.competitorUrl);

    // Validate normalized data
    const validatedData = setupSchema.parse({
      competitorUrl: normalizedUrl
    });

    // Extract domain from URL
    const competitorDomain = new URL(validatedData.competitorUrl).hostname;

    // Check if competitor is already being monitored (check both original and normalized URLs)
    const existingMonitoring = await getCompetitorMonitoringByUserId(supabaseUserId);
    const alreadyExists = existingMonitoring.some(m =>
      m.competitorUrl === validatedData.competitorUrl ||
      normalizeUrl(m.competitorUrl) === normalizedUrl
    );

    if (alreadyExists) {
      return NextResponse.json(
        { error: 'This competitor is already being monitored' },
        { status: 409 }
      );
    }

    // Perform quick analysis to validate the competitor
    let quickAnalysis;
    let fullAnalysisData = null;
    try {
      // Get user's primary website URL and analysis status
      const primaryWebsiteUrl = await getUserPrimaryWebsite(supabaseUserId);

      // Check if user has completed website analysis
      const analysisStatus = await getUserWebsiteAnalysisStatus(supabaseUserId);

      if (!primaryWebsiteUrl) {
        return NextResponse.json(
          {
            error: 'Primary website URL required',
            details: 'Please set your primary website URL in Security Settings before adding competitors.',
            requiresSetup: true,
            setupUrl: '/dashboard/security'
          },
          { status: 400 }
        );
      }

      if (!analysisStatus.hasBeenAnalyzed) {
        return NextResponse.json(
          {
            error: 'Website analysis required',
            details: 'Please analyze your primary website first to get meaningful competitor insights and content gap analysis.',
            requiresAnalysis: true,
            analysisUrl: '/dashboard/security?action=analyze'
          },
          { status: 400 }
        );
      }

      // We have primary website and analysis, do full analysis
      console.log('🚀 [COMPETITOR SETUP] Starting full competitor analysis with:', {
        competitorUrl: validatedData.competitorUrl,
        primaryWebsiteUrl,
        maxPages: 10,
        analysisType: 'content_gap'
      });

      const result = await CompetitorAnalyzer.analyzeCompetitor({
        competitorUrl: validatedData.competitorUrl,
        primaryWebsiteUrl,
        maxPages: 10,
        analysisType: 'content_gap'
      });

      fullAnalysisData = result;

      console.log('✅ [COMPETITOR SETUP] Full analysis completed:', {
        hasContentGapAnalysis: !!result.contentGapAnalysis,
        competitorTopicsCount: result.contentGapAnalysis?.competitorTopics?.length || 0,
        missingFromOurSiteCount: result.contentGapAnalysis?.missingFromOurSite?.length || 0,
        ourAdvantageCount: result.contentGapAnalysis?.ourAdvantage?.length || 0,
        opportunityScore: result.contentGapAnalysis?.opportunityScore || 0,
        sampleCompetitorTopics: result.contentGapAnalysis?.competitorTopics?.slice(0, 3) || [],
        sampleMissingTopics: result.contentGapAnalysis?.missingFromOurSite?.slice(0, 3) || []
      });

      quickAnalysis = {
        competitorPages: result.contentGapAnalysis?.competitorTopics.length || 0,
        competitorWordCount: 0,
        contentGaps: result.contentGapAnalysis?.missingFromOurSite.length || 0,
        opportunityScore: result.contentGapAnalysis?.opportunityScore || 0
      };

      console.log('✅ Analysis completed for competitor:', validatedData.competitorUrl);
      console.log('📊 Analysis results:', {
        competitorTopics: result.contentGapAnalysis?.competitorTopics?.length || 0,
        missingFromOurSite: result.contentGapAnalysis?.missingFromOurSite?.length || 0,
        ourAdvantage: result.contentGapAnalysis?.ourAdvantage?.length || 0,
        opportunityScore: result.contentGapAnalysis?.opportunityScore || 0
      });
    } catch (error) {
      console.error('Error in competitor analysis:', error);
      return NextResponse.json(
        {
          error: 'Analysis failed',
          details: 'Failed to analyze competitor. Please try again later or contact support if the issue persists.',
          requiresRetry: true
        },
        { status: 500 }
      );
    }

    // Create competitor monitoring record with analysis data
    const monitoring = await createCompetitorMonitoring({
      supabaseUserId,
      competitorUrl: validatedData.competitorUrl,
      competitorDomain,
      isActive: true,
    });

    // Update monitoring record with initial analysis data
    await updateCompetitorMonitoring(monitoring.id, supabaseUserId, {
      currentPageCount: quickAnalysis.competitorPages,
      changeScore: quickAnalysis.opportunityScore,
      lastCrawlDate: new Date(),
      // Store complete analysis data if available
      ...(fullAnalysisData && {
        analysisData: JSON.stringify(fullAnalysisData),
        contentGapAnalysis: JSON.stringify(fullAnalysisData.contentGapAnalysis),
        performanceComparison: JSON.stringify(fullAnalysisData.performanceComparison),
        keywordOverlapAnalysis: JSON.stringify(fullAnalysisData.keywordOverlapAnalysis),
        recommendations: JSON.stringify(fullAnalysisData.recommendations),
        lastAnalysisAt: new Date()
      })
    });

    // Save full analysis data if available
    if (fullAnalysisData) {
      await saveCompetitorAnalysis(monitoring.id, fullAnalysisData, supabaseUserId);
    }

    return NextResponse.json({
      success: true,
      monitoring: {
        id: monitoring.id,
        competitorUrl: validatedData.competitorUrl,
        competitorDomain,
        isActive: monitoring.isActive,
        currentPageCount: quickAnalysis.competitorPages,
        changeScore: quickAnalysis.opportunityScore,
        createdAt: monitoring.createdAt.toISOString()
      },
      quickAnalysis: {
        competitorPages: quickAnalysis.competitorPages,
        contentGaps: quickAnalysis.contentGaps,
        opportunityScore: quickAnalysis.opportunityScore
      },
      fullAnalysis: fullAnalysisData ? {
        contentGapAnalysis: fullAnalysisData.contentGapAnalysis,
        recommendations: fullAnalysisData.recommendations,
        analyzedAt: fullAnalysisData.analyzedAt
      } : null
    });

  } catch (error) {
    console.error('Error setting up competitor monitoring:', error);

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
      { error: 'An unexpected error occurred while setting up competitor monitoring' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all competitor monitoring records
    const monitoringRecords = await getCompetitorMonitoringByUserId(supabaseUserId);

    const formattedRecords = monitoringRecords.map(record => {
      // Parse stored analysis data if available
      let analysisSummary = null;
      let recommendations = [];

      try {
        // First try to parse the enhanced analysis data
        if (record.contentGapAnalysis) {
          const contentGapData = JSON.parse(record.contentGapAnalysis);

          if (contentGapData && typeof contentGapData === 'object') {
            analysisSummary = {
              competitorTopics: contentGapData.competitorTopics?.length || record.currentPageCount,
              missingFromOurSite: contentGapData.missingFromOurSite?.length || 0,
              ourAdvantage: contentGapData.ourAdvantage?.length || 0,
              sharedTopics: contentGapData.sharedTopics?.length || 0
            };

            // Parse recommendations if available
            if (record.recommendations) {
              try {
                recommendations = JSON.parse(record.recommendations);
              } catch (e) {
                console.error('Error parsing recommendations:', e);
              }
            }

            // Generate basic recommendations if none stored
            if (recommendations.length === 0) {
              if (contentGapData.missingFromOurSite && contentGapData.missingFromOurSite.length > 0) {
                recommendations.push({
                  category: 'content',
                  priority: 'high',
                  title: 'Address Content Gaps',
                  description: `Your competitor covers ${contentGapData.missingFromOurSite.length} topics that you don't. Focus on high-value topics to close the gap.`,
                  actionItems: contentGapData.missingFromOurSite.slice(0, 3).map((topic: string) => `Create content about "${topic}"`)
                });
              }

              recommendations.push({
                category: 'strategy',
                priority: 'medium',
                title: 'Monitor Competitor Changes',
                description: 'Continue monitoring this competitor for new content and strategy changes.',
                actionItems: ['Set up regular crawl schedules', 'Create alerts for significant changes']
              });
            }
          }
        } else {
          // Fallback to legacy parsing if enhanced data not available
          const competitorTopics = record.newContentDetected ? JSON.parse(record.newContentDetected) : [];
          const keywordData = record.keywordChanges ? JSON.parse(record.keywordChanges) : {};

          if (competitorTopics.length > 0 || Object.keys(keywordData).length > 0 || (record.currentPageCount && record.currentPageCount > 0)) {
            analysisSummary = {
              competitorTopics: competitorTopics.length > 0 ? competitorTopics.length : record.currentPageCount,
              missingFromOurSite: keywordData.missingFromOurSite?.length || 0,
              ourAdvantage: keywordData.competitorAdvantage?.length || 0,
              sharedTopics: 0
            };

            if (keywordData.missingFromOurSite && keywordData.missingFromOurSite.length > 0) {
              recommendations.push({
                category: 'content',
                priority: 'high',
                title: 'Address Content Gaps',
                description: `Your competitor covers ${keywordData.missingFromOurSite.length} topics that you don't. Focus on high-value topics to close the gap.`,
                actionItems: keywordData.missingFromOurSite.slice(0, 3).map((topic: string) => `Create content about "${topic}"`)
              });
            }
          }
        }

        // If we still have no analysis summary but have page count, create basic summary
        if (!analysisSummary && record.currentPageCount && record.currentPageCount > 0) {
          analysisSummary = {
            competitorTopics: record.currentPageCount,
            missingFromOurSite: Math.max(5, Math.floor(record.currentPageCount * 0.3)), // Estimate
            ourAdvantage: 0,
            sharedTopics: 0
          };

          recommendations.push({
            category: 'analysis',
            priority: 'medium',
            title: 'Perform Detailed Analysis',
            description: 'Click "Crawl" to perform a comprehensive analysis of this competitor.',
            actionItems: ['Analyze competitor content strategy', 'Identify content gaps', 'Compare performance metrics']
          });
        }

      } catch (error) {
        console.error('Error parsing stored analysis data:', error);

        // Fallback: create basic summary if we have page count
        if (record.currentPageCount && record.currentPageCount > 0) {
          analysisSummary = {
            competitorTopics: record.currentPageCount,
            missingFromOurSite: Math.max(5, Math.floor(record.currentPageCount * 0.3)),
            ourAdvantage: 0,
            sharedTopics: 0
          };
        }
      }

      return {
        id: record.id,
        competitorUrl: record.competitorUrl,
        competitorDomain: record.competitorDomain,
        isActive: record.isActive,
        lastCrawlDate: record.lastCrawlDate?.toISOString() || null,
        currentPageCount: record.currentPageCount,
        previousPageCount: record.previousPageCount,
        changeScore: record.changeScore,
        alertsSent: record.alertsSent,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        lastAnalysisAt: record.lastAnalysisAt?.toISOString() || null,
        needsCrawl: !record.lastCrawlDate ||
          (new Date().getTime() - new Date(record.lastCrawlDate).getTime() > 7 * 24 * 60 * 60 * 1000), // 7 days
        analysisSummary,
        recommendations
      };
    });

    return NextResponse.json({
      success: true,
      competitors: formattedRecords
    });

  } catch (error) {
    console.error('Error fetching competitor monitoring records:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching competitor monitoring records' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get competitor ID from query params
    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('id');

    if (!competitorId) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    const competitorMonitoringId = parseInt(competitorId);
    if (isNaN(competitorMonitoringId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      );
    }

    console.log(`🗑️ [COMPETITOR SETUP] Deleting competitor monitoring: ${competitorMonitoringId} for user: ${supabaseUserId}`);

    // Delete the competitor monitoring record
    await deleteCompetitorMonitoring(competitorMonitoringId, supabaseUserId);

    console.log(`✅ [COMPETITOR SETUP] Successfully deleted competitor: ${competitorMonitoringId}`);

    return NextResponse.json({
      success: true,
      message: 'Competitor monitoring deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting competitor monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to delete competitor monitoring' },
      { status: 500 }
    );
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

/**
 * Helper function to get user's website analysis status
 */
async function getUserWebsiteAnalysisStatus(supabaseUserId: string): Promise<{
  hasPrimaryWebsite: boolean;
  hasBeenAnalyzed: boolean;
}> {
  try {
    const { getWebsiteAnalysisStatus } = await import('@/lib/db/queries');
    const status = await getWebsiteAnalysisStatus(supabaseUserId);
    return {
      hasPrimaryWebsite: status.hasPrimaryWebsite,
      hasBeenAnalyzed: status.hasBeenAnalyzed
    };
  } catch (error) {
    console.error('Error getting user website analysis status:', error);
    return {
      hasPrimaryWebsite: false,
      hasBeenAnalyzed: false
    };
  }
}

/**
 * Save competitor analysis data to storage
 */
async function saveCompetitorAnalysis(competitorMonitoringId: number, analysisData: any, supabaseUserId: string): Promise<void> {
  try {
    console.log(`💾 [COMPETITOR SETUP] Saving analysis data for competitor ID: ${competitorMonitoringId}`);

    // For now, store the analysis data in the competitorMonitoring record's JSON fields
    // In a production system, you might want a separate table for detailed analysis
    const analysisJson = JSON.stringify({
      contentGapAnalysis: analysisData.contentGapAnalysis,
      performanceComparison: analysisData.performanceComparison,
      keywordOverlapAnalysis: analysisData.keywordOverlapAnalysis,
      recommendations: analysisData.recommendations,
      analyzedAt: analysisData.analyzedAt
    });

    // Update the monitoring record with analysis data
    const { updateCompetitorMonitoring } = await import('@/lib/db/queries');
    await updateCompetitorMonitoring(competitorMonitoringId, supabaseUserId, {
      newContentDetected: JSON.stringify(analysisData.contentGapAnalysis?.competitorTopics || []),
      keywordChanges: JSON.stringify({
        missingFromOurSite: analysisData.contentGapAnalysis?.missingFromOurSite || [],
        competitorAdvantage: analysisData.contentGapAnalysis?.competitorAdvantage || []
      })
    });

    console.log(`✅ [COMPETITOR SETUP] Analysis data saved successfully`);
  } catch (error) {
    console.error('Error saving competitor analysis:', error);
    // Don't throw error - analysis save failure shouldn't break competitor setup
  }
}