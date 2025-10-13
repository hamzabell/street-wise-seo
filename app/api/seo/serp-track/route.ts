import { NextRequest, NextResponse } from 'next/server';
import { trackKeywordRankings, SERPTrackingRequest, SERPTrackingRequestSchema } from '@/lib/seo/serp-tracker';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';
import { isFeatureEnabled } from '@/lib/utils';

// Extended schema for API with additional validation
const SERPTrackAPISchema = z.object({
  keywords: z.array(z.string().min(1)).min(1).max(50),
  domain: z.string().min(1),
  searchEngine: z.enum(['google', 'bing', 'duckduckgo']).default('google'),
  location: z.string().optional(),
  language: z.string().default('en'),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
  maxResults: z.number().min(10).max(100).default(50),
  useProxy: z.boolean().default(false),
  proxyConfig: z.object({
    server: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
  }).optional(),
  saveToDatabase: z.boolean().default(true),
  compareWithHistory: z.boolean().default(true),
});

export type SERPTrackAPIRequest = z.infer<typeof SERPTrackAPISchema>;

// POST /api/seo/serp-track - Track keyword rankings
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = SERPTrackAPISchema.parse(body);

    console.log('🚀 [API:SERP-TRACK] Starting SERP tracking request', {
      keywords: validatedData.keywords.length,
      domain: validatedData.domain,
      searchEngine: validatedData.searchEngine,
      device: validatedData.device,
      userId: supabaseUserId
    });

    // Validate domain format
    try {
      new URL(`https://${validatedData.domain}`);
    } catch {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Prepare tracking request
    const trackingRequest: SERPTrackingRequest = {
      keywords: validatedData.keywords,
      domain: validatedData.domain,
      searchEngine: validatedData.searchEngine,
      location: validatedData.location,
      language: validatedData.language,
      device: validatedData.device,
      maxResults: validatedData.maxResults,
      useProxy: validatedData.useProxy,
      proxyConfig: validatedData.proxyConfig,
    };

    // Track keyword rankings
    const session = await trackKeywordRankings(trackingRequest);

    // Process results
    const processedResults = await Promise.all(
      session.results.map(async (result) => {
        const processedResult = { ...result };

        // Add historical comparison if requested
        if (validatedData.compareWithHistory && result.rank > 0) {
          const tracker = require('@/lib/seo/serp-tracker').getSERPTracker();
          const historicalComparison = await tracker.compareWithHistory(result.keyword, result.rank);
          (processedResult as any).previousRank = historicalComparison.previousRank;
          (processedResult as any).rankChange = historicalComparison.rankChange;
          (processedResult as any).trend = historicalComparison.trend;
        }

        return processedResult;
      })
    );

    // Calculate summary statistics
    const foundRankings = processedResults.filter(r => r.rank > 0);
    const top10Rankings = foundRankings.filter(r => r.rank <= 10);
    const top3Rankings = foundRankings.filter(r => r.rank <= 3);

    const summary = {
      totalKeywords: session.totalKeywords,
      successfulQueries: session.successfulQueries,
      failedQueries: session.failedQueries,
      keywordsFound: foundRankings.length,
      keywordsInTop10: top10Rankings.length,
      keywordsInTop3: top3Rankings.length,
      averageRank: foundRankings.length > 0
        ? Math.round(foundRankings.reduce((sum, r) => sum + r.rank, 0) / foundRankings.length)
        : 0,
      serpFeaturesDetected: processedResults.some(r =>
        r.serpFeatures.featuredSnippet ||
        r.serpFeatures.localPack ||
        r.serpFeatures.shoppingResults
      ),
    };

    console.log('✅ [API:SERP-TRACK] SERP tracking completed', {
      sessionId: session.id,
      successfulQueries: session.successfulQueries,
      failedQueries: session.failedQueries,
      keywordsFound: foundRankings.length,
      processingTime: new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      summary,
      results: processedResults,
      errors: session.errors,
      metadata: {
        startTime: session.startTime,
        endTime: session.endTime,
        searchEngine: validatedData.searchEngine,
        location: validatedData.location || 'Global',
        device: validatedData.device,
        maxResults: validatedData.maxResults,
      }
    });

  } catch (error) {
    console.error('❌ [API:SERP-TRACK] Error tracking SERP rankings:', error);

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
      { error: 'An unexpected error occurred while tracking SERP rankings' },
      { status: 500 }
    );
  }
}

