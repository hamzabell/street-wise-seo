/**
 * Topic generation service with AI-powered content suggestions
 */

import { z } from 'zod';
import { getLemonfoxClient } from './lemonfox-client';
import { crawlWebsite } from './website-crawler';
import { analyzeContent } from './content-analyzer';
import { getIndustryTemplate, generateIndustryPrompt, getSeasonalSuggestions, getLocalServicePatterns, getCurrentSeason } from './industry-templates';
import { generateCustomerQuestions } from './question-generator';
import type { TopicGeneration, SavedTopic, NewTopicGeneration, NewSavedTopic } from '../db/schema';
import type { CustomerQuestion } from './question-generator';
import {
  createTopicGeneration,
  getTopicGenerationsByUserId,
  createSavedTopic,
  getSavedTopicsByUserId,
  getSavedTopicsCount,
  getWebsiteAnalysisByDomain,
  isWebsiteRecentlyCrawled
} from '../db/queries';

export const TopicGenerationRequestSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long'),
  industryId: z.string().min(1, 'Industry selection is required'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  location: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  competitorUrl: z.string().url('Invalid competitor URL').optional().or(z.literal('')),
  forceRecrawl: z.boolean().default(false), // Force re-crawl even if recently crawled
  supabaseUserId: z.string().optional(), // User ID for caching checks
});

export type TopicGenerationRequest = z.infer<typeof TopicGenerationRequestSchema>;

export interface GeneratedTopic {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  suggestedTags: string[];
  relevanceScore?: number;
  reasoning?: string;
  source?: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
  relatedContent?: string;
  // Mobile optimization fields
  mobileFriendly?: boolean;
  voiceSearchFriendly?: boolean;
  localIntent?: 'high' | 'medium' | 'low';
  actionOriented?: boolean;
  recommendedLength?: 'short' | 'medium' | 'long';
  // Customer questions field
  customerQuestions?: CustomerQuestion[];
  // Seasonal content fields
  seasonalRelevance?: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'current';
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
  // Implementation fields
  implementationTime?: '15 min' | '30 min' | '1 hour' | '2+ hours';
  contentChecklist?: string[];
  titleVariations?: string[];
}

export interface TopicGenerationResult {
  inputTopic: string;
  generatedTopics: GeneratedTopic[];
  metadata: {
    businessType: string;
    targetAudience: string;
    location?: string;
    generatedAt: string;
    totalTopics: number;
    averageDifficulty: string;
    totalEstimatedVolume: number;
  };
  websiteAnalysis?: any;
  contentAnalysis?: any;
  competitorAnalysis?: any;
}

export class TopicGenerator {
  private lemonfoxClient = getLemonfoxClient();

