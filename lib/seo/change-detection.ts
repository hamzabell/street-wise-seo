import { CompetitorAnalysisResult, analyzeCompetitor } from './competitor-analysis';
import { getCompetitorMonitoringById, updateCompetitorMonitoring } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';

export interface ContentChange {
  type: 'new_page' | 'removed_page' | 'updated_page' | 'new_content' | 'removed_content';
  url?: string;
  title?: string;
  description: string;
  timestamp: Date;
  impact: 'high' | 'medium' | 'low';
}

export interface KeywordChange {
  keyword: string;
  previousFrequency: number;
  newFrequency: number;
  change: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface ChangeDetectionResult {
  contentChanges: ContentChange[];
  keywordChanges: KeywordChange[];
  newPagesCount: number;
  removedPagesCount: number;
  updatedPagesCount: number;
  overallChangeScore: number;
  alerts: Array<{
    type: 'content_added' | 'content_removed' | 'significant_keyword_change';
    severity: 'high' | 'medium' | 'low';
    message: string;
    details: any;
  }>;
}

export class ChangeDetectionEngine {
  /**
   * Detect changes between current and previous competitor analysis
   */
  static async detectChanges(
    competitorUrl: string,
    previousAnalysis: CompetitorAnalysisResult,
    currentAnalysis: CompetitorAnalysisResult
  ): Promise<ChangeDetectionResult> {
    console.log('🔍 [CHANGE DETECTION] Analyzing changes for:', competitorUrl);

    const contentChanges = this.detectContentChanges(previousAnalysis, currentAnalysis);
    const keywordChanges = this.detectKeywordChanges(previousAnalysis, currentAnalysis);
    const alerts = this.generateAlerts(contentChanges, keywordChanges);

    const newPagesCount = contentChanges.filter(c => c.type === 'new_page').length;
    const removedPagesCount = contentChanges.filter(c => c.type === 'removed_page').length;
    const updatedPagesCount = contentChanges.filter(c => c.type === 'updated_page').length;

    // Calculate overall change score (0-100)
    const overallChangeScore = this.calculateChangeScore(contentChanges, keywordChanges);

    const result: ChangeDetectionResult = {
      contentChanges,
      keywordChanges,
      newPagesCount,
      removedPagesCount,
      updatedPagesCount,
      overallChangeScore,
      alerts
    };

    console.log('✅ [CHANGE DETECTION] Analysis completed', {
      contentChanges: contentChanges.length,
      keywordChanges: keywordChanges.length,
      changeScore: overallChangeScore
    });

    return result;
  }

