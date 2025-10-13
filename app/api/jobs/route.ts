/**
 * API route for background job management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserId } from '@/lib/db/queries';
import { jobManager } from '@/lib/background/job-manager';
import { db } from '@/lib/db/drizzle';
import { backgroundJobs, jobNotifications } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/jobs - Get user's jobs and statistics
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

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    console.log(`📋 [JOBS API] Fetching jobs for user ${supabaseUserId}`);

    // Get jobs
    let jobs;
    if (activeOnly) {
      jobs = await jobManager.getUserActiveJobs(supabaseUserId);
    } else {
      jobs = await jobManager.getUserJobs(supabaseUserId, limit, offset);
    }

    // Transform jobs for response
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      type: job.type,
      status: job.status,
      priority: job.priority,
      progress: job.progress,
      currentStep: job.currentStep,
      input: job.input ? JSON.parse(job.input) : null,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.error,
      metadata: job.metadata ? JSON.parse(job.metadata) : null,
      createdAt: job.createdAt.toISOString(),
      startedAt: job.startedAt?.toISOString() || null,
      completedAt: job.completedAt?.toISOString() || null,
      updatedAt: job.updatedAt.toISOString(),
      retryCount: job.retryCount,
      maxRetries: job.maxRetries,
    }));

    const response: any = {
      success: true,
      data: {
        jobs: transformedJobs,
        pagination: activeOnly ? null : {
          limit,
          offset,
          total: jobs.length,
          hasMore: jobs.length === limit,
        },
      },
    };

    // Include statistics if requested
    if (includeStats) {
      const statistics = await jobManager.getJobStatistics(supabaseUserId);
      response.data.statistics = statistics;
    }

    console.log(`✅ [JOBS API] Retrieved ${jobs.length} jobs for user ${supabaseUserId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [JOBS API] Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
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

    const body = await request.json();
    console.log('📥 [JOBS API] Creating new job:', body);

    // Validate required fields
    if (!body.type) {
      return NextResponse.json(
        { error: 'Job type is required' },
        { status: 400 }
      );
    }

    // Add user ID to job input
    const jobInput = {
      ...body,
      userId: supabaseUserId,
    };

    // Queue the job
    const jobId = await jobManager.enqueueJob(jobInput);

    console.log(`✅ [JOBS API] Job created: ${jobId}`);

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: 'queued',
        message: 'Job has been queued for processing',
      },
    });

  } catch (error) {
    console.error('❌ [JOBS API] Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}