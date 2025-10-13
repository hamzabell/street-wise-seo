#!/usr/bin/env npx tsx

/**
 * Cron job for automated competitor monitoring
 * This script should be run weekly to monitor competitor changes
 */

import { getActiveCompetitorMonitoring, updateCompetitorMonitoring } from '@/lib/db/queries';
import { CompetitorAnalyzer } from '@/lib/seo/competitor-analysis';
import { ChangeDetectionEngine } from '@/lib/seo/change-detection';
import { createCompetitorAnalysis } from '@/lib/db/queries';

interface MonitoringJob {
  competitorMonitoringId: number;
  competitorUrl: string;
  competitorDomain: string;
  primaryWebsiteUrl: string;
  alertsSent: number;
  changeScore: number;
}

interface CronJobResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: string[];
  summary: {
    totalChanges: number;
    highImpactChanges: number;
    newContentFound: number;
    alertsTriggered: number;
  };
}

class CompetitorMonitoringCron {
  /**
   * Run the weekly competitor monitoring job
   */
  static async runWeeklyMonitoring(): Promise<CronJobResult> {
    console.log('🕐 [COMPETITOR MONITORING CRON] Starting weekly competitor monitoring...');

    const result: CronJobResult = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      summary: {
        totalChanges: 0,
        highImpactChanges: 0,
        newContentFound: 0,
        alertsTriggered: 0
      }
    };

