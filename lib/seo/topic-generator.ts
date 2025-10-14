/**
 * Topic generation service with AI-powered content suggestions
 */

import { z } from 'zod';
import { getLemonfoxClient, type CulturalGenerationRequest } from './lemonfox-client';
import { crawlWebsite } from './website-crawler';
import { analyzeContent } from './content-analyzer';
import { getIndustryTemplate, generateIndustryPrompt, getSeasonalSuggestions, getLocalServicePatterns, getCurrentSeason } from './industry-templates';
import { detectLocationCharacteristics, getLocationAwareSeasonalTopics } from './location-awareness';
import { generateCustomerQuestions } from './question-generator';
import { analyzeContentPerformance, generatePersonalizationInsights } from './content-performance-tracker';
import { performCompetitorAnalysis } from './competitor-intelligence';
import { analyzeMarketTrends, getQuickTrendInsights } from './market-trend-analyzer';
import { generatePredictiveRecommendations } from './predictive-content-engine';
import type { TopicGeneration, SavedTopic, NewTopicGeneration, NewSavedTopic } from '../db/schema';
import type { CustomerQuestion } from './question-generator';
import type { PersonalizationInsights } from './content-performance-tracker';
import type { TrendAnalysisResult, MarketInsight } from './market-trend-analyzer';
import type { PredictiveContentResult } from './predictive-content-engine';
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
  enablePersonalization: z.boolean().default(true), // Enable performance-based personalization
  maxTopics: z.number().default(20), // Maximum number of topics to generate
  // Advanced contextual intelligence options
  enableMarketAnalysis: z.boolean().default(false), // Enable market trend analysis
  enablePredictiveRecommendations: z.boolean().default(false), // Enable predictive content engine
  marketAnalysisTimeframe: z.enum(['current', '30_days', '90_days', '6_months']).default('30_days'),
  predictionAccuracy: z.enum(['conservative', 'balanced', 'aggressive']).default('balanced'),
  includeSeasonalForecast: z.boolean().default(false),
  // Cultural and language options
  languagePreference: z.enum(['english', 'native', 'cultural_english']).default('english'),
  formalityLevel: z.enum(['formal', 'professional', 'casual', 'slang_heavy']).default('professional'),
  contentPurpose: z.enum(['marketing', 'educational', 'conversational', 'technical']).default('marketing'),
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
  source?: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'personalized';
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
  // Performance-based personalization fields
  personalizedScore?: number;
  predictedPerformance?: number;
  userPreferenceMatch?: number;
  personalizationReasons?: string[];
  optimalContentType?: string;
  bestPerformingTone?: string;
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
    personalizationEnabled: boolean;
    averagePersonalizedScore?: number;
    averagePredictedPerformance?: number;
    marketAnalysisEnabled: boolean;
    predictiveRecommendationsEnabled: boolean;
  };
  websiteAnalysis?: any;
  contentAnalysis?: any;
  competitorAnalysis?: any;
  personalizationInsights?: PersonalizationInsights;
  marketAnalysis?: TrendAnalysisResult;
  predictiveRecommendations?: PredictiveContentResult;
  marketInsights?: MarketInsight[];
}

export class TopicGenerator {
  private lemonfoxClient = getLemonfoxClient();

