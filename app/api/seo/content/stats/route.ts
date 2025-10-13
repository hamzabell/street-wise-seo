import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, generatedContent, savedTopics, usageTracking } from '@/lib/db';
import { eq, and, desc, gte, lte, count, avg, sum } from 'drizzle-orm';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // Default to last 30 days

    // Calculate date range
    const now = new Date();
    const daysAgo = parseInt(period);
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    // Get total content statistics
    const totalContentQuery = db
      .select({
        totalCount: count(),
        totalWords: sum(generatedContent.wordCount),
        avgSeoScore: avg(generatedContent.seoScore),
        avgReadingTime: avg(generatedContent.readingTime)
      })
      .from(generatedContent)
      .where(eq(generatedContent.supabaseUserId, user.id));

    const totalStats = await totalContentQuery;
    const totalData = totalStats[0];

    // Get period-specific statistics
    const periodContentQuery = db
      .select({
        periodCount: count(),
        periodWords: sum(generatedContent.wordCount)
      })
      .from(generatedContent)
      .where(
        and(
          eq(generatedContent.supabaseUserId, user.id),
          gte(generatedContent.createdAt, startDate)
        )
      );

    const periodStats = await periodContentQuery;
    const periodData = periodStats[0];

    // Get content type distribution
    const contentTypeQuery = db
      .select({
        contentType: generatedContent.contentType,
        count: count(),
        avgSeoScore: avg(generatedContent.seoScore)
      })
      .from(generatedContent)
      .where(eq(generatedContent.supabaseUserId, user.id))
      .groupBy(generatedContent.contentType);

    const contentTypeStats = await contentTypeQuery;

    // Get tone distribution
    const toneQuery = db
      .select({
        tone: generatedContent.tone,
        count: count()
      })
      .from(generatedContent)
      .where(eq(generatedContent.supabaseUserId, user.id))
      .groupBy(generatedContent.tone);

    const toneStats = await toneQuery;

    // Get status distribution
    const statusQuery = db
      .select({
        status: generatedContent.status,
        count: count()
      })
      .from(generatedContent)
      .where(eq(generatedContent.supabaseUserId, user.id))
      .groupBy(generatedContent.status);

    const statusStats = await statusQuery;

    // Get recent activity (last 10 content items)
    const recentContent = await db
      .select({
        id: generatedContent.id,
        title: generatedContent.title,
        contentType: generatedContent.contentType,
        wordCount: generatedContent.wordCount,
        seoScore: generatedContent.seoScore,
        status: generatedContent.status,
        createdAt: generatedContent.createdAt,
        savedTopic: {
          topic: savedTopics.topic
        }
      })
      .from(generatedContent)
      .leftJoin(savedTopics, eq(generatedContent.savedTopicId, savedTopics.id))
      .where(eq(generatedContent.supabaseUserId, user.id))
      .orderBy(desc(generatedContent.createdAt))
      .limit(10);

    // Get usage statistics from tracking
    const usageQuery = db
      .select({
        action: usageTracking.action,
        count: count()
      })
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.supabaseUserId, user.id),
          gte(usageTracking.createdAt, startDate)
        )
      )
      .groupBy(usageTracking.action);

    const usageStats = await usageQuery;

    // Format the response
    const stats = {
      overview: {
        totalContent: Number(totalData?.totalCount || 0),
        totalWords: Number(totalData?.totalWords || 0),
        averageSeoScore: Math.round(Number(totalData?.avgSeoScore || 0)),
        averageReadingTime: Math.round(Number(totalData?.avgReadingTime || 0)),
        periodContent: Number(periodData?.periodCount || 0),
        periodWords: Number(periodData?.periodWords || 0)
      },
      contentTypeDistribution: contentTypeStats.map(stat => ({
        contentType: stat.contentType,
        count: Number(stat.count),
        averageSeoScore: Math.round(Number(stat.avgSeoScore || 0)),
        percentage: totalData?.totalCount
          ? Math.round((Number(stat.count) / Number(totalData.totalCount)) * 100)
          : 0
      })),
      toneDistribution: toneStats.map(stat => ({
        tone: stat.tone,
        count: Number(stat.count),
        percentage: totalData?.totalCount
          ? Math.round((Number(stat.count) / Number(totalData.totalCount)) * 100)
          : 0
      })),
      statusDistribution: statusStats.map(stat => ({
        status: stat.status,
        count: Number(stat.count),
        percentage: totalData?.totalCount
          ? Math.round((Number(stat.count) / Number(totalData.totalCount)) * 100)
          : 0
      })),
      recentActivity: recentContent.map(item => ({
        id: item.id,
        title: item.title,
        contentType: item.contentType,
        wordCount: item.wordCount,
        seoScore: item.seoScore,
        status: item.status,
        createdAt: item.createdAt,
        topic: item.savedTopic?.topic
      })),
      usageActivity: usageStats.map(stat => ({
        action: stat.action,
        count: Number(stat.count)
      })),
      period: {
        days: daysAgo,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Content stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content statistics' },
      { status: 500 }
    );
  }
}