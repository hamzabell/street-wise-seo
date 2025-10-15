/**
 * Lemonfox.ai API client for AI-powered SEO topic generation
 */

import { cleanMarkdown, cleanTopicList, extractCleanJson, parseAndCleanStructuredResponse, cleanAIResponse, cleanTopicTitle } from './markdown-parser';
import { detectLocationCharacteristics, generateLocationAwarePrompt } from './location-awareness';
import { extractBusinessOfferings, type BusinessOfferings } from './service-extractor';
import { analyzeBrandVoice, type BrandAnalysisInsights } from './brand-voice-analyzer';
import { analyzeCompetitors, type CompetitiveIntelligenceReport } from './competitor-intelligence';
import {
  generateCulturalAdaptation,
  detectLanguageFromLocation,
  validateCulturalRequest,
  type CulturalAdaptationRequest,
  type CulturalPrompt
} from './cultural-language-system';
import {
  synthesizeContext,
  generateEnhancedPrompts,
  type ContextSources,
  type SynthesizedContext,
  type ContextWeighting
} from './context-synthesis';

export interface LemonfoxGenerationRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export interface LemonfoxGenerationResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LemonfoxError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface CulturalGenerationRequest {
  location?: string;
  languagePreference: 'english' | 'native' | 'cultural_english';
  formalityLevel: 'formal' | 'professional' | 'casual' | 'slang_heavy';
  contentPurpose: 'marketing' | 'educational' | 'conversational' | 'technical';
  targetAudience: string;
  businessType?: string;
}

interface TopicUserSettings {
  tone?: string;
  additionalContext?: string;
  competitorUrls?: string[];
}

