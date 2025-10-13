import { NextRequest, NextResponse } from 'next/server';
import { generateContentPerformanceReport } from '@/lib/seo/content-performance-tracker';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';
import { isFeatureEnabled } from '@/lib/utils';

const ContentPerformanceRequestSchema = z.object({
  domain: z.string().min(1),
  includeRecommendations: z.boolean().default(true),
  includeTechnicalIssues: z.boolean().default(true),
  includeOptimizationRoadmap: z.boolean().default(true),
});

// GET /api/seo/content-performance - Generate content performance report
export async function GET(request: NextRequest) {
  try {
    // Check if performance feature is enabled
    if (!isFeatureEnabled('PERFORMANCE_FEATURE')) {
      return NextResponse.json(
        { error: 'Performance tracking feature is not available' },
        { status: 403 }
      );
    }

    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const includeRecommendations = searchParams.get('includeRecommendations') !== 'false';
    const includeTechnicalIssues = searchParams.get('includeTechnicalIssues') !== 'false';
    const includeOptimizationRoadmap = searchParams.get('includeOptimizationRoadmap') !== 'false';

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    console.log('📊 [API:CONTENT-PERFORMANCE] Generating content performance report', {
      domain,
      includeRecommendations,
      includeTechnicalIssues,
      includeOptimizationRoadmap,
      userId: supabaseUserId,
    });

    const report = await generateContentPerformanceReport(domain);

    // Filter report based on request parameters
    const filteredReport = { ...report };

    if (!includeRecommendations) {
      delete (filteredReport as any).contentRecommendations;
      delete (filteredReport as any).topPerformingContent;
      delete (filteredReport as any).underperformingContent;
    }

    if (!includeTechnicalIssues) {
      delete (filteredReport as any).technicalSeoIssues;
    }

    if (!includeOptimizationRoadmap) {
      delete (filteredReport as any).optimizationRoadmap;
    }

    console.log('✅ [API:CONTENT-PERFORMANCE] Report generated successfully', {
      domain: report.domain,
      totalContent: report.totalContentPieces,
      averageScore: report.averageContentScore,
      topPerformers: report.topPerformingContent.length,
    });

    return NextResponse.json({
      success: true,
      report: filteredReport,
      metadata: {
        generatedAt: report.reportDate,
        filters: {
          includeRecommendations,
          includeTechnicalIssues,
          includeOptimizationRoadmap,
        },
      }
    });

  } catch (error) {
    console.error('❌ [API:CONTENT-PERFORMANCE] Error generating report:', error);

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (error.message.includes('No website analysis found')) {
        return NextResponse.json(
          { error: 'No website analysis found for this domain. Please run a website crawl first.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while generating content performance report' },
      { status: 500 }
    );
  }
}

// POST /api/seo/content-performance - Generate detailed performance analysis
export async function POST(request: NextRequest) {
  try {
    // Check if performance feature is enabled
    if (!isFeatureEnabled('PERFORMANCE_FEATURE')) {
      return NextResponse.json(
        { error: 'Performance tracking feature is not available' },
        { status: 403 }
      );
    }

    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = ContentPerformanceRequestSchema.parse(body);

    console.log('📊 [API:CONTENT-PERFORMANCE] Generating detailed performance analysis', {
      domain: validatedData.domain,
      includeRecommendations: validatedData.includeRecommendations,
      includeTechnicalIssues: validatedData.includeTechnicalIssues,
      includeOptimizationRoadmap: validatedData.includeOptimizationRoadmap,
      userId: supabaseUserId,
    });

    const report = await generateContentPerformanceReport(validatedData.domain);

    // Generate additional insights
    const insights = await generateAdditionalInsights(report);

    // Filter report based on request parameters
    const filteredReport = { ...report };

    if (!validatedData.includeRecommendations) {
      delete (filteredReport as any).contentRecommendations;
    }

    if (!validatedData.includeTechnicalIssues) {
      delete (filteredReport as any).technicalSeoIssues;
    }

    if (!validatedData.includeOptimizationRoadmap) {
      delete (filteredReport as any).optimizationRoadmap;
    }

    console.log('✅ [API:CONTENT-PERFORMANCE] Detailed analysis completed', {
      domain: report.domain,
      totalContent: report.totalContentPieces,
      averageScore: report.averageContentScore,
      insightsGenerated: Object.keys(insights).length,
    });

    return NextResponse.json({
      success: true,
      report: filteredReport,
      insights,
      metadata: {
        generatedAt: report.reportDate,
        analysisType: 'detailed',
        filters: validatedData,
      }
    });

  } catch (error) {
    console.error('❌ [API:CONTENT-PERFORMANCE] Error generating detailed analysis:', error);

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

      if (error.message.includes('No website analysis found')) {
        return NextResponse.json(
          { error: 'No website analysis found for this domain. Please run a website crawl first.' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while generating detailed analysis' },
      { status: 500 }
    );
  }
}

/**
 * Generate additional insights from the performance report
 */
async function generateAdditionalInsights(report: any): Promise<{
  contentStrategy: string[];
  technicalPriorities: string[];
  performanceTrends: string[];
  competitiveAdvantages: string[];
}> {
  const insights = {
    contentStrategy: [] as string[],
    technicalPriorities: [] as string[],
    performanceTrends: [] as string[],
    competitiveAdvantages: [] as string[],
  };

  // Content strategy insights
  if (report.averageContentScore < 60) {
    insights.contentStrategy.push('Overall content quality needs improvement - focus on depth and value');
  }

  if (report.topPerformingContent.length > 0) {
    const topTopics = report.topPerformingContent
      .slice(0, 3)
      .map((content: any) => content.title.split(' ').slice(0, 3).join(' '));
    insights.contentStrategy.push(`Top performing content focuses on: ${topTopics.join(', ')}`);
  }

  if (report.underperformingContent.length > report.totalContentPieces * 0.3) {
    insights.contentStrategy.push('High percentage of underperforming content - consider content audit and consolidation');
  }

  // Technical priorities
  const highSeverityIssues = report.technicalSeoIssues.filter((issue: any) => issue.severity === 'high');
  if (highSeverityIssues.length > 0) {
    insights.technicalPriorities.push(`${highSeverityIssues.length} high-priority technical issues need immediate attention`);
  }

  if (report.contentGapsAnalysis.criticalGaps.length > 0) {
    insights.technicalPriorities.push(`Address critical content gaps: ${report.contentGapsAnalysis.criticalGaps.slice(0, 2).join(', ')}`);
  }

  // Performance trends
  const improvingRatio = report.keywordPerformance.improvingKeywords / report.keywordPerformance.totalKeywordsTracked;
  if (improvingRatio > 0.4) {
    insights.performanceTrends.push('Strong positive ranking trends - continue current strategy');
  } else if (improvingRatio < 0.2) {
    insights.performanceTrends.push('Declining performance - requires strategy reassessment');
  }

  if (report.keywordPerformance.keywordsInTop10 / report.keywordPerformance.totalKeywordsTracked > 0.3) {
    insights.performanceTrends.push('Good page 1 visibility - focus on maintaining and improving current rankings');
  }

  // Competitive advantages
  if (report.averageContentScore > 70) {
    insights.competitiveAdvantages.push('High content quality scores indicate strong competitive positioning');
  }

  if (report.topPerformingContent.some((content: any) => content.contentDepthScore > 80)) {
    insights.competitiveAdvantages.push('Deep, comprehensive content provides competitive edge');
  }

  if (report.technicalSeoIssues.length < report.totalContentPieces * 0.1) {
    insights.competitiveAdvantages.push('Strong technical SEO foundation supports better rankings');
  }

  return insights;
}