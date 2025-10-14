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

// Enhanced interfaces for performance-based personalization
export interface UserPreferenceProfile {
  userId: string;
  businessId: string;

  // Content preferences based on performance
  preferredContentTypes: Record<string, {
    count: number;
    avgScore: number;
    successRate: number;
  }>;

  preferredTopics: Record<string, {
    count: number;
    avgScore: number;
    successRate: number;
  }>;

  preferredTones: Record<string, {
    count: number;
    avgScore: number;
    engagementRate: number;
  }>;

  preferredLengths: Record<string, {
    count: number;
    avgScore: number;
    readTime: number;
  }>;

  // Performance patterns
  successfulPatterns: ContentPattern[];
  unsuccessfulPatterns: ContentPattern[];

  // Engagement patterns
  peakEngagementTimes: number[];
  preferredPublishingDays: number[];
  seasonalPreferences: Record<string, number>;

  // Learning metrics
  totalContentAnalyzed: number;
  accuracyScore: number;
  lastUpdated: Date;
  modelVersion: string;
}

export interface ContentPattern {
  characteristics: {
    contentType: string;
    topicCategory: string;
    tone: string;
    length: number;
    structure: string[];
    keywords: string[];
    multimediaElements: number;
  };

  performance: {
    avgEngagement: number;
    avgConversion: number;
    avgSEO: number;
    successRate: number;
  };

  frequency: number;
  confidence: number;
  predictivePower: number;
}

export interface PersonalizationInsights {
  userProfile: UserPreferenceProfile;

  // Content recommendations based on performance
  contentRecommendations: {
    optimalContentTypes: Array<{
      type: string;
      confidence: number;
      expectedScore: number;
      reasoning: string;
    }>;

    topicSuggestions: Array<{
      topic: string;
      category: string;
      priority: number;
      confidence: number;
      expectedPerformance: number;
    }>;

    toneRecommendations: Array<{
      tone: string;
      usage: number;
      effectiveness: number;
      expectedEngagement: number;
    }>;

    structuralPreferences: {
      optimalLength: number;
      optimalReadTime: number;
      preferredStructure: string[];
      multimediaNeeds: string[];
      keywordDensity: number;
    };
  };

  // Performance optimization recommendations
  performanceOptimization: {
    bestPublishingTimes: number[];
    optimalPublishingFrequency: number;
    seasonalAdjustments: Record<string, number>;
    contentRefreshSchedule: Record<string, number>;
  };

  // Strategic guidance
  strategicGuidance: {
    focusAreas: string[];
    avoidAreas: string[];
    competitiveAdvantages: string[];
    growthOpportunities: string[];
  };

  // Predictive insights
  predictiveAnalytics: {
    nextQuarterPerformance: number;
    contentSuccessProbability: number;
    recommendedContentMix: Record<string, number>;
    riskFactors: string[];
  };
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

  // ===================
  // PERSONALIZATION METHODS
  // ===================

  /**
   * Generate personalized insights based on user's content performance history
   */
  async generatePersonalizationInsights(
    userId: string,
    businessId: string,
    contentHistory?: ContentPerformanceMetrics[],
    performanceData?: any[]
  ): Promise<PersonalizationInsights> {
    console.log(`🎯 [PERSONALIZATION] Generating insights for user: ${userId}, business: ${businessId}`);

    // Get or create user preference profile
    const userProfile = await this.getUserPreferenceProfile(userId, businessId, contentHistory);

    // Analyze performance patterns
    await this.analyzePerformancePatterns(userProfile, contentHistory, performanceData);

    // Generate personalization insights
    const insights = await this.generatePersonalizationRecommendations(userProfile);

    console.log(`✅ [PERSONALIZATION] Insights generated for ${userId}`, {
      optimalContentTypes: insights.contentRecommendations.optimalContentTypes.length,
      topicSuggestions: insights.contentRecommendations.topicSuggestions.length,
      accuracyScore: userProfile.accuracyScore
    });

    return insights;
  }