  async generateTopics(request: TopicGenerationRequest): Promise<TopicGenerationResult> {
    // Validate input
    const validated = TopicGenerationRequestSchema.parse(request);
    // Get industry template
    const industryTemplate = getIndustryTemplate(validated.industryId);
    const industryName = industryTemplate?.name || 'Service Business';
    const seasonalTopics = getSeasonalSuggestions(validated.industryId);

  
    try {
      let websiteAnalysis = null;
      let contentAnalysis = null;
      let competitorAnalysis = null;

      // If website URL provided, check if recently crawled or crawl and analyze it
      if (validated.websiteUrl) {
        const websiteDomain = new URL(validated.websiteUrl).hostname;
      
        try {
          // Check if website was recently crawled (only for primary website, not competitors)
          let shouldUseCachedData = false;
          if (validated.supabaseUserId && !validated.forceRecrawl) {
            const crawlCheck = await isWebsiteRecentlyCrawled(websiteDomain, validated.supabaseUserId, 30);
            shouldUseCachedData = crawlCheck.recentlyCrawled;

            console.log('📅 [TOPIC GENERATOR] Recent crawl check:', {
              domain: websiteDomain,
              recentlyCrawled: crawlCheck.recentlyCrawled,
              daysSinceCrawl: crawlCheck.daysSinceCrawl,
              lastCrawledAt: crawlCheck.lastCrawledAt?.toISOString(),
              forceRecrawl: validated.forceRecrawl
            });

            // If recently crawled and not forcing recrawl, try to use existing analysis
            if (shouldUseCachedData) {
              console.log('📦 [TOPIC GENERATOR] Using cached website analysis for:', websiteDomain);
              const cachedAnalysis = await getWebsiteAnalysisByDomain(websiteDomain, validated.supabaseUserId);
              if (cachedAnalysis) {
                websiteAnalysis = {
                  url: cachedAnalysis.url,
                  domain: cachedAnalysis.domain,
                  crawledPages: [], // We'll populate this if needed
                  totalWordCount: cachedAnalysis.totalWordCount || 0,
                  totalImages: cachedAnalysis.totalImages || 0,
                  topics: JSON.parse(cachedAnalysis.topics || '[]'),
                  keywords: JSON.parse(cachedAnalysis.keywords || '[]'),
                  internalLinkingScore: cachedAnalysis.internalLinkingScore || 0,
                  technicalIssues: JSON.parse(cachedAnalysis.technicalIssues || '[]'),
                  crawledAt: cachedAnalysis.crawledAt.toISOString(),
                };
                console.log('✅ [TOPIC GENERATOR] Cached data loaded successfully:', {
                  domain: websiteAnalysis.domain,
                  topicsFound: websiteAnalysis.topics.length,
                  keywordsFound: websiteAnalysis.keywords.length
                });
              }
            }
          }

          // If not using cached data, crawl the website
          if (!shouldUseCachedData || validated.forceRecrawl) {
            const crawlReason = validated.forceRecrawl ? 'Force recrawl requested' : 'No recent crawl data available';
            console.log(`🕷️ [TOPIC GENERATOR] Crawling website (${crawlReason}):`, validated.websiteUrl);

            websiteAnalysis = await crawlWebsite({
              url: validated.websiteUrl,
              maxPages: 5, // Limit for topic generation
              includeExternalLinks: false,
              crawlDelay: 1000
            });

            console.log('✅ [TOPIC GENERATOR] Website crawled successfully:', {
              domain: websiteAnalysis.domain,
              pagesCrawled: websiteAnalysis.crawledPages.length,
              topicsFound: websiteAnalysis.topics.length
            });
          }

          // If competitor URL provided, crawl competitor as well (competitors are always crawled fresh)
          if (validated.competitorUrl) {
            console.log('🏁 [TOPIC GENERATOR] Crawling competitor:', validated.competitorUrl);
            try {
              competitorAnalysis = await crawlWebsite({
                url: validated.competitorUrl,
                maxPages: 3, // Smaller limit for competitor
                includeExternalLinks: false,
                crawlDelay: 1000
              });
              console.log('✅ [TOPIC GENERATOR] Competitor crawled successfully:', {
                domain: competitorAnalysis.domain,
                pagesCrawled: competitorAnalysis.crawledPages.length
              });
            } catch (error) {
              console.error('❌ [TOPIC GENERATOR] Competitor crawl failed:', error);
              // Continue without competitor analysis
            }
          }

          // Analyze content (only if we have fresh data or sufficient cached data)
          if (websiteAnalysis && (websiteAnalysis.crawledPages.length > 0 || websiteAnalysis.topics.length > 0)) {
            console.log('🧠 [TOPIC GENERATOR] Analyzing content...');
            contentAnalysis = analyzeContent(websiteAnalysis, competitorAnalysis || undefined);
            console.log('✅ [TOPIC GENERATOR] Content analysis completed:', {
              contentGaps: contentAnalysis.contentGaps.length,
              contentClusters: contentAnalysis.contentClusters.length,
              seoInsights: contentAnalysis.seoInsights.length
            });
          } else {
            console.log('⚠️ [TOPIC GENERATOR] Insufficient data for content analysis, proceeding without it');
          }

        } catch (error) {
          console.error('❌ [TOPIC GENERATOR] Website analysis failed:', error);
          // Continue without website analysis
        }
      } else {
        console.log('ℹ️ [TOPIC GENERATOR] No website URL provided, using AI-only generation');
      }

      // Generate topics using AI (with or without website data)
      console.log('🤖 [TOPIC GENERATOR] Generating AI topics...');
      const topics = await this.lemonfoxClient.generateSEOTopics(
        validated.topic,
        industryName,
        validated.targetAudience,
        validated.location,
        websiteAnalysis,
        contentAnalysis,
        validated.industryId,
        seasonalTopics
      );

      // Analyze metadata for each topic
      const topicsWithMetadata = await this.lemonfoxClient.analyzeTopicMetadata(topics);

      // Calculate relevance scores and filter results
      const processedTopics = this.processTopicsWithRelevance(
        topicsWithMetadata,
        validated,
        contentAnalysis
      );

      // Add mobile optimization analysis
      const mobileOptimizedTopics = this.addMobileOptimization(
        processedTopics,
        validated.industryId,
        validated.location
      );

      // Add seasonal and urgency analysis
      const topicsWithSeasonalData = this.addSeasonalAndUrgencyAnalysis(
        mobileOptimizedTopics,
        validated.industryId
      );

      // Generate customer questions for top topics
      const topicsWithQuestions = await this.addCustomerQuestions(
        topicsWithSeasonalData,
        validated,
        industryName
      );

      // Add service area pages if location provided
      const topicsWithServiceArea = this.generateServiceAreaPages(
        topicsWithQuestions,
        validated.location,
        validated.industryId
      );

      // Add implementation details
      const topicsWithImplementation = this.addImplementationDetails(
        topicsWithServiceArea,
        validated.industryId
      );

      // Generate metadata
      const metadata = this.generateMetadata(validated, topicsWithImplementation);

      console.log(`✅ [TOPIC GENERATOR] Generated ${topicsWithImplementation.length} topics with implementation details`);

      return {
        inputTopic: validated.topic,
        generatedTopics: topicsWithImplementation,
        metadata,
        websiteAnalysis,
        contentAnalysis,
        competitorAnalysis,
      };
    } catch (error) {
      console.error('❌ [TOPIC GENERATOR] Error in topic generation:', error);
      throw new Error('Failed to generate topics. Please try again.');
    }
  }

