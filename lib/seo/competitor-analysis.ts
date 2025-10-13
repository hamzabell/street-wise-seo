import { WebsiteCrawler, WebsiteAnalysisResult, crawlWebsite } from './website-crawler';
import { z } from 'zod';

export const CompetitorAnalysisRequestSchema = z.object({
  competitorUrl: z.string().url('Invalid competitor URL format'),
  primaryWebsiteUrl: z.string().url('Invalid primary website URL format'),
  maxPages: z.number().min(1).max(30).default(15),
  analysisType: z.enum(['content_gap', 'performance_comparison', 'keyword_overlap']).default('content_gap'),
});

export type CompetitorAnalysisRequest = z.infer<typeof CompetitorAnalysisRequestSchema>;

export interface ContentGapAnalysis {
  competitorTopics: string[];
  missingFromOurSite: string[];
  ourAdvantage: string[];
  competitorAdvantage: string[];
  sharedTopics: string[];
  opportunityScore: number;
}

export interface PerformanceComparison {
  competitorMetrics: {
    totalPages: number;
    totalWordCount: number;
    averageWordsPerPage: number;
    internalLinkingScore: number;
    technicalIssuesCount: number;
  };
  ourMetrics: {
    totalPages: number;
    totalWordCount: number;
    averageWordsPerPage: number;
    internalLinkingScore: number;
    technicalIssuesCount: number;
  };
  comparison: {
    contentAdvantage: 'competitor' | 'ours' | 'equal';
    technicalAdvantage: 'competitor' | 'ours' | 'equal';
    linkingAdvantage: 'competitor' | 'ours' | 'equal';
    overallScore: number;
  };
}

export interface KeywordOverlapAnalysis {
  competitorKeywords: Array<{ keyword: string; frequency: number; density: number }>;
  ourKeywords: Array<{ keyword: string; frequency: number; density: number }>;
  sharedKeywords: Array<{ keyword: string; competitorFreq: number; ourFreq: number }>;
  competitorOnlyKeywords: string[];
  ourOnlyKeywords: string[];
  overlapScore: number;
  opportunities: Array<{
    keyword: string;
    competitorPosition: number;
    ourPotential: string;
  }>;
}

export interface CompetitorAnalysisResult {
  competitorUrl: string;
  competitorDomain: string;
  primaryWebsiteUrl: string;
  primaryDomain: string;
  analysisType: string;
  contentGapAnalysis?: ContentGapAnalysis;
  performanceComparison?: PerformanceComparison;
  keywordOverlapAnalysis?: KeywordOverlapAnalysis;
  recommendations: Array<{
    category: 'content' | 'technical' | 'keywords' | 'strategy';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
  }>;
  analyzedAt: string;
}

export class CompetitorAnalyzer {
  /**
   * Analyze competitor website against primary website
   */
  static async analyzeCompetitor(request: CompetitorAnalysisRequest): Promise<CompetitorAnalysisResult> {
    console.log('🔍 [COMPETITOR ANALYZER] Starting competitor analysis:', request);
    const validated = CompetitorAnalysisRequestSchema.parse(request);

    // Crawl both websites
    console.log('🕷️ [COMPETITOR ANALYZER] Crawling competitor website...');
    const competitorAnalysis = await crawlWebsite({
      url: validated.competitorUrl,
      maxPages: validated.maxPages,
      includeExternalLinks: false,
      crawlDelay: 1500
    });

    console.log('🕷️ [COMPETITOR ANALYZER] Crawling primary website...');
    const primaryAnalysis = await crawlWebsite({
      url: validated.primaryWebsiteUrl,
      maxPages: validated.maxPages,
      includeExternalLinks: false,
      crawlDelay: 1500
    });

    console.log('📊 [COMPETITOR ANALYZER] Performing analysis...');

    let result: CompetitorAnalysisResult = {
      competitorUrl: validated.competitorUrl,
      competitorDomain: new URL(validated.competitorUrl).hostname,
      primaryWebsiteUrl: validated.primaryWebsiteUrl,
      primaryDomain: new URL(validated.primaryWebsiteUrl).hostname,
      analysisType: validated.analysisType,
      recommendations: [],
      analyzedAt: new Date().toISOString()
    };

    // Perform analysis based on type
    switch (validated.analysisType) {
      case 'content_gap':
        result.contentGapAnalysis = this.analyzeContentGaps(competitorAnalysis, primaryAnalysis);
        break;
      case 'performance_comparison':
        result.performanceComparison = this.comparePerformance(competitorAnalysis, primaryAnalysis);
        break;
      case 'keyword_overlap':
        result.keywordOverlapAnalysis = this.analyzeKeywordOverlap(competitorAnalysis, primaryAnalysis);
        break;
    }

    // Generate recommendations
    result.recommendations = this.generateRecommendations(result, competitorAnalysis, primaryAnalysis);

    console.log('✅ [COMPETITOR ANALYZER] Analysis completed');
    return result;
  }