  /**
   * Get user preference profile, creating one if it doesn't exist
   */
  private async getUserPreferenceProfile(
    userId: string,
    businessId: string,
    contentHistory?: ContentPerformanceMetrics[]
  ): Promise<UserPreferenceProfile> {
    // Check cache first (in a real implementation, this would check database)
    const cacheKey = `${userId}_${businessId}`;
    let profile = this.getUserProfileFromCache(cacheKey);

    if (!profile) {
      profile = await this.createUserProfile(userId, businessId, contentHistory);
      this.cacheUserProfile(cacheKey, profile);
    }

    // Update profile with new content data if available
    if (contentHistory && contentHistory.length > 0) {
      profile = await this.updateUserProfileWithNewData(profile, contentHistory);
      this.cacheUserProfile(cacheKey, profile);
    }

    return profile;
  }

  /**
   * Create new user preference profile
   */
  private async createUserProfile(
    userId: string,
    businessId: string,
    contentHistory?: ContentPerformanceMetrics[]
  ): Promise<UserPreferenceProfile> {
    const profile: UserPreferenceProfile = {
      userId,
      businessId,
      preferredContentTypes: {},
      preferredTopics: {},
      preferredTones: {},
      preferredLengths: {},
      successfulPatterns: [],
      unsuccessfulPatterns: [],
      peakEngagementTimes: [9, 14, 19], // Default business hours
      preferredPublishingDays: [1, 2, 3, 4], // Monday-Thursday
      seasonalPreferences: {
        spring: 25,
        summer: 25,
        fall: 25,
        winter: 25
      },
      totalContentAnalyzed: contentHistory?.length || 0,
      accuracyScore: 0.75, // Start with 75% accuracy
      lastUpdated: new Date(),
      modelVersion: '1.0.0'
    };

    // Analyze existing content history if available
    if (contentHistory && contentHistory.length > 0) {
      await this.analyzeInitialContentPatterns(profile, contentHistory);
    }

    return profile;
  }

  /**
   * Analyze initial content patterns from existing history
   */
  private async analyzeInitialContentPatterns(
    profile: UserPreferenceProfile,
    contentHistory: ContentPerformanceMetrics[]
  ): Promise<void> {
    contentHistory.forEach(content => {
      // Analyze content type preferences
      const contentType = this.inferContentType(content);
      this.updateContentTypePreference(profile, contentType, content);

      // Analyze topic preferences
      const topicCategory = this.inferTopicCategory(content);
      this.updateTopicPreference(profile, topicCategory, content);

      // Analyze length preferences
      const lengthCategory = this.categorizeContentLength(content.wordCount);
      this.updateLengthPreference(profile, lengthCategory, content);

      // Analyze tone preferences (would need NLP analysis)
      const tone = this.inferContentTone(content);
      this.updateTonePreference(profile, tone, content);

      // Create content patterns
      const pattern = this.createContentPattern(content);
      if (content.overallScore >= 70) {
        profile.successfulPatterns.push(pattern);
      } else {
        profile.unsuccessfulPatterns.push(pattern);
      }
    });

    // Calculate initial accuracy based on pattern performance
    profile.accuracyScore = this.calculateProfileAccuracy(profile);
  }

  /**
   * Update user profile with new content performance data
   */
  private async updateUserProfileWithNewData(
    profile: UserPreferenceProfile,
    contentHistory: ContentPerformanceMetrics[]
  ): Promise<UserPreferenceProfile> {
    contentHistory.forEach(content => {
      // Update preferences with new data
      const contentType = this.inferContentType(content);
      this.updateContentTypePreference(profile, contentType, content);

      const topicCategory = this.inferTopicCategory(content);
      this.updateTopicPreference(profile, topicCategory, content);

      const lengthCategory = this.categorizeContentLength(content.wordCount);
      this.updateLengthPreference(profile, lengthCategory, content);

      const tone = this.inferContentTone(content);
      this.updateTonePreference(profile, tone, content);

      // Update content patterns
      const pattern = this.createContentPattern(content);
      this.updateContentPatterns(profile, pattern);

      // Update engagement patterns
      this.updateEngagementPatterns(profile, content);
    });

    profile.totalContentAnalyzed += contentHistory.length;
    profile.lastUpdated = new Date();

    // Recalculate accuracy
    profile.accuracyScore = this.calculateProfileAccuracy(profile);

    return profile;
  }