export class LemonfoxClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.lemonfox.ai/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateCompletion(request: LemonfoxGenerationRequest): Promise<LemonfoxGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          ...(request.system_prompt ? [{ role: 'system', content: request.system_prompt }] : []),
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.max_tokens || 2000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorData: LemonfoxError = await response.json().catch(() => ({
        error: { message: 'Unknown error occurred', type: 'unknown' }
      }));
      throw new Error(`Lemonfox API error: ${errorData.error.message}`);
    }

    const data: LemonfoxGenerationResponse = await response.json();
    return data;
  }

  async generateSEOTopics(
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string,
    websiteAnalysis?: any,
    contentAnalysis?: any,
    industryId?: string,
    seasonalTopics?: string[],
    competitorWebsites?: any[],
    competitorIntelligence?: CompetitiveIntelligenceReport,
    culturalRequest?: CulturalGenerationRequest,
    userSettings?: TopicUserSettings
  ): Promise<Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
    relatedContent?: string;
    competitiveInsight?: string;
    marketPositioning?: string;
    strategicContext?: string;
  }>> {
    console.log('🚀 [LEMONFOX] Starting enhanced SEO topic generation with context synthesis');

    // Extract detailed business offerings from website analysis
    let businessOfferings: BusinessOfferings | null = null;
    let brandAnalysis: BrandAnalysisInsights | null = null;
    let competitiveIntel: CompetitiveIntelligenceReport | null = null;
    let culturalPrompt: CulturalPrompt | null = null;

    // Get location characteristics for enhanced context
    const locationCharacteristics = location ? detectLocationCharacteristics(location) : null;

    if (websiteAnalysis) {
      try {
        // Extract business offerings
        businessOfferings = extractBusinessOfferings(websiteAnalysis);
        console.log('🏢 [LEMONFOX] Business offerings extracted:', {
          servicesCount: businessOfferings.services.length,
          productsCount: businessOfferings.products.length,
          businessType: businessOfferings.businessType,
          primaryCategories: businessOfferings.primaryCategories
        });

        // Analyze brand voice for enhanced personalization
        brandAnalysis = analyzeBrandVoice(websiteAnalysis);
        console.log('🎯 [LEMONFOX] Brand voice analysis completed:', {
          primaryTone: brandAnalysis.brandVoiceProfile.primaryTone,
          formalityLevel: brandAnalysis.brandVoiceProfile.formalityLevel,
          keyPhrasesCount: brandAnalysis.brandVoiceProfile.keyPhrases.length,
          uniqueTermsCount: brandAnalysis.brandVoiceProfile.uniqueTerminology.length
        });

        // Analyze competitors for strategic intelligence
        if (competitorWebsites && competitorWebsites.length > 0) {
          if (competitorIntelligence) {
            competitiveIntel = competitorIntelligence;
            console.log('🏁 [LEMONFOX] Using provided competitor intelligence:', {
              competitorsAnalyzed: competitiveIntel.primaryCompetitors.length,
              marketSize: competitiveIntel.marketAnalysis.totalMarketSize,
              contentGaps: competitiveIntel.competitiveGaps.contentGaps.length
            });
          } else {
            competitiveIntel = await analyzeCompetitors(websiteAnalysis, competitorWebsites, businessType, location);
            console.log('🏁 [LEMONFOX] Competitor intelligence analysis completed:', {
              competitorsAnalyzed: competitiveIntel.primaryCompetitors.length,
              marketSize: competitiveIntel.marketAnalysis.totalMarketSize,
              contentGaps: competitiveIntel.competitiveGaps.contentGaps.length,
              strategicRecs: competitiveIntel.strategicRecommendations.contentStrategy.length
            });
          }
        }
      } catch (error) {
        console.error('❌ [LEMONFOX] Failed to extract business offerings, brand voice, or competitor intelligence:', error);
      }
    }

    // Generate cultural adaptation if requested
    if (culturalRequest && location) {
      try {
        const validatedRequest = validateCulturalRequest({
          ...culturalRequest,
          location,
          targetAudience,
          businessType
        });
        culturalPrompt = generateCulturalAdaptation(validatedRequest);
        console.log('🌍 [LEMONFOX] Cultural adaptation generated:', {
          location,
          languagePreference: culturalRequest.languagePreference,
          formalityLevel: culturalRequest.formalityLevel
        });
      } catch (error) {
        console.error('❌ [LEMONFOX] Failed to generate cultural adaptation:', error);
      }
    }

    // Prepare context sources for synthesis
    const contextSources: ContextSources = {
      websiteAnalysis,
      brandAnalysis: brandAnalysis || undefined,
      competitorIntelligence: competitiveIntel || undefined,
      businessOfferings: businessOfferings || undefined,
      culturalPrompt: culturalPrompt || undefined,
      culturalRequest: culturalRequest && location ? {
        ...culturalRequest,
        location: location
      } : undefined,
      location: location || undefined,
      businessType: businessType || undefined,
      targetAudience: targetAudience || undefined,
      contentAnalysis: contentAnalysis || undefined,
      tonePreference: userSettings?.tone,
      languagePreference: culturalRequest?.languagePreference,
      formalityPreference: culturalRequest?.formalityLevel,
      contentPurpose: culturalRequest?.contentPurpose,
      additionalContext: userSettings?.additionalContext,
      competitorUrls: userSettings?.competitorUrls,
      userTopic: topic
    };

    // Generate enhanced prompts using context synthesis
    let systemPrompt: string;
    let userPrompt: string;
    let synthesizedContext: SynthesizedContext;

    try {
      const enhancedPrompts = generateEnhancedPrompts(
        topic,
        contextSources,
        seasonalTopics,
        // Custom weights to prioritize business offerings and competitor intelligence
        {
          businessOfferings: 0.25,
          competitorIntelligence: 0.25,
          brandVoice: 0.20,
          culturalContext: 0.15,
          location: 0.10,
          marketPositioning: 0.05
        }
      );

      systemPrompt = enhancedPrompts.systemPrompt;
      userPrompt = enhancedPrompts.userPrompt;
      synthesizedContext = enhancedPrompts.context;

      console.log('🧠 [LEMONFOX] Context synthesis completed:', {
        completeness: synthesizedContext.contextQuality.completeness,
        confidence: synthesizedContext.contextQuality.confidence,
        dataSources: synthesizedContext.contextQuality.dataSources.length,
        conflicts: synthesizedContext.contextQuality.conflicts.length
      });

      // Log warnings about context quality issues
      if (synthesizedContext.contextQuality.conflicts.length > 0) {
        console.warn('⚠️ [LEMONFOX] Context conflicts detected:', synthesizedContext.contextQuality.conflicts);
      }

      if (synthesizedContext.contextQuality.recommendations.length > 0) {
        console.info('ℹ️ [LEMONFOX] Context recommendations:', synthesizedContext.contextQuality.recommendations);
      }

    } catch (error) {
      console.error('❌ [LEMONFOX] Context synthesis failed, falling back to basic prompts:', error);

      // Create a minimal fallback context for when synthesis fails
      synthesizedContext = {
        businessIdentity: {
          type: businessType,
          location: location || '',
          primaryOfferings: [],
          uniqueValueProps: [],
          targetAudience: targetAudience
        },
        brandVoice: {
          primaryTone: 'professional',
          formalityLevel: 'professional',
          languageStyle: 'professional',
          keyPhrases: [],
          communicationPerspective: 'third-person',
          coreValues: []
        },
        competitiveStrategy: {
          marketPositioning: [],
          contentGapsToTarget: [],
          marketOpportunities: [],
          competitiveAdvantages: [],
          strategicDifferentiation: [],
          competitorThreats: [],
          counterPositioning: [],
          comparisonOpportunities: []
        },
        contentStrategy: {
          topicPriorities: [],
          contentAngles: [],
          strategicKeywords: [],
          serviceSpecificTopics: [],
          locationSpecificTopics: []
        },
        culturalContext: {
          communicationStyle: 'professional',
          culturalNuances: [],
          languageGuidelines: [],
          formalityRequirements: [],
          localReferences: [],
          avoidances: []
        },
        strategicInstructions: {
          topicGeneration: [
            `Generate topics specifically for ${businessType} business serving ${targetAudience}`,
            `Focus on location-specific topics when possible: ${location || 'general area'}`
          ],
          contentCreation: [
            `Write in professional tone with clear, actionable content`,
            `Address specific customer needs and pain points`
          ],
          competitivePositioning: [
            `Differentiate from competitors through unique value propositions`,
            `Emphasize quality and reliability`
          ],
          culturalAdaptation: [
            `Use culturally appropriate language and examples`,
            `Consider local context and references`
          ],
          brandConsistency: [
            `Maintain consistent brand voice throughout content`,
            `Reflect professional business values`
          ],
          competitorCountering: [
            `Address competitor advantages with strategic counter-positioning`,
            `Highlight unique differentiators that competitors lack`
          ],
          differentiationFocus: [
            `Focus on unique value propositions and competitive advantages`,
            `Emphasize what makes this business different from competitors`
          ]
        },
        contextQuality: {
          completeness: 0.5,
          confidence: 0.5,
          dataSources: ['fallback'],
          conflicts: [],
          recommendations: ['Context synthesis failed - using fallback']
        },
        userPreferences: {
          desiredTone: userSettings?.tone || 'professional',
          languagePreference: culturalRequest?.languagePreference || 'english',
          formalityPreference: culturalRequest?.formalityLevel || 'professional',
          contentPurpose: culturalRequest?.contentPurpose || 'marketing',
          additionalContext: userSettings?.additionalContext,
          competitorUrls: userSettings?.competitorUrls || [],
          brandToneReference: 'professional'
        }
      };

      // Fallback to basic prompt generation if context synthesis fails
      systemPrompt = `You are an expert SEO topic generator for small local service businesses. Generate practical, business-relevant topics that customers actually search for.

CRITICAL RULES:
- Respond with ONLY a numbered list of topics and their reasoning
- NO introductions, explanations, or conclusions
- NO phrases like "Here are some topics..." or "Based on the context..."
- Start directly with "1. Topic Title | Specific Reasoning | Source"
- Each topic on its own line
- Generate exactly 10-15 topics
- Format: "Topic Title | Specific Reasoning | Source"
- Topics must be complete sentences ending with proper punctuation
- Topic titles must NOT include source identifiers, numbers, or reasoning text
- Topic titles should be clear, descriptive business topics (not technical identifiers)
- Focus on local search and practical customer problems with location-aware insights
- Include seasonal topics when relevant
- Emphasize voice search and mobile-friendly topics
- When location context exists, include at least 2 globally adaptable or region-scalable topics that tie back to local insights
- Reasoning must reference competitive advantages, counter competitor threats, or highlight market opportunities
- Align topic suggestions with requested tone: ${userSettings?.tone || 'professional'}
- Keep content purpose in mind: ${culturalRequest?.contentPurpose || 'marketing'}
- Prioritize hyperlocal coverage (neighborhoods, ZIP codes, landmarks) alongside city-wide authority plays
- Include at least one topic for building local reputation (reviews, testimonials, community partnerships)
- Suggest content aimed at Google Business Profile optimization, local landing pages, and map pack visibility
- Source must be one of: website_gap, competitor_advantage, content_opportunity, market_opportunity, competitive_gap, strategic_positioning, competitor_counter, differentiation_focus
- AVOID generic topics - make them specific to ${businessType} and ${targetAudience}

TOPIC QUALITY REQUIREMENTS:
- Each topic must be a complete, actionable title
- Topics should address specific customer problems or questions
- Include location-specific elements when possible
- Reference regional or global relevance in the reasoning when appropriate
- Mention competitor considerations when relevant to the topic focus
- Call out whether the intent is hyperlocal, service-area, or regional/global in the reasoning
- Avoid generic filler content
- Make topics sound like they were written by a business owner, not an AI

EXAMPLE OF GOOD FORMAT:
"1. How to Choose the Best Plumber for Emergency Repairs in Your Area | Hyperlocal intent with differentiation plus review-driven trust builders | competitor_advantage"
"2. Complete Guide to Home Plumbing Maintenance for Homeowners | Seasonal demand play that fuels Google Business Profile updates and neighborhood guides | market_opportunity"`;

      userPrompt = `Business: ${businessType}
Audience: ${targetAudience}${location ? `\nLocation: ${location}` : ''}
Base topic: ${topic}${seasonalTopics && seasonalTopics.length > 0 ? `\nSeasonal Focus: ${seasonalTopics.slice(0, 3).join(', ')}` : ''}

Geographic directive: ${location ? `Prioritize hyper-local needs in ${location}, highlighting neighborhoods, ZIP codes, or landmarks, while adding 2 globally adaptable topics grounded in local insight.` : 'No fixed location provided. Create topics that can flex between regional and global audiences, referencing cultural cues when available, and note how they localize.'}
Competitive directive: Reference differentiation against known competitor strengths whenever possible.
Local SEO directive: Include ideas that power Google Business Profile updates, local landing pages, map pack prominence, and reputation-building campaigns.
Tone directive: Match the requested tone of "${userSettings?.tone || 'professional'}" while staying authentic to the brand.
Content purpose emphasis: ${culturalRequest?.contentPurpose || 'marketing'}.
${userSettings?.additionalContext ? `Additional context: ${userSettings.additionalContext}` : ''}
${userSettings?.competitorUrls && userSettings.competitorUrls.length > 0 ? `Competitors provided: ${userSettings.competitorUrls.join(', ')}` : ''}

IMPORTANT: Generate 10-15 specific, business-relevant SEO topics. Each topic should be a complete, actionable title that ${targetAudience} would actually search for.

Start your response with "1." and follow the format exactly.`;
    }

    // Make the API call with enhanced prompts
    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt: userPrompt,
        system_prompt: systemPrompt,
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      console.log('🤖 [LEMONFOX] Enhanced AI response received:', {
        contentLength: content.length,
        promptTokens: userPrompt.length,
        systemPromptTokens: systemPrompt.length
      });

      // Parse the enhanced format: "Topic | Reasoning | Source"
      let topicsWithReasoning = this.parseTopicsWithReasoningEnhanced(content, synthesizedContext, topic, businessType, targetAudience);

      // If parsing fails, fallback to basic topics with enhanced reasoning based on synthesized context
      if (topicsWithReasoning.length < 5) {
        const basicTopics = this.extractTopicsWithRegex(
          content,
          businessType,
          targetAudience,
          synthesizedContext.businessIdentity.location
        );
        topicsWithReasoning = basicTopics.map(t => ({
          topic: t,
          reasoning: this.generateEnhancedSpecificReasoning(t, businessType, targetAudience, synthesizedContext),
          source: this.determineTopicSourceEnhanced(t, synthesizedContext)
        }));
      }

      // Final fallback - generate enhanced topics ourselves if AI completely fails
      if (topicsWithReasoning.length === 0) {
        const fallbackTopics = this.generateEnhancedFallbackTopics(topic, businessType, targetAudience, location || '', synthesizedContext);
        topicsWithReasoning = fallbackTopics.map(t => ({
          topic: t.topic,
          reasoning: t.reasoning,
          source: t.source,
          relatedContent: t.relatedContent,
          competitiveInsight: t.competitiveInsight,
          marketPositioning: t.marketPositioning,
          strategicContext: t.strategicContext
        }));
      }

      console.log('✅ [LEMONFOX] Enhanced topic generation completed:', {
        topicsGenerated: topicsWithReasoning.length,
        sources: [...new Set(topicsWithReasoning.map(t => t.source))],
        averageConfidence: synthesizedContext.contextQuality.confidence
      });

      return topicsWithReasoning.slice(0, 15);
    } catch (error) {
      console.error('❌ [LEMONFOX] Error in enhanced topic generation:', error);
      throw new Error('Failed to generate SEO topics with enhanced context synthesis');
    }
  }

  /**
   * Enhanced topic parsing with support for new context sources
   */
  private parseTopicsWithReasoningEnhanced(content: string, context: SynthesizedContext, topic: string, businessType: string, targetAudience: string): Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
    relatedContent?: string;
    competitiveInsight?: string;
    marketPositioning?: string;
    strategicContext?: string;
  }> {
    const topics: Array<{
      topic: string;
      reasoning: string;
      source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
      relatedContent?: string;
      competitiveInsight?: string;
      marketPositioning?: string;
      strategicContext?: string;
    }> = [];

    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and headers
      if (!trimmed ||
          trimmed.toLowerCase().includes('here are') ||
          trimmed.toLowerCase().includes('based on') ||
          !/^\d+\./.test(trimmed)) {
        continue;
      }

      // Try to parse the format: "1. Topic | Reasoning | Source"
      const match = trimmed.match(/^\d+\.\s*(.+)$/);
      if (!match) continue;

      const topicContent = match[1];

      // Try to split by pipe character
      const parts = topicContent.split('|').map(p => p.trim());

      if (parts.length >= 3) {
        // Extract the topic title (first part)
        let topicText = parts[0].trim();
        const reasoning = parts[1].trim();
        const sourceText = parts[2].toLowerCase();

        // Enhanced cleaning: Use the new enhanced cleaning method with generic detection
        topicText = this.cleanTopicTitleEnhanced(topicText, businessType, targetAudience, context.businessIdentity.location);

        // Enhanced source validation with new sources
        let source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
        if (sourceText.includes('strategic_positioning')) {
          source = 'strategic_positioning';
        } else if (sourceText.includes('competitive_gap')) {
          source = 'competitive_gap';
        } else if (sourceText.includes('market_opportunity')) {
          source = 'market_opportunity';
        } else if (sourceText.includes('competitor') || sourceText.includes('advantage')) {
          source = 'competitor_advantage';
        } else if (sourceText.includes('opportunity') || sourceText.includes('content')) {
          source = 'content_opportunity';
        } else if (sourceText.includes('website_gap')) {
          source = 'website_gap';
        } else {
          source = 'ai';
        }

        // Validate reasoning specificity - reject generic reasoning
        if (this.isGenericReasoning(reasoning) && source !== 'ai') {
          console.warn(`⚠️ Generic reasoning detected for non-AI topic: "${reasoning}" - marking as AI`);
          source = 'ai';
        }

        // Enhanced topic validation - ensure it looks like a real topic, not a source identifier
        const isTopicValid = topicText.length > 10 && topicText.length < 200 &&
          !topicText.includes('source:') &&
          !topicText.includes('reasoning:') &&
          !topicText.includes('advantage:') &&
          !topicText.includes('opportunity:') &&
          !topicText.includes('gap:') &&
          !topicText.match(/\b(competitor_advantage|website_gap|content_opportunity|strategic_positioning|market_opportunity|competitive_gap)\b/gi) &&
          !topicText.match(/^\s*\w+_(advantage|gap|opportunity|positioning)\s*$/gi) &&
          !topicText.match(/^\s*\(Source:\s*[^)]+\)\s*$/gi) && // Remove (Source: ...) patterns
          (topicText.endsWith('.') || topicText.endsWith('?') || topicText.endsWith('!') || topicText.length > 20);

        if (isTopicValid && reasoning.length > 10) {
          console.log(`✅ [LEMONFOX] Valid topic parsed: "${topicText}" (source: ${source})`);
          topics.push({
            topic: topicText,
            reasoning: reasoning,
            source,
            relatedContent: parts[3] || undefined,
            competitiveInsight: parts[4] || undefined,
            marketPositioning: parts[5] || undefined,
            strategicContext: this.generateStrategicContext(context, topicText, source)
          });
        } else {
          console.warn(`⚠️ [LEMONFOX] Invalid topic filtered out: "${topicText}" (length: ${topicText.length}, contains source: ${topicText.includes('source:')}, validLength: ${topicText.length > 10 && topicText.length < 200})`);
        }
      } else if (parts.length === 1) {
        // Fallback: just the topic, add basic reasoning
        let topicText = parts[0].trim();

        // Apply the SAME enhanced cleaning as the main parsing path
        topicText = this.cleanTopicTitleEnhanced(topicText, businessType, targetAudience, context.businessIdentity.location);

        // More lenient validation for fallback, but still filter out source identifiers
        const isTopicValid = topicText.length > 10 && topicText.length < 200 &&
          !topicText.includes('source:') &&
          !topicText.includes('reasoning:') &&
          !topicText.includes('advantage:') &&
          !topicText.includes('opportunity:') &&
          !topicText.includes('gap:') &&
          !topicText.match(/\b(competitor_advantage|website_gap|content_opportunity|strategic_positioning|market_opportunity|competitive_gap)\b/gi) &&
          !topicText.match(/^\s*\w+_(advantage|gap|opportunity|positioning)\s*$/gi) &&
          !topicText.match(/^\s*\(Source:\s*[^)]+\)\s*$/gi) && // Remove (Source: ...) patterns
          (!topicText.includes('reasoning') && !topicText.includes('advantage') && !topicText.includes('opportunity')) &&
          (topicText.endsWith('.') || topicText.endsWith('?') || topicText.endsWith('!') || topicText.length > 20);

        if (isTopicValid) {
          console.log(`✅ [LEMONFOX] Valid fallback topic parsed: "${topicText}" (source: ai)`);
          topics.push({
            topic: topicText,
            reasoning: this.generateEnhancedSpecificReasoning(topic, businessType, targetAudience, context),
            source: 'ai',
            relatedContent: undefined,
            competitiveInsight: undefined,
            marketPositioning: undefined,
            strategicContext: this.generateStrategicContext(context, topicText, 'ai')
          });
        } else {
          console.warn(`⚠️ [LEMONFOX] Invalid fallback topic filtered out: "${topicText}" (length: ${topicText.length}, contains patterns: ${topicText.includes('source:') || topicText.includes('advantage:') || topicText.includes('opportunity:')})`);
        }
      }
    }

    return topics;
  }

  /**
   * Enhanced reasoning generation using synthesized context
   */
  private generateEnhancedSpecificReasoning(
    topic: string,
    businessType: string,
    targetAudience: string,
    context: SynthesizedContext
  ): string {
    const { businessIdentity, brandVoice, competitiveStrategy, contentStrategy } = context;
    const topicLower = topic.toLowerCase();

    // Check for direct business offering matches
    if (businessIdentity.primaryOfferings.some(offering =>
      topicLower.includes(offering.toLowerCase()) || offering.toLowerCase().includes(topicLower)
    )) {
      const matchingOffering = businessIdentity.primaryOfferings.find(offering =>
        topicLower.includes(offering.toLowerCase()) || offering.toLowerCase().includes(topicLower)
      );
      if (matchingOffering) {
        return `This topic directly promotes your ${matchingOffering} service, addressing specific customer needs and driving qualified leads for ${targetAudience} in the ${businessIdentity.location || 'your service area'}.`;
      }
    }

    // Check for competitive positioning opportunities
    if (competitiveStrategy.contentGapsToTarget.some(gap =>
      topicLower.includes(gap.toLowerCase()) || gap.toLowerCase().includes(topicLower)
    )) {
      const matchingGap = competitiveStrategy.contentGapsToTarget.find(gap =>
        topicLower.includes(gap.toLowerCase()) || gap.toLowerCase().includes(topicLower)
      );
      if (matchingGap) {
        return `This addresses the critical content gap "${matchingGap}" that competitors have covered but you're missing, helping you compete effectively in the ${businessIdentity.type} market.`;
      }
    }

    // Check for market opportunity alignment
    if (competitiveStrategy.marketOpportunities.some(opp =>
      topicLower.includes(opp.toLowerCase()) || opp.toLowerCase().includes(topicLower)
    )) {
      const matchingOpportunity = competitiveStrategy.marketOpportunities.find(opp =>
        topicLower.includes(opp.toLowerCase()) || opp.toLowerCase().includes(topicLower)
      );
      if (matchingOpportunity) {
        return `This topic leverages the emerging market opportunity "${matchingOpportunity}" that competitors haven't capitalized on, positioning you as an early mover in the ${businessIdentity.type} space.`;
      }
    }

    // Add strategic context from business identity
    const businessContext = businessIdentity.uniqueValueProps.length > 0
      ? `These topics help differentiate ${businessIdentity.type} by highlighting ${businessIdentity.uniqueValueProps.join(', ')} for ${targetAudience}.`
      : `These topics specifically address ${targetAudience} needs in the ${businessIdentity.type} market.`;

    // Add cultural and location context if available
    let contextualEnhancement = '';
    if (businessIdentity.location) {
      contextualEnhancement += ` Located in ${businessIdentity.location}, this content will resonate with local customer needs and search patterns.`;
    }

    if (context.culturalContext.culturalNuances.length > 0) {
      contextualEnhancement += ` Incorporates ${context.culturalContext.culturalNuances.slice(0, 2).join(', ')} for cultural resonance.`;
    }

    // Combine with business context
    const businessFocus = businessIdentity.primaryOfferings.length > 0
      ? `Focus on these specific offerings: ${businessIdentity.primaryOfferings.slice(0, 3).join(', ')}`
      : `Focus on ${businessIdentity.type} services and customer needs.`;

    return `${businessContext} ${businessFocus} ${contextualEnhancement} This topic will help attract and convert customers by addressing their specific needs.`;
  }

  /**
   * Generate strategic context explanation for enhanced reasoning
   */
  private generateStrategicContext(
    context: SynthesizedContext,
    topic: string,
    source: string
  ): string {
    const { businessIdentity, brandVoice, competitiveStrategy, contentStrategy } = context;

    switch (source) {
      case 'strategic_positioning':
        return `Strategic positioning: ${competitiveStrategy.marketPositioning.slice(0, 2).join(', ')} leveraging your unique strengths in ${businessIdentity.type}.`;

      case 'competitive_gap':
        return `Competitive gap: This topic fills a content gap that competitors have missed, giving you first-mover advantage in the ${businessIdentity.type} market.`;

      case 'market_opportunity':
        return `Market opportunity: Capitalizes on emerging trends and opportunities that competitors haven't capitalized on yet.`;

      case 'competitor_advantage':
        return `Competitive advantage: This helps you differentiate from competitors and gain market share in ${businessIdentity.location || 'your service area'}.`;

      case 'website_gap':
        return `Website gap: This addresses missing content on your website that customers are actively searching for.`;

      case 'content_opportunity':
        return `Content opportunity: This builds on your existing content to strengthen topical authority and internal linking.`;

      default:
        return `AI-generated topic based on comprehensive business context analysis.`;
    }
  }

  /**
   * Enhanced source determination with context weighting
   */
  private determineTopicSourceEnhanced(
    topic: string,
    context: SynthesizedContext
  ): 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning' {
    const topicLower = topic.toLowerCase();
    const { businessIdentity, competitiveStrategy, contentStrategy } = context;
    const topicWords = topicLower.split(/\s+/).filter((w: string) => w.length > 2);

    // Check strategic positioning first (highest priority)
    if (competitiveStrategy.marketPositioning.some(pos =>
      topicLower.includes(pos.toLowerCase()) || pos.toLowerCase().includes(topicLower)
    )) {
      return 'strategic_positioning';
    }

    // Check competitive gaps (high priority)
    if (competitiveStrategy.contentGapsToTarget.some(gap =>
      topicLower.includes(gap.toLowerCase()) || gap.toLowerCase().includes(topicLower)
    )) {
      return 'competitive_gap';
    }

    // Check market opportunities
    if (competitiveStrategy.marketOpportunities.some(opp =>
      topicLower.includes(opp.toLowerCase()) || opp.toLowerCase().includes(topicLower)
    )) {
      return 'market_opportunity';
    }

    // Check business offering relevance
    if (businessIdentity.primaryOfferings.some(offering =>
      topicLower.includes(offering.toLowerCase()) || offering.toLowerCase().includes(topicLower)
    )) {
      return 'website_gap';
    }

    // Check content strategy priorities
    if (contentStrategy.topicPriorities.some(priority =>
      topicLower.includes(priority.toLowerCase()) || priority.toLowerCase().includes(topicLower)
    )) {
      return 'content_opportunity';
    }

    // Default to AI if no specific matches found
    return 'ai';
  }

  /**
   * Enhanced fallback topic generation with context synthesis
   */
  private generateEnhancedFallbackTopics(
    baseTopic: string,
    businessType: string,
    targetAudience: string,
    location: string,
    context: SynthesizedContext
  ): Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
    relatedContent?: string;
    competitiveInsight?: string;
    marketPositioning?: string;
    strategicContext?: string;
  }> {
    const { businessIdentity, contentStrategy, competitiveStrategy, brandVoice, culturalContext } = context;
    const locationText = location ? ` in ${location}` : '';

    // Generate strategic business-focused topics
    const strategicTopics: Array<{
      topic: string;
      reasoning: string;
      source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
      relatedContent?: string;
      competitiveInsight?: string;
      marketPositioning?: string;
      strategicContext?: string;
    }> = [
      {
        topic: `${businessIdentity.type} Strategic Growth Guide for ${targetAudience}${locationText}`,
        reasoning: `Strategic positioning in ${businessIdentity.type} market for ${targetAudience}`,
        source: 'strategic_positioning',
        relatedContent: 'Business growth and market leadership content',
        competitiveInsight: `Leverage ${businessIdentity.primaryOfferings.slice(0, 2).join(', ')} for competitive advantage`,
        marketPositioning: `Position as ${businessIdentity.type} market leader in ${location || 'your service area'}`,
        strategicContext: `Aligns with ${businessIdentity.uniqueValueProps.slice(0, 2).join(', ')}`
      },
      {
        topic: `Competitive Intelligence: ${businessIdentity.type} vs Competitors Analysis`,
        reasoning: `Strategic competitive analysis to identify and exploit market opportunities in ${businessIdentity.location || 'your service area'}`,
        source: 'competitive_gap',
        relatedContent: 'Competitive analysis and market research content',
        competitiveInsight: `Leverages ${competitiveStrategy.competitiveAdvantages.slice(0, 2).join(', ')} for differentiation`,
        marketPositioning: `Position strategically against competitors in ${businessIdentity.location || 'your service area'}`,
        strategicContext: `Uses ${competitiveStrategy.strategicDifferentiation.slice(0, 2).join(', ')}`
      },
      {
        topic: `Market Opportunity: Emerging ${businessIdentity.type} Trends for ${targetAudience}`,
        reasoning: `Capitalize on emerging market opportunities before competitors in ${businessIdentity.location || 'your service area'}`,
        source: 'market_opportunity',
        relatedContent: 'Market trend analysis and opportunity identification',
        competitiveInsight: `Focus on ${competitiveStrategy.marketOpportunities.slice(0, 2).join(', ')} for growth`,
        marketPositioning: `First-mover advantage in emerging ${businessIdentity.type} market`,
        strategicContext: `Emphasizes ${competitiveStrategy.strategicDifferentiation.slice(0, 1).join(', ')}`
      },
      {
        topic: `Customer-Centric ${businessIdentity.type} Solutions for ${targetAudience}`,
        reasoning: `Focus on solving specific customer pain points with ${businessIdentity.primaryOfferings.slice(0, 3).join(', ')}`,
        source: 'content_opportunity',
        relatedContent: 'Customer-centric problem-solving content',
        competitiveInsight: `Emphasizes customer benefits and solutions`,
        marketPositioning: `Position as customer-centric ${businessIdentity.type} provider`,
        strategicContext: `Uses ${contentStrategy.contentAngles.slice(0, 2).join(', ')} and ${brandVoice.primaryTone} tone`
      },
      {
        topic: `Strategic Positioning: ${businessIdentity.type} Market Analysis`,
        reasoning: `Comprehensive market positioning and strategic analysis for ${targetAudience} in ${businessIdentity.location || 'your service area'}`,
        source: 'strategic_positioning',
        relatedContent: 'Market analysis and positioning content',
        competitiveInsight: `Leverages ${businessIdentity.uniqueValueProps.slice(0, 2).join(', ')} for trust`,
        marketPositioning: `Establish authority in ${businessIdentity.type} market`,
        strategicContext: `Integrates all strategic requirements and business context`
      }
    ];

    // Add culturally-aware topics if location and cultural context available
    if (location && culturalContext.culturalNuances.length > 0) {
      strategicTopics.push({
        topic: `Local ${businessIdentity.type} Solutions in ${location}`,
        reasoning: `Address local customer needs in ${location} with culturally appropriate communication`,
        source: 'content_opportunity',
        relatedContent: 'Local-focused customer problem-solving',
        competitiveInsight: `Leverages local knowledge and cultural context`,
        marketPositioning: `Establish strong local presence in ${location}`,
        strategicContext: `Incorporates ${culturalContext.culturalNuances.slice(0, 3).join(', ')}`
      });
    }

    return strategicTopics.slice(0, 12);
  }

  private parseTopicsWithReasoning(content: string): Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
  }> {
    const topics: Array<{
      topic: string;
      reasoning: string;
      source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
      relatedContent?: string;
    }> = [];

    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and headers
      if (!trimmed ||
          trimmed.toLowerCase().includes('here are') ||
          trimmed.toLowerCase().includes('based on') ||
          !/^\d+\./.test(trimmed)) {
        continue;
      }

      // Try to parse the format: "1. Topic | Reasoning | Source"
      const match = trimmed.match(/^\d+\.\s*(.+)$/);
      if (!match) continue;

      const topicContent = match[1];

      // Try to split by pipe character
      const parts = topicContent.split('|').map(p => p.trim());

      if (parts.length >= 3) {
        // Extract the topic title (first part) - this should NOT include reasoning
        let topicText = parts[0].trim();
        const reasoning = parts[1].trim();
        const sourceText = parts[2].toLowerCase();

        // Additional cleaning: ensure the topic text doesn't contain reasoning-like content
        // Remove any trailing numbers or fragments that might be from the reasoning
        topicText = topicText.replace(/\s+\d+$/, ''); // Remove trailing numbers like " 9"
        topicText = topicText.replace(/\s+\|\s*.*$/, ''); // Remove any trailing pipe content

        // Apply cleanTopicTitle to remove any remaining source identifiers
        topicText = cleanTopicTitle(topicText);

        // Validate and clean the source
        let source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
        if (sourceText.includes('website_gap') || sourceText.includes('website gap')) {
          source = 'website_gap';
        } else if (sourceText.includes('competitor') || sourceText.includes('advantage')) {
          source = 'competitor_advantage';
        } else if (sourceText.includes('opportunity') || sourceText.includes('content')) {
          source = 'content_opportunity';
        } else {
          source = 'ai';
        }

        // Validate reasoning specificity - reject generic reasoning
        if (this.isGenericReasoning(reasoning) && source !== 'ai') {
          console.warn(`⚠️ Generic reasoning detected for non-AI topic: "${reasoning}" - marking as AI`);
          source = 'ai';
        }

        // Only add if the topic looks valid - more lenient validation
        const isTopicValid = topicText.length > 10 && topicText.length < 200 &&
          (!topicText.includes('reasoning') && !topicText.includes('advantage') && !topicText.includes('opportunity')) &&
          (topicText.endsWith('.') || topicText.endsWith('?') || topicText.endsWith('!') || topicText.length > 20);

        if (isTopicValid && reasoning.length > 10) {
          topics.push({
            topic: topicText,
            reasoning: reasoning,
            source: source,
            relatedContent: parts[3] || undefined
          });
        }
      } else if (parts.length === 1) {
        // Fallback: just the topic, add basic reasoning
        let topicText = parts[0].trim();

        // Clean the topic text to remove any trailing reasoning fragments
        topicText = topicText.replace(/\s+\d+$/, ''); // Remove trailing numbers
        topicText = topicText.replace(/\s+\|\s*.*$/, ''); // Remove any trailing pipe content

        // Apply cleanTopicTitle
        topicText = cleanTopicTitle(topicText);

        // More lenient validation for fallback
        const isTopicValid = topicText.length > 10 && topicText.length < 200 &&
          (!topicText.includes('reasoning') && !topicText.includes('advantage') && !topicText.includes('opportunity')) &&
          (topicText.endsWith('.') || topicText.endsWith('?') || topicText.endsWith('!') || topicText.length > 20);

        if (isTopicValid) {
          topics.push({
            topic: topicText,
            reasoning: 'AI-generated topic based on business context',
            source: 'ai'
          });
        }
      }
    }

    return topics;
  }

  private isGenericReasoning(reasoning: string): boolean {
    const genericPatterns = [
      /ai-generated topic based on.*business context/,
      /ai-generated topic based on.*audience/,
      /general topic for/,
      /topic suggestion for/,
      /business context/,
      /audience context/,
      /based on the provided/,
      /generated for/,
      /suggested topic/
    ];

    return genericPatterns.some(pattern => pattern.test(reasoning.toLowerCase()));
  }

  /**
   * Detects generic topic titles that should be enhanced
   */
  private isGenericTopicTitle(topicText: string): boolean {
    const genericPatterns = [
      /this topic addresses specific challenges/i,
      /this topic highlights the importance/i,
      /this topic provides solutions/i,
      /comprehensive guide to/i,
      /complete guide to/i,
      /ultimate guide to/i,
      /essential aspects of/i,
      /valuable insights and/i,
      /practical advice that/i,
      /actionable advice that/i,
      /benefits of/i,
      /important for/i,
      /crucial for/i,
      /how to improve/i,
      /strategies for success/i,
      /best practices for/i,
      /tips and tricks/i,
      /everything you need to know/i,
      /the definitive guide/i,
      /mastering the art of/i,
      /unlocking the potential/i,
      /maximizing your/i,
      /optimizing your/i,
      /enhancing your/i
    ];

    const genericStartPatterns = [
      /^how to /i,
      /^what is /i,
      /^why /i,
      /^when to /i,
      /^where to /i,
      /^the importance of /i,
      /^understanding /i,
      /^exploring /i,
      /^discover /i,
      /^learn /i,
      /^master /i
    ];

    const topicLower = topicText.toLowerCase().trim();

    // Check for generic patterns
    const hasGenericPattern = genericPatterns.some(pattern => pattern.test(topicLower));
    const hasGenericStart = genericStartPatterns.some(pattern => pattern.test(topicLower));

    // Check if it's too short or doesn't contain meaningful content
    const isTooShort = topicText.length < 15;
    const lacksSubstance = !topicText.includes('for') && !topicText.includes('with') && !topicText.includes('in') && topicText.length < 25;

    // Check if it reads like a generic template
    const soundsLikeTemplate = topicLower.includes('[your business]') ||
                              topicLower.includes('[industry]') ||
                              topicLower.includes('[topic]') ||
                              topicLower.includes('fill in the blank');

    return hasGenericPattern || hasGenericStart || isTooShort || lacksSubstance || soundsLikeTemplate;
  }

  /**
   * Enhanced topic title cleaning with generic detection
   */
  private cleanTopicTitleEnhanced(topicText: string, businessType: string, targetAudience: string, location?: string): string {
    let cleanedTopic = topicText.trim();

    // Apply existing cleaning first
    cleanedTopic = cleanTopicTitle(cleanedTopic);

    // Remove all source identifiers and reasoning fragments aggressively
    const sourcePatterns = [
      /\(Source:\s*[^)]+\)/gi,
      /\b(source:\s*\w+)\b/gi,
      /\b(competitor_advantage|website_gap|content_opportunity|strategic_positioning|market_opportunity|competitive_gap)\b/gi,
      /^\s*\w+_(advantage|gap|opportunity|positioning)\s*$/gi,
      /\s*\d+\.\s*$/gi,
      /\s*\d+\s*$/,
      /\|\s*[^|]*$/  // Remove anything after a pipe
    ];

    // Apply all cleaning patterns
    for (const pattern of sourcePatterns) {
      cleanedTopic = cleanedTopic.replace(pattern, '').trim();
    }

    // If the topic is generic after cleaning, enhance it
    if (this.isGenericTopicTitle(cleanedTopic)) {
      cleanedTopic = this.enhanceGenericTopic(cleanedTopic, businessType, targetAudience, location);
    }

    // Ensure it ends properly
    if (
      cleanedTopic.length > 0 &&
      !cleanedTopic.endsWith('.') &&
      !cleanedTopic.endsWith('?') &&
      !cleanedTopic.endsWith('!')
    ) {
      cleanedTopic += '.';
    }

    return cleanedTopic;
  }

  /**
   * Enhances generic topic titles to make them more specific and valuable
   */
  private enhanceGenericTopic(genericTopic: string, businessType: string, targetAudience: string, location?: string): string {
    const locationText = location ? ` in ${location}` : '';
    const topicLower = genericTopic.toLowerCase();

    // Enhancement patterns for common generic topics
    const enhancements: Array<{pattern: RegExp, replacement: string}> = [
      // Generic "How to" topics
      {
        pattern: /^how to\s+(.+)$/i,
        replacement: `Complete Guide to $1 for ${targetAudience}${locationText}: Step-by-Step Instructions`
      },

      // Generic "What is" topics
      {
        pattern: /^what is\s+(.+)$/i,
        replacement: `Understanding $1: Essential Guide for ${targetAudience} in the ${businessType} Industry${locationText}`
      },

      // Generic "Tips" topics
      {
        pattern: /(.+?)\s+tips\s+for\s+(.+)$/i,
        replacement: `$1 Strategies That Actually Work for $2${locationText}: Proven Methods and Best Practices`
      },

      // Generic "Guide" topics
      {
        pattern: /^(.+?)\s+guide\s+for\s+(.+)$/i,
        replacement: `Comprehensive $1 Guide for $2${locationText}: Expert Advice and Practical Implementation`
      },

      // Generic "Best practices" topics
      {
        pattern: /^(.+?)\s+best\s+practices$/i,
        replacement: `$1 Best Practices for ${targetAudience}${locationText}: Industry Standards and Expert Recommendations`
      },

      // Generic "Strategies" topics
      {
        pattern: /^(.+?)\s+strategies\s+for\s+(.+)$/i,
        replacement: `Advanced $1 Strategies for $2${locationText}: Proven Techniques for Success`
      },

      // Generic "Benefits" topics
      {
        pattern: /^benefits\s+of\s+(.+)$/i,
        replacement: `The Complete Guide to $1 Benefits for ${targetAudience}${locationText}: Maximizing Your ROI`
      },

      // Generic "Importance" topics
      {
        pattern: /^the\s+importance\s+of\s+(.+)$/i,
        replacement: `Why $1 Matters for ${targetAudience}${locationText}: Critical Insights and Business Impact`
      },

      // Generic "Understanding" topics
      {
        pattern: /^understanding\s+(.+)$/i,
        replacement: `Deep Dive into $1: Essential Knowledge for ${targetAudience}${locationText}`
      }
    ];

    // Try to apply enhancements
    for (const {pattern, replacement} of enhancements) {
      if (pattern.test(genericTopic)) {
        return genericTopic.replace(pattern, replacement);
      }
    }

    // If no pattern matches, create a more specific version
    if (topicLower.includes('how') || topicLower.includes('guide')) {
      return `Complete Guide to ${genericTopic.replace(/^(how to|the |a |an )/i, '').trim()} for ${targetAudience}${locationText}: Expert Advice and Step-by-Step Instructions`;
    }

    if (topicLower.includes('what') || topicLower.includes('understanding')) {
      return `Understanding ${genericTopic.replace(/^(what is|the |a |an )/i, '').trim()}: Essential Guide for ${targetAudience} in ${businessType}${locationText}`;
    }

    // Fallback: make it more specific
    return `${genericTopic} for ${targetAudience}: Expert ${businessType} Insights and Practical Solutions${locationText}`;
  }

  private extractTopicsWithRegex(
    content: string,
    businessType: string,
    targetAudience: string,
    location?: string
  ): string[] {
    const topics = new Set<string>();

    const addTopic = (rawTopic: string) => {
      if (!rawTopic) return;

      // Remove leftover metadata fragments before cleaning
      let cleaned = rawTopic
        .replace(/^[\s|:,-]+/, '')
        .replace(/\s*\|\s*[^|]*$/, '')
        .trim();

      cleaned = this.cleanTopicTitleEnhanced(cleaned, businessType, targetAudience, location);

      // Remove entries the cleaner could not salvage
      if (!cleaned || cleaned.length < 10) {
        return;
      }

      const lower = cleaned.toLowerCase();
      if (
        cleaned.startsWith('|') ||
        lower.startsWith('this topic') ||
        lower.startsWith('topic ') ||
        lower.startsWith('reasoning')
      ) {
        return;
      }

      const normalized = cleaned.replace(/\s+/g, ' ').trim();

      if (!normalized || normalized.length < 10) {
        return;
      }

      topics.add(normalized);
    };

    // Try to match numbered list patterns
    const numberedMatches = content.match(/\d+\.\s+([^.!?]*[.!?]?)/g);
    if (numberedMatches) {
      for (const match of numberedMatches) {
        const topic = match.replace(/^\d+\.\s*/, '').trim();
        if (!topic) continue;
        addTopic(topic);
      }
    }

    // Try to match bullet points
    const bulletMatches = content.match(/[-*+]\s+([^.!?]*[.!?]?)/g);
    if (bulletMatches) {
      for (const match of bulletMatches) {
        const topic = match.replace(/^[-*+]\s*/, '').trim();
        if (!topic) continue;
        addTopic(topic);
      }
    }

    return Array.from(topics);
  }

  private generateFallbackTopics(topic: string, businessType: string, targetAudience: string, location?: string): string[] {
    const locationText = location ? ` in ${location}` : '';
    const locationModifier = location ? `${location} ` : '';

    // Generate more specific, business-relevant topics based on business type
    const businessSpecificTopics = this.generateBusinessSpecificTopics(topic, businessType, targetAudience, location);

    // General fallback topics with business context
    const baseTopics = [
      `How to Choose the Right ${businessType} for ${topic.toLowerCase()}${locationText}`,
      `Complete Guide to ${topic} for ${targetAudience} from Trusted ${businessType}s`,
      `${topic} Solutions That Actually Work for ${targetAudience}${locationText}`,
      `What Every ${targetAudience} Should Know About ${topic} Before Hiring`,
      `Emergency ${topic} Services: 24/7 Solutions for ${targetAudience}${locationText}`,
      `${topic} Cost Guide: What ${targetAudience} Should Expect to Pay${locationText}`,
      `Top ${topic} Mistakes ${targetAudience} Make (And How to Avoid Them)`,
      `${businessType} vs DIY ${topic}: When to Call a Professional${locationText}`,
      `${topic} for ${targetAudience}: Questions to Ask Before Hiring`,
      `${topic} Trends in ${location || 'Your Area'}: What's New for ${targetAudience}`,
      ...businessSpecificTopics
    ];

    // Remove duplicates and limit to 10
    const uniqueTopics = [...new Set(baseTopics)];
    return uniqueTopics.slice(0, 10);
  }

  private generateBusinessSpecificTopics(topic: string, businessType: string, targetAudience: string, location?: string): string[] {
    const locationText = location ? ` in ${location}` : '';

    // Business type specific topic templates
    const businessTemplates: Record<string, string[]> = {
      'plumbing': [
        `Common ${topic.toLowerCase()} Issues Every Homeowner Faces${locationText}`,
        `${topic} Warning Signs: When to Call an Emergency Plumber`,
        `How Professional Plumbers Handle Complex ${topic.toLowerCase()} Problems`,
        `${topic} Maintenance Tips to Prevent Costly Repairs`,
      ],
      'hvac': [
        `${topic} Solutions for Year-Round Comfort${locationText}`,
        `HVAC ${topic.toLowerCase()}: Energy Efficiency Tips for ${targetAudience}`,
        `When to Replace vs Repair: ${topic} Decisions for Homeowners`,
        `Professional ${topic} Services: What HVAC Technicians Recommend`,
      ],
      'electrical': [
        `Electrical ${topic.toLowerCase()}: Safety First for ${targetAudience}`,
        `${topic} Upgrades: Modern Solutions for Older Homes${locationText}`,
        `Licensed Electricians Discuss Common ${topic.toLowerCase()} Problems`,
        `${topic} Codes and Regulations: What Homeowners Need to Know`,
      ],
      'cleaning': [
        `Professional ${topic.toLowerCase()} Services for Busy ${targetAudience}`,
        `${topic} Solutions That Fit Your Schedule and Budget${locationText}`,
        `Eco-Friendly ${topic} Options for Health-Conscious Homes`,
        `${topic} Frequency Guide: What ${targetAudience} Really Need`,
      ],
      'landscaping': [
        `${topic} Design Ideas for Beautiful Outdoor Spaces${locationText}`,
        `Sustainable ${topic.toLowerCase()} Practices for Eco-Friendly Homes`,
        `Seasonal ${topic} Maintenance for ${targetAudience}${locationText}`,
        `Professional ${topic} vs DIY: Cost-Benefit Analysis`,
      ],
      'roofing': [
        `${topic} Solutions for All Weather Conditions${locationText}`,
        `Roof ${topic.toLowerCase()}: Warning Signs Every Homeowner Should Know`,
        `Professional Roof ${topic} vs DIY: Making the Right Choice`,
        `${topic} Materials Guide: Options for ${targetAudience}${locationText}`,
      ],
      'painting': [
        `${topic} Color Trends for Modern Homes${locationText}`,
        `Professional ${topic} Techniques for Flawless Results`,
        `${topic} Preparation: What ${targetAudience} Need to Know`,
        `Interior vs Exterior ${topic}: Different Approaches for Best Results`,
      ],
      'pest-control': [
        `${topic} Prevention Strategies for ${targetAudience}${locationText}`,
        `Safe ${topic.toLowerCase()} Solutions for Families and Pets`,
        `Seasonal ${topic}: What to Expect and How to Prepare`,
        `Professional ${topic} Treatment: What to Expect and When`,
      ]
    };

    // Get business-specific topics or use general templates
    const businessKey = businessType.toLowerCase();
    const specificTopics = businessTemplates[businessKey] || [
      `${topic} Solutions for ${targetAudience}${locationText}`,
      `Professional ${topic.toLowerCase()} Services from ${businessType}s`,
      `${topic} Considerations Every ${targetAudience} Should Know`,
      `${businessType} Guide to ${topic} Success${locationText}`,
    ];

    return specificTopics;
  }

  private generateSpecificReasoning(
    topic: string,
    businessType: string,
    targetAudience: string,
    contentAnalysis?: any,
    websiteAnalysis?: any
  ): string {
    // If we have content analysis, generate specific reasoning
    if (contentAnalysis && websiteAnalysis) {
      const topicLower = topic.toLowerCase();
      const topicWords = topicLower.split(/\s+/).filter((w: string) => w.length > 2);

      // Enhanced content gap reasoning with semantic matching
      if (contentAnalysis.contentGaps?.length > 0) {
        const matchingGap = contentAnalysis.contentGaps.find((gap: any) => {
          const gapLower = gap.topic.toLowerCase();
          const gapWords = gapLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(gapLower) || gapLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => gapWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (matchingGap) {
          const priorityText = matchingGap.priority === 'high' ? 'critical' : 'important';
          return `Your website is missing "${matchingGap.topic}" content which ${matchingGap.reason.toLowerCase()}. This addresses a ${priorityText} content gap for ${targetAudience}.`;
        }
      }

      // Enhanced competitor advantage reasoning
      if (contentAnalysis.competitorAnalysis?.missingTopics?.length > 0) {
        const competitorTopic = contentAnalysis.competitorAnalysis.missingTopics.find((compTopic: string) => {
          const compLower = compTopic.toLowerCase();
          const compWords = compLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(compLower) || compLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => compWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (competitorTopic) {
          return `Competitors have content about "${competitorTopic}" that you're missing. This topic helps you compete effectively in the ${businessType} market.`;
        }
      }

      // Enhanced existing content reasoning
      if (websiteAnalysis.topics?.length > 0) {
        const existingTopic = websiteAnalysis.topics.find((existingTopic: string) => {
          const existingLower = existingTopic.toLowerCase();
          const existingWords = existingLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(existingLower) || existingLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => existingWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (existingTopic) {
          return `Build on your existing "${existingTopic}" content by expanding with this topic for ${targetAudience}. This strengthens your content cluster.`;
        }
      }

      // Enhanced keyword opportunity reasoning
      if (contentAnalysis.keywordOpportunities?.length > 0) {
        const keywordOpp = contentAnalysis.keywordOpportunities.find((opp: any) => {
          const keywordLower = opp.keyword.toLowerCase();
          const keywordWords = keywordLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(keywordLower) || keywordLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => keywordWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (keywordOpp) {
          const potentialIncrease = keywordOpp.potentialUsage - keywordOpp.currentUsage;
          return `"${keywordOpp.keyword}" appears ${keywordOpp.currentUsage} times on your site but has potential for ${keywordOpp.potentialUsage} usages. This topic helps you capture ${potentialIncrease} more keyword opportunities.`;
        }
      }

      // Content cluster opportunity reasoning
      if (contentAnalysis.contentClusters?.length > 0) {
        const relevantCluster = contentAnalysis.contentClusters.find((cluster: any) => {
          const clusterLower = cluster.mainTopic.toLowerCase();
          const clusterWords = clusterLower.split(/\s+/).filter((w: string) => w.length > 2);

          const sharedWords = topicWords.filter(word => clusterWords.includes(word));
          return sharedWords.length >= 1;
        });

        if (relevantCluster) {
          return `This topic expands your "${relevantCluster.mainTopic}" content cluster, helping you build topical authority and improve internal linking for ${targetAudience}.`;
        }
      }

      // SEO insight-based reasoning
      if (contentAnalysis.seoInsights?.length > 0) {
        const relevantInsight = contentAnalysis.seoInsights.find((insight: any) =>
          insight.type === 'content_cluster' &&
          (topicLower.includes('guide') || topicLower.includes('complete') || topicLower.includes('comprehensive'))
        );

        if (relevantInsight) {
          return `This comprehensive topic addresses ${relevantInsight.description.toLowerCase()} It will help improve your content quality and SEO performance.`;
        }
      }

      // High-priority gap reasoning based on industry
      const highPriorityGaps = contentAnalysis.contentGaps?.filter((gap: any) => gap.priority === 'high');
      if (highPriorityGaps?.length > 0) {
        return `While you have some content, this topic addresses critical gaps identified in your website analysis, helping you better serve ${targetAudience} in the ${businessType} space.`;
      }
    }

    // Fallback to business-specific reasoning
    return `${businessType} business targeting ${targetAudience} needs this content to attract and convert customers.`;
  }

  private determineTopicSource(
    topic: string,
    contentAnalysis?: any,
    websiteAnalysis?: any
  ): 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' {
    if (!contentAnalysis || !websiteAnalysis) {
      return 'ai';
    }

    const topicLower = topic.toLowerCase();
    const topicWords = topicLower.split(/\s+/).filter((w: string) => w.length > 2);

    // Enhanced content gap matching - semantic matching
    if (contentAnalysis.contentGaps?.length > 0) {
      const matchingGap = contentAnalysis.contentGaps.find((gap: any) => {
        const gapLower = gap.topic.toLowerCase();
        const gapWords = gapLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(gapLower) || gapLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching - check for shared meaningful words
        const sharedWords = topicWords.filter(word => gapWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (matchingGap) {
        return 'website_gap';
      }
    }

    // Enhanced competitor advantage matching
    if (contentAnalysis.competitorAnalysis?.missingTopics?.length > 0) {
      const competitorTopic = contentAnalysis.competitorAnalysis.missingTopics.find((compTopic: string) => {
        const compLower = compTopic.toLowerCase();
        const compWords = compLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(compLower) || compLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching
        const sharedWords = topicWords.filter(word => compWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (competitorTopic) {
        return 'competitor_advantage';
      }
    }

    // Enhanced existing content matching
    if (websiteAnalysis.topics?.length > 0) {
      const existingTopic = websiteAnalysis.topics.find((existingTopic: string) => {
        const existingLower = existingTopic.toLowerCase();
        const existingWords = existingLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(existingLower) || existingLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching
        const sharedWords = topicWords.filter(word => existingWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (existingTopic) {
        return 'content_opportunity';
      }
    }

    // Enhanced keyword opportunity matching
    if (contentAnalysis.keywordOpportunities?.length > 0) {
      const keywordOpp = contentAnalysis.keywordOpportunities.find((opp: any) => {
        const keywordLower = opp.keyword.toLowerCase();
        const keywordWords = keywordLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(keywordLower) || keywordLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching
        const sharedWords = topicWords.filter(word => keywordWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (keywordOpp) {
        return 'content_opportunity';
      }
    }

    // Business context matching for content opportunities
    if (contentAnalysis.seoInsights?.length > 0) {
      const hasContentClusterInsight = contentAnalysis.seoInsights.some((insight: any) =>
        insight.type === 'content_cluster' &&
        (topicLower.includes('content') || topicLower.includes('guide') || topicLower.includes('cluster'))
      );

      if (hasContentClusterInsight) {
        return 'content_opportunity';
      }
    }

    return 'ai';
  }

  async analyzeTopicMetadata(topicsWithReasoning: Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
    relatedContent?: string;
    competitiveInsight?: string;
    marketPositioning?: string;
  }>): Promise<Array<{
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    suggestedTags: string[];
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
    relatedContent?: string;
    competitiveInsight?: string;
    marketPositioning?: string;
  }>> {
    const systemPrompt = `You are an SEO expert. Analyze the provided topics and estimate their SEO metrics.

For each topic, provide:
- Difficulty: easy, medium, or hard (based on competition)
- Search Volume: estimated monthly searches (use ranges like 100-500, 500-1000, 1000-5000, 5000+)
- Competition: low, medium, or high
- Suggested Tags: 3-5 relevant keywords/tags

Respond with JSON only, no formatting or explanations. If you must format, use a JSON array without markdown formatting.`;

    const prompt = `Analyze these topics for SEO metrics:
${topicsWithReasoning.map((item, index) => `${index + 1}. ${item.topic}`).join('\n')}

IMPORTANT: Respond with VALID JSON only. All string values must be in double quotes. All numeric values must be actual numbers (not ranges).

Example format:
[
  {
    "difficulty": "medium",
    "searchVolume": 1000,
    "competition": "medium",
    "suggestedTags": ["seo", "marketing", "business"]
  }
]

For searchVolume, use the midpoint of ranges:
- 100-500 → 300
- 500-1000 → 750
- 1000-5000 → 3000
- 5000+ → 7500
- low → 300
- medium → 1000
- high → 3000`;

    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent analysis
      });

      const content = response.choices[0]?.message?.content || '';

      // Use the new markdown parser to extract clean JSON
      try {
        const jsonContent = extractCleanJson(content);
        const parsed = JSON.parse(jsonContent);

        if (Array.isArray(parsed)) {
          return parsed.map((item, index) => {
            const originalTopic = topicsWithReasoning[index] || topicsWithReasoning[0];
            return {
              ...originalTopic,
              difficulty: this.validateDifficulty(item.difficulty),
              searchVolume: this.parseSearchVolume(item.searchVolume),
              competition: this.validateCompetition(item.competition),
              suggestedTags: Array.isArray(item.suggestedTags) ? item.suggestedTags : this.extractTagsFromTopic(originalTopic.topic)
            };
          });
        }
      } catch (parseError) {
        console.error('Failed to parse SEO analysis response:', parseError);
        console.error('Raw content:', content);
      }

      // Enhanced fallback with regex parsing - use original topic structure
      return this.parseMarkdownAnalysisWithReasoning(content, topicsWithReasoning);
    } catch (error) {
      console.error('Error analyzing topic metadata:', error);
      throw new Error('Failed to analyze topic metadata');
    }
  }

  private parseMarkdownAnalysisWithReasoning(content: string, topicsWithReasoning: Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
    relatedContent?: string;
    competitiveInsight?: string;
    marketPositioning?: string;
  }>): Array<{
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    suggestedTags: string[];
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' | 'market_opportunity' | 'competitive_gap' | 'strategic_positioning';
    relatedContent?: string;
    competitiveInsight?: string;
    marketPositioning?: string;
  }> {
    // Simple fallback that preserves the original topic structure
    return topicsWithReasoning.map(originalTopic => ({
      ...originalTopic,
      difficulty: 'medium',
      searchVolume: 500,
      competition: 'medium',
      suggestedTags: this.extractTagsFromTopic(originalTopic.topic)
    }));
  }

  private validateDifficulty(difficulty: any): 'easy' | 'medium' | 'hard' {
    const valid = ['easy', 'medium', 'hard'];
    return valid.includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() as 'easy' | 'medium' | 'hard' : 'medium';
  }

  private validateCompetition(competition: any): 'low' | 'medium' | 'high' {
    const valid = ['low', 'medium', 'high'];
    return valid.includes(competition?.toLowerCase()) ? competition.toLowerCase() as 'low' | 'medium' | 'high' : 'medium';
  }
  private parseSearchVolume(volumeString: string): number {
    if (typeof volumeString === 'number') return volumeString;

    const str = String(volumeString).toLowerCase();
    if (str.includes('5000+') || str.includes('5000+')) return 7500;
    if (str.includes('1000+')) return 3000;
    if (str.includes('100-500')) return 300;
    if (str.includes('500-1000')) return 750;
    if (str.includes('1000-5000')) return 3000;
    if (str.includes('high')) return 3000;
    if (str.includes('medium')) return 1000;
    if (str.includes('low')) return 300;

    // Extract numbers from string
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : 500;
  }

  private extractTagsFromTopic(topic: string): string[] {
    const words = topic.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);

    return [...new Set(words)]; // Remove duplicates
  }

  async generateDetailedTopicInfo(
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string
  ): Promise<{
    description: string;
    contentBrief: string;
    contentAngle: string;
    estimatedTimeToWrite: string;
    competitorAnalysis: string;
    keywordInsights: string[];
    relatedTopics: string[];
  }> {
    const systemPrompt = `You are an expert SEO content strategist with deep expertise in creating business-relevant, actionable content. Generate detailed, specific information that provides real value to businesses.

CRITICAL REQUIREMENTS:
- Be SPECIFIC and BUSINESS-FOCUSED, not generic
- Provide ACTIONABLE insights, not vague advice
- Ensure all content is relevant to the business type and target audience
- Related topics must be semantically connected to the main topic
- Content brief should include specific, measurable outcomes
- Competitor analysis must identify concrete opportunities

CONTENT QUALITY STANDARDS:
- Description: Engaging, specific, and benefit-oriented
- Content Brief: Detailed outline with 5-7 specific points to cover
- Content Angle: Unique perspective that addresses specific pain points
- Keywords: Mix of primary, secondary, and long-tail keywords with search intent
- Related Topics: Semantically relevant, not generic variations

BUSINESS CONTEXT FOCUS:
- Address specific challenges faced by ${businessType} businesses
- Provide practical solutions for ${targetAudience}
- Include measurable business outcomes and ROI considerations
- Focus on competitive advantages and market positioning

Respond with VALID JSON only, no markdown formatting or explanations.`;

    const prompt = `Generate comprehensive, business-focused topic information for:

TOPIC: ${topic}
BUSINESS TYPE: ${businessType}
TARGET AUDIENCE: ${targetAudience}
${location ? `LOCATION: ${location}` : ''}

REQUIREMENTS:
1. Create content that addresses specific business challenges and opportunities
2. Focus on actionable advice that delivers measurable results
3. Ensure all suggestions are relevant to the business context
4. Related topics must be semantically connected and business-relevant

SPECIFIC INSTRUCTIONS:
- Description: Write 2-3 compelling sentences that highlight specific business benefits
- Content Brief: Include 5-7 specific, actionable points with measurable outcomes
- Content Angle: Identify a unique perspective that addresses specific pain points
- Keywords: Provide 3-5 specific keywords with search intent (informational, commercial, etc.)
- Related Topics: Suggest 3-5 topics that are semantically related and business-relevant

IMPORTANT: Respond with VALID JSON only. All string values must be in double quotes.

Example format:
{
  "description": "A strategic guide to implementing [topic] that helps [business type] businesses achieve [specific outcome] by addressing [specific pain point].",
  "contentBrief": "This comprehensive topic covers: 1) [Specific point with measurable outcome], 2) [Another specific point], 3) [Practical implementation steps], 4) [Business metrics to track], 5) [Common mistakes to avoid].",
  "contentAngle": "Focus on [unique approach] that differentiates from generic content by addressing [specific challenge] faced by [target audience].",
  "estimatedTimeToWrite": "3-4 hours",
  "competitorAnalysis": "Most competitors cover [generic aspect]. This topic stands out by focusing on [specific differentiation] that addresses [business need].",
  "keywordInsights": ["Primary keyword with commercial intent", "Secondary informational keyword", "Long-tail problem-solving keyword", "Location-specific variation"],
  "relatedTopics": ["Semantically related topic 1", "Business-focused topic 2", "Advanced implementation topic 3"]
}`;

    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 1500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      // Try to parse JSON response
      try {
        const jsonContent = extractCleanJson(content);

        // If no valid JSON found, create a fallback response
        if (!jsonContent) {
          console.warn('⚠️ [LEMONFOX] No valid JSON found in AI response, using fallback');
          return this.createFallbackDetailedTopicInfo(topic, businessType, targetAudience, location);
        }

        const parsed = JSON.parse(jsonContent);

        // Validate and enhance the response with business-specific content
        const enhancedDescription = this.validateAndEnhanceDescription(parsed.description, topic, businessType, targetAudience);
        const enhancedContentBrief = this.validateAndEnhanceContentBrief(parsed.contentBrief, topic, businessType, targetAudience);
        const enhancedContentAngle = this.validateAndEnhanceContentAngle(parsed.contentAngle, topic, businessType, targetAudience);
        const enhancedCompetitorAnalysis = this.validateAndEnhanceCompetitorAnalysis(parsed.competitorAnalysis, topic, businessType);
        const enhancedKeywordInsights = this.validateAndEnhanceKeywordInsights(parsed.keywordInsights, topic, businessType, targetAudience, location);
        const enhancedRelatedTopics = this.validateAndEnhanceRelatedTopics(parsed.relatedTopics, topic, businessType, targetAudience);

        return {
          description: enhancedDescription,
          contentBrief: enhancedContentBrief,
          contentAngle: enhancedContentAngle,
          estimatedTimeToWrite: parsed.estimatedTimeToWrite || '3-4 hours',
          competitorAnalysis: enhancedCompetitorAnalysis,
          keywordInsights: enhancedKeywordInsights,
          relatedTopics: enhancedRelatedTopics
        };
      } catch (parseError) {
        console.error('Failed to parse detailed topic info response:', parseError);
        console.error('Raw AI response content:', content);

        // Return fallback response instead of throwing error
        console.warn('⚠️ [LEMONFOX] Using fallback response due to JSON parsing failure');
        return this.createFallbackDetailedTopicInfo(topic, businessType, targetAudience, location);
      }
    } catch (error) {
      console.error('Error generating detailed topic info:', error);
      throw new Error('Failed to generate detailed topic information');
    }
  }

  private validateAndEnhanceDescription(
    description: string,
    topic: string,
    businessType: string,
    targetAudience: string
  ): string {
    if (!description || description.length < 20 || this.isGenericContent(description)) {
      return `A strategic guide to ${topic} that helps ${businessType} businesses achieve measurable results by addressing specific challenges faced by ${targetAudience}. This comprehensive approach combines industry best practices with practical implementation strategies.`;
    }

    // Ensure description mentions specific business benefits
    if (!description.toLowerCase().includes(businessType.toLowerCase()) ||
        !description.toLowerCase().includes(targetAudience.toLowerCase())) {
      return `${description} This content is specifically designed for ${businessType} businesses targeting ${targetAudience}, providing actionable insights and measurable outcomes.`;
    }

    return description;
  }

  private validateAndEnhanceContentBrief(
    contentBrief: string,
    topic: string,
    businessType: string,
    targetAudience: string
  ): string {
    if (!contentBrief || contentBrief.length < 50 || this.isGenericContent(contentBrief)) {
      return `This comprehensive topic covers: 1) Key challenges and opportunities in ${topic} for ${businessType} businesses, 2) Step-by-step implementation strategies tailored for ${targetAudience}, 3) Measurable metrics and KPIs to track success, 4) Common pitfalls and how to avoid them, 5) Industry-specific examples and case studies, 6) Tools and resources for efficient execution, 7) Long-term maintenance and optimization strategies.`;
    }

    // Ensure content brief includes specific, actionable points
    if (!contentBrief.includes('1)') && !contentBrief.includes('•') && !contentBrief.includes('-')) {
      return `This comprehensive topic covers: ${contentBrief} Key areas include: specific implementation steps, measurable outcomes, industry examples, and practical tools for ${businessType} businesses serving ${targetAudience}.`;
    }

    return contentBrief;
  }

  private validateAndEnhanceContentAngle(
    contentAngle: string,
    topic: string,
    businessType: string,
    targetAudience: string
  ): string {
    if (!contentAngle || contentAngle.length < 20 || this.isGenericContent(contentAngle)) {
      return `Focus on a data-driven approach that combines ${businessType} industry expertise with practical ${targetAudience} insights, highlighting measurable ROI and competitive advantages that generic content often overlooks.`;
    }

    // Ensure content angle is specific and differentiated
    if (!contentAngle.toLowerCase().includes('different') &&
        !contentAngle.toLowerCase().includes('unique') &&
        !contentAngle.toLowerCase().includes('specific')) {
      return `${contentAngle} This unique approach addresses specific pain points that ${targetAudience} faces, providing differentiated value that sets ${businessType} businesses apart from competitors.`;
    }

    return contentAngle;
  }

  private validateAndEnhanceCompetitorAnalysis(
    competitorAnalysis: string,
    topic: string,
    businessType: string
  ): string {
    if (!competitorAnalysis || competitorAnalysis.length < 30 || this.isGenericContent(competitorAnalysis)) {
      return `Most competitors provide generic ${topic} advice that lacks industry specificity. This topic stands out by focusing on ${businessType}-specific challenges, providing actionable strategies with measurable outcomes that address real business needs rather than theoretical concepts.`;
    }

    // Ensure competitor analysis identifies specific opportunities
    if (!competitorAnalysis.toLowerCase().includes('opportunity') &&
        !competitorAnalysis.toLowerCase().includes('advantage')) {
      return `${competitorAnalysis} This creates a competitive advantage by addressing gaps in existing content and providing specific insights that resonate with ${businessType} business decision-makers.`;
    }

    return competitorAnalysis;
  }

  private validateAndEnhanceKeywordInsights(
    keywordInsights: string[],
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string
  ): string[] {
    if (!Array.isArray(keywordInsights) || keywordInsights.length === 0 ||
        keywordInsights.every(insight => this.isGenericContent(insight))) {
      const locationModifier = location ? ` ${location}` : '';
      return [
        `Primary: "${topic} for ${businessType}${locationModifier}" - high commercial intent targeting decision-makers`,
        `Secondary: "how to ${topic.toLowerCase()} ${targetAudience}" - informational intent addressing specific pain points`,
        `Long-tail: "${topic} strategies that improve [business outcome]" - problem-solving with measurable results`,
        location ? `Local: "${topic} near ${location} for ${businessType}" - geo-targeted commercial intent` : `Industry: "${businessType} ${topic} best practices" - industry-specific authority building`
      ];
    }

    // Enhance existing insights to be more specific
    return keywordInsights.map(insight => {
      if (this.isGenericContent(insight)) {
        return `Focus on ${topic}-specific keywords that combine ${businessType} context with ${targetAudience} pain points, emphasizing measurable outcomes and practical solutions.`;
      }
      return insight;
    });
  }

  private validateAndEnhanceRelatedTopics(
    relatedTopics: string[],
    topic: string,
    businessType: string,
    targetAudience: string
  ): string[] {
    if (!Array.isArray(relatedTopics) || relatedTopics.length === 0 ||
        relatedTopics.every(t => this.isGenericContent(t))) {
      return [
        `Advanced ${topic} strategies for ${businessType} growth`,
        `Measuring ROI from ${topic} initiatives for ${targetAudience}`,
        `${topic} automation and scaling techniques for ${businessType}`,
        `Common ${topic} mistakes that cost ${businessType} businesses money`,
        `Future trends in ${topic} for ${targetAudience} success`
      ];
    }

    // Filter and enhance related topics to ensure semantic relevance
    const enhancedTopics = relatedTopics
      .filter(t => !this.isGenericContent(t))
      .filter(t => this.isSemanticallyRelated(t, topic))
      .map(t => this.enhanceRelatedTopic(t, businessType, targetAudience))
      .slice(0, 5);

    // Ensure we have at least 3 good topics
    while (enhancedTopics.length < 3) {
      const fallbackTopics = [
        `Advanced ${topic} strategies for ${businessType} growth`,
        `Measuring ROI from ${topic} initiatives for ${targetAudience}`,
        `${topic} automation and scaling techniques for ${businessType}`,
        `Common ${topic} mistakes that cost ${businessType} businesses money`,
        `Integrating ${topic} with existing ${businessType} workflows`,
        `${topic} case studies for ${targetAudience} success stories`
      ];

      const newTopic = fallbackTopics.find(t => !enhancedTopics.includes(t));
      if (newTopic && !enhancedTopics.includes(newTopic)) {
        enhancedTopics.push(newTopic);
      } else {
        break;
      }
    }

    return enhancedTopics;
  }

  private isSemanticallyRelated(relatedTopic: string, mainTopic: string): boolean {
    const mainTopicLower = mainTopic.toLowerCase();
    const relatedTopicLower = relatedTopic.toLowerCase();

    // Extract key terms from main topic (words longer than 3 characters)
    const mainTopicWords = mainTopicLower.split(/\s+/).filter(word => word.length > 3);
    const relatedTopicWords = relatedTopicLower.split(/\s+/).filter(word => word.length > 3);

    // Check for direct topic inclusion
    if (relatedTopicLower.includes(mainTopicLower) || mainTopicLower.includes(relatedTopicLower)) {
      return true;
    }

    // Check for semantic overlap - at least 20% of words should match
    const sharedWords = mainTopicWords.filter(word => relatedTopicWords.includes(word));
    const overlapRatio = sharedWords.length / Math.max(mainTopicWords.length, relatedTopicWords.length);

    if (overlapRatio >= 0.2) {
      return true;
    }

    // Check for business-relevant semantic patterns
    const semanticPatterns = [
      /advanced.*strategies/,
      /best.*practices/,
      /common.*mistakes/,
      /how.*to/,
      /implementation/,
      /automation/,
      /scaling/,
      /optimization/,
      /measurement/,
      /roi/,
      /case.*study/,
      /integration/,
      /workflow/,
      /tools/,
      /resources/,
      /future.*trends/,
      /measuring.*success/,
      /practical.*guide/,
      /step.*by.*step/
    ];

    // If related topic contains semantic patterns AND shares at least one word with main topic
    const hasSemanticPattern = semanticPatterns.some(pattern => pattern.test(relatedTopicLower));
    const hasWordOverlap = sharedWords.length > 0;

    return hasSemanticPattern && hasWordOverlap;
  }

  private enhanceRelatedTopic(topic: string, businessType: string, targetAudience: string): string {
    // Enhance topic to be more business-specific
    if (!topic.toLowerCase().includes(businessType.toLowerCase()) &&
        !topic.toLowerCase().includes(targetAudience.toLowerCase())) {
      return `${topic} for ${businessType} businesses targeting ${targetAudience}`;
    }
    return topic;
  }

  private isGenericContent(content: string): boolean {
    const genericPatterns = [
      /comprehensive guide to/,
      /essential aspects of/,
      /valuable insights and/,
      /practical advice that/,
      /actionable advice that/,
      /benefits of/,
      /important for/,
      /crucial for/,
      /business context/,
      /audience context/,
      /based on the provided/,
      /generated for/,
      /suggested topic/
    ];

    const contentLower = content.toLowerCase();
    return genericPatterns.some(pattern => pattern.test(contentLower)) ||
           contentLower.length < 20;
  }

  async generateCustomerQuestions(
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string,
    industryId?: string,
    localServicePatterns: string[] = []
  ): Promise<Array<{
    question: string;
    category: string;
    reasoning: string;
  }>> {
    const systemPrompt = `You are an expert in creating customer questions that match how real people speak, especially when using voice search assistants like Siri, Alexa, or Google Assistant.

CRITICAL REQUIREMENTS:
- Generate questions that sound exactly like how customers actually speak
- Focus on conversational, natural language patterns
- Include local intent and location-specific queries
- Optimize for voice search (longer, more natural phrasing)
- Categorize each question by type: how_to, what_is, where_can, why_does, emergency
- Ensure questions address real customer pain points and needs

VOICE SEARCH OPTIMIZATION:
- Use natural, conversational language
- Include complete questions with proper grammar
- Add context that people would naturally include when speaking
- Use phrases like "help me", "I need", "can you", "what's the best"
- Avoid keyword stuffing or robotic language
- Make questions sound like someone is actually asking for help

QUESTION CATEGORIES:
- how_to: Step-by-step guidance questions ("How do I...", "Can you help me...")
- what_is: Definition and explanation questions ("What is...", "Can you explain...")
- where_can: Location-based search questions ("Where can I find...", "What's the best...")
- why_does: Problem explanation questions ("Why does my...", "What causes...")
- emergency: Urgent help questions ("I need emergency...", "Help! My...")

LOCAL INTENT:
- Include "near me", "in [city]", or local context when appropriate
- Consider what people would ask when looking for local services
- Add location modifiers naturally within questions

Respond with ONLY a numbered list of questions. Format: "Question | Category | Reasoning"`;

    let prompt = `Generate customer questions for:
TOPIC: ${topic}
BUSINESS TYPE: ${businessType}
TARGET AUDIENCE: ${targetAudience}${location ? `\nLOCATION: ${location}` : ''}

INDUSTRY CONTEXT: Focus on ${businessType} services that ${targetAudience} would search for.`;

    // Add local service patterns if available
    if (localServicePatterns.length > 0) {
      prompt += `

LOCAL SERVICE PATTERNS TO CONSIDER:
${localServicePatterns.slice(0, 3).join(', ')}`;
    }

    prompt += `

Generate 12-15 customer questions that sound exactly like how real people speak to voice assistants. Focus on practical problems, urgent needs, and genuine customer concerns.

REMEMBER: These questions should match how people actually talk, not how they type. Use conversational language and include natural context.

Start your response with "1."`;

    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 2000,
        temperature: 0.4, // Slightly higher for more creative, natural questions
      });

      const content = response.choices[0]?.message?.content || '';

      // Parse questions in the format: "Question | Category | Reasoning"
      const questions = this.parseCustomerQuestions(content);

  
      return questions.slice(0, 15); // Limit to 15 questions
    } catch (error) {
      console.error('❌ [LEMONFOX] Error generating customer questions:', error);
      throw new Error('Failed to generate customer questions');
    }
  }

  private parseCustomerQuestions(content: string): Array<{
    question: string;
    category: string;
    reasoning: string;
  }> {
    const questions: Array<{
      question: string;
      category: string;
      reasoning: string;
    }> = [];

    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and headers
      if (!trimmed ||
          trimmed.toLowerCase().includes('here are') ||
          trimmed.toLowerCase().includes('customer questions') ||
          !/^\d+\./.test(trimmed)) {
        continue;
      }

      // Try to parse the format: "1. Question | Category | Reasoning"
      const match = trimmed.match(/^\d+\.\s*(.+)$/);
      if (!match) continue;

      const questionContent = match[1];

      // Try to split by pipe character
      const parts = questionContent.split('|').map(p => p.trim());

      if (parts.length >= 3) {
        const question = parts[0].trim();
        const category = parts[1].trim().toLowerCase();
        const reasoning = parts[2].trim();

        // Validate the question looks natural and conversational
        if (this.isConversationalQuestion(question) && reasoning.length > 10) {
          questions.push({
            question: this.cleanCustomerQuestion(question),
            category: this.normalizeQuestionCategory(category),
            reasoning: reasoning
          });
        }
      } else if (parts.length === 1) {
        // Fallback: just the question, infer category and add basic reasoning
        const question = parts[0].trim();

        if (this.isConversationalQuestion(question)) {
          questions.push({
            question: this.cleanCustomerQuestion(question),
            category: this.inferQuestionCategory(question),
            reasoning: 'Customer question based on common search patterns and needs'
          });
        }
      }
    }

    return questions;
  }

  private isConversationalQuestion(question: string): boolean {
    const questionLower = question.toLowerCase();

    // Check for conversational patterns
    const conversationalStarts = [
      /^how do i/i,
      /^what is/i,
      /^where can/i,
      /^why does/i,
      /^when should/i,
      /^can you/i,
      /^help me/i,
      /^i need/i,
      /^what's the best/i,
      /^which/i,
      /^should i/i
    ];

    const hasConversationalStart = conversationalStarts.some(start => start.test(questionLower));

    // Check for natural language indicators
    const hasNaturalLanguage = questionLower.includes('for me') ||
                               questionLower.includes('my') ||
                               questionLower.includes('our') ||
                               questionLower.includes('help') ||
                               questionLower.includes('need') ||
                               questionLower.length > 20; // Longer questions tend to be more conversational

    // Avoid robotic or keyword-stuffed questions
    const notRobotic = !questionLower.includes(':') &&
                      !questionLower.includes('|') &&
                      !questionLower.includes(' vs ') &&
                      !questionLower.match(/^\w+\s+\w+\s*\w*$/); // Too short/simple

    return hasConversationalStart && hasNaturalLanguage && notRobotic;
  }

  private cleanCustomerQuestion(question: string): string {
    return question
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\?\s*$/, '?') // Ensure proper ending
      .trim();
  }

  private normalizeQuestionCategory(category: string): string {
    const normalized = category.toLowerCase().replace(/[^a-z_]/g, '_');

    const categoryMap: Record<string, string> = {
      'how_to': 'how_to',
      'how': 'how_to',
      'howto': 'how_to',
      'what_is': 'what_is',
      'what': 'what_is',
      'definition': 'what_is',
      'where_can': 'where_can',
      'where': 'where_can',
      'location': 'where_can',
      'why_does': 'why_does',
      'why': 'why_does',
      'emergency': 'emergency',
      'urgent': 'emergency',
      'immediate': 'emergency'
    };

    return categoryMap[normalized] || 'what_is'; // Default fallback
  }

  private inferQuestionCategory(question: string): string {
    const questionLower = question.toLowerCase();

    if (questionLower.startsWith('how do') || questionLower.startsWith('can you help') || questionLower.includes('steps')) {
      return 'how_to';
    }
    if (questionLower.startsWith('what is') || questionLower.startsWith('what does') || questionLower.startsWith('can you explain')) {
      return 'what_is';
    }
    if (questionLower.startsWith('where can') || questionLower.includes('near me') || questionLower.includes('in [city]')) {
      return 'where_can';
    }
    if (questionLower.startsWith('why does') || questionLower.startsWith('what causes') || questionLower.includes('reason')) {
      return 'why_does';
    }
    if (questionLower.includes('emergency') || questionLower.includes('urgent') || questionLower.includes('right now')) {
      return 'emergency';
    }

    return 'what_is'; // Default fallback
  }

  /**
   * Creates a fallback detailed topic info response when JSON parsing fails
   */
  private createFallbackDetailedTopicInfo(
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string
  ): {
    description: string;
    contentBrief: string;
    contentAngle: string;
    estimatedTimeToWrite: string;
    competitorAnalysis: string;
    keywordInsights: string[];
    relatedTopics: string[];
  } {
    const locationText = location ? ` in ${location}` : '';

    return {
      description: `A strategic guide to ${topic} that helps ${businessType} businesses achieve measurable results by addressing specific challenges faced by ${targetAudience}. This comprehensive approach combines industry best practices with practical implementation strategies${locationText}.`,
      contentBrief: `This comprehensive topic covers: 1) Key challenges and opportunities in ${topic} for ${businessType} businesses, 2) Step-by-step implementation strategies tailored for ${targetAudience}, 3) Measurable metrics and KPIs to track success, 4) Common pitfalls and how to avoid them, 5) Industry-specific examples and case studies, 6) Tools and resources for efficient execution, 7) Long-term maintenance and optimization strategies.`,
      contentAngle: `Focus on a data-driven approach that combines ${businessType} industry expertise with practical ${targetAudience} insights, highlighting measurable ROI and competitive advantages that generic content often overlooks.`,
      estimatedTimeToWrite: '3-4 hours',
      competitorAnalysis: `Most competitors provide generic ${topic} advice that lacks industry specificity. This topic stands out by focusing on ${businessType}-specific challenges, providing actionable strategies with measurable outcomes that address real business needs rather than theoretical concepts.`,
      keywordInsights: [
        `Primary: "${topic} for ${businessType}${locationText}" - high commercial intent targeting decision-makers`,
        `Secondary: "how to ${topic.toLowerCase()} ${targetAudience}" - informational intent addressing specific pain points`,
        `Long-tail: "${topic} strategies that improve [business outcome]" - problem-solving with measurable results`,
        location ? `Local: "${topic} near ${location} for ${businessType}" - geo-targeted commercial intent` : `Industry: "${businessType} ${topic} best practices" - industry-specific authority building`
      ],
      relatedTopics: [
        `Advanced ${topic} strategies for ${businessType} growth`,
        `Measuring ROI from ${topic} initiatives for ${targetAudience}`,
        `${topic} automation and scaling techniques for ${businessType}`,
        `Common ${topic} mistakes that cost ${businessType} businesses money`,
        `Future trends in ${topic} for ${targetAudience} success`
      ]
    };
  }
}

// Singleton instance
let lemonfoxClient: LemonfoxClient | null = null;

export function getLemonfoxClient(): LemonfoxClient {
  if (!lemonfoxClient) {
    const apiKey = process.env.LEMONFOX_API_KEY;
    if (!apiKey) {
      throw new Error('LEMONFOX_API_KEY environment variable is not set');
    }
    lemonfoxClient = new LemonfoxClient(apiKey);
  }
  return lemonfoxClient;
}
