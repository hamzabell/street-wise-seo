import { NextRequest, NextResponse } from 'next/server';
import { getPerformanceScorer } from '@/lib/seo/performance-scorer';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';
import { jobManager } from '@/lib/background/job-manager';
import { JobType, JobPriority } from '@/lib/background/job-types';
import { isFeatureEnabled } from '@/lib/utils';

const PerformanceScoreRequestSchema = z.object({
  domain: z.string().min(1),
  includeRecommendations: z.boolean().default(true),
  includeFactors: z.boolean().default(false),
  background: z.boolean().default(false), // New option for background processing
});

// GET /api/seo/performance-score - Get performance score for a domain
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
    const includeFactors = searchParams.get('includeFactors') === 'true';
    const background = searchParams.get('background') === 'true';

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    // Handle background processing
    if (background) {
      console.log(`🔄 [PERFORMANCE API] Processing ${domain} as background job`);

      // Create background job
      const jobId = await jobManager.enqueueJob({
        type: JobType.PERFORMANCE_ANALYSIS,
        userId: supabaseUserId,
        domain,
        includeRecommendations,
        includeFactors,
        priority: JobPriority.NORMAL,
      });

      return NextResponse.json({
        success: true,
        data: {
          jobId,
          status: 'queued',
          message: 'Performance analysis has been queued for background processing. You can track the progress in the dashboard.',
        },
      });
    }

    console.log('📊 [API:PERFORMANCE-SCORE] Calculating performance score', {
      domain,
      includeRecommendations,
      includeFactors,
      userId: supabaseUserId,
    });

    const scorer = getPerformanceScorer();
    const score = await scorer.calculatePerformanceScore(domain);

    const response: any = {
      success: true,
      score,
      metadata: {
        domain,
        calculatedAt: new Date().toISOString(),
        grade: score.grade,
        overallScore: score.overall,
      }
    };

    if (includeRecommendations) {
      const recommendations = await scorer.getPerformanceRecommendations(domain);
      response.recommendations = recommendations;
    }

    console.log('✅ [API:PERFORMANCE-SCORE] Score calculated successfully', {
      domain,
      overall: score.overall,
      grade: score.grade,
      trend: score.trends?.direction,
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [API:PERFORMANCE-SCORE] Error calculating performance score:', error);

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while calculating performance score' },
      { status: 500 }
    );
  }
}

// POST /api/seo/performance-score - Calculate detailed performance analysis
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
    const validatedData = PerformanceScoreRequestSchema.parse(body);

    console.log('📊 [API:PERFORMANCE-SCORE] Calculating detailed performance analysis', {
      domain: validatedData.domain,
      includeRecommendations: validatedData.includeRecommendations,
      includeFactors: validatedData.includeFactors,
      background: validatedData.background,
      userId: supabaseUserId,
    });

    // Handle background processing
    if (validatedData.background) {
      console.log(`🔄 [PERFORMANCE API] Processing ${validatedData.domain} as background job`);

      // Create background job
      const jobId = await jobManager.enqueueJob({
        type: JobType.PERFORMANCE_ANALYSIS,
        userId: supabaseUserId,
        domain: validatedData.domain,
        includeRecommendations: validatedData.includeRecommendations,
        includeFactors: validatedData.includeFactors,
        priority: JobPriority.NORMAL,
      });

      return NextResponse.json({
        success: true,
        data: {
          jobId,
          status: 'queued',
          message: 'Performance analysis has been queued for background processing. You can track the progress in the dashboard.',
        },
      });
    }

    const scorer = getPerformanceScorer();
    const score = await scorer.calculatePerformanceScore(validatedData.domain);

    const response: any = {
      success: true,
      score,
      metadata: {
        domain: validatedData.domain,
        calculatedAt: new Date().toISOString(),
        analysisType: 'detailed',
      }
    };

    if (validatedData.includeRecommendations) {
      const recommendations = await scorer.getPerformanceRecommendations(validatedData.domain);
      response.recommendations = recommendations;
    }

    // Generate additional insights
    const insights = await generatePerformanceInsights(score);
    response.insights = insights;

    console.log('✅ [API:PERFORMANCE-SCORE] Detailed analysis completed', {
      domain: validatedData.domain,
      overall: score.overall,
      grade: score.grade,
      insightsCount: Object.keys(insights).length,
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [API:PERFORMANCE-SCORE] Error calculating detailed analysis:', error);

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
      { error: 'An unexpected error occurred while calculating detailed analysis' },
      { status: 500 }
    );
  }
}

/**
 * Generate additional insights from the performance score
 */
async function generatePerformanceInsights(score: any): Promise<{
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  quickWins: string[];
  longTerm: string[];
}> {
  const insights = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    opportunities: [] as string[],
    quickWins: [] as string[],
    longTerm: [] as string[],
  };

  // Analyze strengths
  if (score.ranking >= 80) {
    insights.strengths.push('Strong keyword rankings with good visibility in search results');
  }
  if (score.content >= 80) {
    insights.strengths.push('High-quality content that provides excellent value to users');
  }
  if (score.technical >= 80) {
    insights.strengths.push('Solid technical SEO foundation supporting overall performance');
  }
  if (score.traffic >= 80) {
    insights.strengths.push('Strong organic traffic and user engagement metrics');
  }
  if (score.authority >= 80) {
    insights.strengths.push('Good domain authority and online presence');
  }

  // Analyze weaknesses
  if (score.ranking < 50) {
    insights.weaknesses.push('Poor keyword rankings limiting organic visibility');
  }
  if (score.content < 50) {
    insights.weaknesses.push('Content quality issues affecting user experience and rankings');
  }
  if (score.technical < 50) {
    insights.weaknesses.push('Technical SEO problems hindering search engine crawling and indexing');
  }
  if (score.traffic < 50) {
    insights.weaknesses.push('Low organic traffic and poor user engagement');
  }
  if (score.authority < 50) {
    insights.weaknesses.push('Limited domain authority and online reputation');
  }

  // Identify opportunities
  if (score.ranking >= 60 && score.ranking < 80) {
    insights.opportunities.push('Optimize existing rankings to break into top positions');
  }
  if (score.content >= 60 && score.content < 80) {
    insights.opportunities.push('Enhance content depth and quality to improve rankings');
  }
  if (score.technical >= 60 && score.technical < 80) {
    insights.opportunities.push('Fine-tune technical elements for optimal performance');
  }

  // Quick wins (high impact, low effort)
  if (score.technical < 70) {
    insights.quickWins.push('Resolve technical SEO issues for immediate ranking improvements');
  }
  if (score.content >= 60 && score.content < 75) {
    insights.quickWins.push('Optimize existing content with better on-page SEO elements');
  }
  if (score.ranking >= 11 && score.ranking <= 20) {
    insights.quickWins.push('Focus on keywords ranking on page 2 to push them into top 10');
  }

  // Long-term strategies
  if (score.authority < 70) {
    insights.longTerm.push('Build domain authority through strategic link building and content marketing');
  }
  if (score.content < 70) {
    insights.longTerm.push('Develop comprehensive content strategy targeting high-value keywords');
  }
  if (score.traffic < 70) {
    insights.longTerm.push('Improve user experience and conversion optimization to maximize traffic value');
  }

  // Trend-based insights
  if (score.trends.direction === 'up') {
    insights.strengths.push(`Positive performance trend with ${Math.abs(score.trends.change)} point improvement`);
  } else if (score.trends.direction === 'down') {
    insights.weaknesses.push(`Declining performance trend with ${Math.abs(score.trends.change)} point decrease`);
  }

  return insights;
}