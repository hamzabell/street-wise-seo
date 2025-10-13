/**
 * API route for individual job management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserId } from '@/lib/db/queries';
import { jobManager } from '@/lib/background/job-manager';
import { db } from '@/lib/db/drizzle';
import { backgroundJobs, jobNotifications } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/jobs/[id] - Get specific job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    console.log(`📋 [JOB API] Fetching job ${jobId} for user ${supabaseUserId}`);

    const job = await jobManager.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Verify user owns this job
    if (job.supabaseUserId !== supabaseUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Transform job for response
    const transformedJob = {
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
      nextRetryAt: job.nextRetryAt?.toISOString() || null,
    };

    console.log(`✅ [JOB API] Retrieved job ${jobId}`);

    return NextResponse.json({
      success: true,
      data: transformedJob,
    });

  } catch (error) {
    console.error('❌ [JOB API] Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Cancel a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    console.log(`🚫 [JOB API] Cancelling job ${jobId} for user ${supabaseUserId}`);

    const job = await jobManager.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Verify user owns this job
    if (job.supabaseUserId !== supabaseUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Cancel the job
    await jobManager.cancelJob(jobId);

    console.log(`✅ [JOB API] Job ${jobId} cancelled`);

    return NextResponse.json({
      success: true,
      data: {
        id: jobId,
        status: 'cancelled',
        message: 'Job has been cancelled successfully',
      },
    });

  } catch (error) {
    console.error('❌ [JOB API] Error cancelling job:', error);

    if (error instanceof Error) {
      if (error.message.includes('Cannot cancel job')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/[id]/retry - Retry a failed job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: 'Invalid job ID' },
        { status: 400 }
      );
    }

    const job = await jobManager.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Verify user owns this job
    if (job.supabaseUserId !== supabaseUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if job can be retried
    if (job.status !== 'failed') {
      return NextResponse.json(
        { error: 'Only failed jobs can be retried' },
        { status: 400 }
      );
    }

    if (job.retryCount >= job.maxRetries) {
      return NextResponse.json(
        { error: 'Job has exceeded maximum retry attempts' },
        { status: 400 }
      );
    }

    console.log(`🔄 [JOB API] Retrying job ${jobId} for user ${supabaseUserId}`);

    // Reset job for retry
    await db
      .update(backgroundJobs)
      .set({
        status: 'queued',
        progress: 0,
        currentStep: null,
        error: null,
        nextRetryAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(backgroundJobs.id, jobId));

    console.log(`✅ [JOB API] Job ${jobId} queued for retry`);

    return NextResponse.json({
      success: true,
      data: {
        id: jobId,
        status: 'queued',
        message: 'Job has been queued for retry',
      },
    });

  } catch (error) {
    console.error('❌ [JOB API] Error retrying job:', error);
    return NextResponse.json(
      { error: 'Failed to retry job' },
      { status: 500 }
    );
  }
}