  private processTopicsWithRelevance(
    topics: Array<{
      topic: string;
      difficulty: 'easy' | 'medium' | 'hard';
      searchVolume: number;
      competition: 'low' | 'medium' | 'high';
      suggestedTags: string[];
    }>,
    request: TopicGenerationRequest,
    contentAnalysis?: any
  ): GeneratedTopic[] {
    return topics.map(topic => ({
      ...topic,
      relevanceScore: this.calculateRelevanceScore(topic, request, contentAnalysis),
    })).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  private calculateRelevanceScore(
    topic: { topic: string; suggestedTags: string[] },
    request: TopicGenerationRequest,
    contentAnalysis?: any
  ): number {
    let score = 0;
    const { topic: topicText, suggestedTags } = topic;
    const { industryId, targetAudience, location } = request;

    // Get industry template for relevance scoring
    const industryTemplate = getIndustryTemplate(industryId);
    const industryName = industryTemplate?.name || '';

    // Base relevance from topic content
    const topicLower = topicText.toLowerCase();
    const industryLower = industryName.toLowerCase();
    const audienceLower = targetAudience.toLowerCase();
    const locationLower = location?.toLowerCase() || '';

    // Industry relevance (40% weight)
    if (topicLower.includes(industryLower)) score += 40;
    suggestedTags.forEach(tag => {
      if (tag.toLowerCase().includes(industryLower)) score += 10;
    });

    // Industry-specific pain points relevance
    if (industryTemplate?.commonPainPoints) {
      industryTemplate.commonPainPoints.forEach(painPoint => {
        const painLower = painPoint.toLowerCase();
        if (topicLower.includes(painLower) || painLower.includes(topicLower)) {
          score += 15;
        }
      });
    }

    // Target audience relevance (30% weight)
    const audienceKeywords = audienceLower.split(' ');
    audienceKeywords.forEach(keyword => {
      if (topicLower.includes(keyword) && keyword.length > 2) score += 15;
    });

    // Location relevance (20% weight)
    if (locationLower && topicLower.includes(locationLower)) score += 20;

    // Length and quality (10% weight)
    if (topicText.length >= 10 && topicText.length <= 100) score += 5;
    if (suggestedTags.length >= 3) score += 5;

    // Website-specific relevance (15% weight) if we have content analysis
    if (contentAnalysis && contentAnalysis.contentGaps) {
      const contentGaps = contentAnalysis.contentGaps;
      const topicLower = topicText.toLowerCase();

      // Boost score if topic addresses content gaps
      const matchingGap = contentGaps.find((gap: any) =>
        gap.topic.toLowerCase().includes(topicLower) ||
        topicLower.includes(gap.topic.toLowerCase())
      );

      if (matchingGap) {
        if (matchingGap.priority === 'high') score += 15;
        else if (matchingGap.priority === 'medium') score += 10;
        else score += 5;
      }

      // Boost score if topic is a keyword opportunity
      if (contentAnalysis.keywordOpportunities) {
        const matchingKeyword = contentAnalysis.keywordOpportunities.find((opp: any) =>
          opp.keyword.toLowerCase().includes(topicLower) ||
          topicLower.includes(opp.keyword.toLowerCase())
        );

        if (matchingKeyword) {
          score += 8;
        }
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  private generateMetadata(
    request: TopicGenerationRequest,
    topics: GeneratedTopic[]
  ) {
    const totalVolume = topics.reduce((sum, topic) => sum + topic.searchVolume, 0);
    const difficultyCounts = topics.reduce(
      (acc, topic) => {
        acc[topic.difficulty]++;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 } as Record<string, number>
    );

    const averageDifficulty = Object.entries(difficultyCounts).reduce(
      (max, [difficulty, count]) => count > max.count ? { difficulty, count } : max,
      { difficulty: 'medium', count: 0 }
    ).difficulty;

    const industryTemplate = getIndustryTemplate(request.industryId);

    return {
      businessType: industryTemplate?.name || 'Service Business',
      targetAudience: request.targetAudience,
      location: request.location,
      generatedAt: new Date().toISOString(),
      totalTopics: topics.length,
      averageDifficulty,
      totalEstimatedVolume: totalVolume,
      industryId: request.industryId,
    };
  }

  private async addCustomerQuestions(
    topics: GeneratedTopic[],
    request: TopicGenerationRequest,
    businessType: string
  ): Promise<GeneratedTopic[]> {
    // Generate questions for top 5 topics based on relevance score and search volume
    const topTopics = topics
      .sort((a, b) => {
        const scoreA = (a.relevanceScore || 0) + (a.searchVolume / 1000);
        const scoreB = (b.relevanceScore || 0) + (b.searchVolume / 1000);
        return scoreB - scoreA;
      })
      .slice(0, 5);

    console.log(`🎯 [TOPIC GENERATOR] Generating customer questions for ${topTopics.length} top topics`);

    const topicsWithQuestions = await Promise.all(
      topics.map(async (topic) => {
        // Only generate questions for top topics
        if (topTopics.includes(topic)) {
          try {
            const questionResult = await generateCustomerQuestions({
              topic: topic.topic,
              industryId: request.industryId,
              targetAudience: request.targetAudience,
              location: request.location,
              businessType: businessType,
              maxQuestions: 5 // Generate fewer questions per topic
            });

            return {
              ...topic,
              customerQuestions: questionResult.questions
            };
          } catch (error) {
            console.error(`❌ [TOPIC GENERATOR] Failed to generate questions for topic "${topic.topic}":`, error);
            return topic; // Return topic without questions if generation fails
          }
        }
        return topic;
      })
    );

    return topicsWithQuestions;
  }

  private addSeasonalAndUrgencyAnalysis(
    topics: GeneratedTopic[],
    industryId: string
  ): GeneratedTopic[] {
    const currentSeason = getCurrentSeason();
    const seasonalTopics = getSeasonalSuggestions(industryId);
    const template = getIndustryTemplate(industryId);

    return topics.map(topic => {
      const topicLower = topic.topic.toLowerCase();

      // Seasonal relevance analysis
      let seasonalRelevance: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday' | 'current' | undefined;
      let urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' | undefined;

      // Check if topic matches current seasonal suggestions
      const currentSeasonalTopics = seasonalTopics.filter(seasonalTopic =>
        seasonalTopic.toLowerCase().includes(topicLower) ||
        topicLower.includes(seasonalTopic.toLowerCase())
      );

      if (currentSeasonalTopics.length > 0) {
        seasonalRelevance = 'current';
      }

      // Check for seasonal keywords
      const seasonalKeywords = {
        spring: ['spring', 'march', 'april', 'may', 'easter', 'bloom', 'garden', 'cleaning'],
        summer: ['summer', 'june', 'july', 'august', 'heat', 'vacation', 'outdoor', 'pool'],
        fall: ['fall', 'autumn', 'september', 'october', 'november', 'leaves', 'halloween', 'thanksgiving'],
        winter: ['winter', 'december', 'january', 'february', 'snow', 'cold', 'heating', 'holiday', 'christmas'],
        holiday: ['holiday', 'christmas', 'thanksgiving', 'easter', 'halloween', 'valentine', 'fourth of july']
      };

      Object.entries(seasonalKeywords).forEach(([season, keywords]) => {
        if (keywords.some(keyword => topicLower.includes(keyword))) {
          seasonalRelevance = season as any;
        }
      });

      // Urgency analysis for service businesses
      const emergencyKeywords = ['emergency', '24 hour', '24/7', 'urgent', 'immediate', 'same day', 'asap', 'repair', 'fix'];
      const highPriorityKeywords = ['prevent', 'maintenance', 'inspection', 'check', 'prepare', 'before'];

      if (emergencyKeywords.some(keyword => topicLower.includes(keyword))) {
        urgencyLevel = 'emergency';
      } else if (highPriorityKeywords.some(keyword => topicLower.includes(keyword))) {
        urgencyLevel = 'high';
      } else if (template?.commonPainPoints.some(painPoint =>
        topicLower.includes(painPoint.toLowerCase()) ||
        painPoint.toLowerCase().includes(topicLower)
      )) {
        urgencyLevel = 'medium';
      } else {
        urgencyLevel = 'low';
      }

      return {
        ...topic,
        seasonalRelevance,
        urgencyLevel
      };
    });
  }

  private addMobileOptimization(
    topics: GeneratedTopic[],
    industryId: string,
    location?: string
  ): GeneratedTopic[] {
    const localServicePatterns = getLocalServicePatterns(industryId);
    const locationLower = location?.toLowerCase() || '';

    return topics.map(topic => {
      const topicLower = topic.topic.toLowerCase();

      // Mobile-friendly analysis
      const mobileFriendly = topicLower.length <= 60 &&
                            !topicLower.includes('comprehensive') &&
                            !topicLower.includes('detailed') &&
                            !topicLower.includes('extensive');

      // Voice search friendly analysis
      const voiceSearchFriendly =
        (topicLower.includes('how to') ||
         topicLower.includes('what is') ||
         topicLower.includes('where can') ||
         topicLower.includes('why does') ||
         topicLower.includes('when should')) &&
        !topicLower.includes('vs') &&
        !topicLower.includes(':') &&
        topicLower.split(' ').length <= 10;

      // Local intent analysis
      let localIntent: 'high' | 'medium' | 'low' = 'low';
      if (locationLower && topicLower.includes(locationLower)) {
        localIntent = 'high';
      } else if (localServicePatterns.some(pattern =>
        pattern.toLowerCase().includes(topicLower) ||
        topicLower.includes(pattern.toLowerCase())
      )) {
        localIntent = 'medium';
      }

      // Action-oriented analysis
      const actionOriented =
        topicLower.includes('how to') ||
        topicLower.includes('guide') ||
        topicLower.includes('tips') ||
        topicLower.includes('steps') ||
        topicLower.includes('best') ||
        topicLower.includes('top') ||
        topicLower.includes('avoid');

      // Recommended length based on mobile optimization
      let recommendedLength: 'short' | 'medium' | 'long' = 'medium';
      if (mobileFriendly && voiceSearchFriendly) {
        recommendedLength = 'short';
      } else if (!mobileFriendly && !voiceSearchFriendly) {
        recommendedLength = 'long';
      }

      return {
        ...topic,
        mobileFriendly,
        voiceSearchFriendly,
        localIntent,
        actionOriented,
        recommendedLength,
      };
    });
  }

  private generateServiceAreaPages(
    topics: GeneratedTopic[],
    location?: string,
    industryId?: string
  ): GeneratedTopic[] {
    if (!location || !industryId) return topics;

    const locationLower = location.toLowerCase();
    const template = getIndustryTemplate(industryId);
    if (!template) return topics;

    // Generate service area specific topics
    const serviceAreaTopics: GeneratedTopic[] = [
      {
        topic: `Emergency ${template.name.toLowerCase()} in ${location}`,
        difficulty: 'medium' as const,
        searchVolume: 800,
        competition: 'medium' as const,
        suggestedTags: [`emergency ${template.name.toLowerCase()}`, location, '24/7 service'],
        localIntent: 'high',
        mobileFriendly: true,
        voiceSearchFriendly: true,
        actionOriented: true,
        recommendedLength: 'short',
        urgencyLevel: 'emergency',
        seasonalRelevance: 'current'
      },
      {
        topic: `Best ${template.name.toLowerCase()} near ${location}`,
        difficulty: 'medium' as const,
        searchVolume: 1200,
        competition: 'high' as const,
        suggestedTags: [`best ${template.name.toLowerCase()}`, location, 'top rated'],
        localIntent: 'high',
        mobileFriendly: true,
        voiceSearchFriendly: true,
        actionOriented: true,
        recommendedLength: 'medium'
      },
      {
        topic: `${template.name} Services ${location}`,
        difficulty: 'easy' as const,
        searchVolume: 600,
        competition: 'medium' as const,
        suggestedTags: [`${template.name.toLowerCase()} services`, location, 'local'],
        localIntent: 'high',
        mobileFriendly: true,
        voiceSearchFriendly: false,
        actionOriented: true,
        recommendedLength: 'short'
      },
      {
        topic: `Affordable ${template.name.toLowerCase()} in ${location}`,
        difficulty: 'easy' as const,
        searchVolume: 400,
        competition: 'medium' as const,
        suggestedTags: [`affordable ${template.name.toLowerCase()}`, location, 'pricing'],
        localIntent: 'high',
        mobileFriendly: true,
        voiceSearchFriendly: true,
        actionOriented: true,
        recommendedLength: 'short'
      }
    ];

    // Add service area topics if they don't already exist
    const existingTopics = topics.map(t => t.topic.toLowerCase());
    const newServiceAreaTopics = serviceAreaTopics.filter(
      serviceTopic => !existingTopics.includes(serviceTopic.topic.toLowerCase())
    );

    return [...topics, ...newServiceAreaTopics.slice(0, 3)]; // Add up to 3 service area topics
  }

  private addImplementationDetails(
    topics: GeneratedTopic[],
    industryId: string
  ): GeneratedTopic[] {
    return topics.map(topic => {
      const topicLower = topic.topic.toLowerCase();

      // Determine implementation time based on complexity
      let implementationTime: '15 min' | '30 min' | '1 hour' | '2+ hours' = '30 min';

      if (topic.recommendedLength === 'short' && topic.difficulty === 'easy') {
        implementationTime = '15 min';
      } else if (topic.difficulty === 'hard' || topic.recommendedLength === 'long') {
        implementationTime = '2+ hours';
      } else if (topic.difficulty === 'medium' || topic.urgencyLevel === 'high') {
        implementationTime = '1 hour';
      }

      // Generate content checklist based on topic characteristics
      const checklist: string[] = [];

      // Basic checklist items for all topics
      checklist.push('Write engaging introduction');
      checklist.push('Include target keywords naturally');
      checklist.push('Add clear call-to-action');

      // Topic-specific checklist items
      if (topic.localIntent === 'high') {
        checklist.push('Include local references and landmarks');
        checklist.push('Add service area information');
        checklist.push('Include phone number and address');
      }

      if (topic.mobileFriendly) {
        checklist.push('Use short paragraphs and bullet points');
        checklist.push('Optimize for mobile reading');
      }

      if (topic.voiceSearchFriendly) {
        checklist.push('Use conversational language');
        checklist.push('Answer common questions directly');
      }

      if (topic.urgencyLevel === 'emergency') {
        checklist.push('Highlight emergency contact info');
        checklist.push('Include response time guarantees');
        checklist.push('Add trust indicators and reviews');
      }

      if (topic.seasonalRelevance === 'current') {
        checklist.push('Include seasonal keywords');
        checklist.push('Add timely references');
      }

      // Industry-specific checklist items
      const template = getIndustryTemplate(industryId);
      if (template) {
        if (template.id.includes('plumbing') || template.id.includes('hvac')) {
          checklist.push('Include licensing information');
          checklist.push('Add service guarantees');
        } else if (template.id.includes('electrical')) {
          checklist.push('Emphasize safety and certifications');
          checklist.push('Include insurance information');
        } else if (template.id.includes('cleaning')) {
          checklist.push('List cleaning methods and products');
          checklist.push('Add before/after examples');
        }
      }

      // Generate title variations
      const titleVariations: string[] = [];
      const baseTopic = topic.topic;

      // Create variations
      titleVariations.push(baseTopic);

      if (!baseTopic.includes('Guide')) {
        titleVariations.push(`Complete Guide to ${baseTopic}`);
      }

      if (baseTopic.toLowerCase().includes('how to')) {
        titleVariations.push(baseTopic.replace('How to', 'Ultimate Guide: How to'));
      }

      if (topic.localIntent === 'high') {
        titleVariations.push(`${baseTopic} [Your City] Guide`);
      }

      if (topic.urgencyLevel === 'emergency') {
        titleVariations.push(`Emergency ${baseTopic}: What to Do Now`);
      }

      return {
        ...topic,
        implementationTime,
        contentChecklist: checklist.slice(0, 6), // Limit to 6 key items
        titleVariations: titleVariations.slice(0, 3) // Limit to 3 variations
      };
    });
  }

  async saveTopicsToDatabase(
    supabaseUserId: string,
    result: TopicGenerationResult
  ): Promise<{ generationId: number; savedTopicIds: number[] }> {
    try {
      // Create database record for the generation
      const generation = await createTopicGeneration({
        supabaseUserId,
        inputTopic: result.inputTopic,
        generatedTopics: JSON.stringify(result.generatedTopics),
        metadata: JSON.stringify(result.metadata),
      });

      return {
        generationId: generation.id,
        savedTopicIds: [] // Individual topics can be saved separately if needed
      };
    } catch (error) {
      console.error('Error saving topics to database:', error);
      throw new Error('Failed to save topics');
    }
  }

  async getTopicHistory(supabaseUserId: string, limit = 10): Promise<TopicGenerationResult[]> {
    try {
      const generations = await getTopicGenerationsByUserId(supabaseUserId, limit, 0);

      return generations.map(generation => {
        try {
          const generatedTopics = JSON.parse(generation.generatedTopics);
          const metadata = JSON.parse(generation.metadata || '{}');

          return {
            inputTopic: generation.inputTopic,
            generatedTopics: Array.isArray(generatedTopics) ? generatedTopics : [],
            metadata: {
              businessType: metadata.businessType || '',
              targetAudience: metadata.targetAudience || '',
              location: metadata.location,
              generatedAt: metadata.generatedAt || generation.createdAt.toISOString(),
              totalTopics: metadata.totalTopics || generatedTopics.length,
              averageDifficulty: metadata.averageDifficulty || 'medium',
              totalEstimatedVolume: metadata.totalEstimatedVolume || 0,
            }
          };
        } catch (parseError) {
          console.error('Error parsing generation data:', parseError);
          // Return a minimal valid structure for corrupted data
          return {
            inputTopic: generation.inputTopic,
            generatedTopics: [],
            metadata: {
              businessType: '',
              targetAudience: '',
              generatedAt: generation.createdAt.toISOString(),
              totalTopics: 0,
              averageDifficulty: 'medium',
              totalEstimatedVolume: 0,
            }
          };
        }
      });
    } catch (error) {
      console.error('Error fetching topic history:', error);
      throw new Error('Failed to fetch topic history');
    }
  }

  async saveSingleTopic(
    supabaseUserId: string,
    topic: GeneratedTopic,
    sourceGenerationId?: number
  ): Promise<number> {
    try {
      const savedTopic = await createSavedTopic({
        supabaseUserId,
        topic: topic.topic,
        description: `SEO topic with ${topic.competition} competition and ${topic.searchVolume} estimated monthly searches`,
        tags: JSON.stringify(topic.suggestedTags),
        difficulty: topic.difficulty,
        searchVolume: topic.searchVolume,
        competitionLevel: topic.competition,
        sourceGenerationId,
      });

      return savedTopic.id;
    } catch (error) {
      console.error('Error saving single topic:', error);
      throw new Error('Failed to save topic');
    }
  }
}

// Singleton instance
let topicGenerator: TopicGenerator | null = null;

export function getTopicGenerator(): TopicGenerator {
  if (!topicGenerator) {
    topicGenerator = new TopicGenerator();
  }
  return topicGenerator;
}

// Export helper functions for use in API routes
export async function generateSEOTopics(request: TopicGenerationRequest): Promise<TopicGenerationResult> {
  const generator = getTopicGenerator();
  return await generator.generateTopics(request);
}

export async function saveTopicsToDatabase(
  supabaseUserId: string,
  result: TopicGenerationResult
): Promise<{ generationId: number; savedTopicIds: number[] }> {
  const generator = getTopicGenerator();
  return await generator.saveTopicsToDatabase(supabaseUserId, result);
}

export async function saveSingleTopic(
  supabaseUserId: string,
  topic: GeneratedTopic,
  sourceGenerationId?: number
): Promise<number> {
  const generator = getTopicGenerator();
  return await generator.saveSingleTopic(supabaseUserId, topic, sourceGenerationId);
}