    try {
      // Get all active competitor monitoring records
      const activeMonitoring = await getActiveCompetitorMonitoring(''); // TODO: This script is deprecated
      console.log(`📊 [COMPETITOR MONITORING CRON] Found ${activeMonitoring.length} active competitors to monitor`);

      const jobs: MonitoringJob[] = activeMonitoring.map(monitoring => ({
        competitorMonitoringId: monitoring.id,
        competitorUrl: monitoring.competitorUrl,
        competitorDomain: monitoring.competitorDomain,
        primaryWebsiteUrl: '', // Would need to get from user's website analysis
        alertsSent: monitoring.alertsSent || 0,
        changeScore: monitoring.changeScore || 0
      }));

      // Process each competitor
      for (const job of jobs) {
        try {
          console.log(`🔍 [COMPETITOR MONITORING CRON] Processing: ${job.competitorDomain}`);

          const processResult = await this.processCompetitor(job);

          if (processResult.success) {
            result.successful++;
            result.summary.totalChanges += processResult.changes?.totalChanges || 0;
            result.summary.highImpactChanges += processResult.changes?.alerts?.filter((a: any) => a.severity === 'high').length || 0;
            result.summary.newContentFound += processResult.changes?.newPagesCount || 0;
            result.summary.alertsTriggered += processResult.changes?.alerts?.length || 0;

            console.log(`✅ [COMPETITOR MONITORING CRON] Successfully processed: ${job.competitorDomain}`);
          } else {
            result.failed++;
            result.errors.push(`Failed to process ${job.competitorDomain}: ${processResult.error}`);
            console.log(`❌ [COMPETITOR MONITORING CRON] Failed to process: ${job.competitorDomain}`);
          }

          result.totalProcessed++;

          // Add delay between requests to avoid rate limiting
          await this.sleep(2000);

        } catch (error) {
          result.failed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error processing ${job.competitorDomain}: ${errorMsg}`);
          console.error(`❌ [COMPETITOR MONITORING CRON] Error processing ${job.competitorDomain}:`, error);
        }
      }

      // Log summary
      console.log('📈 [COMPETITOR MONITORING CRON] Weekly monitoring completed');
      console.log(`   Total processed: ${result.totalProcessed}`);
      console.log(`   Successful: ${result.successful}`);
      console.log(`   Failed: ${result.failed}`);
      console.log(`   Total changes detected: ${result.summary.totalChanges}`);
      console.log(`   High-impact changes: ${result.summary.highImpactChanges}`);
      console.log(`   New content found: ${result.summary.newContentFound}`);
      console.log(`   Alerts triggered: ${result.summary.alertsTriggered}`);

      return result;

    } catch (error) {
      console.error('❌ [COMPETITOR MONITORING CRON] Critical error in monitoring job:', error);
      result.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Process a single competitor for monitoring
   */
  private static async processCompetitor(job: MonitoringJob): Promise<{
    success: boolean;
    changes?: any;
    error?: string;
  }> {
    try {
      // Get primary website URL (this would need to be stored or fetched)
      const primaryWebsiteUrl = await this.getPrimaryWebsiteUrl();
      if (!primaryWebsiteUrl) {
        return {
          success: false,
          error: 'Primary website URL not found'
        };
      }

      // Perform current competitor analysis
      const currentAnalysis = await CompetitorAnalyzer.analyzeCompetitor({
        competitorUrl: job.competitorUrl,
        primaryWebsiteUrl,
        maxPages: 15,
        analysisType: 'content_gap'
      });

      // Get previous analysis (this would need to be stored in database)
      const previousAnalysis = await this.getPreviousAnalysis(job.competitorMonitoringId);

      let changeResult = null;
      if (previousAnalysis) {
        // Detect changes
        changeResult = await ChangeDetectionEngine.detectChanges(
          job.competitorUrl,
          previousAnalysis,
          currentAnalysis
        );

        // Update monitoring record with changes
        await ChangeDetectionEngine.updateMonitoringRecord(
          job.competitorMonitoringId,
          changeResult
        );
      } else {
        // First time monitoring, create initial analysis
        await this.saveInitialAnalysis(job.competitorMonitoringId, currentAnalysis);
      }

      // Save current analysis for future comparison
      await this.saveCurrentAnalysis(job.competitorMonitoringId, currentAnalysis);

      return {
        success: true,
        changes: changeResult
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get primary website URL for the user
   */
  private static async getPrimaryWebsiteUrl(): Promise<string | null> {
    try {
      // This would fetch the user's primary website from their website analyses
      // For now, return a placeholder
      return null;
    } catch (error) {
      console.error('Error getting primary website URL:', error);
      return null;
    }
  }

  /**
   * Get previous analysis for change detection
   */
  private static async getPreviousAnalysis(competitorMonitoringId: number): Promise<any> {
    try {
      // This would fetch the previous analysis from storage
      // For now, return null (no previous analysis)
      return null;
    } catch (error) {
      console.error('Error getting previous analysis:', error);
      return null;
    }
  }

  /**
   * Save initial analysis
   */
  private static async saveInitialAnalysis(competitorMonitoringId: number, analysis: any): Promise<void> {
    try {
      // This would save the analysis to a file or database for future comparison
      console.log(`💾 [COMPETITOR MONITORING CRON] Saving initial analysis for competitor ID: ${competitorMonitoringId}`);
    } catch (error) {
      console.error('Error saving initial analysis:', error);
    }
  }

  /**
   * Save current analysis for future comparison
   */
  private static async saveCurrentAnalysis(competitorMonitoringId: number, analysis: any): Promise<void> {
    try {
      // This would save the analysis to a file or database for future comparison
      console.log(`💾 [COMPETITOR MONITORING CRON] Saving current analysis for competitor ID: ${competitorMonitoringId}`);
    } catch (error) {
      console.error('Error saving current analysis:', error);
    }
  }

  /**
   * Sleep utility for rate limiting
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send email notifications for high-impact changes
   */
  private static async sendEmailNotifications(changes: any): Promise<void> {
    try {
      const highImpactAlerts = changes.alerts?.filter((alert: any) => alert.severity === 'high') || [];

      if (highImpactAlerts.length > 0) {
        console.log(`📧 [COMPETITOR MONITORING CRON] Would send email for ${highImpactAlerts.length} high-impact alerts`);
        // Implementation would integrate with email service
      }
    } catch (error) {
      console.error('Error sending email notifications:', error);
    }
  }

  /**
   * Generate weekly report
   */
  public static generateWeeklyReport(results: CronJobResult): string {
    const report = `
# Weekly Competitor Monitoring Report

## Summary
- Total competitors monitored: ${results.totalProcessed}
- Successfully processed: ${results.successful}
- Failed to process: ${results.failed}
- Total changes detected: ${results.summary.totalChanges}
- High-impact changes: ${results.summary.highImpactChanges}
- New content discovered: ${results.summary.newContentFound}
- Alerts triggered: ${results.summary.alertsTriggered}

## Key Insights
${results.summary.highImpactChanges > 0 ?
  `⚠️ ${results.summary.highImpactChanges} high-impact competitor changes detected this week. Review these for competitive intelligence.` :
  '✅ No high-impact changes detected this week.'
}

${results.summary.newContentFound > 0 ?
  `📝 Competitors added ${results.summary.newContentFound} new content pieces this week. Consider analyzing these topics for your own content strategy.` :
  ''
}

## Errors
${results.errors.length > 0 ?
  results.errors.map(error => `- ${error}`).join('\n') :
  'No errors reported.'
}

---
Generated on: ${new Date().toISOString()}
    `;

    return report.trim();
  }
}

// Run the cron job if this script is executed directly
if (require.main === module) {
  CompetitorMonitoringCron.runWeeklyMonitoring()
    .then(result => {
      console.log('\n📊 [COMPETITOR MONITORING CRON] Final Report:');
      console.log(CompetitorMonitoringCron.generateWeeklyReport(result));

      if (result.failed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ [COMPETITOR MONITORING CRON] Fatal error:', error);
      process.exit(1);
    });
}

export { CompetitorMonitoringCron };