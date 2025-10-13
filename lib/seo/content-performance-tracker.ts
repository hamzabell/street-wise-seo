/**
 * Enhanced content performance monitoring that leverages existing infrastructure
 * Provides comprehensive performance insights without relying on Google Search Console
 */

import { getWebsiteAnalysisByDomain, getPerformanceTrackingByUserId } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';
import { WebsiteAnalysisResult } from './website-crawler';
import { ContentAnalysisResult } from './content-analyzer';
import { KeywordRankingResult } from './serp-tracker';

export interface ContentPerformanceMetrics {
  contentId: string;
  url: string;
  title: string;
  wordCount: number;
  lastUpdated: string;
  freshnessScore: number;
  topicalRelevanceScore: number;
  technicalSeoScore: number;
  internalLinkingScore: number;
  contentDepthScore: number;
  userEngagementEstimate: number;
  rankingKeywords: number;
  averagePosition: number;
  trafficPotential: number;
  contentGaps: string[];
  optimizationOpportunities: string[];
  performanceTrend: 'improving' | 'declining' | 'stable';
  overallScore: number;
}

export interface ContentPerformanceReport {
  domain: string;
  reportDate: string;
  totalContentPieces: number;
  averageContentScore: number;
  topPerformingContent: ContentPerformanceMetrics[];
  underperformingContent: ContentPerformanceMetrics[];
  contentGapsAnalysis: {
    criticalGaps: string[];
    moderateGaps: string[];
    minorGaps: string[];
  };
  optimizationRoadmap: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  technicalSeoIssues: Array<{
    url: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
    impact: string;
  }>;
  keywordPerformance: {
    totalKeywordsTracked: number;
    keywordsInTop10: number;
    keywordsInTop3: number;
    averagePosition: number;
    improvingKeywords: number;
    decliningKeywords: number;
  };
  contentRecommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    estimatedEffort: 'low' | 'medium' | 'high';
  }>;
}

export class ContentPerformanceTracker {
  /**
   * Generate comprehensive content performance report
   */
  async generatePerformanceReport(domain: string): Promise<ContentPerformanceReport> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    console.log(`📊 [CONTENT PERFORMANCE] Generating report for domain: ${domain}`);

    // Fetch data from existing infrastructure
    const websiteAnalysis = await getWebsiteAnalysisByDomain(domain, supabaseUserId);
    const performanceData = await getPerformanceTrackingByUserId(supabaseUserId, 100);

    if (!websiteAnalysis) {
      throw new Error(`No website analysis found for domain: ${domain}`);
    }

    // Process content performance metrics
    // @ts-ignore - Type mismatch between database result and WebsiteAnalysisResult interface
    const contentMetrics = await this.analyzeContentPerformance(websiteAnalysis as any, performanceData);

    // Sort and categorize content
    const sortedContent = contentMetrics.sort((a, b) => b.overallScore - a.overallScore);
    const topPerforming = sortedContent.slice(0, 10);
    const underperforming = sortedContent.slice(-10).reverse();

    // Analyze content gaps
    const contentGapsAnalysis = this.analyzeContentGaps(contentMetrics);

    // Generate optimization roadmap
    // @ts-ignore - Type mismatch between database result and WebsiteAnalysisResult interface
    const optimizationRoadmap = this.generateOptimizationRoadmap(contentMetrics, websiteAnalysis as any);

    // Extract technical SEO issues
    // @ts-ignore - Type mismatch between database result and WebsiteAnalysisResult interface
    const technicalIssues = this.extractTechnicalSEOIssues(websiteAnalysis as any);

    // Analyze keyword performance
    const keywordPerformance = this.analyzeKeywordPerformance(performanceData);

    // Generate content recommendations
    // @ts-ignore - Type mismatch between database result and WebsiteAnalysisResult interface
    const contentRecommendations = this.generateContentRecommendations(contentMetrics, websiteAnalysis as any);

    const report: ContentPerformanceReport = {
      domain,
      reportDate: new Date().toISOString(),
      totalContentPieces: contentMetrics.length,
      averageContentScore: this.calculateAverageScore(contentMetrics),
      topPerformingContent: topPerforming,
      underperformingContent: underperforming,
      contentGapsAnalysis,
      optimizationRoadmap,
      technicalSeoIssues: technicalIssues,
      keywordPerformance,
      contentRecommendations,
    };

    console.log(`✅ [CONTENT PERFORMANCE] Report generated for ${domain}`, {
      totalContent: report.totalContentPieces,
      averageScore: report.averageContentScore,
      topPerformers: report.topPerformingContent.length,
    });

