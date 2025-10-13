#!/usr/bin/env npx tsx

/**
 * Background Status Check Script
 * Checks the status of background jobs and system health
 */

import { db } from '@/lib/db/drizzle';
import { backgroundJobs, jobNotifications } from '@/lib/db/schema';
import { eq, and, desc, isNull, gte } from 'drizzle-orm';

async function checkBackgroundStatus() {
  console.log('🔍 [BG STATUS] Checking background job system status...\n');

  try {
    // Check active jobs
    const activeJobs = await db
      .select()
      .from(backgroundJobs)
      .where(eq(backgroundJobs.status, 'running'))
      .orderBy(desc(backgroundJobs.startedAt));

    console.log(`📊 [BG STATUS] Active Jobs: ${activeJobs.length}`);
    if (activeJobs.length > 0) {
      activeJobs.forEach(job => {
        console.log(`  - Job #${job.id}: ${job.type} (${job.progress}% - ${job.currentStep || 'Processing...'})`);
        console.log(`    Started: ${job.startedAt?.toLocaleString() || 'Unknown'}`);
        console.log(`    User: ${job.supabaseUserId}`);
      });
    }

    // Check queued jobs
    const queuedJobs = await db
      .select()
      .from(backgroundJobs)
      .where(eq(backgroundJobs.status, 'queued'))
      .orderBy(desc(backgroundJobs.createdAt))
      .limit(10);

    console.log(`\n⏳ [BG STATUS] Queued Jobs: ${queuedJobs.length}`);
    if (queuedJobs.length > 0) {
      queuedJobs.forEach(job => {
        console.log(`  - Job #${job.id}: ${job.type} (${job.priority})`);
        console.log(`    Created: ${job.createdAt.toLocaleString()}`);
        console.log(`    User: ${job.supabaseUserId}`);
      });
    }

    // Check failed jobs (recent)
    const recentFailed = await db
      .select()
      .from(backgroundJobs)
      .where(
        and(
          eq(backgroundJobs.status, 'failed'),
          gte(backgroundJobs.updatedAt, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        )
      )
      .orderBy(desc(backgroundJobs.updatedAt))
      .limit(5);

    console.log(`\n❌ [BG STATUS] Recent Failed Jobs (24h): ${recentFailed.length}`);
    if (recentFailed.length > 0) {
      recentFailed.forEach(job => {
        console.log(`  - Job #${job.id}: ${job.type}`);
        console.log(`    Error: ${job.error || 'Unknown error'}`);
        console.log(`    Failed: ${job.updatedAt.toLocaleString()}`);
        console.log(`    Retries: ${job.retryCount}/${job.maxRetries}`);
      });
    }

    // Check recent notifications
    const recentNotifications = await db
      .select()
      .from(jobNotifications)
      .where(
        gte(jobNotifications.createdAt, new Date(Date.now() - 60 * 60 * 1000)) // Last hour
      )
      .orderBy(desc(jobNotifications.createdAt))
      .limit(10);

    console.log(`\n📬 [BG STATUS] Recent Notifications (1h): ${recentNotifications.length}`);
    if (recentNotifications.length > 0) {
      recentNotifications.forEach(notif => {
        console.log(`  - ${notif.title}: ${notif.message}`);
        console.log(`    Type: ${notif.type} | Read: ${notif.isRead ? 'Yes' : 'No'}`);
        console.log(`    Created: ${notif.createdAt.toLocaleString()}`);
      });
    }

    // System health summary
    const totalJobs = await db.select().from(backgroundJobs);
    const completedJobs = totalJobs.filter(j => j.status === 'completed');
    const failedJobs = totalJobs.filter(j => j.status === 'failed');

    const successRate = totalJobs.length > 0 ? (completedJobs.length / totalJobs.length) * 100 : 0;

    console.log(`\n📈 [BG STATUS] System Health Summary:`);
    console.log(`  Total Jobs: ${totalJobs.length}`);
    console.log(`  Completed: ${completedJobs.length}`);
    console.log(`  Failed: ${failedJobs.length}`);
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`  Active: ${activeJobs.length}`);
    console.log(`  Queued: ${queuedJobs.length}`);

    // Health check
    const isHealthy = activeJobs.length < 5 && queuedJobs.length < 10 && successRate > 70;
    console.log(`\n${isHealthy ? '✅' : '⚠️'} [BG STATUS] System Health: ${isHealthy ? 'Healthy' : 'Warning'}`);

    if (!isHealthy) {
      console.log('\n🚨 [BG STATUS] Health Issues Detected:');
      if (activeJobs.length >= 5) {
        console.log('  - High number of active jobs (≥5)');
      }
      if (queuedJobs.length >= 10) {
        console.log('  - High number of queued jobs (≥10)');
      }
      if (successRate <= 70) {
        console.log('  - Low success rate (≤70%)');
      }
    }

  } catch (error) {
    console.error('❌ [BG STATUS] Error checking background status:', error);
    process.exit(1);
  }
}

// Run the status check
checkBackgroundStatus()
  .then(() => {
    console.log('\n✅ [BG STATUS] Status check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ [BG STATUS] Status check failed:', error);
    process.exit(1);
  });