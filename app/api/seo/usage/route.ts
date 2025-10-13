/**
 * API route for tracking and retrieving SEO usage statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getUserUsageStats, getSavedTopicsCount, getTopicGenerationAnalytics, getSavedTopicsAnalytics, trackUserAction } from '@/lib/db/queries';
import { USAGE_LIMITS } from '@/lib/seo/utils';

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
    const period = (searchParams.get('period') as 'daily' | 'monthly') || 'daily';
    const includeAnalytics = searchParams.get('analytics') === 'true';

    // Get basic usage stats
    const dailyStats = await getUserUsageStats(user.id, 'daily');
    const monthlyStats = await getUserUsageStats(user.id, 'monthly');

    // Get saved topics count
    const savedTopicsCount = await getSavedTopicsCount(user.id);

    // Determine user plan (in a real app, this would come from user's subscription)
    const userPlan = 'FREE'; // Default to free plan
    const limits = USAGE_LIMITS[userPlan];

    // Calculate usage percentages
    const dailyPercentage = limits.dailyGenerations > 0
      ? Math.round((dailyStats.totalGenerations / limits.dailyGenerations) * 100)
      : 0;

    const monthlyPercentage = limits.monthlyGenerations > 0
      ? Math.round((monthlyStats.totalGenerations / limits.monthlyGenerations) * 100)
      : 0;

    const savedTopicsPercentage = limits.savedTopics > 0
      ? Math.round((savedTopicsCount / limits.savedTopics) * 100)
      : 0;

    const response = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          plan: userPlan,
        },
        usage: {
          daily: {
            generations: dailyStats.dailyGenerations,
            saves: dailyStats.totalSaves,
            total: dailyStats.totalActions,
            limit: limits.dailyGenerations,
            percentage: dailyPercentage,
            remaining: Math.max(0, limits.dailyGenerations - dailyStats.dailyGenerations),
          },
          monthly: {
            generations: monthlyStats.monthlyGenerations,
            saves: monthlyStats.totalSaves,
            total: monthlyStats.totalActions,
            limit: limits.monthlyGenerations,
            percentage: monthlyPercentage,
            remaining: Math.max(0, limits.monthlyGenerations - monthlyStats.monthlyGenerations),
          },
          savedTopics: {
            count: savedTopicsCount,
            limit: limits.savedTopics,
            percentage: savedTopicsPercentage,
            remaining: Math.max(0, limits.savedTopics - savedTopicsCount),
          },
        },
        limits: {
          maxTopicsPerGeneration: limits.maxTopicsPerGeneration,
          features: {
            unlimitedGenerations: limits.dailyGenerations < 0,
            unlimitedSavedTopics: limits.savedTopics < 0,
            advancedAnalytics: userPlan !== 'FREE',
            prioritySupport: (userPlan as any) === 'ENTERPRISE',
          }
        },
        upgrade: {
          canUpgrade: userPlan === 'FREE',
          suggestedPlan: dailyPercentage > 70 ? 'PRO' : 'FREE',
          reason: dailyPercentage > 80
            ? 'You\'re approaching your daily limit'
            : monthlyPercentage > 70
            ? 'You\'re using a lot of generations this month'
            : null,
        }
      },
    };

    // Include analytics if requested
    if (includeAnalytics && userPlan !== 'FREE') {
      try {
        const topicAnalytics = await getTopicGenerationAnalytics(user.id);
        const savedTopicsAnalytics = await getSavedTopicsAnalytics(user.id);

        (response.data as any).analytics = {
          topicGeneration: topicAnalytics,
          savedTopics: savedTopicsAnalytics,
        };
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Don't fail the request if analytics fail
        (response.data as any).analytics = null;
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in usage API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    // Parse request body
    const body = await request.json();
    const { action, metadata } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Action is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate action types
    const validActions = [
      'generate_topic',
      'save_topic',
      'view_topic',
      'export_topics',
      'delete_topic',
      'update_topic',
      'share_topic',
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          error: 'Invalid action',
          validActions
        },
        { status: 400 }
      );
    }

    // Track the user action
    try {
      await trackUserAction(user.id, action, metadata);
    } catch (error) {
      console.error('Failed to track user action:', error);
      // Don't fail the request if tracking fails
    }

    return NextResponse.json({
      success: true,
      message: 'Action tracked successfully',
      data: {
        action,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Unexpected error in POST usage API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

