import { getCrawledPagesByAnalysisId, getWebsiteAnalysisById } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';

export interface LinkingSuggestion {
  sourceUrl: string;
  sourceTitle: string;
  targetUrl: string;
  targetTitle: string;
  anchorText: string;
  relevanceScore: number;
  linkType: 'internal' | 'external' | 'contextual';
  reasoning: string;
}

export class LinkingSuggestionsGenerator {
  /**
   * Generate internal linking suggestions based on crawled website data
   */
  static async generateInternalLinkingSuggestions(
    websiteAnalysisId: number,
    targetTopic: string,
    targetKeywords: string[] = []
  ): Promise<LinkingSuggestion[]> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    // Get website analysis and crawled pages
    const websiteAnalysis = await getWebsiteAnalysisById(websiteAnalysisId, supabaseUserId);
    if (!websiteAnalysis) {
      throw new Error('Website analysis not found');
    }

    const crawledPages = await getCrawledPagesByAnalysisId(websiteAnalysisId);
    if (crawledPages.length === 0) {
      return [];
    }

    // Generate suggestions
    const suggestions: LinkingSuggestion[] = [];

    // 1. Find pages that should link TO the new content
    const sourcePages = this.findPagesThatShouldLinkToTarget(
      crawledPages,
      targetTopic,
      targetKeywords
    );

    // 2. Find pages that the new content should link TO
    const targetPages = this.findPagesThatTargetShouldLinkTo(
      crawledPages,
      targetTopic,
      targetKeywords
    );

    // 3. Generate contextual linking suggestions
    const contextualSuggestions = this.generateContextualLinkingSuggestions(
      crawledPages,
      targetTopic,
      targetKeywords
    );

    suggestions.push(...sourcePages, ...targetPages, ...contextualSuggestions);