  /**
   * Analyze performance patterns and update insights
   */
  private async analyzePerformancePatterns(
    profile: UserPreferenceProfile,
    contentHistory?: ContentPerformanceMetrics[],
    performanceData?: any[]
  ): Promise<void> {
    // Analyze successful vs unsuccessful patterns
    this.updatePatternPredictions(profile);

    // Identify high-performing characteristics
    this.identifyHighPerformanceCharacteristics(profile);

    // Update confidence scores
    this.updatePredictionConfidence(profile);
  }

  /**
   * Generate personalization recommendations based on user profile
   */
  private async generatePersonalizationRecommendations(profile: UserPreferenceProfile): Promise<PersonalizationInsights> {
    return {
      userProfile: profile,
      contentRecommendations: {
        optimalContentTypes: this.getOptimalContentTypes(profile),
        topicSuggestions: this.getTopicSuggestions(profile),
        toneRecommendations: this.getToneRecommendations(profile),
        structuralPreferences: this.getStructuralPreferences(profile)
      },
      performanceOptimization: {
        bestPublishingTimes: profile.peakEngagementTimes,
        optimalPublishingFrequency: this.calculateOptimalFrequency(profile),
        seasonalAdjustments: profile.seasonalPreferences,
        contentRefreshSchedule: this.generateRefreshSchedule(profile)
      },
      strategicGuidance: {
        focusAreas: this.getFocusAreas(profile),
        avoidAreas: this.getAvoidAreas(profile),
        competitiveAdvantages: this.getCompetitiveAdvantages(profile),
        growthOpportunities: this.getGrowthOpportunities(profile)
      },
      predictiveAnalytics: {
        nextQuarterPerformance: this.predictNextQuarterPerformance(profile),
        contentSuccessProbability: this.calculateSuccessProbability(profile),
        recommendedContentMix: this.getRecommendedContentMix(profile),
        riskFactors: this.identifyRiskFactors(profile)
      }
    };
  }

  // Helper methods for preference analysis
  private inferContentType(content: ContentPerformanceMetrics): string {
    const title = content.title.toLowerCase();
    const url = content.url.toLowerCase();

    if (title.includes('blog') || url.includes('/blog/')) return 'blog_post';
    if (title.includes('guide') || title.includes('how to')) return 'guide';
    if (title.includes('service') || title.includes('about')) return 'service_page';
    if (title.includes('contact') || title.includes('quote')) return 'conversion_page';
    if (title.includes('portfolio') || title.includes('work')) return 'portfolio';

    return 'general_content';
  }

  private inferTopicCategory(content: ContentPerformanceMetrics): string {
    const title = content.title.toLowerCase();
    const url = content.url.toLowerCase();

    if (title.includes('plumbing') || url.includes('plumbing')) return 'plumbing';
    if (title.includes('hvac') || title.includes('air conditioning')) return 'hvac';
    if (title.includes('electrical') || title.includes('electrician')) return 'electrical';
    if (title.includes('cleaning') || title.includes('janitorial')) return 'cleaning';
    if (title.includes('landscaping') || title.includes('lawn')) return 'landscaping';
    if (title.includes('roofing') || title.includes('roofer')) return 'roofing';

    return 'general_service';
  }

  private categorizeContentLength(wordCount: number): string {
    if (wordCount < 300) return 'short';
    if (wordCount < 800) return 'medium';
    if (wordCount < 1500) return 'long';
    return 'extended';
  }

  private inferContentTone(content: ContentPerformanceMetrics): string {
    const title = content.title.toLowerCase();

    if (title.includes('professional') || title.includes('expert')) return 'professional';
    if (title.includes('guide') || title.includes('tips')) return 'informative';
    if (title.includes('best') || title.includes('top')) return 'authoritative';
    if (title.includes('how to') || title.includes('easy')) return 'helpful';
    if (title.includes('emergency') || title.includes('urgent')) return 'urgent';

    return 'neutral';
  }

