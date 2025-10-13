/**
 * Background Job Manager
 * Handles queuing, scheduling, and tracking of background jobs
 */

import { db } from '@/lib/db/drizzle';
import { backgroundJobs, jobNotifications } from '@/lib/db/schema';
import { eq, and, desc, asc, lt, gte, isNull } from 'drizzle-orm';
import {
  JobType,
  JobStatus,
  JobPriority,
  NotificationType,
  JobInput,
  JobResult,
  JobProgress,
  JobStatistics,
  JobConfig,
  JobNotificationData,
  BaseJobInput,
} from './job-types';

export class JobManager {
  private static instance: JobManager;
  private config: JobConfig;
  private isProcessing = false;
  private processingInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  private constructor(config: Partial<JobConfig> = {}) {
    this.config = {
      maxConcurrentJobs: 3,
      defaultRetries: 3,
      retryDelay: 5000, // 5 seconds
      jobTimeout: 30 * 60 * 1000, // 30 minutes
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      maxJobAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...config,
    };

    this.startProcessing();
    this.startCleanup();
  }

  public static getInstance(config?: Partial<JobConfig>): JobManager {
    if (!JobManager.instance) {
      JobManager.instance = new JobManager(config);
    }
    return JobManager.instance;
  }

  /**
   * Queue a new job for background processing
   */
  public async enqueueJob(jobInput: JobInput): Promise<number> {
    const jobData = {
      supabaseUserId: jobInput.userId,
      type: jobInput.type,
      status: JobStatus.QUEUED,
      priority: jobInput.priority || JobPriority.NORMAL,
      progress: 0,
      input: JSON.stringify(jobInput),
      maxRetries: jobInput.maxRetries || this.config.defaultRetries,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [job] = await db.insert(backgroundJobs).values(jobData).returning();

    console.log(`📋 [JOB MANAGER] Job queued: ${job.id} (${job.type}) for user ${jobInput.userId}`);

    // Send notification for job queued
    await this.sendNotification({
      userId: jobInput.userId,
      jobId: job.id,
      type: NotificationType.JOB_STARTED,
      title: 'Job Started',
      message: `Your ${this.getJobTypeDisplayName(jobInput.type)} job has been queued and will start processing shortly.`,
      actionUrl: '/dashboard',
      actionText: 'View Progress',
      autoDismiss: false,
    });

    return job.id;
  }

  /**
   * Get job by ID
   */
  public async getJob(jobId: number): Promise<any> {
    const [job] = await db
      .select()
      .from(backgroundJobs)
      .where(eq(backgroundJobs.id, jobId))
      .limit(1);

    return job;
  }

  /**
   * Get jobs for a specific user
   */
  public async getUserJobs(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<any[]> {
    return await db
      .select()
      .from(backgroundJobs)
      .where(eq(backgroundJobs.supabaseUserId, userId))
      .orderBy(desc(backgroundJobs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get active jobs for a user
   */
  public async getUserActiveJobs(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(backgroundJobs)
      .where(
        and(
          eq(backgroundJobs.supabaseUserId, userId),
          eq(backgroundJobs.status, JobStatus.RUNNING)
        )
      )
      .orderBy(desc(backgroundJobs.createdAt));
  }

  /**
   * Update job progress
   */
  public async updateJobProgress(
    jobId: number,
    progress: number,
    currentStep?: string,
    metadata?: any
  ): Promise<void> {
    const updateData: any = {
      progress,
      updatedAt: new Date(),
    };

    if (currentStep) {
      updateData.currentStep = currentStep;
    }

    if (metadata) {
      updateData.metadata = JSON.stringify(metadata);
    }

    await db
      .update(backgroundJobs)
      .set(updateData)
      .where(eq(backgroundJobs.id, jobId));

    console.log(`📊 [JOB MANAGER] Job ${jobId} progress: ${progress}% - ${currentStep || ''}`);
  }

  /**
   * Mark job as completed
   */
  public async completeJob(jobId: number, result: JobResult): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await db
      .update(backgroundJobs)
      .set({
        status: JobStatus.COMPLETED,
        progress: 100,
        result: JSON.stringify(result),
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(backgroundJobs.id, jobId));

    console.log(`✅ [JOB MANAGER] Job completed: ${jobId} (${job.type})`);

    // Send completion notification
    await this.sendNotification({
      userId: job.supabaseUserId,
      jobId: jobId,
      type: NotificationType.JOB_COMPLETED,
      title: 'Job Completed',
      message: `Your ${this.getJobTypeDisplayName(job.type)} job has completed successfully.`,
      actionUrl: this.getJobResultUrl(job.type, result),
      actionText: 'View Results',
      autoDismiss: true,
      dismissAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });
  }

  /**
   * Mark job as failed
   */
  public async failJob(jobId: number, error: string): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const shouldRetry = job.retryCount < job.maxRetries;
    const nextRetryAt = shouldRetry ? new Date(Date.now() + this.config.retryDelay) : null;

    await db
      .update(backgroundJobs)
      .set({
        status: shouldRetry ? JobStatus.RETRYING : JobStatus.FAILED,
        error,
        retryCount: job.retryCount + 1,
        nextRetryAt,
        updatedAt: new Date(),
      })
      .where(eq(backgroundJobs.id, jobId));

    console.log(`❌ [JOB MANAGER] Job failed: ${jobId} (${job.type}) - ${error}`);

    // Send failure notification
    await this.sendNotification({
      userId: job.supabaseUserId,
      jobId: jobId,
      type: shouldRetry ? NotificationType.JOB_RETRYING : NotificationType.JOB_FAILED,
      title: shouldRetry ? 'Job Retrying' : 'Job Failed',
      message: shouldRetry
        ? `Your ${this.getJobTypeDisplayName(job.type)} job failed and will retry automatically.`
        : `Your ${this.getJobTypeDisplayName(job.type)} job failed: ${error}`,
      actionUrl: '/dashboard',
      actionText: 'View Details',
      autoDismiss: !shouldRetry,
    });
  }

  /**
   * Cancel a job
   */
  public async cancelJob(jobId: number): Promise<void> {
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (![JobStatus.QUEUED, JobStatus.RUNNING, JobStatus.RETRYING].includes(job.status)) {
      throw new Error(`Cannot cancel job in status: ${job.status}`);
    }

    await db
      .update(backgroundJobs)
      .set({
        status: JobStatus.CANCELLED,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(backgroundJobs.id, jobId));

    console.log(`🚫 [JOB MANAGER] Job cancelled: ${jobId} (${job.type})`);

    // Send cancellation notification
    await this.sendNotification({
      userId: job.supabaseUserId,
      jobId: jobId,
      type: NotificationType.JOB_CANCELLED,
      title: 'Job Cancelled',
      message: `Your ${this.getJobTypeDisplayName(job.type)} job was cancelled.`,
      autoDismiss: true,
      dismissAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
    });
  }

  /**
   * Get job statistics
   */
  public async getJobStatistics(userId?: string): Promise<JobStatistics> {
    const whereClause = userId ? eq(backgroundJobs.supabaseUserId, userId) : undefined;

    const allJobs = await db.select().from(backgroundJobs).where(whereClause);

    const stats: JobStatistics = {
      total: allJobs.length,
      queued: allJobs.filter(j => j.status === JobStatus.QUEUED).length,
      running: allJobs.filter(j => j.status === JobStatus.RUNNING).length,
      completed: allJobs.filter(j => j.status === JobStatus.COMPLETED).length,
      failed: allJobs.filter(j => j.status === JobStatus.FAILED).length,
      cancelled: allJobs.filter(j => j.status === JobStatus.CANCELLED).length,
      averageDuration: 0,
      successRate: 0,
      jobsByType: {} as Record<JobType, number>,
      jobsByStatus: {} as Record<JobStatus, number>,
      recentJobs: [],
    };

    // Calculate average duration and success rate
    const completedJobs = allJobs.filter(j => j.status === JobStatus.COMPLETED);
    if (completedJobs.length > 0) {
      const totalDuration = completedJobs.reduce((sum, job) => {
        if (job.startedAt && job.completedAt) {
          return sum + (job.completedAt.getTime() - job.startedAt.getTime());
        }
        return sum;
      }, 0);
      stats.averageDuration = totalDuration / completedJobs.length;
    }

    if (allJobs.length > 0) {
      stats.successRate = (completedJobs.length / allJobs.length) * 100;
    }

    // Count jobs by type
    Object.values(JobType).forEach(type => {
      stats.jobsByType[type] = allJobs.filter(j => j.type === type).length;
    });

    // Count jobs by status
    Object.values(JobStatus).forEach(status => {
      stats.jobsByStatus[status] = allJobs.filter(j => j.status === status).length;
    });

    // Recent jobs
    stats.recentJobs = allJobs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(job => ({
        id: job.id,
        type: job.type as JobType,
        status: job.status as JobStatus,
        createdAt: job.createdAt,
        completedAt: job.completedAt || undefined,
        duration: job.startedAt && job.completedAt
          ? job.completedAt.getTime() - job.startedAt.getTime()
          : undefined,
      }));

    return stats;
  }

  /**
   * Get next job to process
   */
  public async getNextJob(): Promise<any> {
    const [job] = await db
      .select()
      .from(backgroundJobs)
      .where(
        and(
          eq(backgroundJobs.status, JobStatus.QUEUED),
          isNull(backgroundJobs.nextRetryAt)
        )
      )
      .orderBy(asc(backgroundJobs.priority), asc(backgroundJobs.createdAt))
      .limit(1);

    // Check for retry jobs
    if (!job) {
      const [retryJob] = await db
        .select()
        .from(backgroundJobs)
        .where(
          and(
            eq(backgroundJobs.status, JobStatus.RETRYING),
            gte(backgroundJobs.nextRetryAt, new Date())
          )
        )
        .orderBy(asc(backgroundJobs.priority), asc(backgroundJobs.nextRetryAt))
        .limit(1);

      return retryJob;
    }

    return job;
  }

  /**
   * Start job processing loop
   */
  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    console.log('🔄 [JOB MANAGER] Starting job processing loop');

    this.processingInterval = setInterval(async () => {
      try {
        await this.processNextJob();
      } catch (error) {
        console.error('❌ [JOB MANAGER] Error in processing loop:', error);
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Process next available job
   */
  private async processNextJob(): Promise<void> {
    // Check if we're at max concurrent jobs
    const runningJobs = await db
      .select()
      .from(backgroundJobs)
      .where(eq(backgroundJobs.status, JobStatus.RUNNING));

    if (runningJobs.length >= this.config.maxConcurrentJobs) {
      return;
    }

    const job = await this.getNextJob();
    if (!job) return;

    // Mark job as running
    await db
      .update(backgroundJobs)
      .set({
        status: JobStatus.RUNNING,
        startedAt: new Date(),
        updatedAt: new Date(),
        nextRetryAt: null,
      })
      .where(eq(backgroundJobs.id, job.id));

    console.log(`▶️ [JOB MANAGER] Starting job: ${job.id} (${job.type})`);

    // Process job in background
    this.processJobAsync(job).catch(error => {
      console.error(`❌ [JOB MANAGER] Error processing job ${job.id}:`, error);
      this.failJob(job.id, error.message).catch(console.error);
    });
  }

  /**
   * Process job asynchronously
   */
  private async processJobAsync(job: any): Promise<void> {
    try {
      const jobInput: JobInput = JSON.parse(job.input);

      // Import the job processor
      const { BackgroundJobProcessor } = await import('./job-processor');
      const processor = new BackgroundJobProcessor();

      // Set timeout for job
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), this.config.jobTimeout);
      });

      // Process job with timeout
      const result = await Promise.race([
        processor.process(jobInput),
        timeoutPromise,
      ]);

      await this.completeJob(job.id, result as JobResult);
    } catch (error) {
      await this.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Start cleanup process
   */
  private startCleanup(): void {
    console.log('🧹 [JOB MANAGER] Starting cleanup process');

    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupOldJobs();
      } catch (error) {
        console.error('❌ [JOB MANAGER] Error in cleanup:', error);
      }
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up old jobs and notifications
   */
  private async cleanupOldJobs(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.maxJobAge);

    // Clean up old completed/failed jobs
    await db
      .delete(backgroundJobs)
      .where(
        and(
          eq(backgroundJobs.status, JobStatus.COMPLETED),
          lt(backgroundJobs.completedAt!, cutoffDate)
        )
      );

    await db
      .delete(backgroundJobs)
      .where(
        and(
          eq(backgroundJobs.status, JobStatus.FAILED),
          lt(backgroundJobs.completedAt!, cutoffDate)
        )
      );

    // Clean up old notifications
    await db
      .delete(jobNotifications)
      .where(
        and(
          eq(jobNotifications.autoDismiss, true),
          lt(jobNotifications.dismissAt!, new Date())
        )
      );

    console.log('🧹 [JOB MANAGER] Cleanup completed');
  }

  /**
   * Send job notification
   */
  private async sendNotification(notificationData: JobNotificationData): Promise<void> {
    await db.insert(jobNotifications).values({
      supabaseUserId: notificationData.userId,
      jobId: notificationData.jobId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      actionUrl: notificationData.actionUrl,
      actionText: notificationData.actionText,
      autoDismiss: notificationData.autoDismiss ?? true,
      dismissAt: notificationData.dismissAt || null,
      createdAt: new Date(),
    });
  }

  /**
   * Get display name for job type
   */
  private getJobTypeDisplayName(type: JobType): string {
    const displayNames: Record<JobType, string> = {
      [JobType.WEBSITE_CRAWL]: 'Website Crawl',
      [JobType.PERFORMANCE_ANALYSIS]: 'Performance Analysis',
      [JobType.COMPETITOR_MONITORING]: 'Competitor Monitoring',
      [JobType.CONTENT_PERFORMANCE_TRACKING]: 'Content Performance Tracking',
      [JobType.SERP_TRACKING]: 'SERP Tracking',
    };
    return displayNames[type] || type;
  }

  /**
   * Get result URL for job type
   */
  private getJobResultUrl(type: JobType, result: JobResult): string {
    switch (type) {
      case JobType.WEBSITE_CRAWL:
        return '/dashboard/performance';
      case JobType.PERFORMANCE_ANALYSIS:
        return '/dashboard/performance';
      case JobType.COMPETITOR_MONITORING:
        return '/dashboard/competitors';
      case JobType.CONTENT_PERFORMANCE_TRACKING:
        return '/dashboard/performance';
      case JobType.SERP_TRACKING:
        return '/dashboard/performance';
      default:
        return '/dashboard';
    }
  }

  /**
   * Stop job manager
   */
  public stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.isProcessing = false;
    console.log('⏹️ [JOB MANAGER] Job manager stopped');
  }
}

// Export singleton instance
export const jobManager = JobManager.getInstance();