    // Sort by relevance score and limit to top suggestions
    return suggestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);
  }

  /**
   * Find existing pages that should link to the new content
   */
  private static findPagesThatShouldLinkToTarget(
    crawledPages: any[],
    targetTopic: string,
    targetKeywords: string[]
  ): LinkingSuggestion[] {
    const suggestions: LinkingSuggestion[] = [];
    const targetWords = [...targetTopic.toLowerCase().split(' '), ...targetKeywords.map(k => k.toLowerCase())];

    crawledPages.forEach(page => {
      const pageContent = (page.content + ' ' + page.title + ' ' + (page.headings || '')).toLowerCase();

      // Calculate relevance
      const relevanceScore = this.calculateKeywordRelevance(targetWords, pageContent);

      if (relevanceScore > 0.3) { // Threshold for suggesting a link
        const anchorText = this.generateAnchorText(targetTopic, targetKeywords, pageContent);
        const reasoning = this.generateLinkReasoning(page, targetTopic, relevanceScore, 'source');

        suggestions.push({
          sourceUrl: page.url,
          sourceTitle: page.title,
          targetUrl: '', // Will be the new content URL
          targetTitle: targetTopic,
          anchorText,
          relevanceScore,
          linkType: 'internal',
          reasoning
        });
      }
    });

    return suggestions;
  }

  /**
   * Find pages that the new content should link to
   */
  private static findPagesThatTargetShouldLinkTo(
    crawledPages: any[],
    targetTopic: string,
    targetKeywords: string[]
  ): LinkingSuggestion[] {
    const suggestions: LinkingSuggestion[] = [];
    const targetWords = [...targetTopic.toLowerCase().split(' '), ...targetKeywords.map(k => k.toLowerCase())];

    crawledPages.forEach(page => {
      // Skip if this page is too similar to the target (might be duplicate content)
      const pageContent = (page.content + ' ' + page.title).toLowerCase();
      const similarityScore = this.calculateSimilarity(targetTopic.toLowerCase(), pageContent);

      if (similarityScore > 0.8) {
        return; // Skip pages that are too similar
      }

      // Find pages that contain complementary information
      const complementaryScore = this.calculateComplementaryRelevance(targetWords, pageContent);

      if (complementaryScore > 0.2) {
        const anchorText = page.title; // Use page title as anchor text
        const reasoning = this.generateLinkReasoning(page, targetTopic, complementaryScore, 'target');

        suggestions.push({
          sourceUrl: '', // Will be the new content URL
          sourceTitle: targetTopic,
          targetUrl: page.url,
          targetTitle: page.title,
          anchorText,
          relevanceScore: complementaryScore,
          linkType: 'internal',
          reasoning
        });
      }
    });

    return suggestions;
  }

  /**
   * Generate contextual linking suggestions based on topic clusters
   */
  private static generateContextualLinkingSuggestions(
    crawledPages: any[],
    targetTopic: string,
    targetKeywords: string[]
  ): LinkingSuggestion[] {
    const suggestions: LinkingSuggestion[] = [];

    // Group pages by topic similarity
    const topicClusters = this.identifyTopicClusters(crawledPages);

    // Find the most relevant cluster for the target topic
    const relevantCluster = this.findMostRelevantCluster(targetTopic, targetKeywords, topicClusters);

    if (relevantCluster.length > 0) {
      // Suggest linking between pages in the same cluster
      relevantCluster.forEach(page => {
        if (this.calculateRelevance(targetTopic, page.title + ' ' + (page.content || '')) > 0.4) {
          suggestions.push({
            sourceUrl: '', // New content
            sourceTitle: targetTopic,
            targetUrl: page.url,
            targetTitle: page.title,
            anchorText: page.title,
            relevanceScore: 0.6,
            linkType: 'contextual',
            reasoning: `This page is part of the same topic cluster and provides additional context for readers interested in ${targetTopic}.`
          });
        }
      });
    }

    return suggestions;
  }

  /**
   * Calculate keyword relevance score
   */
  private static calculateKeywordRelevance(keywords: string[], content: string): number {
    const contentWords = content.split(' ');
    let keywordCount = 0;

    keywords.forEach(keyword => {
      const keywordRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = content.match(keywordRegex);
      if (matches) {
        keywordCount += matches.length;
      }
    });

    return Math.min(keywordCount / keywords.length, 1); // Normalize to 0-1
  }

  /**
   * Calculate similarity between two texts
   */
  private static calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(' ').filter(w => w.length > 2);
    const words2 = text2.toLowerCase().split(' ').filter(w => w.length > 2);

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  /**
   * Calculate complementary relevance (how well pages complement each other)
   */
  private static calculateComplementaryRelevance(targetKeywords: string[], pageContent: string): number {
    // Look for supporting concepts, not exact matches
    const supportingConcepts = [
      'guide', 'tutorial', 'example', 'how', 'what', 'why', 'best', 'top',
      'tools', 'resources', 'tips', 'tricks', 'strategies', 'techniques',
      'benefits', 'advantages', 'disadvantages', 'comparison', 'vs'
    ];

    let supportingScore = 0;
    const contentLower = pageContent.toLowerCase();

    supportingConcepts.forEach(concept => {
      if (contentLower.includes(concept)) {
        supportingScore += 0.1;
      }
    });

    // Add some relevance if there are some keyword matches but not too many
    const keywordScore = this.calculateKeywordRelevance(targetKeywords, pageContent);
    const complementaryScore = Math.min(keywordScore * 0.5 + supportingScore, 0.8);

    return complementaryScore;
  }

  /**
   * Generate appropriate anchor text
   */
  private static generateAnchorText(targetTopic: string, targetKeywords: string[], context: string): string {
    const possibleAnchors = [
      targetTopic,
      ...targetKeywords.filter(k => k.toLowerCase().includes(targetTopic.toLowerCase().split(' ')[0])),
      `comprehensive ${targetTopic} guide`,
      `${targetTopic} best practices`,
      `how to ${targetTopic.toLowerCase()}`
    ];

    // Choose the most contextually appropriate anchor
    return possibleAnchors[0] || targetTopic;
  }

  /**
   * Generate reasoning for the link suggestion
   */
  private static generateLinkReasoning(
    page: any,
    targetTopic: string,
    score: number,
    type: 'source' | 'target'
  ): string {
    const highScoreReason = `Strong topical relevance (${Math.round(score * 100)}% match)`;
    const mediumScoreReason = `Moderate topical relevance (${Math.round(score * 100)}% match)`;
    const lowScoreReason = `Some topical relevance (${Math.round(score * 100)}% match)`;

    let reason = score > 0.7 ? highScoreReason : score > 0.4 ? mediumScoreReason : lowScoreReason;

    if (type === 'source') {
      reason += `. This page should link to your new ${targetTopic} content to provide readers with additional detailed information.`;
    } else {
      reason += `. Your new ${targetTopic} content should link to this page to provide readers with additional context and supporting information.`;
    }

    return reason;
  }

  /**
   * Calculate simple relevance score
   */
  private static calculateRelevance(topic: string, content: string): number {
    const topicWords = topic.toLowerCase().split(' ');
    const contentWords = content.toLowerCase();

    let matches = 0;
    topicWords.forEach(word => {
      if (contentWords.includes(word)) {
        matches++;
      }
    });

    return matches / topicWords.length;
  }

  /**
   * Identify topic clusters from crawled pages
   */
  private static identifyTopicClusters(crawledPages: any[]): Array<{ pages: any[], topic: string }> {
    const clusters: Array<{ pages: any[], topic: string }> = [];
    const processed = new Set<number>();

    crawledPages.forEach((page, index) => {
      if (processed.has(index)) return;

      const cluster = { pages: [page], topic: this.extractMainTopic(page) };
      processed.add(index);

      // Find similar pages
      crawledPages.forEach((otherPage, otherIndex) => {
        if (processed.has(otherIndex)) return;

        const similarity = this.calculateSimilarity(
          page.title + ' ' + (page.content || ''),
          otherPage.title + ' ' + (otherPage.content || '')
        );

        if (similarity > 0.3) {
          cluster.pages.push(otherPage);
          processed.add(otherIndex);
        }
      });

      if (cluster.pages.length > 1) {
        clusters.push(cluster);
      }
    });

    return clusters;
  }

  /**
   * Find the most relevant topic cluster for the target topic
   */
  private static findMostRelevantCluster(
    targetTopic: string,
    targetKeywords: string[],
    clusters: Array<{ pages: any[], topic: string }>
  ): any[] {
    if (clusters.length === 0) return [];

    let bestCluster: any[] = [];
    let bestScore = 0;

    clusters.forEach(cluster => {
      const clusterContent = cluster.pages
        .map(p => p.title + ' ' + (p.content || ''))
        .join(' ');

      const score = this.calculateKeywordRelevance(
        [...targetTopic.toLowerCase().split(' '), ...targetKeywords.map(k => k.toLowerCase())],
        clusterContent.toLowerCase()
      );

      if (score > bestScore) {
        bestScore = score;
        bestCluster = cluster.pages;
      }
    });

    return bestScore > 0.2 ? bestCluster : [];
  }

  /**
   * Extract main topic from a page
   */
  private static extractMainTopic(page: any): string {
    // Simple extraction - take first 2-3 words from title
    const titleWords = page.title.split(' ').slice(0, 3);
    return titleWords.join(' ');
  }
}