  /**
   * Analyze content gaps between competitor and our website
   */
  private static analyzeContentGaps(
    competitorAnalysis: WebsiteAnalysisResult,
    primaryAnalysis: WebsiteAnalysisResult
  ): ContentGapAnalysis {
    console.log('🔍 [CONTENT GAP ANALYSIS] Starting content gap analysis');
    console.log('📊 [CONTENT GAP] Competitor analysis data:', {
      url: competitorAnalysis.url,
      totalTopics: competitorAnalysis.topics.length,
      topics: competitorAnalysis.topics.slice(0, 10), // Show first 10 topics
      crawledPages: competitorAnalysis.crawledPages.length
    });

    console.log('📊 [CONTENT GAP] Primary website analysis data:', {
      url: primaryAnalysis.url,
      totalTopics: primaryAnalysis.topics.length,
      topics: primaryAnalysis.topics.slice(0, 10), // Show first 10 topics
      crawledPages: primaryAnalysis.crawledPages.length
    });

    const competitorTopics = new Set(competitorAnalysis.topics.map(t => t.toLowerCase()));
    const ourTopics = new Set(primaryAnalysis.topics.map(t => t.toLowerCase()));

    console.log('🔄 [CONTENT GAP] Topic sets created:', {
      competitorTopicsCount: competitorTopics.size,
      ourTopicsCount: ourTopics.size
    });

    const competitorOnly = Array.from(competitorTopics).filter(topic => !ourTopics.has(topic));
    const ourOnly = Array.from(ourTopics).filter(topic => !competitorTopics.has(topic));
    const shared = Array.from(competitorTopics).filter(topic => ourTopics.has(topic));

    console.log('📈 [CONTENT GAP] Topic comparison results:', {
      competitorOnly: competitorOnly.length,
      ourOnly: ourOnly.length,
      shared: shared.length,
      competitorOnlySample: competitorOnly.slice(0, 5),
      ourOnlySample: ourOnly.slice(0, 5),
      sharedSample: shared.slice(0, 5)
    });

    // Analyze advantages
    const competitorAdvantage = competitorOnly.slice(0, 10).map(topic =>
      `Missing from our site: ${topic}`
    );

    const ourAdvantage = ourOnly.slice(0, 10).map(topic =>
      `Missing from competitor: ${topic}`
    );

    // Calculate opportunity score (higher means more opportunity for us)
    const opportunityScore = Math.min(100, (competitorOnly.length / Math.max(competitorAnalysis.topics.length, 1)) * 100);

    console.log('🎯 [CONTENT GAP] Final calculations:', {
      opportunityScore,
      opportunityCalculation: `${competitorOnly.length} / ${competitorAnalysis.topics.length} * 100`,
      competitorAdvantageCount: competitorAdvantage.length,
      ourAdvantageCount: ourAdvantage.length
    });

    const result = {
      competitorTopics: Array.from(competitorTopics),
      missingFromOurSite: competitorOnly,
      ourAdvantage,
      competitorAdvantage,
      sharedTopics: shared,
      opportunityScore
    };

    console.log('✅ [CONTENT GAP] Analysis completed with result:', result);
    return result;
  }

