/**
 * Content analyzer utilities for processing crawled website data and generating insights
 */

import { WebsiteAnalysisResult, CrawledPage } from './website-crawler';
import { z } from 'zod';

export interface ContentGap {
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDifficulty: 'easy' | 'medium' | 'hard';
  competitorAdvantage?: string;
}

export interface ContentCluster {
  mainTopic: string;
  pages: string[];
  suggestedPages: string[];
  internalLinkingOpportunities: Array<{
    from: string;
    to: string;
    anchorText: string;
  }>;
}

export interface SEOInsight {
  type: 'content_gap' | 'keyword_opportunity' | 'technical_issue' | 'content_cluster';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export interface ContentAnalysisResult {
  summary: {
    totalTopics: number;
    contentQualityScore: number;
    topicalAuthorityScore: number;
    technicalSeoScore: number;
  };
  contentGaps: ContentGap[];
  contentClusters: ContentCluster[];
  seoInsights: SEOInsight[];
  keywordOpportunities: Array<{
    keyword: string;
    currentUsage: number;
    potentialUsage: number;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: 'low' | 'medium' | 'high';
  }>;
  competitorAnalysis?: {
    missingTopics: string[];
    weakerContent: string[];
    opportunities: string[];
  };
}

export class ContentAnalyzer {
  analyzeWebsiteContent(
    websiteAnalysis: WebsiteAnalysisResult,
    competitorAnalysis?: WebsiteAnalysisResult
  ): ContentAnalysisResult {
    const contentGaps = this.identifyContentGaps(websiteAnalysis, competitorAnalysis);
    const contentClusters = this.identifyContentClusters(websiteAnalysis);
    const seoInsights = this.generateSEOInsights(websiteAnalysis, contentGaps);
    const keywordOpportunities = this.identifyKeywordOpportunities(websiteAnalysis);
    const competitorComparison = competitorAnalysis
      ? this.analyzeCompetitorContent(websiteAnalysis, competitorAnalysis)
      : undefined;

    const summary = this.generateSummary(websiteAnalysis, contentGaps, contentClusters);

    return {
      summary,
      contentGaps,
      contentClusters,
      seoInsights,
      keywordOpportunities,
      competitorAnalysis: competitorComparison
    };
  }

