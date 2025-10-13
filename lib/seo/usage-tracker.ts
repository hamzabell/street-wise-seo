import { db, usageTracking } from '@/lib/db';
import { eq, gte, and, count } from 'drizzle-orm';

export interface UsageStats {
  daily: {
    generations: number;
    saves: number;
    total: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  monthly: {
    generations: number;
    saves: number;
    total: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
  savedTopics: {
    count: number;
    limit: number;
    percentage: number;
    remaining: number;
  };
}

export async function trackUsage(
  supabaseUserId: string,
  action: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await db.insert(usageTracking).values({
      supabaseUserId,
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Failed to track usage:', error);
    // Don't throw error - tracking failures shouldn't break the main functionality
  }
}

export async function getUserUsageStats(supabaseUserId: string): Promise<UsageStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // Get daily usage
    const dailyUsage = await db
      .select({ count: count() })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.supabaseUserId, supabaseUserId),
          gte(usageTracking.createdAt, startOfDay)
        )
      );

    // Get monthly usage
    const monthlyUsage = await db
      .select({ count: count() })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.supabaseUserId, supabaseUserId),
          gte(usageTracking.createdAt, startOfMonth)
        )
      );

    const dailyCount = Number(dailyUsage[0]?.count || 0);
    const monthlyCount = Number(monthlyUsage[0]?.count || 0);

    // Define limits (these would come from user's subscription plan)
    const dailyLimit = 25;
    const monthlyLimit = 500;
    const savedTopicsLimit = 100;

    // Calculate saved topics count (simplified)
    const savedTopicsCount = Math.min(monthlyCount / 2, 15); // Estimate

    return {
      daily: {
        generations: Math.min(dailyCount, 15),
        saves: Math.min(dailyCount, 10),
        total: dailyCount,
        limit: dailyLimit,
        percentage: Math.round((dailyCount / dailyLimit) * 100),
        remaining: Math.max(0, dailyLimit - dailyCount)
      },
      monthly: {
        generations: Math.min(monthlyCount, 100),
        saves: Math.min(monthlyCount, 50),
        total: monthlyCount,
        limit: monthlyLimit,
        percentage: Math.round((monthlyCount / monthlyLimit) * 100),
        remaining: Math.max(0, monthlyLimit - monthlyCount)
      },
      savedTopics: {
        count: savedTopicsCount,
        limit: savedTopicsLimit,
        percentage: Math.round((savedTopicsCount / savedTopicsLimit) * 100),
        remaining: Math.max(0, savedTopicsLimit - savedTopicsCount)
      }
    };

  } catch (error) {
    console.error('Failed to get usage stats:', error);

    // Return default values
    return {
      daily: {
        generations: 0,
        saves: 0,
        total: 0,
        limit: 25,
        percentage: 0,
        remaining: 25
      },
      monthly: {
        generations: 0,
        saves: 0,
        total: 0,
        limit: 500,
        percentage: 0,
        remaining: 500
      },
      savedTopics: {
        count: 0,
        limit: 100,
        percentage: 0,
        remaining: 100
      }
    };
  }
}