  /**
   * Compare performance metrics between competitor and our website
   */
  private static comparePerformance(
    competitorAnalysis: WebsiteAnalysisResult,
    primaryAnalysis: WebsiteAnalysisResult
  ): PerformanceComparison {
    const competitorMetrics = {
      totalPages: competitorAnalysis.crawledPages.length,
      totalWordCount: competitorAnalysis.totalWordCount,
      averageWordsPerPage: competitorAnalysis.totalWordCount / Math.max(competitorAnalysis.crawledPages.length, 1),
      internalLinkingScore: competitorAnalysis.internalLinkingScore,
      technicalIssuesCount: competitorAnalysis.technicalIssues.length
    };

    const ourMetrics = {
      totalPages: primaryAnalysis.crawledPages.length,
      totalWordCount: primaryAnalysis.totalWordCount,
      averageWordsPerPage: primaryAnalysis.totalWordCount / Math.max(primaryAnalysis.crawledPages.length, 1),
      internalLinkingScore: primaryAnalysis.internalLinkingScore,
      technicalIssuesCount: primaryAnalysis.technicalIssues.length
    };

    // Determine advantages
    const contentAdvantage = competitorMetrics.averageWordsPerPage > ourMetrics.averageWordsPerPage * 1.2 ? 'competitor' :
                          ourMetrics.averageWordsPerPage > competitorMetrics.averageWordsPerPage * 1.2 ? 'ours' : 'equal';

    const technicalAdvantage = competitorMetrics.technicalIssuesCount < ourMetrics.technicalIssuesCount ? 'competitor' :
                           ourMetrics.technicalIssuesCount < competitorMetrics.technicalIssuesCount ? 'ours' : 'equal';

    const linkingAdvantage = competitorMetrics.internalLinkingScore > ourMetrics.internalLinkingScore + 10 ? 'competitor' :
                         ourMetrics.internalLinkingScore > competitorMetrics.internalLinkingScore + 10 ? 'ours' : 'equal';

    // Calculate overall score (0-100, where >50 means we're ahead)
    let score = 50;
    if (contentAdvantage === 'ours') score += 15;
    if (contentAdvantage === 'competitor') score -= 15;
    if (technicalAdvantage === 'ours') score += 10;
    if (technicalAdvantage === 'competitor') score -= 10;
    if (linkingAdvantage === 'ours') score += 10;
    if (linkingAdvantage === 'competitor') score -= 10;

    return {
      competitorMetrics,
      ourMetrics,
      comparison: {
        contentAdvantage,
        technicalAdvantage,
        linkingAdvantage,
        overallScore: Math.max(0, Math.min(100, score))
      }
    };
  }

  /**
   * Analyze keyword overlap between competitor and our website
   */
  private static analyzeKeywordOverlap(
    competitorAnalysis: WebsiteAnalysisResult,
    primaryAnalysis: WebsiteAnalysisResult
  ): KeywordOverlapAnalysis {
    const competitorKeywords = new Map(
      competitorAnalysis.keywords.map(k => [k.keyword.toLowerCase(), { frequency: k.frequency, density: k.density }])
    );
    const ourKeywords = new Map(
      primaryAnalysis.keywords.map(k => [k.keyword.toLowerCase(), { frequency: k.frequency, density: k.density }])
    );

    const competitorOnly = Array.from(competitorKeywords.keys()).filter(k => !ourKeywords.has(k));
    const ourOnly = Array.from(ourKeywords.keys()).filter(k => !competitorKeywords.has(k));
    const shared = Array.from(competitorKeywords.keys()).filter(k => ourKeywords.has(k));

    const sharedKeywords = shared.map(keyword => ({
      keyword,
      competitorFreq: competitorKeywords.get(keyword)!.frequency,
      ourFreq: ourKeywords.get(keyword)!.frequency
    }));

    // Calculate overlap score
    const totalUniqueKeywords = new Set([...competitorKeywords.keys(), ...ourKeywords.keys()]).size;
    const overlapScore = (shared.length / totalUniqueKeywords) * 100;

    // Generate opportunities (keywords competitor has but we don't, with high potential)
    const opportunities = competitorOnly
      .slice(0, 20)
      .map(keyword => ({
        keyword,
        competitorPosition: competitorKeywords.get(keyword)!.frequency,
        ourPotential: this.estimateKeywordPotential(keyword, competitorKeywords.get(keyword)!)
      }))
      .filter(opp => opp.ourPotential !== 'low')
      .slice(0, 10);

    return {
      competitorKeywords: competitorAnalysis.keywords,
      ourKeywords: primaryAnalysis.keywords,
      sharedKeywords,
      competitorOnlyKeywords: competitorOnly,
      ourOnlyKeywords: ourOnly,
      overlapScore,
      opportunities
    };
  }