  private createContentPattern(content: ContentPerformanceMetrics): ContentPattern {
    return {
      characteristics: {
        contentType: this.inferContentType(content),
        topicCategory: this.inferTopicCategory(content),
        tone: this.inferContentTone(content),
        length: content.wordCount,
        structure: ['title', 'introduction', 'main content', 'conclusion'],
        keywords: [], // Would extract from content
        multimediaElements: 0 // Would analyze from content
      },
      performance: {
        avgEngagement: content.userEngagementEstimate,
        avgConversion: content.trafficPotential / 100, // Simplified
        avgSEO: content.topicalRelevanceScore,
        successRate: content.overallScore > 70 ? 1 : 0
      },
      frequency: 1,
      confidence: 0.5,
      predictivePower: 0.3
    };
  }

  private updateContentTypePreference(profile: UserPreferenceProfile, contentType: string, content: ContentPerformanceMetrics): void {
    if (!profile.preferredContentTypes[contentType]) {
      profile.preferredContentTypes[contentType] = {
        count: 0,
        avgScore: 0,
        successRate: 0
      };
    }

    const pref = profile.preferredContentTypes[contentType];
    pref.count++;
    pref.avgScore = (pref.avgScore * (pref.count - 1) + content.overallScore) / pref.count;
    pref.successRate = (pref.successRate * (pref.count - 1) + (content.overallScore > 70 ? 1 : 0)) / pref.count;
  }

  private updateTopicPreference(profile: UserPreferenceProfile, topicCategory: string, content: ContentPerformanceMetrics): void {
    if (!profile.preferredTopics[topicCategory]) {
      profile.preferredTopics[topicCategory] = {
        count: 0,
        avgScore: 0,
        successRate: 0
      };
    }

    const pref = profile.preferredTopics[topicCategory];
    pref.count++;
    pref.avgScore = (pref.avgScore * (pref.count - 1) + content.overallScore) / pref.count;
    pref.successRate = (pref.successRate * (pref.count - 1) + (content.overallScore > 70 ? 1 : 0)) / pref.count;
  }

  private updateTonePreference(profile: UserPreferenceProfile, tone: string, content: ContentPerformanceMetrics): void {
    if (!profile.preferredTones[tone]) {
      profile.preferredTones[tone] = {
        count: 0,
        avgScore: 0,
        engagementRate: 0
      };
    }

    const pref = profile.preferredTones[tone];
    pref.count++;
    pref.avgScore = (pref.avgScore * (pref.count - 1) + content.overallScore) / pref.count;
    pref.engagementRate = (pref.engagementRate * (pref.count - 1) + content.userEngagementEstimate) / pref.count;
  }

  private updateLengthPreference(profile: UserPreferenceProfile, lengthCategory: string, content: ContentPerformanceMetrics): void {
    if (!profile.preferredLengths[lengthCategory]) {
      profile.preferredLengths[lengthCategory] = {
        count: 0,
        avgScore: 0,
        readTime: content.wordCount / 200 // Average reading speed
      };
    }

    const pref = profile.preferredLengths[lengthCategory];
    pref.count++;
    pref.avgScore = (pref.avgScore * (pref.count - 1) + content.overallScore) / pref.count;
    pref.readTime = (pref.readTime * (pref.count - 1) + (content.wordCount / 200)) / pref.count;
  }