// GET /api/seo/serp-track - Get recent tracking sessions or check status
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
    const keyword = searchParams.get('keyword');
    const limit = parseInt(searchParams.get('limit') || '30');

    console.log('📊 [API:SERP-TRACK] Fetching SERP tracking data', {
      keyword,
      limit,
      userId: supabaseUserId
    });

    // Fetch recent performance tracking data
    const { getPerformanceTrackingByKeyword, getPerformanceTrackingByUserId } = await import('@/lib/db/queries');

    let trackingData;
    if (keyword) {
      trackingData = await getPerformanceTrackingByKeyword(keyword, supabaseUserId, limit);
    } else {
      trackingData = await getPerformanceTrackingByUserId(supabaseUserId, limit);
    }

    // Group data by keyword and calculate trends
    const keywordGroups = new Map<string, any[]>();

    trackingData.forEach(entry => {
      const key = entry.keyword;
      if (!keywordGroups.has(key)) {
        keywordGroups.set(key, []);
      }
      keywordGroups.get(key)!.push(entry);
    });

    // Process each keyword group
    const processedData = Array.from(keywordGroups.entries()).map(([keyword, entries]) => {
      // Sort by date
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const latest = entries[0];
      const previous = entries[1];

      const currentRank = latest.position / 100;
      const previousRank = previous ? previous.position / 100 : currentRank;
      const rankChange = previousRank - currentRank;

      let trend: 'up' | 'down' | 'stable' | 'new';
      if (entries.length === 1) {
        trend = 'new';
      } else if (Math.abs(rankChange) <= 2) {
        trend = 'stable';
      } else if (rankChange > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }

      return {
        keyword,
        currentRank,
        previousRank,
        rankChange,
        trend,
        url: latest.url,
        lastUpdated: latest.date,
        device: latest.device,
        country: latest.country,
        dataPoints: entries.length,
        averagePosition: Math.round(
          entries.reduce((sum, e) => sum + e.position, 0) / entries.length / 100
        ),
        bestPosition: Math.min(...entries.map(e => e.position / 100)),
        worstPosition: Math.max(...entries.map(e => e.position / 100)),
      };
    });

    // Sort by current rank (unranked keywords at the end)
    processedData.sort((a, b) => {
      if (a.currentRank === 0 && b.currentRank === 0) return 0;
      if (a.currentRank === 0) return 1;
      if (b.currentRank === 0) return -1;
      return a.currentRank - b.currentRank;
    });

    // Calculate summary statistics
    const rankedKeywords = processedData.filter(k => k.currentRank > 0);
    const top10Keywords = rankedKeywords.filter(k => k.currentRank <= 10);
    const top3Keywords = rankedKeywords.filter(k => k.currentRank <= 3);

    const summary = {
      totalKeywords: processedData.length,
      rankedKeywords: rankedKeywords.length,
      keywordsInTop10: top10Keywords.length,
      keywordsInTop3: top3Keywords.length,
      averageRank: rankedKeywords.length > 0
        ? Math.round(rankedKeywords.reduce((sum, k) => sum + k.currentRank, 0) / rankedKeywords.length)
        : 0,
      improvingKeywords: rankedKeywords.filter(k => k.trend === 'up').length,
      decliningKeywords: rankedKeywords.filter(k => k.trend === 'down').length,
      stableKeywords: rankedKeywords.filter(k => k.trend === 'stable').length,
      newKeywords: processedData.filter(k => k.trend === 'new').length,
    };

    console.log('✅ [API:SERP-TRACK] SERP data retrieved successfully', {
      totalKeywords: summary.totalKeywords,
      rankedKeywords: summary.rankedKeywords,
      keywordsInTop10: summary.keywordsInTop10
    });

    return NextResponse.json({
      success: true,
      summary,
      keywords: processedData,
      metadata: {
        totalDataPoints: trackingData.length,
        dateRange: {
          earliest: trackingData.length > 0 ? trackingData[trackingData.length - 1].date : null,
          latest: trackingData.length > 0 ? trackingData[0].date : null,
        },
        limit,
      }
    });

  } catch (error) {
    console.error('❌ [API:SERP-TRACK] Error fetching SERP tracking data:', error);

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching SERP tracking data' },
      { status: 500 }
    );
  }
}