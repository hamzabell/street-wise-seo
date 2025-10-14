/**
 * API route for generating SEO topics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getUserPrimaryWebsiteUrl, getSupabaseUserId } from '@/lib/db/queries';
import { generateSEOTopics, saveTopicsToDatabase, getTopicGenerator } from '@/lib/seo/topic-generator';
import { validateTopicRequest, canPerformAction, USAGE_LIMITS } from '@/lib/seo/utils';
import { trackUserAction, getDailyUsageCount, getMonthlyUsageCount } from '@/lib/db/queries';

// Request validation schema
const GenerateTopicsRequestSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long'),
  businessType: z.string().min(2, 'Business type must be at least 2 characters long'),
  industryId: z.string().min(1, 'Industry selection is required'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  location: z.string().optional(),
  competitorUrl: z.string().url('Invalid competitor URL').optional().or(z.literal('')),
  tone: z.string().min(1, 'Tone selection is required').default('professional'),
  additionalContext: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  forceRecrawl: z.boolean().default(false), // Force re-crawl even if recently crawled
  // Cultural and language options
  languagePreference: z.enum(['english', 'native', 'cultural_english']).default('english'),
  formalityLevel: z.enum(['formal', 'professional', 'casual', 'slang_heavy']).default('professional'),
  contentPurpose: z.enum(['marketing', 'educational', 'conversational', 'technical']).default('marketing'),
});

// Rate limiting configuration
const RATE_LIMITS = {
  requests: 10, // requests per hour
  window: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(userId: string): Promise<{ allowed: boolean; resetTime?: number }> {
  const now = Date.now();
  const userKey = userId;
  const existing = rateLimitStore.get(userKey);

  if (existing) {
    if (now > existing.resetTime) {
      // Reset the window
      rateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMITS.window });
      return { allowed: true };
    } else if (existing.count >= RATE_LIMITS.requests) {
      return { allowed: false, resetTime: existing.resetTime };
    } else {
      existing.count++;
      return { allowed: true };
    }
  } else {
    rateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMITS.window });
    return { allowed: true };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = GenerateTopicsRequestSchema.safeParse(body);

    if (!validationResult.success) {
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

    const requestData = validationResult.data;

    // If no website URL was provided (empty string), try to get it from security settings
    if (!requestData.websiteUrl) {
      try {
        const supabaseUserId = await getSupabaseUserId();
        if (supabaseUserId) {
          const userPrimaryWebsiteUrl = await getUserPrimaryWebsiteUrl(supabaseUserId);
          if (userPrimaryWebsiteUrl) {
            requestData.websiteUrl = userPrimaryWebsiteUrl;
            console.log('🌐 [API] Using user primary website from security settings:', userPrimaryWebsiteUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user website URL:', error);
        // Continue without website URL - don't fail the request
      }
    } else {
      console.log('🌐 [API] Using provided website URL:', requestData.websiteUrl);
    }

    // Validate topic request using SEO utils
    const topicValidation = validateTopicRequest(requestData);
    if (!topicValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid topic data',
          details: topicValidation.errors
        },
        { status: 400 }
      );
    }

    // Check usage limits (assuming free plan for now)
    const dailyGenerations = await getDailyUsageCount(user.id, 'generate_topic');
    const monthlyGenerations = await getMonthlyUsageCount(user.id, 'generate_topic');

    const usageCheck = canPerformAction(
      {
        dailyGenerations,
        monthlyGenerations,
        savedTopics: 0, // We'll check this separately if needed
      },
      'generate',
      'FREE' // In a real app, get this from user's subscription
    );

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.reason || 'Usage limit exceeded',
          limits: USAGE_LIMITS.FREE,
          currentUsage: {
            daily: dailyGenerations,
            monthly: monthlyGenerations,
          },
          requiresUpgrade: true
        },
        { status: 429 }
      );
    }

    // Track the generation attempt
    await trackUserAction(user.id, 'generate_topic_attempt', {
      inputTopic: requestData.topic,
      industryId: requestData.industryId,
    });

    // Generate topics
    let result;
    try {
      // Prepare the topic generation request with user ID for caching
      const topicRequest = {
        ...requestData,
        supabaseUserId: user.id, // Add user ID for caching logic
      };

      console.log('🚀 [API] Calling generateSEOTopics with request:', {
        topic: requestData.topic,
        websiteUrl: requestData.websiteUrl,
        competitorUrl: requestData.competitorUrl,
        forceRecrawl: requestData.forceRecrawl,
        supabaseUserId: user.id
      });

      result = await generateSEOTopics(topicRequest);
    } catch (error) {
      console.error('Topic generation failed:', error);

      // Track the failure
      await trackUserAction(user.id, 'generate_topic_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        inputTopic: requestData.topic,
        forceRecrawl: requestData.forceRecrawl,
      });

      return NextResponse.json(
        { error: 'Failed to generate topics. Please try again.' },
        { status: 500 }
      );
    }

    // Track successful generation
    await trackUserAction(user.id, 'generate_topic', {
      inputTopic: requestData.topic,
      generatedCount: result.generatedTopics.length,
      industryId: requestData.industryId,
    });

    // Always save to database for history tracking
    let generationId: number | undefined;
    let savedTopicIds: number[] = [];

    try {
      const saveResult = await saveTopicsToDatabase(user.id, result);
      generationId = saveResult.generationId;
      savedTopicIds = saveResult.savedTopicIds;

      // Track the save action
      await trackUserAction(user.id, 'save_generation', {
        generationId,
        topicCount: result.generatedTopics.length,
        autoSaved: true,
      });
    } catch (error) {
      console.error('Failed to save generation to history:', error);
      // Continue without saving - don't fail the request, but log the error
    }

    // Return successful response
    const newDailyCount = dailyGenerations + 1;
    const newMonthlyCount = monthlyGenerations + 1;

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        generationId,
        savedTopicIds,
      },
      usage: {
        daily: newDailyCount,
        monthly: newMonthlyCount,
        limits: USAGE_LIMITS.FREE,
        remaining: {
          daily: Math.max(0, USAGE_LIMITS.FREE.dailyGenerations - newDailyCount),
          monthly: Math.max(0, USAGE_LIMITS.FREE.monthlyGenerations - newMonthlyCount),
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in generate topics API:', error);
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

    // Fetch user's generation history from database
    const topicGenerator = getTopicGenerator();
    const generations = await topicGenerator.getTopicHistory(user.id, limit + offset);

    // Get usage stats
    const dailyGenerations = await getDailyUsageCount(user.id, 'generate_topic');
    const monthlyGenerations = await getMonthlyUsageCount(user.id, 'generate_topic');

    // Apply pagination
    const paginatedGenerations = generations.slice(offset, offset + limit);
    const total = generations.length;

    return NextResponse.json({
      success: true,
      data: {
        generations: paginatedGenerations,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
      usage: {
        daily: dailyGenerations,
        monthly: monthlyGenerations,
        limits: USAGE_LIMITS.FREE,
        remaining: {
          daily: Math.max(0, USAGE_LIMITS.FREE.dailyGenerations - dailyGenerations),
          monthly: Math.max(0, USAGE_LIMITS.FREE.monthlyGenerations - monthlyGenerations),
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET generate topics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}