  /**
   * Detect content changes between analyses
   */
  private static detectContentChanges(
    previousAnalysis: CompetitorAnalysisResult,
    currentAnalysis: CompetitorAnalysisResult
  ): ContentChange[] {
    const changes: ContentChange[] = [];

    // Note: This would require storing the full crawled page data in the database
    // For now, we'll detect topic changes
    const previousTopics = new Set(previousAnalysis.contentGapAnalysis?.competitorTopics || []);
    const currentTopics = new Set(currentAnalysis.contentGapAnalysis?.competitorTopics || []);

    // Detect new topics (new content)
    const newTopics = Array.from(currentTopics).filter(topic => !previousTopics.has(topic));
    newTopics.slice(0, 10).forEach(topic => {
      changes.push({
        type: 'new_content',
        description: `New topic detected: "${topic}"`,
        timestamp: new Date(),
        impact: this.assessTopicImpact(topic)
      });
    });

    // Detect removed topics (removed content)
    const removedTopics = Array.from(previousTopics).filter(topic => !currentTopics.has(topic));
    removedTopics.slice(0, 10).forEach(topic => {
      changes.push({
        type: 'removed_content',
        description: `Topic removed: "${topic}"`,
        timestamp: new Date(),
        impact: this.assessTopicImpact(topic)
      });
    });

    return changes.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  /**
   * Detect keyword changes between analyses
   */
  private static detectKeywordChanges(
    previousAnalysis: CompetitorAnalysisResult,
    currentAnalysis: CompetitorAnalysisResult
  ): KeywordChange[] {
    const changes: KeywordChange[] = [];

    if (!previousAnalysis.keywordOverlapAnalysis || !currentAnalysis.keywordOverlapAnalysis) {
      return changes;
    }

    const previousKeywords = new Map(
      previousAnalysis.keywordOverlapAnalysis.competitorKeywords.map(k => [k.keyword, k.frequency])
    );
    const currentKeywords = new Map(
      currentAnalysis.keywordOverlapAnalysis.competitorKeywords.map(k => [k.keyword, k.frequency])
    );

    // Find keyword changes
    const allKeywords = new Set([...previousKeywords.keys(), ...currentKeywords.keys()]);

    allKeywords.forEach(keyword => {
      const previousFreq = previousKeywords.get(keyword) || 0;
      const currentFreq = currentKeywords.get(keyword) || 0;

      if (previousFreq !== currentFreq) {
        const change = currentFreq - previousFreq;
        const impact = this.assessKeywordChangeImpact(keyword, change, currentFreq);

        changes.push({
          keyword,
          previousFrequency: previousFreq,
          newFrequency: currentFreq,
          change,
          impact,
          timestamp: new Date()
        });
      }
    });

    return changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  }

  /**
   * Generate alerts based on detected changes
   */
  private static generateAlerts(
    contentChanges: ContentChange[],
    keywordChanges: KeywordChange[]
  ): Array<{
    type: 'content_added' | 'content_removed' | 'significant_keyword_change';
    severity: 'high' | 'medium' | 'low';
    message: string;
    details: any;
  }> {
    const alerts: Array<{
      type: 'content_added' | 'content_removed' | 'significant_keyword_change';
      severity: 'high' | 'medium' | 'low';
      message: string;
      details: any;
    }> = [];

    // Content addition alerts
    const highImpactNewContent = contentChanges.filter(c => c.type === 'new_content' && c.impact === 'high');
    if (highImpactNewContent.length > 0) {
      alerts.push({
        type: 'content_added',
        severity: 'high',
        message: `Competitor added ${highImpactNewContent.length} high-impact content pieces`,
        details: {
          topics: highImpactNewContent.map(c => c.description),
          count: highImpactNewContent.length
        }
      });
    }

    // Content removal alerts
    const significantRemovedContent = contentChanges.filter(c => c.type === 'removed_content' && c.impact !== 'low');
    if (significantRemovedContent.length > 0) {
      alerts.push({
        type: 'content_removed',
        severity: 'medium',
        message: `Competitor removed ${significantRemovedContent.length} content pieces`,
        details: {
          topics: significantRemovedContent.map(c => c.description),
          count: significantRemovedContent.length
        }
      });
    }

    // Keyword change alerts
    const significantKeywordChanges = keywordChanges.filter(k => k.impact === 'high');
    if (significantKeywordChanges.length > 0) {
      alerts.push({
        type: 'significant_keyword_change',
        severity: 'high',
        message: `Significant keyword changes detected (${significantKeywordChanges.length} keywords)`,
        details: {
          keywords: significantKeywordChanges.map(k => ({
            keyword: k.keyword,
            change: k.change,
            newFrequency: k.newFrequency
          })),
          count: significantKeywordChanges.length
        }
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Assess the impact of a topic change
   */
  private static assessTopicImpact(topic: string): 'high' | 'medium' | 'low' {
    // High impact topics are those that suggest business activities
    const highImpactIndicators = [
      'pricing', 'product', 'service', 'solution', 'feature', 'launch',
      'announcement', 'news', 'update', 'case study', 'testimonial'
    ];

    const mediumImpactIndicators = [
      'guide', 'tutorial', 'how to', 'best practices', 'tips',
      'blog', 'article', 'resource', 'tool'
    ];

    const topicLower = topic.toLowerCase();

    if (highImpactIndicators.some(indicator => topicLower.includes(indicator))) {
      return 'high';
    } else if (mediumImpactIndicators.some(indicator => topicLower.includes(indicator))) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Assess the impact of a keyword change
   */
  private static assessKeywordChangeImpact(
    keyword: string,
    change: number,
    newFrequency: number
  ): 'high' | 'medium' | 'low' {
    // High impact: significant change in important keyword
    if (Math.abs(change) > 5 && newFrequency > 10) {
      return 'high';
    }

    // Medium impact: moderate change
    if (Math.abs(change) > 3 && newFrequency > 5) {
      return 'medium';
    }

    // Low impact: minor change or low frequency
    return 'low';
  }

  /**
   * Calculate overall change score
   */
  private static calculateChangeScore(
    contentChanges: ContentChange[],
    keywordChanges: KeywordChange[]
  ): number {
    let score = 0;

    // Weight content changes
    contentChanges.forEach(change => {
      const weight = change.impact === 'high' ? 10 : change.impact === 'medium' ? 5 : 2;
      score += weight;
    });

    // Weight keyword changes
    keywordChanges.forEach(change => {
      const weight = change.impact === 'high' ? 8 : change.impact === 'medium' ? 4 : 1;
      score += weight;
    });

    return Math.min(100, score);
  }

  /**
   * Update competitor monitoring record with change detection results
   */
  static async updateMonitoringRecord(
    competitorMonitoringId: number,
    changeResult: ChangeDetectionResult
  ): Promise<void> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    // Convert changes to JSON for storage
    const newContentDetected = JSON.stringify(
      changeResult.contentChanges.filter(c => c.type === 'new_content').map(c => c.description)
    );
    const removedContentDetected = JSON.stringify(
      changeResult.contentChanges.filter(c => c.type === 'removed_content').map(c => c.description)
    );
    const keywordChanges = JSON.stringify(
      changeResult.keywordChanges.slice(0, 20).map(k => ({
        keyword: k.keyword,
        change: k.change,
        impact: k.impact
      }))
    );

    // Update the monitoring record
    await updateCompetitorMonitoring(competitorMonitoringId, supabaseUserId, {
      lastCrawlDate: new Date(),
      currentPageCount: changeResult.newPagesCount,
      newContentDetected,
      removedContentDetected,
      keywordChanges,
      changeScore: changeResult.overallChangeScore,
      alertsSent: changeResult.alerts.length
    });
  }

  /**
   * Create change summary for dashboard display
   */
  static createChangeSummary(changeResult: ChangeDetectionResult): {
    summary: string;
    hasSignificantChanges: boolean;
    actionItems: string[];
  } {
    const significantChanges = changeResult.alerts.filter(a => a.severity === 'high');
    const hasSignificantChanges = significantChanges.length > 0;

    let summary = '';
    if (changeResult.newPagesCount > 0) {
      summary += `${changeResult.newPagesCount} new page${changeResult.newPagesCount > 1 ? 's' : ''} added. `;
    }
    if (changeResult.removedPagesCount > 0) {
      summary += `${changeResult.removedPagesCount} page${changeResult.removedPagesCount > 1 ? 's' : ''} removed. `;
    }
    if (changeResult.keywordChanges.length > 0) {
      summary += `${changeResult.keywordChanges.length} keyword change${changeResult.keywordChanges.length > 1 ? 's' : ''} detected. `;
    }

    if (summary === '') {
      summary = 'No significant changes detected.';
    }

    const actionItems: string[] = [];
    if (changeResult.newPagesCount > 5) {
      actionItems.push('Review competitor\'s new content strategy');
    }
    if (significantChanges.length > 0) {
      actionItems.push('Investigate high-impact changes for competitive insights');
    }
    if (changeResult.keywordChanges.some(k => k.change > 10)) {
      actionItems.push('Analyze keyword strategy shifts');
    }

    return {
      summary: summary.trim(),
      hasSignificantChanges,
      actionItems
    };
  }
}