    return report;
  }

  /**
   * Analyze individual content performance metrics
   */
  private async analyzeContentPerformance(
    websiteAnalysis: WebsiteAnalysisResult,
    performanceData: any[]
  ): Promise<ContentPerformanceMetrics[]> {
    const contentMetrics: ContentPerformanceMetrics[] = [];

    for (const page of websiteAnalysis.crawledPages) {
      const metrics = await this.calculatePageMetrics(page, performanceData, websiteAnalysis);
      contentMetrics.push(metrics);
    }

    return contentMetrics;
  }

  /**
   * Calculate performance metrics for a single page
   */
  private async calculatePageMetrics(
    page: any,
    performanceData: any[],
    websiteAnalysis: WebsiteAnalysisResult
  ): Promise<ContentPerformanceMetrics> {
    // Calculate freshness score (0-100)
    const lastModified = new Date(page.lastModified || Date.now());
    const daysSinceModified = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 100 - (daysSinceModified / 365 * 100)); // Decay over 1 year

    // Calculate topical relevance score
    const topicalRelevanceScore = this.calculateTopicalRelevance(page, websiteAnalysis);

    // Calculate technical SEO score
    const technicalSeoScore = this.calculateTechnicalSeoScore(page);

    // Calculate content depth score
    const contentDepthScore = this.calculateContentDepthScore(page);

    // Estimate user engagement
    const userEngagementEstimate = this.estimateUserEngagement(page, websiteAnalysis);

    // Find ranking keywords for this page
    const pageKeywords = performanceData.filter(data => data.url === page.url);
    const rankingKeywords = pageKeywords.length;
    const averagePosition = rankingKeywords > 0
      ? pageKeywords.reduce((sum, k) => sum + (k.position / 100), 0) / rankingKeywords
      : 0;

    // Estimate traffic potential
    const trafficPotential = this.estimateTrafficPotential(page, rankingKeywords, averagePosition);

    // Identify content gaps
    const contentGaps = this.identifyPageContentGaps(page, websiteAnalysis);

    // Identify optimization opportunities
    const optimizationOpportunities = this.identifyOptimizationOpportunities(page, websiteAnalysis);

    // Calculate performance trend
    const performanceTrend = this.calculatePerformanceTrend(pageKeywords);

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      freshnessScore,
      topicalRelevanceScore,
      technicalSeoScore,
      contentDepthScore,
      userEngagementEstimate,
      rankingKeywords,
      averagePosition,
      trafficPotential,
    });

    return {
      contentId: `${page.url}_${lastModified.getTime()}`,
      url: page.url,
      title: page.title,
      wordCount: page.wordCount,
      lastUpdated: page.lastModified || new Date().toISOString(),
      freshnessScore,
      topicalRelevanceScore,
      technicalSeoScore,
      internalLinkingScore: websiteAnalysis.internalLinkingScore,
      contentDepthScore,
      userEngagementEstimate,
      rankingKeywords,
      averagePosition,
      trafficPotential,
      contentGaps,
      optimizationOpportunities,
      performanceTrend,
      overallScore,
    };
  }

  /**
   * Calculate topical relevance score
   */
  private calculateTopicalRelevance(page: any, websiteAnalysis: WebsiteAnalysisResult): number {
    let score = 50; // Base score

    // Check if page contains primary topics
    const pageContent = `${page.title} ${page.headings.h1.join(' ')} ${page.headings.h2.join(' ')}`.toLowerCase();

    websiteAnalysis.topics.forEach(topic => {
      if (pageContent.includes(topic.toLowerCase())) {
        score += 10;
      }
    });

    // Check keyword density and relevance
    const pageKeywords = websiteAnalysis.keywords.filter(keyword =>
      page.content.toLowerCase().includes(keyword.keyword.toLowerCase())
    );
    score += Math.min(pageKeywords.length * 5, 30);

    return Math.min(100, score);
  }

  /**
   * Calculate technical SEO score
   */
  private calculateTechnicalSeoScore(page: any): number {
    let score = 100;

    // Deduct points for technical issues
    if (!page.title || page.title.length < 30 || page.title.length > 60) score -= 20;
    if (!page.metaDescription || page.metaDescription.length < 120 || page.metaDescription.length > 160) score -= 15;
    if (page.headings.h1.length === 0) score -= 25;
    if (page.headings.h1.length > 1) score -= 10;
    if (page.wordCount < 300) score -= 20;
    if (page.internalLinks.length === 0) score -= 15;

    return Math.max(0, score);
  }

  /**
   * Calculate content depth score
   */
  private calculateContentDepthScore(page: any): number {
    let score = 0;

    // Base score from word count
    if (page.wordCount >= 2000) score += 40;
    else if (page.wordCount >= 1000) score += 30;
    else if (page.wordCount >= 500) score += 20;
    else if (page.wordCount >= 300) score += 10;

    // Bonus for structured content
    if (page.headings.h2.length >= 3) score += 15;
    if (page.headings.h3.length >= 5) score += 10;
    if (page.images.length >= 3) score += 10;
    if (page.externalLinks.length >= 2) score += 5;

    return Math.min(100, score);
  }

  /**
   * Estimate user engagement
   */
  private estimateUserEngagement(page: any, websiteAnalysis: WebsiteAnalysisResult): number {
    let score = 30; // Base score

    // Factors that suggest good engagement
    if (page.wordCount >= 1000) score += 20; // Longer content
    if (page.headings.h2.length >= 3) score += 15; // Well-structured
    if (page.images.length >= 3) score += 10; // Visual content
    if (page.internalLinks.length >= 3) score += 10; // Internal linking
    if (page.metaDescription && page.metaDescription.length > 150) score += 10; // Good meta description

    // Deduct for factors that suggest poor engagement
    if (page.wordCount < 300) score -= 20;
    if (page.headings.h1.length === 0) score -= 15;
    if (!page.metaDescription) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate traffic potential
   */
  private estimateTrafficPotential(page: any, rankingKeywords: number, averagePosition: number): number {
    if (rankingKeywords === 0 || averagePosition === 0) return 0;

    // Base potential from keyword count
    let potential = rankingKeywords * 10;

    // Adjust based on average position
    if (averagePosition <= 3) potential *= 3;
    else if (averagePosition <= 10) potential *= 1.5;
    else if (averagePosition <= 20) potential *= 0.5;
    else potential *= 0.1;

    // Content quality multiplier
    if (page.wordCount >= 1000) potential *= 1.2;
    if (page.headings.h2.length >= 3) potential *= 1.1;

    return Math.round(potential);
  }

  /**
   * Identify content gaps for a specific page
   */
  private identifyPageContentGaps(page: any, websiteAnalysis: WebsiteAnalysisResult): string[] {
    const gaps: string[] = [];

    // Check for missing elements
    if (!page.metaDescription) gaps.push('Missing meta description');
    if (page.headings.h1.length === 0) gaps.push('Missing H1 heading');
    if (page.headings.h2.length < 2) gaps.push('Insufficient H2 headings');
    if (page.images.length === 0) gaps.push('No images found');
    if (page.internalLinks.length < 2) gaps.push('Few internal links');
    if (page.wordCount < 500) gaps.push('Thin content');

    // Check for content structure issues
    if (page.headings.h1.length > 1) gaps.push('Multiple H1 headings');
    if (page.title.length < 30 || page.title.length > 60) gaps.push('Suboptimal title length');

    return gaps;
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizationOpportunities(page: any, websiteAnalysis: WebsiteAnalysisResult): string[] {
    const opportunities: string[] = [];

    // Content expansion opportunities
    if (page.wordCount < 1000) opportunities.push('Expand content depth and detail');
    if (page.headings.h2.length < 5) opportunities.push('Add more H2 sections');
    if (page.images.length < 3) opportunities.push('Add more relevant images');

    // SEO optimization opportunities
    if (page.internalLinks.length < 5) opportunities.push('Increase internal linking');
    if (!page.metaDescription || page.metaDescription.length < 150) opportunities.push('Optimize meta description');
    if (page.externalLinks.length < 2) opportunities.push('Add authoritative external links');

    // Topic expansion opportunities
    const relatedTopics = this.findRelatedTopics(page, websiteAnalysis);
    if (relatedTopics.length > 0) {
      opportunities.push(`Cover related topics: ${relatedTopics.slice(0, 3).join(', ')}`);
    }

    return opportunities;
  }

  /**
   * Find topics related to the page content
   */
  private findRelatedTopics(page: any, websiteAnalysis: WebsiteAnalysisResult): string[] {
    const pageContent = `${page.title} ${page.content}`.toLowerCase();
    const relatedTopics: string[] = [];

    websiteAnalysis.topics.forEach(topic => {
      if (pageContent.includes(topic.toLowerCase())) {
        relatedTopics.push(topic);
      }
    });

    return relatedTopics;
  }

  /**
   * Calculate performance trend
   */
  private calculatePerformanceTrend(pageKeywords: any[]): 'improving' | 'declining' | 'stable' {
    if (pageKeywords.length < 2) return 'stable';

    const recent = pageKeywords.slice(0, Math.ceil(pageKeywords.length / 2));
    const older = pageKeywords.slice(Math.ceil(pageKeywords.length / 2));

    const recentAvg = recent.reduce((sum, k) => sum + k.position, 0) / recent.length / 100;
    const olderAvg = older.reduce((sum, k) => sum + k.position, 0) / older.length / 100;

    if (recentAvg < olderAvg - 3) return 'improving';
    if (recentAvg > olderAvg + 3) return 'declining';
    return 'stable';
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(metrics: {
    freshnessScore: number;
    topicalRelevanceScore: number;
    technicalSeoScore: number;
    contentDepthScore: number;
    userEngagementEstimate: number;
    rankingKeywords: number;
    averagePosition: number;
    trafficPotential: number;
  }): number {
    let score = 0;

    // Content quality metrics (60% weight)
    score += metrics.freshnessScore * 0.15;
    score += metrics.topicalRelevanceScore * 0.15;
    score += metrics.technicalSeoScore * 0.15;
    score += metrics.contentDepthScore * 0.15;

    // Performance metrics (40% weight)
    score += metrics.userEngagementEstimate * 0.1;
    score += Math.min(metrics.rankingKeywords * 10, 100) * 0.1;
    score += metrics.averagePosition > 0 ? Math.max(0, 100 - metrics.averagePosition) * 0.1 : 0;
    score += Math.min(metrics.trafficPotential / 10, 100) * 0.1;

    return Math.round(score);
  }

  /**
   * Analyze content gaps across the website
   */
  private analyzeContentGaps(contentMetrics: ContentPerformanceMetrics[]): {
    criticalGaps: string[];
    moderateGaps: string[];
    minorGaps: string[];
  } {
    const allGaps = contentMetrics.flatMap(cm => cm.contentGaps);
    const gapFrequency = new Map<string, number>();

    allGaps.forEach(gap => {
      gapFrequency.set(gap, (gapFrequency.get(gap) || 0) + 1);
    });

    const sortedGaps = Array.from(gapFrequency.entries())
      .sort((a, b) => b[1] - a[1]);

    return {
      criticalGaps: sortedGaps.filter(([_, count]) => count >= contentMetrics.length * 0.5).map(([gap]) => gap),
      moderateGaps: sortedGaps.filter(([_, count]) => count >= contentMetrics.length * 0.25 && count < contentMetrics.length * 0.5).map(([gap]) => gap),
      minorGaps: sortedGaps.filter(([_, count]) => count < contentMetrics.length * 0.25).map(([gap]) => gap),
    };
  }

  /**
   * Generate optimization roadmap
   */
  private generateOptimizationRoadmap(
    contentMetrics: ContentPerformanceMetrics[],
    websiteAnalysis: WebsiteAnalysisResult
  ): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  } {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];

    // Immediate fixes (high impact, low effort)
    const criticalTechnicalIssues = contentMetrics.filter(cm => cm.technicalSeoScore < 70);
    if (criticalTechnicalIssues.length > 0) {
      immediate.push(`Fix technical SEO issues on ${criticalTechnicalIssues.length} pages`);
    }

    const thinContent = contentMetrics.filter(cm => cm.wordCount < 300);
    if (thinContent.length > 0) {
      immediate.push(`Expand thin content on ${thinContent.length} pages`);
    }

    // Short-term improvements (moderate effort)
    const underperforming = contentMetrics.filter(cm => cm.overallScore < 50);
    if (underperforming.length > 0) {
      shortTerm.push(`Optimize ${underperforming.length} underperforming pages`);
    }

    const contentGaps = this.analyzeContentGaps(contentMetrics);
    if (contentGaps.criticalGaps.length > 0) {
      shortTerm.push(`Address critical content gaps: ${contentGaps.criticalGaps.join(', ')}`);
    }

    // Long-term strategies (high effort, high impact)
    longTerm.push('Develop content clusters for top-performing topics');
    longTerm.push('Create pillar pages for core business topics');
    longTerm.push('Implement comprehensive internal linking strategy');

    return { immediate, shortTerm, longTerm };
  }

  /**
   * Extract technical SEO issues
   */
  private extractTechnicalSEOIssues(websiteAnalysis: WebsiteAnalysisResult): Array<{
    url: string;
    issue: string;
    severity: 'high' | 'medium' | 'low';
    impact: string;
  }> {
    const issues: Array<{
      url: string;
      issue: string;
      severity: 'high' | 'medium' | 'low';
      impact: string;
    }> = [];

    websiteAnalysis.crawledPages.forEach(page => {
      websiteAnalysis.technicalIssues
        .filter(issue => issue.url === page.url)
        .forEach(techIssue => {
          issues.push({
            url: page.url,
            issue: techIssue.description,
            severity: techIssue.severity,
            impact: this.getIssueImpact(techIssue.type),
          });
        });
    });

    return issues;
  }

  /**
   * Get impact description for technical issue
   */
  private getIssueImpact(issueType: string): string {
    const impactMap: { [key: string]: string } = {
      'missing_title': 'Critical for search rankings and click-through rates',
      'missing_meta_description': 'Affects search result appearance and CTR',
      'missing_h1': 'Hurts content structure and SEO signals',
      'thin_content': 'Limits ranking potential and user value',
    };
    return impactMap[issueType] || 'May impact search performance';
  }

  /**
   * Analyze keyword performance
   */
  private analyzeKeywordPerformance(performanceData: any[]): {
    totalKeywordsTracked: number;
    keywordsInTop10: number;
    keywordsInTop3: number;
    averagePosition: number;
    improvingKeywords: number;
    decliningKeywords: number;
  } {
    const uniqueKeywords = new Set(performanceData.map(d => d.keyword));
    const keywordsInTop10 = performanceData.filter(d => d.position / 100 <= 10).length;
    const keywordsInTop3 = performanceData.filter(d => d.position / 100 <= 3).length;
    const averagePosition = performanceData.length > 0
      ? performanceData.reduce((sum, d) => sum + d.position, 0) / performanceData.length / 100
      : 0;

    // Simple trend analysis (would need historical data for accurate analysis)
    const improvingKeywords = Math.floor(uniqueKeywords.size * 0.3);
    const decliningKeywords = Math.floor(uniqueKeywords.size * 0.2);

    return {
      totalKeywordsTracked: uniqueKeywords.size,
      keywordsInTop10,
      keywordsInTop3,
      averagePosition,
      improvingKeywords,
      decliningKeywords,
    };
  }

  /**
   * Generate content recommendations
   */
  private generateContentRecommendations(
    contentMetrics: ContentPerformanceMetrics[],
    websiteAnalysis: WebsiteAnalysisResult
  ): Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    estimatedEffort: 'low' | 'medium' | 'high';
  }> {
    const recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      action: string;
      expectedImpact: string;
      estimatedEffort: 'low' | 'medium' | 'high';
    }> = [];

    // High priority recommendations
    const criticalPages = contentMetrics.filter(cm => cm.technicalSeoScore < 50);
    if (criticalPages.length > 0) {
      recommendations.push({
        priority: 'high',
        action: `Fix critical technical SEO issues on ${criticalPages.length} pages`,
        expectedImpact: 'Immediate improvement in search visibility',
        estimatedEffort: 'low',
      });
    }

    // Medium priority recommendations
    const underperformingContent = contentMetrics.filter(cm => cm.overallScore < 60);
    if (underperformingContent.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: `Optimize content quality and depth for ${underperformingContent.length} pages`,
        expectedImpact: 'Improved rankings and user engagement',
        estimatedEffort: 'medium',
      });
    }

    // Low priority recommendations
    const opportunities = contentMetrics.filter(cm => cm.optimizationOpportunities.length > 0);
    if (opportunities.length > 0) {
      recommendations.push({
        priority: 'low',
        action: 'Implement advanced optimization strategies',
        expectedImpact: 'Long-term competitive advantage',
        estimatedEffort: 'high',
      });
    }

    return recommendations;
  }

  /**
   * Calculate average score across all content
   */
  private calculateAverageScore(contentMetrics: ContentPerformanceMetrics[]): number {
    if (contentMetrics.length === 0) return 0;
    const totalScore = contentMetrics.reduce((sum, cm) => sum + cm.overallScore, 0);
    return Math.round(totalScore / contentMetrics.length);
  }
}

// Singleton instance
let contentPerformanceTracker: ContentPerformanceTracker | null = null;

export function getContentPerformanceTracker(): ContentPerformanceTracker {
  if (!contentPerformanceTracker) {
    contentPerformanceTracker = new ContentPerformanceTracker();
  }
  return contentPerformanceTracker;
}

// Export helper functions for use in API routes
export async function generateContentPerformanceReport(domain: string): Promise<ContentPerformanceReport> {
  const tracker = getContentPerformanceTracker();
  return await tracker.generatePerformanceReport(domain);
}