  private updateContentPatterns(profile: UserPreferenceProfile, pattern: ContentPattern): void {
    // Update pattern frequency and confidence
    const existingPattern = profile.successfulPatterns.find(p =>
      p.characteristics.contentType === pattern.characteristics.contentType &&
      p.characteristics.topicCategory === pattern.characteristics.topicCategory
    );

    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.confidence = Math.min(0.95, existingPattern.confidence + 0.05);
    } else {
      if (pattern.performance.successRate > 0.7) {
        profile.successfulPatterns.push(pattern);
      } else {
        profile.unsuccessfulPatterns.push(pattern);
      }
    }
  }

  private updateEngagementPatterns(profile: UserPreferenceProfile, content: ContentPerformanceMetrics): void {
    // Simple engagement time analysis
    // In a real implementation, this would use actual engagement timestamps
    const engagementScore = content.userEngagementEstimate;

    if (engagementScore > 80) {
      // Content performing well, current time might be good
      const currentHour = new Date().getHours();
      if (!profile.peakEngagementTimes.includes(currentHour)) {
        profile.peakEngagementTimes.push(currentHour);
      }
    }
  }

  private calculateProfileAccuracy(profile: UserPreferenceProfile): number {
    if (profile.totalContentAnalyzed === 0) return 0.75;

    let totalPredictions = 0;
    let correctPredictions = 0;

    // Check content type predictions
    Object.values(profile.preferredContentTypes).forEach(pref => {
      totalPredictions += pref.count;
      correctPredictions += pref.count * pref.successRate;
    });

    if (totalPredictions === 0) return 0.75;

    return Math.min(0.95, correctPredictions / totalPredictions);
  }

  // Recommendation generation methods
  private getOptimalContentTypes(profile: UserPreferenceProfile): Array<{
    type: string;
    confidence: number;
    expectedScore: number;
    reasoning: string;
  }> {
    return Object.entries(profile.preferredContentTypes)
      .sort(([, a], [, b]) => b.avgScore - a.avgScore)
      .slice(0, 5)
      .map(([type, data]) => ({
        type,
        confidence: data.successRate,
        expectedScore: data.avgScore,
        reasoning: `Based on ${data.count} pieces with ${Math.round(data.successRate * 100)}% success rate`
      }));
  }

  private getTopicSuggestions(profile: UserPreferenceProfile): Array<{
    topic: string;
    category: string;
    priority: number;
    confidence: number;
    expectedPerformance: number;
  }> {
    return Object.entries(profile.preferredTopics)
      .sort(([, a], [, b]) => b.avgScore - a.avgScore)
      .slice(0, 8)
      .map(([category, data], index) => ({
        topic: `${category} strategies and best practices`,
        category,
        priority: index + 1,
        confidence: data.successRate,
        expectedPerformance: data.avgScore
      }));
  }

  private getToneRecommendations(profile: UserPreferenceProfile): Array<{
    tone: string;
    usage: number;
    effectiveness: number;
    expectedEngagement: number;
  }> {
    return Object.entries(profile.preferredTones)
      .sort(([, a], [, b]) => b.engagementRate - a.engagementRate)
      .slice(0, 4)
      .map(([tone, data]) => ({
        tone,
        usage: data.count,
        effectiveness: data.avgScore,
        expectedEngagement: data.engagementRate
      }));
  }

  private getStructuralPreferences(profile: UserPreferenceProfile): any {
    const bestLength = Object.entries(profile.preferredLengths)
      .sort(([, a], [, b]) => b.avgScore - a.avgScore)[0];

    const lengthMap = {
      short: 300,
      medium: 800,
      long: 1500,
      extended: 2000
    };

    return {
      optimalLength: lengthMap[bestLength?.[0] as keyof typeof lengthMap] || 800,
      optimalReadTime: bestLength?.[1]?.readTime || 4,
      preferredStructure: ['title', 'introduction', 'main content', 'conclusion', 'call-to-action'],
      multimediaNeeds: ['images', 'videos'],
      keywordDensity: 1.5
    };
  }

  private calculateOptimalFrequency(profile: UserPreferenceProfile): number {
    // Base frequency on total content and engagement
    const baseFrequency = 3; // 3 times per week
    const engagementMultiplier = profile.accuracyScore > 0.8 ? 1.2 : 1.0;

    return Math.round(baseFrequency * engagementMultiplier);
  }

  private generateRefreshSchedule(profile: UserPreferenceProfile): Record<string, number> {
    return {
      '30_days': 30,
      '60_days': 60,
      '90_days': 90,
      '180_days': 180
    };
  }

  private getFocusAreas(profile: UserPreferenceProfile): string[] {
    return Object.entries(profile.preferredTopics)
      .sort(([, a], [, b]) => b.avgScore - a.avgScore)
      .slice(0, 3)
      .map(([category]) => category);
  }

  private getAvoidAreas(profile: UserPreferenceProfile): string[] {
    // Areas with low performance
    return Object.entries(profile.preferredTopics)
      .filter(([, data]) => data.avgScore < 50)
      .map(([category]) => category);
  }

  private getCompetitiveAdvantages(profile: UserPreferenceProfile): string[] {
    return Object.entries(profile.preferredContentTypes)
      .filter(([, data]) => data.successRate > 0.8)
      .map(([type]) => `High-performing ${type} content`);
  }

  private getGrowthOpportunities(profile: UserPreferenceProfile): string[] {
    const opportunities: string[] = [];

    if (profile.accuracyScore > 0.85) {
      opportunities.push('Expand into new content categories');
    }

    if (Object.keys(profile.preferredContentTypes).length < 3) {
      opportunities.push('Diversify content types');
    }

    return opportunities;
  }

  private predictNextQuarterPerformance(profile: UserPreferenceProfile): number {
    const currentAverage = Object.values(profile.preferredContentTypes)
      .reduce((sum, data) => sum + data.avgScore, 0) /
      Object.keys(profile.preferredContentTypes).length || 70;

    // Predict slight improvement based on learning
    const learningImprovement = profile.accuracyScore * 5;

    return Math.min(90, currentAverage + learningImprovement);
  }

  private calculateSuccessProbability(profile: UserPreferenceProfile): number {
    return profile.accuracyScore;
  }

  private getRecommendedContentMix(profile: UserPreferenceProfile): Record<string, number> {
    const mix: Record<string, number> = {};
    const total = Object.values(profile.preferredContentTypes).reduce((sum, data) => sum + data.count, 0);

    Object.entries(profile.preferredContentTypes).forEach(([type, data]) => {
      mix[type] = data.count / total;
    });

    return mix;
  }

  private identifyRiskFactors(profile: UserPreferenceProfile): string[] {
    const risks: string[] = [];

    if (profile.totalContentAnalyzed < 10) {
      risks.push('Limited data for accurate predictions');
    }

    if (profile.accuracyScore < 0.7) {
      risks.push('Model accuracy needs improvement');
    }

    if (Object.keys(profile.preferredContentTypes).length === 1) {
      risks.push('Content type concentration risk');
    }

    return risks;
  }

  // Pattern analysis methods
  private updatePatternPredictions(profile: UserPreferenceProfile): void {
    profile.successfulPatterns.forEach(pattern => {
      // Update predictive power based on recent performance
      pattern.predictivePower = Math.min(0.9, pattern.predictivePower + 0.05);
    });
  }

  private identifyHighPerformanceCharacteristics(profile: UserPreferenceProfile): void {
    // Analyze what makes content successful
    const highPerformingPatterns = profile.successfulPatterns.filter(p => p.performance.successRate > 0.8);

    // Would update preferences based on common characteristics
  }

  private updatePredictionConfidence(profile: UserPreferenceProfile): void {
    profile.successfulPatterns.forEach(pattern => {
      if (pattern.frequency >= 5) {
        pattern.confidence = Math.min(0.95, pattern.confidence + 0.02);
      }
    });
  }

  // Cache management (simplified - would use database in production)
  private profileCache: Map<string, UserPreferenceProfile> = new Map();

  private getUserProfileFromCache(cacheKey: string): UserPreferenceProfile | undefined {
    return this.profileCache.get(cacheKey);
  }

  private cacheUserProfile(cacheKey: string, profile: UserPreferenceProfile): void {
    this.profileCache.set(cacheKey, profile);
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

export async function generatePersonalizationInsights(
  userId: string,
  businessId?: string,
  contentHistory?: ContentPerformanceMetrics[],
  performanceData?: any[]
): Promise<PersonalizationInsights> {
  const tracker = getContentPerformanceTracker();
  // Use userId as businessId if not provided
  return await tracker.generatePersonalizationInsights(userId, businessId || userId, contentHistory, performanceData);
}