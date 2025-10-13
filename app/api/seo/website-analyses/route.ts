import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteAnalysesByUserId, getRecentWebsiteAnalysis } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeTotals = searchParams.get('includeTotals') === 'true';

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Get website analyses from database
    const analyses = await getWebsiteAnalysesByUserId(supabaseUserId, limit, offset);

    // Format analyses for API response
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      url: analysis.url,
      domain: analysis.domain,
      totalWordCount: analysis.totalWordCount || 0,
      totalImages: analysis.totalImages || 0,
      topics: analysis.topics ? JSON.parse(analysis.topics) : [],
      keywords: analysis.keywords ? JSON.parse(analysis.keywords) : {},
      contentGaps: analysis.contentGaps ? JSON.parse(analysis.contentGaps) : [],
      internalLinkingScore: analysis.internalLinkingScore || 0,
      technicalIssues: analysis.technicalIssues ? JSON.parse(analysis.technicalIssues) : [],
      crawledAt: analysis.crawledAt.toISOString(),
      totalPages: 0, // This would need to be calculated from crawled_pages table if needed
    }));

    // Add totals if requested
    let totals = null;
    if (includeTotals) {
      const recentAnalyses = await getRecentWebsiteAnalysis(supabaseUserId);
      const allAnalyses = await getWebsiteAnalysesByUserId(supabaseUserId, 1000, 0);

      totals = {
        totalAnalyses: allAnalyses.length,
        totalWordCount: allAnalyses.reduce((sum, analysis) => sum + (analysis.totalWordCount || 0), 0),
        totalImages: allAnalyses.reduce((sum, analysis) => sum + (analysis.totalImages || 0), 0),
        lastAnalysisDate: allAnalyses.length > 0 ? allAnalyses[0].crawledAt.toISOString() : null,
        domainsAnalyzed: [...new Set(allAnalyses.map(a => a.domain))].length,
      };
    }

    return NextResponse.json({
      success: true,
      analyses: formattedAnalyses,
      pagination: {
        limit,
        offset,
        hasMore: analyses.length === limit
      },
      totals
    });

  } catch (error) {
    console.error('Error fetching website analyses:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching website analyses' },
      { status: 500 }
    );
  }
}