  /**
   * Generate recommendations based on analysis results
   */
  private static generateRecommendations(
    result: CompetitorAnalysisResult,
    competitorAnalysis: WebsiteAnalysisResult,
    primaryAnalysis: WebsiteAnalysisResult
  ): Array<{
    category: 'content' | 'technical' | 'keywords' | 'strategy';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionItems: string[];
  }> {
    const recommendations: Array<{
      category: 'content' | 'technical' | 'keywords' | 'strategy';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      actionItems: string[];
    }> = [];

    // Content recommendations
    if (result.contentGapAnalysis && result.contentGapAnalysis.missingFromOurSite.length > 0) {
      const missingTopics = result.contentGapAnalysis.missingFromOurSite.slice(0, 5);
      recommendations.push({
        category: 'content',
        priority: result.contentGapAnalysis.opportunityScore > 50 ? 'high' : 'medium',
        title: 'Address Content Gaps',
        description: `Your competitor covers ${result.contentGapAnalysis.missingFromOurSite.length} topics that you don't. Focus on high-value topics to close the gap.`,
        actionItems: missingTopics.map(topic => `Create content about "${topic}"`)
      });
    }

    // Performance recommendations
    if (result.performanceComparison) {
      const { comparison } = result.performanceComparison;

      if (comparison.contentAdvantage === 'competitor') {
        recommendations.push({
          category: 'content',
          priority: 'medium',
          title: 'Improve Content Depth',
          description: 'Your competitor has more comprehensive content. Enhance your existing pages with more detail and value.',
          actionItems: [
            'Expand existing articles with more examples and details',
            'Add case studies and real-world applications',
            'Include more visual content and interactive elements'
          ]
        });
      }

      if (comparison.technicalAdvantage === 'competitor') {
        recommendations.push({
          category: 'technical',
          priority: 'high',
          title: 'Fix Technical SEO Issues',
          description: 'Your competitor has fewer technical issues. Address these to improve search rankings.',
          actionItems: [
            'Fix missing meta descriptions and title tags',
            'Resolve thin content issues',
            'Improve page load speed and mobile experience'
          ]
        });
      }
    }

    // Keyword recommendations
    if (result.keywordOverlapAnalysis && result.keywordOverlapAnalysis.opportunities.length > 0) {
      recommendations.push({
        category: 'keywords',
        priority: 'high',
        title: 'Target Competitor Keywords',
        description: `Your competitor ranks for ${result.keywordOverlapAnalysis.competitorOnlyKeywords.length} keywords that you don't target.`,
        actionItems: result.keywordOverlapAnalysis.opportunities.slice(0, 5).map(opp =>
          `Create content targeting "${opp.keyword}" (${opp.ourPotential} potential)`
        )
      });
    }

    // Strategy recommendations
    recommendations.push({
      category: 'strategy',
      priority: 'medium',
      title: 'Leverage Your Unique Advantages',
      description: 'Focus on areas where you outperform competitors to strengthen your market position.',
      actionItems: [
        'Highlight your unique content in marketing materials',
        'Build topic clusters around your strongest content areas',
        'Create cornerstone content for your competitive advantages'
      ]
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Estimate keyword potential based on competitor performance
   */
  private static estimateKeywordPotential(keyword: string, competitorData: { frequency: number; density: number }): 'high' | 'medium' | 'low' {
    if (competitorData.frequency > 10 && competitorData.density > 2) {
      return 'high'; // Competitor values this keyword highly
    } else if (competitorData.frequency > 5 || competitorData.density > 1) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Quick competitor analysis for dashboard overview
   * Works independently without requiring primary website analysis
   */
  static async quickAnalysis(competitorUrl: string, primaryWebsiteUrl?: string): Promise<{
    competitorPages: number;
    competitorWordCount: number;
    contentGaps: number;
    opportunityScore: number;
  }> {
    try {
      // Try full analysis if primary website is available
      if (primaryWebsiteUrl) {
        const result = await this.analyzeCompetitor({
          competitorUrl,
          primaryWebsiteUrl,
          maxPages: 10,
          analysisType: 'content_gap'
        });

        return {
          competitorPages: result.contentGapAnalysis ? result.contentGapAnalysis.competitorTopics.length : 0,
          competitorWordCount: 0, // Would need full crawl for this
          contentGaps: result.contentGapAnalysis ? result.contentGapAnalysis.missingFromOurSite.length : 0,
          opportunityScore: result.contentGapAnalysis ? result.contentGapAnalysis.opportunityScore : 0
        };
      } else {
        // Fallback: Competitor-only analysis
        return await this.competitorOnlyAnalysis(competitorUrl);
      }
    } catch (error) {
      console.error('Error in quick competitor analysis:', error);
      // Final fallback: return basic domain info
      return await this.competitorOnlyAnalysis(competitorUrl);
    }
  }

  /**
   * Competitor-only analysis when no primary website is available
   */
  private static async competitorOnlyAnalysis(competitorUrl: string): Promise<{
    competitorPages: number;
    competitorWordCount: number;
    contentGaps: number;
    opportunityScore: number;
  }> {
    try {
      // Import here to avoid circular dependencies
      const { crawlWebsite } = await import('./website-crawler');

      console.log('🔍 [COMPETITOR ANALYZER] Performing competitor-only analysis for:', competitorUrl);

      const competitorAnalysis = await crawlWebsite({
        url: competitorUrl,
        maxPages: 10,
        includeExternalLinks: false,
        crawlDelay: 1500
      });

      console.log('✅ [COMPETITOR ANALYZER] Competitor-only analysis completed');

      // Generate basic metrics based on competitor data only
      const competitorPages = competitorAnalysis.crawledPages.length;
      const competitorWordCount = competitorAnalysis.totalWordCount;

      // Estimate opportunity based on content depth and variety
      const topics = competitorAnalysis.topics.length;
      const avgWordsPerPage = competitorWordCount / Math.max(competitorPages, 1);

      // Simple opportunity scoring based on content richness
      let opportunityScore = 0;
      if (topics > 20) opportunityScore += 30;
      if (avgWordsPerPage > 500) opportunityScore += 25;
      if (competitorPages > 10) opportunityScore += 25;
      if (competitorAnalysis.internalLinkingScore > 50) opportunityScore += 20;

      opportunityScore = Math.min(100, opportunityScore);

      // Content gaps is a placeholder when we don't have primary site comparison
      const contentGaps = Math.max(5, Math.floor(topics * 0.3));

      return {
        competitorPages,
        competitorWordCount,
        contentGaps,
        opportunityScore
      };
    } catch (error) {
      console.error('Error in competitor-only analysis:', error);
      // Ultimate fallback: return minimal data based on domain
      return {
        competitorPages: 1,
        competitorWordCount: 500,
        contentGaps: 5,
        opportunityScore: 25
      };
    }
  }
}

// Export helper functions for use in API routes
export async function analyzeCompetitor(request: CompetitorAnalysisRequest): Promise<CompetitorAnalysisResult> {
  return await CompetitorAnalyzer.analyzeCompetitor(request);
}