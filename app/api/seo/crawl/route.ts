/**
 * API route for website crawling and analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getSupabaseUserId } from '@/lib/db/queries';
import { crawlWebsite } from '@/lib/seo/website-crawler';
import { WebsiteCrawlRequestSchema } from '@/types/seo';
import { canPerformAction, USAGE_LIMITS } from '@/lib/seo/utils';
import { trackUserAction, getDailyUsageCount, getMonthlyUsageCount } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { websiteAnalyses, crawledPages, contentGaps } from '@/lib/db/schema';
import { analyzeContent } from '@/lib/seo/content-analyzer';
import { eq, desc } from 'drizzle-orm';
import { jobManager } from '@/lib/background/job-manager';
import { JobType, JobPriority } from '@/lib/background/job-types';

// Request validation schema
const CrawlRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  maxPages: z.number().min(1).max(20).default(10),
  includeExternalLinks: z.boolean().default(false),
  competitorUrl: z.string().url().optional(),
  background: z.boolean().default(false), // New option for background processing
});

// Rate limiting configuration
const RATE_LIMITS = {
  requests: 5, // requests per hour for crawling
  window: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Simple in-memory rate limiting for crawling
const crawlRateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function checkCrawlRateLimit(userId: string): Promise<{ allowed: boolean; resetTime?: number }> {
  const now = Date.now();
  const userKey = `crawl_${userId}`;
  const existing = crawlRateLimitStore.get(userKey);

  if (existing) {
    if (now > existing.resetTime) {
      crawlRateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMITS.window });
      return { allowed: true };
    } else if (existing.count >= RATE_LIMITS.requests) {
      return { allowed: false, resetTime: existing.resetTime };
    } else {
      existing.count++;
      return { allowed: true };
    }
  } else {
    crawlRateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMITS.window });
    return { allowed: true };
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [CRAWL API] Starting website crawl request');

  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      console.log('❌ [CRAWL API] Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`✅ [CRAWL API] User authenticated: ${user.id} (${user.email})`);

    // Check crawl rate limiting
    const rateLimitResult = await checkCrawlRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Crawl rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log('📥 [CRAWL API] Request body:', JSON.stringify(body, null, 2));

    const validationResult = CrawlRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.log('❌ [CRAWL API] Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { url, maxPages, includeExternalLinks, competitorUrl, background } = validationResult.data;
    console.log(`✅ [CRAWL API] Parsed request - URL: ${url}, Competitor: ${competitorUrl || 'none'}, MaxPages: ${maxPages}, Background: ${background}`);

    // Handle background processing
    if (background) {
      console.log('🔄 [CRAWL API] Processing as background job');

      // Create background job
      const jobId = await jobManager.enqueueJob({
        type: JobType.WEBSITE_CRAWL,
        userId: user.id,
        url,
        maxPages,
        includeExternalLinks,
        competitorUrl,
        priority: JobPriority.NORMAL,
      });

      // Track the crawl attempt
      await trackUserAction(user.id, 'crawl_website_background', {
        url,
        maxPages,
        jobId,
      });

      return NextResponse.json({
        success: true,
        data: {
          jobId,
          status: 'queued',
          message: 'Website crawl has been queued for background processing. You can track the progress in the dashboard.',
        },
      });
    }

    // Check usage limits for crawling (assuming free plan for now)
    const dailyCrawls = await getDailyUsageCount(user.id, 'crawl_website');
    const monthlyCrawls = await getMonthlyUsageCount(user.id, 'crawl_website');

    const usageCheck = canPerformAction(
      {
        dailyGenerations: 0,
        monthlyGenerations: 0,
        savedTopics: 0,
      },
      'crawl',
      'FREE' // In a real app, get this from user's subscription
    );

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.reason || 'Crawling limit exceeded',
          limits: USAGE_LIMITS.FREE,
          currentUsage: {
            daily: dailyCrawls,
            monthly: monthlyCrawls,
          },
          requiresUpgrade: true
        },
        { status: 429 }
      );
    }

    // Track the crawl attempt
    await trackUserAction(user.id, 'crawl_website_attempt', {
      url,
      maxPages,
    });

    // Crawl the website
    let websiteAnalysis;
    let competitorAnalysis = null;

    console.log('🕷️ [CRAWL API] Starting website crawl for:', url);
    try {
      websiteAnalysis = await crawlWebsite({
        url,
        maxPages,
        includeExternalLinks,
        crawlDelay: 1000
      });

      console.log(`✅ [CRAWL API] Website crawl completed! Pages crawled: ${websiteAnalysis.crawledPages.length}, Topics found: ${websiteAnalysis.topics.length}`);
      console.log('📊 [CRAWL API] Website analysis summary:', {
        domain: websiteAnalysis.domain,
        totalWords: websiteAnalysis.totalWordCount,
        totalImages: websiteAnalysis.totalImages,
        topicsCount: websiteAnalysis.topics.length,
        keywordsCount: websiteAnalysis.keywords.length,
        technicalIssues: websiteAnalysis.technicalIssues.length
      });

      // If competitor URL provided, crawl competitor as well
      if (competitorUrl) {
        console.log('🏁 [CRAWL API] Starting competitor crawl for:', competitorUrl);
        try {
          competitorAnalysis = await crawlWebsite({
            url: competitorUrl,
            maxPages: Math.min(maxPages, 5), // Limit competitor crawl
            includeExternalLinks: false,
            crawlDelay: 1000
          });

          console.log(`✅ [CRAWL API] Competitor crawl completed! Pages crawled: ${competitorAnalysis.crawledPages.length}, Topics found: ${competitorAnalysis.topics.length}`);
        } catch (error) {
          console.error('❌ [CRAWL API] Competitor crawl failed:', error);
          // Continue without competitor analysis
        }
      } else {
        console.log('ℹ️ [CRAWL API] No competitor URL provided');
      }
    } catch (error) {
      console.error('❌ [CRAWL API] Website crawling failed:', error);

      // Track the failure
      await trackUserAction(user.id, 'crawl_website_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
      });

      return NextResponse.json(
        { error: 'Failed to crawl website. Please check the URL and try again.' },
        { status: 500 }
      );
    }

    // Analyze content
    let contentAnalysis: any = null;
    console.log('🧠 [CRAWL API] Starting content analysis...');
    try {
      contentAnalysis = analyzeContent(websiteAnalysis, competitorAnalysis || undefined);
      console.log('✅ [CRAWL API] Content analysis completed!', {
        contentGaps: contentAnalysis.contentGaps.length,
        contentClusters: contentAnalysis.contentClusters.length,
        seoInsights: contentAnalysis.seoInsights.length,
        keywordOpportunities: contentAnalysis.keywordOpportunities.length,
        competitorAnalysis: !!contentAnalysis.competitorAnalysis
      });
    } catch (error) {
      console.error('❌ [CRAWL API] Content analysis failed:', error);
      // Continue without content analysis
    }

    // Save to database
    let savedAnalysisId: number | undefined;

    try {
      // Start a transaction to save website analysis
      const savedAnalysis = await db.transaction(async (tx) => {
        // Insert website analysis
        const [analysis] = await tx.insert(websiteAnalyses).values({
          supabaseUserId: user.id,
          url: websiteAnalysis.url,
          domain: websiteAnalysis.domain,
          totalWordCount: websiteAnalysis.totalWordCount,
          totalImages: websiteAnalysis.totalImages,
          topics: JSON.stringify(websiteAnalysis.topics),
          keywords: JSON.stringify(websiteAnalysis.keywords),
          contentGaps: JSON.stringify([]), // Will be populated by content analyzer
          internalLinkingScore: websiteAnalysis.internalLinkingScore,
          technicalIssues: JSON.stringify(websiteAnalysis.technicalIssues),
          crawledAt: new Date(websiteAnalysis.crawledAt),
        }).returning({ id: websiteAnalyses.id });

        // Insert crawled pages
        for (const page of websiteAnalysis.crawledPages) {
          await tx.insert(crawledPages).values({
            websiteAnalysisId: analysis.id,
            url: page.url,
            title: page.title,
            metaDescription: page.metaDescription,
            headings: JSON.stringify(page.headings),
            content: page.content,
            wordCount: page.wordCount,
            internalLinks: JSON.stringify(page.internalLinks),
            externalLinks: JSON.stringify(page.externalLinks),
            images: JSON.stringify(page.images),
            lastModified: page.lastModified ? new Date(page.lastModified) : null,
          });
        }

        // Insert content gaps
        if (contentAnalysis) {
          for (const gap of contentAnalysis.contentGaps) {
            await tx.insert(contentGaps).values({
              websiteAnalysisId: analysis.id,
              topic: gap.topic,
              reason: gap.reason,
              priority: gap.priority,
              estimatedDifficulty: gap.estimatedDifficulty,
              competitorAdvantage: gap.competitorAdvantage || null,
            });
          }
        }

        return analysis;
      });

      savedAnalysisId = savedAnalysis.id;
    } catch (error) {
      console.error('Failed to save website analysis:', error);
      // Continue without saving - don't fail the request
    }

    // Track successful crawl
    await trackUserAction(user.id, 'crawl_website', {
      url,
      pagesCrawled: websiteAnalysis.crawledPages.length,
      analysisId: savedAnalysisId,
    });

    // Update usage counts
    const newDailyCount = dailyCrawls + 1;
    const newMonthlyCount = monthlyCrawls + 1;

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        websiteAnalysis,
        contentAnalysis,
        competitorAnalysis,
        analysisId: savedAnalysisId,
      },
      usage: {
        crawlsUsed: newDailyCount,
        crawlsLimit: USAGE_LIMITS.FREE.dailyCrawls,
        remaining: Math.max(0, USAGE_LIMITS.FREE.dailyCrawls - newDailyCount)
      }
    });

  } catch (error) {
    console.error('Unexpected error in crawl API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    // Fetch user's website analysis history
    const analyses = await db
      .select({
        id: websiteAnalyses.id,
        url: websiteAnalyses.url,
        domain: websiteAnalyses.domain,
        totalWordCount: websiteAnalyses.totalWordCount,
        totalImages: websiteAnalyses.totalImages,
        topics: websiteAnalyses.topics,
        internalLinkingScore: websiteAnalyses.internalLinkingScore,
        crawledAt: websiteAnalyses.crawledAt,
      })
      .from(websiteAnalyses)
      .where(eq(websiteAnalyses.supabaseUserId, user.id))
      .orderBy(desc(websiteAnalyses.crawledAt))
      .limit(limit)
      .offset(offset);

    const dailyCrawls = await getDailyUsageCount(user.id, 'crawl_website');
    const monthlyCrawls = await getMonthlyUsageCount(user.id, 'crawl_website');

    return NextResponse.json({
      success: true,
      data: {
        analyses: analyses.map(analysis => ({
          ...analysis,
          topics: JSON.parse(analysis.topics || '[]'),
        })),
        pagination: {
          limit,
          offset,
          total: analyses.length,
          hasMore: analyses.length === limit,
        },
      },
      usage: {
        crawlsUsed: dailyCrawls,
        crawlsLimit: USAGE_LIMITS.FREE.dailyCrawls,
        remaining: Math.max(0, USAGE_LIMITS.FREE.dailyCrawls - dailyCrawls)
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET crawl API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}