  private identifyContentGaps(
    websiteAnalysis: WebsiteAnalysisResult,
    competitorAnalysis?: WebsiteAnalysisResult
  ): ContentGap[] {
    const gaps: ContentGap[] = [];
    const existingTopics = new Set(websiteAnalysis.topics.map(t => t.toLowerCase()));

    // Common business content gaps
    const businessEssentialTopics = [
      { topic: 'About Us', reason: 'Builds trust and credibility', priority: 'high' as const },
      { topic: 'Services/Products', reason: 'Core business offerings', priority: 'high' as const },
      { topic: 'Contact Information', reason: 'Essential for lead generation', priority: 'high' as const },
      { topic: 'Pricing', reason: 'Qualifies leads and sets expectations', priority: 'medium' as const },
      { topic: 'FAQ', reason: 'Reduces support burden and addresses objections', priority: 'medium' as const },
      { topic: 'Testimonials/Reviews', reason: 'Social proof and trust building', priority: 'medium' as const },
      { topic: 'Case Studies/Portfolio', reason: 'Demonstrates expertise and results', priority: 'medium' as const },
      { topic: 'Blog/Resources', reason: 'SEO value and thought leadership', priority: 'low' as const }
    ];

    businessEssentialTopics.forEach(({ topic, reason, priority }) => {
      const topicExists = existingTopics.has(topic.toLowerCase()) ||
        websiteAnalysis.crawledPages.some(page =>
          page.title.toLowerCase().includes(topic.toLowerCase()) ||
          page.headings.h1.some(h1 => h1.toLowerCase().includes(topic.toLowerCase()))
        );

      if (!topicExists) {
        gaps.push({
          topic,
          reason,
          priority,
          estimatedDifficulty: this.estimateDifficulty(topic),
        });
      }
    });

    // Industry-specific gaps based on business type
    const industryGaps = this.identifyIndustrySpecificGaps(websiteAnalysis);
    gaps.push(...industryGaps);

    // Competitor-based gaps
    if (competitorAnalysis) {
      const competitorGaps = this.identifyCompetitorGaps(websiteAnalysis, competitorAnalysis);
      gaps.push(...competitorGaps);
    }

    return gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private identifyIndustrySpecificGaps(websiteAnalysis: WebsiteAnalysisResult): ContentGap[] {
    const gaps: ContentGap[] = [];
    const domain = websiteAnalysis.domain.toLowerCase();

    // Restaurant-specific gaps
    if (domain.includes('restaurant') || domain.includes('cafe') || domain.includes('food')) {
      gaps.push(
        {
          topic: 'Menu with Prices',
          reason: 'Essential for restaurant customers',
          priority: 'high',
          estimatedDifficulty: 'easy'
        },
        {
          topic: 'Location and Hours',
          reason: 'Critical information for visitors',
          priority: 'high',
          estimatedDifficulty: 'easy'
        },
        {
          topic: 'Online Ordering/Reservation',
          reason: 'Modern customer expectation',
          priority: 'medium',
          estimatedDifficulty: 'hard'
        }
      );
    }

    // E-commerce specific gaps
    if (domain.includes('shop') || domain.includes('store')) {
      gaps.push(
        {
          topic: 'Product Categories',
          reason: 'Helps users navigate products',
          priority: 'high',
          estimatedDifficulty: 'medium'
        },
        {
          topic: 'Shipping Information',
          reason: 'Reduces cart abandonment',
          priority: 'medium',
          estimatedDifficulty: 'easy'
        },
        {
          topic: 'Return Policy',
          reason: 'Builds purchase confidence',
          priority: 'medium',
          estimatedDifficulty: 'easy'
        }
      );
    }

    // Service business gaps
    if (domain.includes('service') || websiteAnalysis.topics.some(t => t.includes('service'))) {
      gaps.push(
        {
          topic: 'Service Areas',
          reason: 'Defines geographic coverage',
          priority: 'medium',
          estimatedDifficulty: 'easy'
        },
        {
          topic: 'Process Overview',
          reason: 'Sets customer expectations',
          priority: 'medium',
          estimatedDifficulty: 'medium'
        }
      );
    }

    return gaps;
  }

  private identifyCompetitorGaps(
    websiteAnalysis: WebsiteAnalysisResult,
    competitorAnalysis: WebsiteAnalysisResult
  ): ContentGap[] {
    const gaps: ContentGap[] = [];
    const myTopics = new Set(websiteAnalysis.topics.map(t => t.toLowerCase()));
    const competitorTopics = new Set(competitorAnalysis.topics.map(t => t.toLowerCase()));

    // Topics competitor has that I don't
    competitorTopics.forEach(topic => {
      if (!myTopics.has(topic)) {
        gaps.push({
          topic: this.capitalizeTopic(topic),
          reason: `Competitor ranks for this topic`,
          priority: 'medium',
          estimatedDifficulty: 'medium',
          competitorAdvantage: 'Currently missing this topic in your content'
        });
      }
    });

    return gaps;
  }

  private identifyContentClusters(websiteAnalysis: WebsiteAnalysisResult): ContentCluster[] {
    const clusters: ContentCluster[] = [];
    const topicGroups = this.groupRelatedTopics(websiteAnalysis.topics);

    topicGroups.forEach(group => {
      const relatedPages = websiteAnalysis.crawledPages.filter(page =>
        group.some(topic =>
          page.title.toLowerCase().includes(topic.toLowerCase()) ||
          page.headings.h1.some(h1 => h1.toLowerCase().includes(topic.toLowerCase())) ||
          page.headings.h2.some(h2 => h2.toLowerCase().includes(topic.toLowerCase()))
        )
      );

      if (relatedPages.length > 0) {
        const suggestedPages = this.suggestClusterPages(group, relatedPages);
        const linkingOpportunities = this.identifyInternalLinkingOpportunities(relatedPages, group);

        clusters.push({
          mainTopic: this.capitalizeTopic(group[0]),
          pages: relatedPages.map(p => p.url),
          suggestedPages,
          internalLinkingOpportunities: linkingOpportunities
        });
      }
    });

    return clusters;
  }

  private groupRelatedTopics(topics: string[]): string[][] {
    const groups: string[][] = [];
    const used = new Set<string>();

    topics.forEach(topic => {
      if (used.has(topic.toLowerCase())) return;

      const related = topics.filter(t =>
        !used.has(t.toLowerCase()) &&
        this.areTopicsRelated(topic, t)
      );

      if (related.length > 1) {
        groups.push(related);
        related.forEach(t => used.add(t.toLowerCase()));
      }
    });

    return groups;
  }

  private areTopicsRelated(topic1: string, topic2: string): boolean {
    const words1 = topic1.toLowerCase().split(/\s+/);
    const words2 = topic2.toLowerCase().split(/\s+/);

    // Check for common words
    const commonWords = words1.filter(word => words2.includes(word));

    return commonWords.length > 0 && commonWords.length < Math.max(words1.length, words2.length);
  }

  private suggestClusterPages(mainTopic: string[], existingPages: CrawledPage[]): string[] {
    const suggestions: string[] = [];
    const baseTopic = mainTopic[0].toLowerCase();

    // Common content cluster page suggestions
    const commonSuggestions = [
      `${baseTopic} overview`,
      `${baseTopic} guide`,
      `${baseTopic} best practices`,
      `${baseTopic} examples`,
      `${baseTopic} comparison`,
      `how to ${baseTopic}`,
      `${baseTopic} tutorial`,
      `${baseTopic} tips`,
      `${baseTopic} mistakes to avoid`,
      `${baseTopic} tools and resources`
    ];

    // Filter out existing content
    commonSuggestions.forEach(suggestion => {
      const exists = existingPages.some(page =>
        page.title.toLowerCase().includes(suggestion) ||
        page.content.toLowerCase().includes(suggestion)
      );

      if (!exists) {
        suggestions.push(suggestion);
      }
    });

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private identifyInternalLinkingOpportunities(
    pages: CrawledPage[],
    topicGroup: string[]
  ): Array<{ from: string; to: string; anchorText: string }> {
    const opportunities: Array<{ from: string; to: string; anchorText: string }> = [];

    for (let i = 0; i < pages.length; i++) {
      for (let j = 0; j < pages.length; j++) {
        if (i === j) continue;

        const fromPage = pages[i];
        const toPage = pages[j];

        // Check if fromPage already links to toPage
        const alreadyLinked = fromPage.internalLinks.includes(toPage.url);
        if (alreadyLinked) continue;

        // Find relevant anchor text opportunities
        topicGroup.forEach(topic => {
          const topicLower = topic.toLowerCase();
          const fromContent = fromPage.content.toLowerCase();

          if (fromContent.includes(topicLower)) {
            opportunities.push({
              from: fromPage.url,
              to: toPage.url,
              anchorText: this.capitalizeTopic(topic)
            });
          }
        });
      }
    }

    return opportunities.slice(0, 10); // Return top 10 opportunities
  }

  private generateSEOInsights(
    websiteAnalysis: WebsiteAnalysisResult,
    contentGaps: ContentGap[]
  ): SEOInsight[] {
    const insights: SEOInsight[] = [];

    // Content gap insights
    const highPriorityGaps = contentGaps.filter(gap => gap.priority === 'high');
    if (highPriorityGaps.length > 0) {
      insights.push({
        type: 'content_gap',
        title: 'Missing Essential Content',
        description: `Your website is missing ${highPriorityGaps.length} critical content sections that customers expect.`,
        impact: 'high',
        effort: 'medium',
        recommendations: highPriorityGaps.map(gap => `Add a ${gap.topic} page: ${gap.reason}`)
      });
    }

    // Technical SEO insights
    const highSeverityIssues = websiteAnalysis.technicalIssues.filter(issue => issue.severity === 'high');
    if (highSeverityIssues.length > 0) {
      insights.push({
        type: 'technical_issue',
        title: 'Critical Technical SEO Issues',
        description: `Found ${highSeverityIssues.length} high-priority technical issues that may impact search rankings.`,
        impact: 'high',
        effort: 'low',
        recommendations: highSeverityIssues.map(issue => issue.description)
      });
    }

    // Content quality insights
    const averageWordsPerPage = websiteAnalysis.totalWordCount / websiteAnalysis.crawledPages.length;
    if (averageWordsPerPage < 500) {
      insights.push({
        type: 'content_cluster',
        title: 'Content Could Be More Comprehensive',
        description: `Average page has ${Math.round(averageWordsPerPage)} words. Consider expanding content to improve SEO value.`,
        impact: 'medium',
        effort: 'high',
        recommendations: [
          'Expand existing pages with more detailed information',
          'Add examples and case studies',
          'Include FAQ sections on relevant pages'
        ]
      });
    }

    // Internal linking insights
    if (websiteAnalysis.internalLinkingScore < 50) {
      insights.push({
        type: 'content_cluster',
        title: 'Improve Internal Linking',
        description: 'Your internal linking structure could be improved to help users and search engines navigate your content.',
        impact: 'medium',
        effort: 'low',
        recommendations: [
          'Add links between related pages',
          'Create topic clusters with pillar pages',
          'Use descriptive anchor text for internal links'
        ]
      });
    }

    return insights;
  }

  private identifyKeywordOpportunities(websiteAnalysis: WebsiteAnalysisResult): Array<{
    keyword: string;
    currentUsage: number;
    potentialUsage: number;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: 'low' | 'medium' | 'high';
  }> {
    const opportunities = websiteAnalysis.keywords.slice(0, 10).map(keyword => ({
      keyword: keyword.keyword,
      currentUsage: keyword.frequency,
      potentialUsage: Math.min(keyword.frequency * 2, 10), // Reasonable target
      difficulty: this.estimateKeywordDifficulty(keyword.keyword, keyword.density),
      searchVolume: this.estimateSearchVolume(keyword.frequency, websiteAnalysis.crawledPages.length)
    }));

    return opportunities.filter(opp => opp.potentialUsage > opp.currentUsage);
  }

  private analyzeCompetitorContent(
    websiteAnalysis: WebsiteAnalysisResult,
    competitorAnalysis: WebsiteAnalysisResult
  ): ContentAnalysisResult['competitorAnalysis'] {
    const myTopics = new Set(websiteAnalysis.topics.map(t => t.toLowerCase()));
    const competitorTopics = new Set(competitorAnalysis.topics.map(t => t.toLowerCase()));

    const missingTopics = Array.from(competitorTopics).filter(topic => !myTopics.has(topic));
    const weakerContent = Array.from(myTopics).filter(topic => !competitorTopics.has(topic));

    const opportunities = missingTopics.slice(0, 5).map(topic =>
      `Create content about ${this.capitalizeTopic(topic)} that competitors rank for`
    );

    return {
      missingTopics: missingTopics.slice(0, 10),
      weakerContent: weakerContent.slice(0, 10),
      opportunities
    };
  }

  private generateSummary(
    websiteAnalysis: WebsiteAnalysisResult,
    contentGaps: ContentGap[],
    contentClusters: ContentCluster[]
  ): ContentAnalysisResult['summary'] {
    const contentQualityScore = this.calculateContentQualityScore(websiteAnalysis);
    const topicalAuthorityScore = this.calculateTopicalAuthorityScore(websiteAnalysis, contentClusters);
    const technicalSeoScore = this.calculateTechnicalSeoScore(websiteAnalysis);

    return {
      totalTopics: websiteAnalysis.topics.length,
      contentQualityScore,
      topicalAuthorityScore,
      technicalSeoScore
    };
  }

  private calculateContentQualityScore(websiteAnalysis: WebsiteAnalysisResult): number {
    let score = 100;

    // Deduct points for technical issues
    websiteAnalysis.technicalIssues.forEach(issue => {
      switch (issue.severity) {
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    // Consider content depth
    const averageWordsPerPage = websiteAnalysis.totalWordCount / websiteAnalysis.crawledPages.length;
    if (averageWordsPerPage < 300) score -= 15;
    else if (averageWordsPerPage < 500) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculateTopicalAuthorityScore(
    websiteAnalysis: WebsiteAnalysisResult,
    contentClusters: ContentCluster[]
  ): number {
    let score = 0;

    // Base score from topic coverage
    score += Math.min(websiteAnalysis.topics.length * 2, 40);

    // Bonus for content clusters
    score += contentClusters.length * 10;

    // Bonus for internal linking
    score += websiteAnalysis.internalLinkingScore * 0.3;

    return Math.max(0, Math.min(100, score));
  }

  private calculateTechnicalSeoScore(websiteAnalysis: WebsiteAnalysisResult): number {
    let score = 100;

    websiteAnalysis.technicalIssues.forEach(issue => {
      switch (issue.severity) {
        case 'high': score -= 25; break;
        case 'medium': score -= 15; break;
        case 'low': score -= 5; break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private estimateDifficulty(topic: string): 'easy' | 'medium' | 'hard' {
    const highDifficultyWords = ['best', 'top', 'vs', 'review', 'comparison', 'guide'];
    const lowDifficultyWords = ['how to', 'what is', 'tutorial', 'basics'];

    const topicLower = topic.toLowerCase();

    if (highDifficultyWords.some(word => topicLower.includes(word))) {
      return 'hard';
    }
    if (lowDifficultyWords.some(word => topicLower.includes(word))) {
      return 'easy';
    }

    return 'medium';
  }

  private estimateKeywordDifficulty(keyword: string, density: number): 'easy' | 'medium' | 'hard' {
    if (density > 2) return 'easy'; // Already well-optimized
    if (density < 0.5) return 'hard'; // Low relevance currently
    return 'medium';
  }

  private estimateSearchVolume(frequency: number, totalPages: number): 'low' | 'medium' | 'high' {
    const avgFrequency = frequency / totalPages;

    if (avgFrequency > 5) return 'high';
    if (avgFrequency > 2) return 'medium';
    return 'low';
  }

  private capitalizeTopic(topic: string): string {
    return topic.split(/\s+/).map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

// Singleton instance
let contentAnalyzer: ContentAnalyzer | null = null;

export function getContentAnalyzer(): ContentAnalyzer {
  if (!contentAnalyzer) {
    contentAnalyzer = new ContentAnalyzer();
  }
  return contentAnalyzer;
}

// Export helper functions for use in API routes
export function analyzeContent(
  websiteAnalysis: WebsiteAnalysisResult,
  competitorAnalysis?: WebsiteAnalysisResult
): ContentAnalysisResult {
  console.log('🧠 [CONTENT ANALYZER] Starting content analysis', {
    websitePages: websiteAnalysis.crawledPages.length,
    websiteTopics: websiteAnalysis.topics.length,
    hasCompetitor: !!competitorAnalysis,
    competitorPages: competitorAnalysis?.crawledPages.length || 0
  });

  const analyzer = getContentAnalyzer();
  const result = analyzer.analyzeWebsiteContent(websiteAnalysis, competitorAnalysis);

  console.log('✅ [CONTENT ANALYZER] Analysis completed', {
    contentGaps: result.contentGaps.length,
    contentClusters: result.contentClusters.length,
    seoInsights: result.seoInsights.length,
    keywordOpportunities: result.keywordOpportunities.length
  });

  return result;
}