  async generateTopics(request: TopicGenerationRequest): Promise<TopicGenerationResult> {
    // Validate input
    const validated = TopicGenerationRequestSchema.parse(request);
    // Get industry template
    const industryTemplate = getIndustryTemplate(validated.industryId);
    const industryName = industryTemplate?.name || 'Service Business';

    // Get location-aware seasonal topics
    let seasonalTopics = getSeasonalSuggestions(validated.industryId);
    if (validated.location) {
      const locationCharacteristics = detectLocationCharacteristics(validated.location);
      const locationAwareSeasonal = getLocationAwareSeasonalTopics(validated.industryId, locationCharacteristics);
      // Prioritize location-aware topics
      seasonalTopics = [...locationAwareSeasonal, ...seasonalTopics.slice(0, 2)];
    }

    // Initialize personalization variables
    let personalizationInsights: PersonalizationInsights | undefined;
    if (validated.enablePersonalization && validated.supabaseUserId) {
      try {
        console.log('🧠 [TOPIC GENERATOR] Generating personalization insights...');
        personalizationInsights = await generatePersonalizationInsights(validated.supabaseUserId);
        console.log('✅ [TOPIC GENERATOR] Personalization insights generated:', {
          optimalContentTypes: personalizationInsights.optimalContentTypes?.length || 0,
          preferredTopics: personalizationInsights.preferredTopics?.length || 0,
          recommendedTones: personalizationInsights.recommendedTones?.length || 0
        });
      } catch (error) {
        console.warn('⚠️ [TOPIC GENERATOR] Personalization failed, proceeding without it:', error);
      }
    }

    try {
      let websiteAnalysis = null;
      let contentAnalysis = null;
      let competitorAnalysis = null;
      let competitorIntelligence = null;

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

          // Generate advanced competitor intelligence if we have competitor data
          if (competitorAnalysis && validated.enablePersonalization) {
            try {
              console.log('🕵️ [TOPIC GENERATOR] Analyzing competitor intelligence...');
              competitorIntelligence = await performCompetitorAnalysis(
                [competitorAnalysis],
                industryName,
                validated.location
              );
              console.log('✅ [TOPIC GENERATOR] Competitor intelligence generated');
            } catch (error) {
              console.warn('⚠️ [TOPIC GENERATOR] Competitor intelligence analysis failed:', error);
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

      // Prepare cultural generation request
      const culturalRequest: CulturalGenerationRequest = {
        location: validated.location,
        languagePreference: validated.languagePreference,
        formalityLevel: validated.formalityLevel,
        contentPurpose: validated.contentPurpose,
        targetAudience: validated.targetAudience,
        businessType: industryName
      };

      // Generate topics using AI (with or without website data)
      console.log('🤖 [TOPIC GENERATOR] Generating AI topics with cultural adaptation...');
      const topics = await this.lemonfoxClient.generateSEOTopics(
        validated.topic,
        industryName,
        validated.targetAudience,
        validated.location,
        websiteAnalysis,
        contentAnalysis,
        validated.industryId,
        seasonalTopics,
        personalizationInsights,
        competitorIntelligence,
        culturalRequest
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
        validated.industryId,
        validated.location
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

      // Apply performance-based personalization if enabled
      const personalizedTopics = validated.enablePersonalization
        ? this.applyPerformancePersonalization(topicsWithImplementation, personalizationInsights, competitorIntelligence)
        : topicsWithImplementation;

      // Initialize market analysis variables
      let marketAnalysis: TrendAnalysisResult | undefined;
      let predictiveRecommendations: PredictiveContentResult | undefined;
      let marketInsights: MarketInsight[] = [];

      // Perform market trend analysis if enabled
      if (validated.enableMarketAnalysis) {
        try {
          console.log('📈 [TOPIC GENERATOR] Performing market trend analysis...');
          marketAnalysis = await analyzeMarketTrends({
            topic: validated.topic,
            industry: industryName,
            location: validated.location,
            timeframe: validated.marketAnalysisTimeframe,
            includeCompetitors: true,
            includeSeasonal: validated.includeSeasonalForecast,
            detailLevel: validated.predictionAccuracy === 'aggressive' ? 'deep' :
                         validated.predictionAccuracy === 'conservative' ? 'basic' : 'comprehensive'
          });

          // Extract key market insights
          marketInsights = marketAnalysis.marketInsights.slice(0, 5);
          console.log('✅ [TOPIC GENERATOR] Market analysis completed:', {
            currentTrends: marketAnalysis.currentTrends.length,
            emergingOpportunities: marketAnalysis.emergingOpportunities.length,
            insights: marketInsights.length
          });
        } catch (error) {
          console.warn('⚠️ [TOPIC GENERATOR] Market analysis failed:', error);
        }
      }

      // Generate predictive recommendations if enabled
      if (validated.enablePredictiveRecommendations && validated.supabaseUserId) {
        try {
          console.log('🔮 [TOPIC GENERATOR] Generating predictive recommendations...');
          predictiveRecommendations = await generatePredictiveRecommendations({
            businessContext: {
              industry: industryName,
              location: validated.location,
              targetAudience: validated.targetAudience,
              businessGoals: ['Increase organic traffic', 'Improve search rankings'],
              contentCapabilities: ['blog_post', 'social_media', 'website_page'],
              resources: {
                time: 'medium',
                budget: 'medium',
                expertise: ['Content writing', 'SEO']
              }
            },
            analysisOptions: {
              timeframe: validated.marketAnalysisTimeframe === 'current' ? '30_days' :
                         validated.marketAnalysisTimeframe === '30_days' ? '30_days' :
                         validated.marketAnalysisTimeframe === '90_days' ? '90_days' : '6_months',
              predictionAccuracy: validated.predictionAccuracy,
              includeCompetitors: true,
              includeSeasonal: validated.includeSeasonalForecast,
              maxRecommendations: 10
            },
            personalizationData: {
              userId: validated.supabaseUserId,
              historicalPerformance: true,
              userPreferences: true
            }
          });
          console.log('✅ [TOPIC GENERATOR] Predictive recommendations generated:', {
            predictions: predictiveRecommendations.predictions.length,
            strategicInsights: predictiveRecommendations.strategicInsights.length
          });
        } catch (error) {
          console.warn('⚠️ [TOPIC GENERATOR] Predictive recommendations failed:', error);
        }
      }

      // Apply market intelligence and predictive insights to topics
      const enhancedTopics = this.applyMarketIntelligence(
        personalizedTopics,
        marketAnalysis,
        predictiveRecommendations,
        marketInsights
      );

      // Limit to max topics if specified
      const finalTopics = validated.maxTopics ? enhancedTopics.slice(0, validated.maxTopics) : enhancedTopics;

      // Generate metadata
      const metadata = this.generateMetadata(validated, finalTopics, personalizationInsights);

      console.log(`✅ [TOPIC GENERATOR] Generated ${finalTopics.length} topics with advanced contextual intelligence`);

      return {
        inputTopic: validated.topic,
        generatedTopics: finalTopics,
        metadata,
        websiteAnalysis,
        contentAnalysis,
        competitorAnalysis,
        personalizationInsights,
        marketAnalysis,
        predictiveRecommendations,
        marketInsights,
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
    topics: GeneratedTopic[],
    personalizationInsights?: PersonalizationInsights
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

    // Calculate personalization metrics
    const averagePersonalizedScore = topics.reduce((sum, topic) => sum + (topic.personalizedScore || 0), 0) / topics.length;
    const averagePredictedPerformance = topics.reduce((sum, topic) => sum + (topic.predictedPerformance || 0), 0) / topics.length;

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
      personalizationEnabled: request.enablePersonalization,
      averagePersonalizedScore: request.enablePersonalization ? averagePersonalizedScore : undefined,
      averagePredictedPerformance: request.enablePersonalization ? averagePredictedPerformance : undefined,
      marketAnalysisEnabled: request.enableMarketAnalysis,
      predictiveRecommendationsEnabled: request.enablePredictiveRecommendations,
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
    industryId: string,
    location?: string
  ): GeneratedTopic[] {
    // Get location-aware season if location provided
    let currentSeason = getCurrentSeason();
    const locationCharacteristics = location ? detectLocationCharacteristics(location) : null;
    if (locationCharacteristics) {
      currentSeason = locationCharacteristics.season as any;
    }

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

      // Check for seasonal keywords - location-aware
      let seasonalKeywords: Record<string, string[]> = {
        spring: ['spring', 'march', 'april', 'may', 'easter', 'bloom', 'garden', 'cleaning'],
        summer: ['summer', 'june', 'july', 'august', 'heat', 'vacation', 'outdoor', 'pool'],
        fall: ['fall', 'autumn', 'september', 'october', 'november', 'leaves', 'halloween', 'thanksgiving'],
        winter: ['winter', 'december', 'january', 'february', 'snow', 'cold', 'heating', 'holiday', 'christmas'],
        holiday: ['holiday', 'christmas', 'thanksgiving', 'easter', 'halloween', 'valentine', 'fourth of july']
      };

      // Override with location-specific seasonal keywords
      if (locationCharacteristics && locationCharacteristics.country === 'Nigeria') {
        seasonalKeywords = {
          harmattan: ['harmattan', 'dust', 'dry', 'december', 'january', 'febuary', 'ash', 'fog', 'cold', 'chap', 'lips'],
          dry: ['dry', 'heat', 'hot', 'march', 'april', 'may', 'sun', 'temperature', 'hot season', 'dehydration'],
          rainy: ['rain', 'rainy', 'wet', 'june', 'july', 'august', 'september', 'flood', 'storm', 'umbrella', 'mud', 'traffic'],
          holiday: ['christmas', 'new year', 'easter', 'sallah', 'celebration', 'festival']
        };
      }

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

  private applyPerformancePersonalization(
    topics: GeneratedTopic[],
    personalizationInsights?: PersonalizationInsights,
    competitorIntelligence?: any
  ): GeneratedTopic[] {
    if (!personalizationInsights) {
      return topics;
    }

    console.log('🎯 [TOPIC GENERATOR] Applying performance-based personalization to topics...');

    return topics.map(topic => {
      const personalizationReasons: string[] = [];
      let personalizedScore = 0;
      let predictedPerformance = 50; // Base performance prediction

      // Topic relevance scoring based on user preferences
      const topicLower = topic.topic.toLowerCase();

      // Check if topic matches preferred topics
      const topicPreferenceMatch = personalizationInsights.contentRecommendations?.topicSuggestions?.find(pref =>
        topicLower.includes(pref.topic.toLowerCase()) ||
        pref.topic.toLowerCase().includes(topicLower)
      );

      if (topicPreferenceMatch) {
        personalizedScore += topicPreferenceMatch.priority * 0.3;
        predictedPerformance += topicPreferenceMatch.expectedPerformance * 0.2;
        personalizationReasons.push(`Matches user's preferred topic pattern (${topicPreferenceMatch.topic})`);
      }

      // Content type optimization
      const optimalContentType = personalizationInsights.contentRecommendations?.optimalContentTypes?.find(type =>
        type.type === this.inferContentTypeFromTopic(topicLower)
      );

      if (optimalContentType) {
        personalizedScore += optimalContentType.confidence * 0.2;
        predictedPerformance += optimalContentType.expectedScore * 0.15;
        personalizationReasons.push(`Optimal for ${optimalContentType.type} content format`);
      }

      // Tone preference matching
      const recommendedTone = personalizationInsights.contentRecommendations?.toneRecommendations?.find(tone =>
        this.topicMatchesTone(topicLower, tone.tone)
      );

      if (recommendedTone) {
        personalizedScore += recommendedTone.effectiveness * 0.15;
        personalizationReasons.push(`Aligns with ${recommendedTone.tone} communication style`);
      }

      // Length preference optimization
      const lengthPref = personalizationInsights.contentRecommendations?.structuralPreferences;
      if (topic.recommendedLength && lengthPref) {
        const lengthScore = this.calculateLengthScore(topic.recommendedLength, lengthPref);
        personalizedScore += lengthScore * 0.1;
        if (lengthScore > 0.7) {
          personalizationReasons.push('Optimal content length for audience');
        }
      }

      // Competitor differentiation opportunities
      if (competitorIntelligence && competitorIntelligence.competitiveGaps) {
        const gapMatch = competitorIntelligence.competitiveGaps.find((gap: any) =>
          topicLower.includes(gap.topic.toLowerCase()) ||
          gap.topic.toLowerCase().includes(topicLower)
        );

        if (gapMatch) {
          personalizedScore += gapMatch.opportunityScore * 0.25;
          predictedPerformance += 15;
          personalizationReasons.push('Addresses competitor content gap');
          topic.source = 'competitive_gap';
        }
      }

      // User-specific pattern matching
      if (personalizationInsights.userProfile) {
        const profile = personalizationInsights.userProfile;

        // Time-of-day performance adjustment
        const currentHour = new Date().getHours();
        const timePerformance = profile.peakEngagementTimes.find(time =>
          currentHour >= time && currentHour < time + 2
        );

        if (timePerformance) {
          predictedPerformance += 10 * 0.1;
          personalizationReasons.push('Optimal for current time period');
        }

        // Seasonal performance adjustment
        const currentSeason = this.getCurrentSeason();
        const seasonalPerformance = profile.seasonalPreferences[currentSeason];

        if (seasonalPerformance && seasonalPerformance > 25) {
          predictedPerformance += seasonalPerformance * 0.1;
          personalizationReasons.push('Seasonally relevant content');
        }
      }

      // Apply structural preferences
      if (personalizationInsights.contentRecommendations?.structuralPreferences) {
        const structPref = personalizationInsights.contentRecommendations.structuralPreferences;

        if (topic.actionOriented) {
          personalizedScore += 10;
          personalizationReasons.push('Action-oriented content preference match');
        }

        if (topic.mobileFriendly) {
          personalizedScore += 8;
          personalizationReasons.push('Mobile-optimized for user audience');
        }

        if (topic.voiceSearchFriendly) {
          personalizedScore += 6;
          personalizationReasons.push('Voice search optimized');
        }
      }

      // Calculate final scores
      personalizedScore = Math.min(100, Math.max(0, personalizedScore));
      predictedPerformance = Math.min(100, Math.max(0, predictedPerformance));

      // Update topic with personalization data
      return {
        ...topic,
        personalizedScore,
        predictedPerformance,
        userPreferenceMatch: personalizedScore,
        personalizationReasons,
        optimalContentType: optimalContentType?.contentType,
        bestPerformingTone: recommendedTone?.tone,
        source: personalizedScore > 70 ? 'personalized' : topic.source
      };
    }).sort((a, b) => {
      // Sort by personalized score first, then predicted performance
      const scoreA = (a.personalizedScore || 0) * 0.7 + (a.predictedPerformance || 0) * 0.3;
      const scoreB = (b.personalizedScore || 0) * 0.7 + (b.predictedPerformance || 0) * 0.3;
      return scoreB - scoreA;
    });
  }

  private inferContentTypeFromTopic(topic: string): string {
    const topicLower = topic.toLowerCase();

    if (topicLower.includes('how to') || topicLower.includes('guide') || topicLower.includes('tutorial')) {
      return 'blog_post';
    } else if (topicLower.includes('emergency') || topicLower.includes('urgent') || topicLower.includes('quick')) {
      return 'social_media';
    } else if (topicLower.includes('service') || topicLower.includes('about') || topicLower.includes('company')) {
      return 'website_page';
    } else if (topicLower.includes('newsletter') || topicLower.includes('update') || topicLower.includes('announcement')) {
      return 'email';
    } else if (topicLower.includes('near') || topicLower.includes('local') || topicLower.includes('location')) {
      return 'google_business_profile';
    }

    return 'blog_post'; // Default
  }

  private topicMatchesTone(topic: string, tone: string): boolean {
    const topicLower = topic.toLowerCase();

    switch (tone) {
      case 'professional':
        return topicLower.includes('guide') || topicLower.includes('professional') || topicLower.includes('expert');
      case 'casual':
        return topicLower.includes('tips') || topicLower.includes('easy') || topicLower.includes('simple');
      case 'friendly':
        return topicLower.includes('help') || topicLower.includes('friendly') || topicLower.includes('welcome');
      case 'authoritative':
        return topicLower.includes('ultimate') || topicLower.includes('complete') || topicLower.includes('master');
      case 'conversational':
        return topicLower.includes('talk') || topicLower.includes('chat') || topicLower.includes('discuss');
      default:
        return false;
    }
  }

  private calculateLengthScore(recommendedLength: string, userPreferences: any): number {
    if (!userPreferences || !userPreferences.optimalLength) {
      // Default scores if no preferences available
      switch (recommendedLength) {
        case 'short':
          return 0.5;
        case 'medium':
          return 0.7;
        case 'long':
          return 0.3;
        default:
          return 0.5;
      }
    }

    const optimalLength = userPreferences.optimalLength;

    // Score based on how close the recommended length is to optimal length
    const lengthMap = { short: 300, medium: 800, long: 1500 };
    const recommendedLengthValue = lengthMap[recommendedLength as keyof typeof lengthMap] || 800;

    const difference = Math.abs(recommendedLengthValue - optimalLength);
    const maxDifference = 1200; // Max possible difference

    // Score between 0 and 1, higher when closer to optimal
    return Math.max(0, 1 - (difference / maxDifference));
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private applyMarketIntelligence(
    topics: GeneratedTopic[],
    marketAnalysis?: TrendAnalysisResult,
    predictiveRecommendations?: PredictiveContentResult,
    marketInsights?: MarketInsight[]
  ): GeneratedTopic[] {
    if (!marketAnalysis && !predictiveRecommendations) {
      return topics;
    }

    console.log('🧠 [TOPIC GENERATOR] Applying market intelligence to topics...');

    return topics.map(topic => {
      const topicLower = topic.topic.toLowerCase();
      let marketScore = 0;
      const marketReasons: string[] = [];

      // Apply market trend intelligence
      if (marketAnalysis) {
        // Check alignment with current trends
        const matchingTrend = marketAnalysis.currentTrends.find(trend =>
          topicLower.includes(trend.trend.toLowerCase()) ||
          trend.trend.toLowerCase().includes(topicLower)
        );

        if (matchingTrend) {
          marketScore += matchingTrend.growthRate * 0.2;
          marketReasons.push(`Aligns with growing trend: ${matchingTrend.trend} (${matchingTrend.growthRate}% growth)`);
          topic.predictedPerformance = (topic.predictedPerformance || 50) + 15;
        }

        // Check for emerging opportunities
        const matchingOpportunity = marketAnalysis.emergingOpportunities.find(opp =>
          topicLower.includes(opp.trend.toLowerCase()) ||
          opp.trend.toLowerCase().includes(topicLower)
        );

        if (matchingOpportunity) {
          marketScore += matchingOpportunity.growthRate * 0.3;
          marketReasons.push(`First-mover opportunity in emerging trend: ${matchingOpportunity.trend}`);
          topic.predictedPerformance = (topic.predictedPerformance || 50) + 25;
          topic.source = 'market_opportunity';
        }

        // Check for declining trends to avoid
        const decliningTrend = marketAnalysis.decliningTrends.find(trend =>
          topicLower.includes(trend.trend.toLowerCase()) ||
          trend.trend.toLowerCase().includes(topicLower)
        );

        if (decliningTrend) {
          marketScore -= 20;
          marketReasons.push(`Warning: Declining trend detected - ${decliningTrend.trend}`);
          topic.predictedPerformance = Math.max(0, (topic.predictedPerformance || 50) - 20);
        }

        // Apply seasonal intelligence
        if (marketAnalysis.seasonalForecast.length > 0) {
          const currentSeason = this.getCurrentSeason();
          const seasonalForecast = marketAnalysis.seasonalForecast.find(forecast =>
            forecast.season === currentSeason && forecast.predictedTrends.some(trend =>
              topicLower.includes(trend.toLowerCase()) || trend.toLowerCase().includes(topicLower)
            )
          );

          if (seasonalForecast && seasonalForecast.opportunityScore > 70) {
            marketScore += 15;
            marketReasons.push(`Seasonally relevant content with high opportunity score`);
            topic.seasonalRelevance = 'current';
          }
        }
      }

      // Apply predictive recommendations
      if (predictiveRecommendations) {
        // Find matching predictions
        const matchingPrediction = predictiveRecommendations.predictions.find(pred =>
          topicLower.includes(pred.contentTopic.toLowerCase()) ||
          pred.contentTopic.toLowerCase().includes(topicLower)
        );

        if (matchingPrediction) {
          marketScore += matchingPrediction.predictedPerformance * 0.4;
          topic.predictedPerformance = matchingPrediction.predictedPerformance;
          topic.optimalContentType = matchingPrediction.contentType;
          topic.bestPerformingTone = matchingPrediction.recommendedTone;
          marketReasons.push(`Predicted high performance: ${matchingPrediction.predictedPerformance}%`);
        }

        // Apply strategic insights
        const relevantInsight = predictiveRecommendations.strategicInsights.find(insight =>
          insight.impact === 'high' || insight.impact === 'critical'
        );

        if (relevantInsight) {
          marketScore += 10;
          marketReasons.push(`Strategic opportunity: ${relevantInsight.insight}`);
        }
      }

      // Apply market insights
      if (marketInsights) {
        const highImpactInsights = marketInsights.filter(insight =>
          insight.impact === 'high' || insight.impact === 'critical'
        );

        if (highImpactInsights.length > 0) {
          marketScore += highImpactInsights.length * 5;
          marketReasons.push(`${highImpactInsights.length} high-impact market insights applied`);
        }
      }

      // Update topic with market intelligence
      return {
        ...topic,
        personalizedScore: (topic.personalizedScore || 0) + marketScore,
        predictedPerformance: Math.min(100, topic.predictedPerformance || 50),
        personalizationReasons: [
          ...(topic.personalizationReasons || []),
          ...marketReasons
        ],
        source: marketScore > 30 ? 'market_intelligence' : topic.source
      };
    }).sort((a, b) => {
      // Sort by combined personalization and market scores
      const scoreA = (a.personalizedScore || 0) + (a.predictedPerformance || 0) * 0.7;
      const scoreB = (b.personalizedScore || 0) + (b.predictedPerformance || 0) * 0.7;
      return scoreB - scoreA;
    });
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