/**
 * Advanced Context Synthesis System
 *
 * This system transforms multiple context sources (brand voice, competitor intelligence,
 * cultural adaptation, business offerings, etc.) into a unified, strategic prompt
 * that deeply integrates all available user information for highly personalized
 * SEO topic and content generation.
 */

import { analyzeBrandVoice, type BrandAnalysisInsights } from './brand-voice-analyzer';
import { analyzeCompetitors, type CompetitiveIntelligenceReport } from './competitor-intelligence';
import { extractBusinessOfferings, type BusinessOfferings } from './service-extractor';
import { generateCulturalAdaptation, type CulturalPrompt, type CulturalAdaptationRequest, performCulturalAnalysis, type CulturalAnalysisResult } from './cultural-language-system';
import { WebsiteAnalysisResult } from './website-crawler';

export interface ContextSources {
  websiteAnalysis?: WebsiteAnalysisResult;
  brandAnalysis?: BrandAnalysisInsights;
  competitorIntelligence?: CompetitiveIntelligenceReport;
  businessOfferings?: BusinessOfferings;
  culturalPrompt?: CulturalPrompt;
  culturalRequest?: CulturalAdaptationRequest;
  culturalAnalysis?: CulturalAnalysisResult; // Enhanced cultural analysis
  location?: string;
  businessType?: string;
  targetAudience?: string;
  contentAnalysis?: any;
  competitorAdvantages?: any[]; // Enhanced competitor advantages
  counterTopics?: any[]; // Generated counter-topics
  tonePreference?: string;
  languagePreference?: string;
  formalityPreference?: string;
  contentPurpose?: string;
  additionalContext?: string;
  competitorUrls?: string[];
  userTopic?: string;
}

export interface SynthesizedContext {
  // Core business identity
  businessIdentity: {
    type: string;
    primaryOfferings: string[];
    uniqueValueProps: string[];
    targetAudience: string;
    location?: string;
  };

  // Brand voice and communication style
  brandVoice: {
    primaryTone: string;
    formalityLevel: string;
    languageStyle: string;
    keyPhrases: string[];
    communicationPerspective: string;
    coreValues: string[];
  };

  // Competitive positioning
  competitiveStrategy: {
    marketPositioning: string[];
    competitiveAdvantages: string[];
    contentGapsToTarget: string[];
    strategicDifferentiation: string[];
    marketOpportunities: string[];
    competitorThreats: string[];
    counterPositioning: string[];
    comparisonOpportunities: string[];
  };

  // Cultural and linguistic adaptation
  culturalContext: {
    communicationStyle: string;
    culturalNuances: string[];
    languageGuidelines: string[];
    formalityRequirements: string[];
    localReferences: string[];
    avoidances: string[];
  };

  // Strategic content requirements
  contentStrategy: {
    topicPriorities: string[];
    contentAngles: string[];
    strategicKeywords: string[];
    serviceSpecificTopics: string[];
    locationSpecificTopics: string[];
  };

  // Context quality and completeness
  contextQuality: {
    completeness: number; // 0-100
    confidence: number;   // 0-100
    dataSources: string[];
    conflicts: string[];
    recommendations: string[];
  };

  // Strategic instructions for AI
  strategicInstructions: {
    topicGeneration: string[];
    contentCreation: string[];
    competitivePositioning: string[];
    culturalAdaptation: string[];
    brandConsistency: string[];
    competitorCountering: string[];
    differentiationFocus: string[];
  };
  userPreferences: {
    desiredTone: string;
    languagePreference: string;
    formalityPreference: string;
    contentPurpose: string;
    additionalContext?: string;
    competitorUrls: string[];
    brandToneReference: string;
  };
}

export interface ContextWeighting {
  brandVoice: number;
  competitorIntelligence: number;
  businessOfferings: number;
  culturalContext: number;
  location: number;
  marketPositioning: number;
}

export class ContextSynthesizer {
  private defaultWeights: ContextWeighting = {
    brandVoice: 0.25,
    competitorIntelligence: 0.20,
    businessOfferings: 0.20,
    culturalContext: 0.15,
    location: 0.10,
    marketPositioning: 0.10
  };

  /**
   * Synthesize all available context sources into a unified, strategic context
   */
  synthesizeContext(sources: ContextSources, customWeights?: Partial<ContextWeighting>): SynthesizedContext {
    console.log('🧠 [CONTEXT SYNTHESIZER] Starting comprehensive context synthesis');

    const weights = { ...this.defaultWeights, ...customWeights };

    // Build core business identity
    const businessIdentity = this.synthesizeBusinessIdentity(sources, weights);

    // Synthesize brand voice and communication style
    const brandVoice = this.synthesizeBrandVoice(sources, weights);

    // Create competitive positioning strategy
    const competitiveStrategy = this.synthesizeCompetitiveStrategy(sources, weights);

    // Build cultural and linguistic context
    const culturalContext = this.synthesizeCulturalContext(sources, weights);

    // Develop strategic content requirements
    const contentStrategy = this.synthesizeContentStrategy(sources, weights);

    // Assess context quality and completeness
    const contextQuality = this.assessContextQuality(sources);

    // Generate strategic instructions for AI
    const strategicInstructions = this.generateStrategicInstructions(
      businessIdentity,
      brandVoice,
      competitiveStrategy,
      culturalContext,
      contentStrategy
    );

    const synthesizedContext: SynthesizedContext = {
      businessIdentity,
      brandVoice,
      competitiveStrategy,
      culturalContext,
      contentStrategy,
      contextQuality,
      strategicInstructions,
      userPreferences: {
        desiredTone: sources.tonePreference || sources.brandAnalysis?.brandVoiceProfile.primaryTone || brandVoice.primaryTone,
        languagePreference: sources.languagePreference || sources.culturalRequest?.languagePreference || 'english',
        formalityPreference: sources.formalityPreference || sources.culturalRequest?.formalityLevel || brandVoice.formalityLevel || 'professional',
        contentPurpose: sources.contentPurpose || sources.culturalRequest?.contentPurpose || 'marketing',
        additionalContext: sources.additionalContext,
        competitorUrls: sources.competitorUrls || [],
        brandToneReference: brandVoice.primaryTone
      }
    };

    console.log('✅ [CONTEXT SYNTHESIZER] Context synthesis completed', {
      completeness: contextQuality.completeness,
      confidence: contextQuality.confidence,
      dataSources: contextQuality.dataSources.length,
      strategicInstructions: Object.values(strategicInstructions).flat().length
    });

    return synthesizedContext;
  }

  /**
   * Synthesize core business identity from available sources
   */
  private synthesizeBusinessIdentity(sources: ContextSources, weights: ContextWeighting): SynthesizedContext['businessIdentity'] {
    const { businessOfferings, businessType, targetAudience, location } = sources;

    // Extract primary offerings from business offerings or fallback to business type
    let primaryOfferings: string[] = [];
    let uniqueValueProps: string[] = [];

    if (businessOfferings) {
      primaryOfferings = [
        ...(businessOfferings.services || []).slice(0, 5).map(s => s.name),
        ...(businessOfferings.products || []).slice(0, 3).map(p => p.name)
      ];
      uniqueValueProps = (businessOfferings.uniqueSellingPoints || []).slice(0, 4);
    }

    // Fallback to brand analysis if business offerings not available
    if (primaryOfferings.length === 0 && sources.brandAnalysis) {
      const profile = sources.brandAnalysis.brandVoiceProfile;
      primaryOfferings = (profile?.topicClusters || []).slice(0, 5);
      uniqueValueProps = (profile?.uniqueValueProps || []).slice(0, 4);
    }

    // Fallback to business type if no other data available
    if (primaryOfferings.length === 0 && businessType) {
      primaryOfferings = [businessType];
    }

    return {
      type: businessType || 'Service Business',
      primaryOfferings: primaryOfferings.slice(0, 6),
      uniqueValueProps: uniqueValueProps.slice(0, 4),
      targetAudience: targetAudience || 'General customers',
      location: location || undefined
    };
  }

  /**
   * Synthesize brand voice and communication style
   */
  private synthesizeBrandVoice(sources: ContextSources, weights: ContextWeighting): SynthesizedContext['brandVoice'] {
    const { brandAnalysis, culturalRequest } = sources;

    // Default brand voice if analysis not available
    const defaultBrandVoice = {
      primaryTone: 'professional',
      formalityLevel: 'professional',
      languageStyle: 'moderate complexity',
      keyPhrases: [],
      communicationPerspective: 'second-person',
      coreValues: ['quality', 'reliability', 'customer service']
    };

    if (!brandAnalysis) {
      return defaultBrandVoice;
    }

    const profile = brandAnalysis.brandVoiceProfile;

    // Adjust formality based on cultural request
    let formalityLevel = profile?.formalityLevel || 'professional';
    if (culturalRequest) {
      if (culturalRequest.formalityLevel === 'formal' && formalityLevel !== 'formal') {
        formalityLevel = 'formal';
      } else if (culturalRequest.formalityLevel === 'casual' && formalityLevel === 'formal') {
        formalityLevel = 'semi-formal';
      }
    }

    return {
      primaryTone: profile?.primaryTone || 'professional',
      formalityLevel,
      languageStyle: `${profile?.complexityLevel || 'moderate'} complexity with ${profile?.sentenceStructure || 'clear'} sentences`,
      keyPhrases: (profile?.keyPhrases || []).slice(0, 8),
      communicationPerspective: profile?.perspective || 'second-person',
      coreValues: (profile?.coreValues || []).slice(0, 5)
    };
  }

  /**
   * Synthesize competitive positioning strategy with enhanced competitor intelligence
   */
  private synthesizeCompetitiveStrategy(sources: ContextSources, weights: ContextWeighting): SynthesizedContext['competitiveStrategy'] {
    const { competitorIntelligence, brandAnalysis, contentAnalysis, competitorAdvantages, counterTopics } = sources;

    // Default competitive strategy if no intelligence available
    const defaultCompetitiveStrategy = {
      marketPositioning: ['Establish local expertise', 'Build trust through quality service'],
      competitiveAdvantages: ['Personalized service', 'Local knowledge'],
      contentGapsToTarget: ['Educational content about services', 'Local service area information'],
      strategicDifferentiation: ['Focus on customer relationships', 'Emphasize reliability'],
      marketOpportunities: ['Local search optimization', 'Community engagement'],
      competitorThreats: [],
      counterPositioning: [],
      comparisonOpportunities: []
    };

    if (!competitorIntelligence) {
      return defaultCompetitiveStrategy;
    }

    const { marketAnalysis, competitiveGaps, strategicRecommendations, swotAnalysis, competitorAdvantages: compAdvantages } = competitorIntelligence;

    // Extract competitor threats and counter positioning
    const competitorThreats: string[] = [];
    const counterPositioning: string[] = [];
    const comparisonOpportunities: string[] = [];

    // Process enhanced competitor advantages
    if (compAdvantages) {
      (compAdvantages.criticalThreats || []).forEach((threat: any) => {
        if (threat?.advantage) {
          competitorThreats.push(`${threat.advantage} (Critical: ${threat.type})`);
          if (threat.counterStrategy) {
            counterPositioning.push(threat.counterStrategy);
          }
        }
      });

      (compAdvantages.addressableAdvantages || []).forEach((advantage: any) => {
        if (advantage?.advantage) {
          comparisonOpportunities.push(`Address ${advantage.advantage} through value comparison`);
          if (advantage.counterStrategy) {
            counterPositioning.push(advantage.counterStrategy);
          }
        }
      });

      (compAdvantages.comparisonOpportunities || []).forEach((opportunity: any) => {
        if (opportunity?.advantage) {
          comparisonOpportunities.push(`Direct comparison: ${opportunity.advantage}`);
        }
      });
    }

    // Add generated counter-topics to positioning
    if (counterTopics && counterTopics.length > 0) {
      const uniqueCounterTopics = [...new Set(counterTopics.map((topic: any) => topic.reasoning).filter(Boolean))];
      counterPositioning.push(...uniqueCounterTopics.slice(0, 3));
    }

    return {
      marketPositioning: [
        ...(strategicRecommendations?.marketPositioning || []).slice(0, 2),
        ...(swotAnalysis?.strengths || []).slice(0, 1)
      ],
      competitiveAdvantages: [
        ...(strategicRecommendations?.differentiationTactics || []).slice(0, 2),
        ...(swotAnalysis?.opportunities || []).slice(0, 2)
      ],
      contentGapsToTarget: [
        ...(competitiveGaps?.contentGaps || []).slice(0, 3),
        ...(competitiveGaps?.serviceGaps || []).slice(0, 2)
      ],
      strategicDifferentiation: [
        ...(strategicRecommendations?.contentStrategy || []).slice(0, 2),
        `Target emerging trends: ${(marketAnalysis?.emergingTrends || []).slice(0, 2).join(', ')}`
      ],
      marketOpportunities: [
        `Market size: ${(marketAnalysis?.totalMarketSize || 0).toLocaleString()} monthly searches`,
        ...(marketAnalysis?.emergingTrends || []).slice(0, 2),
        ...(swotAnalysis?.opportunities || []).slice(0, 2)
      ],
      competitorThreats: competitorThreats.slice(0, 5), // Limit to top 5 threats
      counterPositioning: [...new Set(counterPositioning)].slice(0, 4), // Unique positioning strategies
      comparisonOpportunities: [...new Set(comparisonOpportunities)].slice(0, 4) // Unique comparison opportunities
    };
  }

  /**
   * Synthesize cultural and linguistic context with enhanced analysis
   */
  private synthesizeCulturalContext(sources: ContextSources, weights: ContextWeighting): SynthesizedContext['culturalContext'] {
    const { culturalPrompt, culturalRequest, culturalAnalysis, location, brandAnalysis, businessType, targetAudience } = sources;

    // Default cultural context if no adaptation available
    const defaultCulturalContext = {
      communicationStyle: 'Professional and direct',
      culturalNuances: ['Value clear communication', 'Respect for time'],
      languageGuidelines: ['Use standard professional language'],
      formalityRequirements: ['Maintain professional tone'],
      localReferences: [],
      avoidances: ['Avoid overly casual language', 'Steer clear of sensitive topics']
    };

    // Use enhanced cultural analysis if available
    if (culturalAnalysis) {
      return this.synthesizeEnhancedCulturalContext(culturalAnalysis, brandAnalysis);
    }

    // Fallback to basic cultural prompt processing
    if (!culturalPrompt) {
      return defaultCulturalContext;
    }

    // Extract cultural context from cultural prompt
    const culturalInstructions = culturalPrompt?.culturalInstructions || '';
    const instructionsLines = culturalInstructions.split('\n');

    const culturalContext: SynthesizedContext['culturalContext'] = {
      communicationStyle: instructionsLines[0] || 'Professional communication',
      culturalNuances: [
        instructionsLines[1] || 'Standard business communication',
        instructionsLines[2] || 'Respectful interaction'
      ].filter(Boolean),
      languageGuidelines: [culturalPrompt?.languageInstructions || 'Use clear, professional language'],
      formalityRequirements: [culturalPrompt?.formalityGuidelines || 'Maintain appropriate business formality'],
      localReferences: (culturalPrompt?.examples || []).slice(0, 3),
      avoidances: (culturalPrompt?.avoidances || []).slice(0, 5)
    };

    // Adjust cultural context based on brand voice
    if (brandAnalysis) {
      const brandTone = brandAnalysis.brandVoiceProfile?.primaryTone;
      if (brandTone === 'casual' || brandTone === 'friendly') {
        culturalContext.formalityRequirements = culturalContext.formalityRequirements.map(req =>
          req.replace('formal', 'approachable')
        );
      }
    }

    return culturalContext;
  }

  /**
   * Synthesize cultural context using enhanced cultural analysis
   */
  private synthesizeEnhancedCulturalContext(
    culturalAnalysis: CulturalAnalysisResult,
    brandAnalysis?: BrandAnalysisInsights
  ): SynthesizedContext['culturalContext'] {
    const {
      primaryCulture,
      culturalDepth,
      adaptationStrategy,
      linguisticFeatures,
      businessCultureAdaptation,
      contentLocalization,
      culturalSensitivity
    } = culturalAnalysis;

    // Build sophisticated cultural context from enhanced analysis
    let culturalContext: SynthesizedContext['culturalContext'] = {
      communicationStyle: this.buildCommunicationStyle(businessCultureAdaptation, linguisticFeatures),
      culturalNuances: this.extractCulturalNuances(culturalAnalysis, culturalSensitivity),
      languageGuidelines: this.buildLanguageGuidelines(linguisticFeatures, adaptationStrategy),
      formalityRequirements: this.buildFormalityRequirements(linguisticFeatures, businessCultureAdaptation),
      localReferences: this.extractLocalReferences(contentLocalization, primaryCulture),
      avoidances: [...culturalSensitivity.highRiskTopics, ...culturalSensitivity.culturalTaboos]
    };

    // Adjust based on brand voice analysis
    if (brandAnalysis) {
      culturalContext = this.adjustCulturalContextForBrand(culturalContext, brandAnalysis, culturalAnalysis);
    }

    return culturalContext;
  }

  /**
   * Build communication style from business culture adaptation
   */
  private buildCommunicationStyle(
    businessCultureAdaptation: CulturalAnalysisResult['businessCultureAdaptation'],
    linguisticFeatures: CulturalAnalysisResult['linguisticFeatures']
  ): string {
    const { communicationApproach, relationshipBuilding } = businessCultureAdaptation;
    const { storytellingElements } = linguisticFeatures;

    const directnessLevel = communicationApproach.directnessLevel >= 7 ? 'Direct' :
                           communicationApproach.directnessLevel >= 5 ? 'Semi-direct' : 'Indirect';

    const emotionalRange = communicationApproach.emotionalRange >= 7 ? 'high emotional expression' :
                          communicationApproach.emotionalRange >= 5 ? 'moderate emotional expression' : 'reserved expression';

    const storytellingPreference = storytellingElements.narrativeStructure.includes('storytelling') ?
      'with narrative elements and cultural storytelling' : 'with clear structured information';

    return `${directnessLevel} communication style with ${emotionalRange}, ${storytellingPreference}`;
  }

  /**
   * Extract cultural nuances from enhanced analysis
   */
  private extractCulturalNuances(
    culturalAnalysis: CulturalAnalysisResult,
    culturalSensitivity: CulturalAnalysisResult['culturalSensitivity']
  ): string[] {
    const nuances = [];

    // Add business culture insights
    if (culturalAnalysis?.businessCultureAdaptation?.relationshipBuilding?.timeInvestment) {
      nuances.push(`Relationship building: ${culturalAnalysis.businessCultureAdaptation.relationshipBuilding.timeInvestment}`);
    }
    if (culturalAnalysis?.businessCultureAdaptation?.decisionMaking?.speed) {
      nuances.push(`Decision-making speed: ${culturalAnalysis.businessCultureAdaptation.decisionMaking.speed}`);
    }
    if (culturalAnalysis?.businessCultureAdaptation?.trustBuilding?.keyFactors) {
      const keyFactors = culturalAnalysis.businessCultureAdaptation.trustBuilding.keyFactors.slice(0, 2).join(' and ');
      if (keyFactors) {
        nuances.push(`Trust emphasis: ${keyFactors}`);
      }
    }

    // Add linguistic features
    if (culturalAnalysis?.linguisticFeatures?.metaphorStyle?.preferredTypes) {
      const metaphorTypes = culturalAnalysis.linguisticFeatures.metaphorStyle.preferredTypes.slice(0, 2).join(' and ');
      if (metaphorTypes) {
        nuances.push(`Metaphor style: ${metaphorTypes}`);
      }
    }
    if (culturalAnalysis?.businessCultureAdaptation?.communicationApproach?.directnessLevel) {
      const directnessLevel = culturalAnalysis.businessCultureAdaptation.communicationApproach.directnessLevel;
      nuances.push(`Communication approach: ${directnessLevel >= 7 ? 'get straight to business' : 'build relationship first'}`);
    }

    // Add cultural sensitivity insights
    if (culturalSensitivity?.preferredFocus) {
      nuances.push(...culturalSensitivity.preferredFocus.slice(0, 2));
    }

    return nuances.slice(0, 6); // Limit to most important nuances
  }

  /**
   * Build language guidelines from linguistic features
   */
  private buildLanguageGuidelines(
    linguisticFeatures: CulturalAnalysisResult['linguisticFeatures'],
    adaptationStrategy: CulturalAnalysisResult['adaptationStrategy']
  ): string[] {
    const { slangIntegration, regionalExpressionUsage, metaphorStyle } = linguisticFeatures;

    const guidelines = [];

    guidelines.push(`Use ${adaptationStrategy} cultural adaptation strategy`);

    if (adaptationStrategy === 'immersive' || adaptationStrategy === 'deep') {
      guidelines.push(`Incorporate high-impact slang: ${slangIntegration.highImpact.map(s => s.slang).join(', ')}`);
      guidelines.push(`Use regional expressions: ${regionalExpressionUsage.recommended.map(r => r.term).slice(0, 3).join(', ')}`);
    } else if (adaptationStrategy === 'moderate') {
      guidelines.push(`Use moderate cultural expressions: ${slangIntegration.moderateUse.map(s => s.slang).slice(0, 2).join(', ')}`);
    } else {
      guidelines.push('Use standard professional language with minimal cultural elements');
    }

    guidelines.push(`Preferred metaphor types: ${metaphorStyle.preferredTypes.slice(0, 2).join(' and ')}`);

    return guidelines;
  }

  /**
   * Build formality requirements from cultural analysis
   */
  private buildFormalityRequirements(
    linguisticFeatures: CulturalAnalysisResult['linguisticFeatures'],
    businessCultureAdaptation: CulturalAnalysisResult['businessCultureAdaptation']
  ): string[] {
    const { formalityMapping } = linguisticFeatures;
    const { communicationApproach, relationshipBuilding } = businessCultureAdaptation;

    let formalityLevel = 'professional';

    if (communicationApproach.hierarchyRespect >= 8) {
      formalityLevel = 'formal';
    } else if (relationshipBuilding.personalConnection === 'high' || relationshipBuilding.personalConnection === 'essential') {
      formalityLevel = 'warmly professional';
    }

    const requirements = [];

    requirements.push(`${formalityLevel} tone`);

    if (formalityMapping.businessFormal.length > 0) {
      requirements.push(`Use formal expressions: ${formalityMapping.businessFormal.slice(0, 2).join(', ')}`);
    }

    if (relationshipBuilding.timeInvestment === 'essential') {
      requirements.push('Prioritize relationship building in communication');
    }

    if (communicationApproach.contextDependency >= 7) {
      requirements.push('Provide context and background information');
    }

    return requirements;
  }

  /**
   * Extract local references from content localization
   */
  private extractLocalReferences(
    contentLocalization: CulturalAnalysisResult['contentLocalization'],
    primaryCulture: CulturalAnalysisResult['primaryCulture']
  ): string[] {
    const { localReferences, culturalEvents, geographicSpecificity } = contentLocalization;

    const references = [
      ...localReferences.localPridePoints.slice(0, 2),
      ...localReferences.communityValues.slice(0, 2),
      ...geographicSpecificity.localTerminology.slice(0, 2),
      ...culturalEvents.majorCelebrations.slice(0, 1)
    ];

    return references.filter(ref => ref && ref.length > 0).slice(0, 5);
  }

  /**
   * Adjust cultural context based on brand voice
   */
  private adjustCulturalContextForBrand(
    culturalContext: SynthesizedContext['culturalContext'],
    brandAnalysis: BrandAnalysisInsights,
    culturalAnalysis: CulturalAnalysisResult
  ): SynthesizedContext['culturalContext'] {
    const brandTone = brandAnalysis.brandVoiceProfile.primaryTone;
    const brandFormality = brandAnalysis.brandVoiceProfile.formalityLevel;
    const culturalDepth = culturalAnalysis.culturalDepth;

    // Adjust communication style based on brand tone
    if (brandTone === 'casual' || brandTone === 'friendly') {
      culturalContext.communicationStyle = culturalContext.communicationStyle.replace('formal', 'approachable');
      culturalContext.formalityRequirements = culturalContext.formalityRequirements.map(req =>
        req.replace('formal', 'warmly professional')
      );
    } else if (brandTone === 'authoritative' && culturalDepth >= 4) {
      // For high cultural depth, maintain authority while respecting culture
      culturalContext.communicationStyle = culturalContext.communicationStyle.replace('Direct', 'Respectfully direct');
    }

    // Blend brand formality with cultural requirements
    if (brandFormality === 'very-casual' && culturalDepth >= 3) {
      culturalContext.formalityRequirements = culturalContext.formalityRequirements.map(req =>
        req.replace('professional', 'relational')
      );
    }

    return culturalContext;
  }

  /**
   * Synthesize strategic content requirements
   */
  private synthesizeContentStrategy(sources: ContextSources, weights: ContextWeighting): SynthesizedContext['contentStrategy'] {
    const { businessOfferings, competitorIntelligence, brandAnalysis, location, businessType, targetAudience } = sources;

    const topicPriorities: string[] = [];
    const contentAngles: string[] = [];
    const strategicKeywords: string[] = [];
    const serviceSpecificTopics: string[] = [];
    const locationSpecificTopics: string[] = [];

    // Service-specific topics from business offerings
    if (businessOfferings) {
      businessOfferings.services.forEach(service => {
        serviceSpecificTopics.push(`How to choose ${service.name.toLowerCase()} services`);
        serviceSpecificTopics.push(`${service.name} cost and pricing guide`);
        if (service.urgencyLevel === 'emergency') {
          serviceSpecificTopics.push(`Emergency ${service.name.toLowerCase()} - what to do`);
        }
        strategicKeywords.push(service.name.toLowerCase());
      });

      businessOfferings.products.forEach(product => {
        serviceSpecificTopics.push(`${product.name} vs alternatives comparison`);
        strategicKeywords.push(product.name.toLowerCase());
      });

      strategicKeywords.push(...businessOfferings.primaryCategories.map(cat => cat.toLowerCase()));
    }

    // Add enhanced competitor intelligence insights
    if (competitorIntelligence) {
      competitorIntelligence.competitiveGaps.contentGaps.forEach(gap => {
        topicPriorities.push(`Address competitor content gap: ${gap}`);
      });

      competitorIntelligence.competitiveGaps.keywordGaps.forEach(keywordGap => {
        topicPriorities.push(`Target competitor keyword gap: ${keywordGap}`);
      });

      competitorIntelligence.competitiveGaps.geographicGaps.forEach(geoGap => {
        topicPriorities.push(`Expand into competitor geographic gap: ${geoGap}`);
      });

      competitorIntelligence.strategicRecommendations.topicPriorities.forEach(priority => {
        topicPriorities.push(priority);
      });

      // Add competitor advantage-driven topics
      if (competitorIntelligence.competitorAdvantages) {
        competitorIntelligence.competitorAdvantages.criticalThreats.forEach((threat: any) => {
          topicPriorities.push(`Counter competitor advantage: ${threat.advantage}`);
        });

        competitorIntelligence.competitorAdvantages.addressableAdvantages.forEach((advantage: any) => {
          topicPriorities.push(`Address competitor advantage: ${advantage.advantage}`);
        });

        competitorIntelligence.competitorAdvantages.comparisonOpportunities.forEach((opportunity: any) => {
          topicPriorities.push(`Comparison opportunity: ${opportunity.advantage}`);
        });
      }

      // Add market leaders and threats
      if (competitorIntelligence.marketAnalysis) {
        competitorIntelligence.marketAnalysis.marketLeaders.forEach(leader => {
          topicPriorities.push(`Compete with market leader: ${leader}`);
        });

        competitorIntelligence.marketAnalysis.emergingTrends.forEach(trend => {
          topicPriorities.push(`Capitalize on emerging trend: ${trend}`);
        });
      }
    }

    // Add brand voice influenced content angles
    if (brandAnalysis) {
      const tone = brandAnalysis.brandVoiceProfile.primaryTone;
      if (tone === 'professional') {
        contentAngles.push('Industry expertise and authority');
        contentAngles.push('Technical knowledge and best practices');
      } else if (tone === 'friendly') {
        contentAngles.push('Customer relationships and trust');
        contentAngles.push('Community-focused solutions');
      } else if (tone === 'authoritative') {
        contentAngles.push('Thought leadership and innovation');
        contentAngles.push('Market insights and trends');
      }
    }

    // Location-specific topics
    if (location) {
      locationSpecificTopics.push(`${businessType || 'Service'} in ${location}: Complete guide`);
      locationSpecificTopics.push(`Best ${businessType || 'services'} near ${location}`);
      locationSpecificTopics.push(`${location} local regulations and requirements`);
      strategicKeywords.push(location.toLowerCase());
    }

    // Target audience influenced content
    if (targetAudience) {
      contentAngles.push(`Specific challenges for ${targetAudience}`);
      strategicKeywords.push(targetAudience.toLowerCase());
    }

    // Ensure we have basic content strategy if no specific data available
    if (topicPriorities.length === 0) {
      topicPriorities.push('Educational content about services', 'Local service area information', 'Cost and pricing transparency');
    }

    if (contentAngles.length === 0) {
      contentAngles.push('Problem-solving approach', 'Value-driven messaging', 'Customer benefit focus');
    }

    if (strategicKeywords.length === 0) {
      strategicKeywords.push('quality', 'professional', 'reliable', 'local');
    }

    return {
      topicPriorities: topicPriorities.slice(0, 6),
      contentAngles: contentAngles.slice(0, 5),
      strategicKeywords: [...new Set(strategicKeywords)].slice(0, 8),
      serviceSpecificTopics: serviceSpecificTopics.slice(0, 5),
      locationSpecificTopics: locationSpecificTopics.slice(0, 4)
    };
  }

  /**
   * Assess context quality and completeness
   */
  private assessContextQuality(sources: ContextSources): SynthesizedContext['contextQuality'] {
    const availableSources: string[] = [];
    let completenessScore = 0;
    const conflicts: string[] = [];
    const recommendations: string[] = [];

    // Check available data sources
    if (sources.websiteAnalysis) {
      availableSources.push('website analysis');
      completenessScore += 25;
    }
    if (sources.brandAnalysis) {
      availableSources.push('brand voice analysis');
      completenessScore += 20;
    }
    if (sources.competitorIntelligence) {
      availableSources.push('competitor intelligence');
      completenessScore += 20;
    }
    if (sources.businessOfferings) {
      availableSources.push('business offerings');
      completenessScore += 15;
    }
    if (sources.culturalPrompt) {
      availableSources.push('cultural adaptation');
      completenessScore += 10;
    }
    if (sources.location) {
      availableSources.push('location data');
      completenessScore += 5;
    }
    if (sources.contentAnalysis) {
      availableSources.push('content analysis');
      completenessScore += 5;
    }

    // Check for conflicts
    if (sources.brandAnalysis && sources.culturalRequest) {
      const brandFormality = sources.brandAnalysis.brandVoiceProfile.formalityLevel;
      const culturalFormality = sources.culturalRequest.formalityLevel;

      if ((brandFormality === 'formal' && culturalFormality === 'casual') ||
          (brandFormality === 'very-casual' && culturalFormality === 'formal')) {
        conflicts.push('Brand formality conflicts with cultural preferences');
        recommendations.push('Balance brand voice with cultural communication preferences');
      }
    }

    // Generate recommendations based on missing data
    if (!sources.websiteAnalysis) {
      recommendations.push('Add website URL for comprehensive brand and content analysis');
    }
    if (!sources.competitorIntelligence && sources.businessOfferings) {
      recommendations.push('Add competitor URLs for strategic positioning insights');
    }
    if (!sources.location) {
      recommendations.push('Specify location for local SEO optimization');
    }

    const confidence = Math.min(100, completenessScore - (conflicts.length * 10));

    return {
      completeness: Math.min(100, completenessScore),
      confidence: Math.max(0, confidence),
      dataSources: availableSources,
      conflicts,
      recommendations
    };
  }

  /**
   * Generate strategic instructions for AI based on synthesized context
   */
  private generateStrategicInstructions(
    businessIdentity: SynthesizedContext['businessIdentity'],
    brandVoice: SynthesizedContext['brandVoice'],
    competitiveStrategy: SynthesizedContext['competitiveStrategy'],
    culturalContext: SynthesizedContext['culturalContext'],
    contentStrategy: SynthesizedContext['contentStrategy']
  ): SynthesizedContext['strategicInstructions'] {
    return {
      topicGeneration: [
        `Generate topics specifically for ${businessIdentity.type} business serving ${businessIdentity.targetAudience}`,
        `Focus on these primary offerings: ${businessIdentity.primaryOfferings.join(', ')}`,
        `Emphasize these unique value propositions: ${businessIdentity.uniqueValueProps.join(', ')}`,
        `Prioritize topics that address these content gaps: ${competitiveStrategy.contentGapsToTarget.slice(0, 3).join(', ')}`,
        `Include location-specific topics: ${contentStrategy.locationSpecificTopics.slice(0, 2).join(', ')}`
      ],
      contentCreation: [
        `Write in ${brandVoice.primaryTone} tone with ${brandVoice.formalityLevel} language`,
        `Use these key brand phrases naturally: ${brandVoice.keyPhrases.slice(0, 4).join(', ')}`,
        `Adopt ${brandVoice.communicationPerspective} perspective throughout content`,
        `Reflect these core values: ${brandVoice.coreValues.slice(0, 3).join(', ')}`,
        `Structure content with ${brandVoice.languageStyle}`
      ],
      competitivePositioning: [
        `Highlight these competitive advantages: ${competitiveStrategy.competitiveAdvantages.slice(0, 3).join(', ')}`,
        `Target these market opportunities: ${competitiveStrategy.marketOpportunities.slice(0, 3).join(', ')}`,
        `Create differentiation through: ${competitiveStrategy.strategicDifferentiation.slice(0, 2).join(', ')}`,
        `Position against market: ${competitiveStrategy.marketPositioning.slice(0, 2).join(', ')}`
      ],
      culturalAdaptation: [
        `Follow communication style: ${culturalContext.communicationStyle}`,
        `Incorporate these cultural nuances: ${culturalContext.culturalNuances.slice(0, 2).join(', ')}`,
        `Use language guidelines: ${culturalContext.languageGuidelines.join('; ')}`,
        `Meet formality requirements: ${culturalContext.formalityRequirements.join('; ')}`,
        `Include local references: ${culturalContext.localReferences.slice(0, 2).join(', ')}`
      ],
      brandConsistency: [
        `Maintain consistent ${brandVoice.primaryTone} voice throughout`,
        `Use strategic keywords: ${contentStrategy.strategicKeywords.slice(0, 5).join(', ')}`,
        `Focus on content angles: ${contentStrategy.contentAngles.slice(0, 3).join(', ')}`,
        `Address topic priorities: ${contentStrategy.topicPriorities.slice(0, 3).join(', ')}`,
        `Avoid these culturally inappropriate elements: ${culturalContext.avoidances.slice(0, 3).join(', ')}`
      ],
      competitorCountering: [
        `Address these competitor threats: ${competitiveStrategy.competitorThreats.slice(0, 3).join(', ')}`,
        `Implement counter-positioning: ${competitiveStrategy.counterPositioning.slice(0, 3).join(', ')}`,
        `Create comparison content for: ${competitiveStrategy.comparisonOpportunities.slice(0, 3).join(', ')}`,
        `Generate counter-topics that challenge competitor advantages`,
        `Focus on value proposition over competitor strengths`
      ],
      differentiationFocus: [
        `Emphasize unique differentiators in every topic`,
        `Create topics that highlight superior value proposition`,
        `Address competitor advantages by showing alternative benefits`,
        `Focus on quality, expertise, and customer service advantages`,
        `Develop thought leadership content that establishes authority`
      ]
    };
  }

  /**
   * Generate enhanced system prompt from synthesized context
   */
  generateEnhancedSystemPrompt(context: SynthesizedContext): string {
    const { businessIdentity, brandVoice, competitiveStrategy, culturalContext, contentStrategy, strategicInstructions, userPreferences } = context;

    const localReferenceSnippet = culturalContext.localReferences.length > 0
      ? culturalContext.localReferences.slice(0, 3).join(', ')
      : 'Incorporate recognizable neighborhood, city, or regional references that match the audience context';

    const competitorAdvantageSnippet = competitiveStrategy.competitiveAdvantages.length > 0
      ? competitiveStrategy.competitiveAdvantages.slice(0, 3).join(', ')
      : 'Service reliability, customer trust, and rapid response times';

    const competitorThreatSnippet = competitiveStrategy.competitorThreats.length > 0
      ? competitiveStrategy.competitorThreats.slice(0, 3).join(', ')
      : 'Generic competitor messaging, aggressive pricing, and national chains';

    const marketOpportunitySnippet = competitiveStrategy.marketOpportunities.length > 0
      ? competitiveStrategy.marketOpportunities.slice(0, 3).join(', ')
      : 'Seasonal demand spikes, underserved neighborhoods, and premium service bundles';

    const locationSpecificFocus = contentStrategy.locationSpecificTopics.length > 0
      ? contentStrategy.locationSpecificTopics.slice(0, 3).join(', ')
      : 'Neighborhood-level service pages, local events sponsorships, regulatory checklists';

    const localSearchBehaviors = contentStrategy.contentAngles.length > 0
      ? contentStrategy.contentAngles.slice(0, 3).join(', ')
      : '"near me" phrases, "open now" urgency, "best in" comparisons';

    const geographicGuidance = businessIdentity.location
      ? `REGIONAL & LOCAL STRATEGY:
- Primary market focus: ${businessIdentity.location}
- Use authentic local references such as ${localReferenceSnippet}
- Reasoning must explain how each topic serves customers in ${businessIdentity.location} while signalling scalability to nearby markets
- Include 1-2 broader or global trend topics that tie back to ${businessIdentity.location} insights
- Surface hyperlocal coverage by spotlighting specific neighborhoods, service corridors, or ZIP codes`
      : `GEOGRAPHIC STRATEGY:
- No single market provided; craft topics with national or global relevance using cultural cues when available
- Highlight how topics can localize across regions in the reasoning when context is available
- Provide at least one topic that explicitly calls out a regional adaptation or localization play`; 

    const competitorSignals = `MARKET & COMPETITOR SIGNALS:
- Competitive advantages to emphasize: ${competitorAdvantageSnippet}
- Competitor threats to counter: ${competitorThreatSnippet}
- Market opportunities to capture: ${marketOpportunitySnippet}
- Counter-positioning themes: ${competitiveStrategy.counterPositioning.slice(0, 3).join(', ') || 'Premium positioning, white-glove service, bundled offerings'}`;

    const localDominance = `LOCAL DOMINANCE DIRECTIVES:
- Concentrate on priority local focus areas such as ${locationSpecificFocus}
- Treat every topic as an opportunity to win local "near me" and service-area searches
- Weave in micro-market references such as neighborhoods, districts, suburbs, or commute hubs
- Reference local proof points (reviews, community partnerships, local awards, regulatory compliance)
- Align suggestions with local SERP features like Google Business Profile updates, map pack optimization, and localized landing pages
- Build authority through community guides, event tie-ins, and collaboration topics relevant to ${businessIdentity.location || 'the service area'}
- Optimize for dominant local search behaviors such as ${localSearchBehaviors}`;

    const userPreferenceDirectives = `USER PREFERENCE ALIGNMENT:
- Requested tone: ${userPreferences.desiredTone} (brand baseline: ${userPreferences.brandToneReference})
- Language preference: ${userPreferences.languagePreference}
- Formality preference: ${userPreferences.formalityPreference}
- Content purpose: ${userPreferences.contentPurpose}
${userPreferences.additionalContext ? `- Additional campaign notes: ${userPreferences.additionalContext}` : '- Additional campaign notes: None provided; infer from context sources'}
${userPreferences.competitorUrls.length > 0 ? `- Direct competitor URLs provided: ${userPreferences.competitorUrls.join(', ')}` : '- No direct competitor URLs supplied; lean on crawled intelligence'}
- Blend requested tone with verified brand voice without losing authenticity
- Ensure final topics can translate into copy that meets the stated purpose and tone`;

    let prompt = `You are an expert SEO content strategist specializing in highly personalized topic generation for local service businesses.

CONTEXT-AWARE STRATEGIC DIRECTIVES:

BUSINESS IDENTITY:
- Type: ${businessIdentity.type}
- Primary Offerings: ${businessIdentity.primaryOfferings.join(', ')}
- Unique Value Props: ${businessIdentity.uniqueValueProps.join(', ')}
- Target Audience: ${businessIdentity.targetAudience}
${businessIdentity.location ? `- Location: ${businessIdentity.location}` : ''}

BRAND VOICE REQUIREMENTS:
- Primary Tone: ${brandVoice.primaryTone}
- Formality Level: ${brandVoice.formalityLevel}
- Language Style: ${brandVoice.languageStyle}
- Communication Perspective: ${brandVoice.communicationPerspective}
- Key Phrases: ${brandVoice.keyPhrases.join(', ')}
- Core Values: ${brandVoice.coreValues.join(', ')}

COMPETITIVE POSITIONING STRATEGY:
- Market Positioning: ${competitiveStrategy.marketPositioning.join(', ')}
- Competitive Advantages: ${competitiveStrategy.competitiveAdvantages.join(', ')}
- Strategic Differentiation: ${competitiveStrategy.strategicDifferentiation.join(', ')}
- Market Opportunities: ${competitiveStrategy.marketOpportunities.join(', ')}
- Competitor Threats: ${competitiveStrategy.competitorThreats.join(', ')}
- Counter-Positioning: ${competitiveStrategy.counterPositioning.join(', ')}
- Comparison Opportunities: ${competitiveStrategy.comparisonOpportunities.join(', ')}

CULTURAL ADAPTATION:
- Communication Style: ${culturalContext.communicationStyle}
- Language Guidelines: ${culturalContext.languageGuidelines.join('; ')}
- Formality Requirements: ${culturalContext.formalityRequirements.join('; ')}
- Cultural Nuances: ${culturalContext.culturalNuances.join(', ')}
- Local References: ${culturalContext.localReferences.join(', ')}

STRATEGIC TOPIC GENERATION REQUIREMENTS:
${strategicInstructions.topicGeneration.map(instruction => `- ${instruction}`).join('\n')}

CONTENT CREATION STANDARDS:
${strategicInstructions.contentCreation.map(instruction => `- ${instruction}`).join('\n')}

COMPETITIVE POSITIONING REQUIREMENTS:
${strategicInstructions.competitivePositioning.map(instruction => `- ${instruction}`).join('\n')}

CULTURAL ADAPTATION REQUIREMENTS:
${strategicInstructions.culturalAdaptation.map(instruction => `- ${instruction}`).join('\n')}

${geographicGuidance}

${competitorSignals}

${userPreferenceDirectives}

${localDominance}

BRAND CONSISTENCY MANDATES:
${strategicInstructions.brandConsistency.map(instruction => `- ${instruction}`).join('\n')}

COMPETITOR COUNTERING STRATEGY:
${strategicInstructions.competitorCountering.map(instruction => `- ${instruction}`).join('\n')}

DIFFERENTIATION FOCUS:
${strategicInstructions.differentiationFocus.map(instruction => `- ${instruction}`).join('\n')}

CRITICAL GENERATION RULES:
- Generate 10-15 highly specific topics directly related to the business's actual offerings
- Each topic must connect to at least one primary offering and address a specific customer need
- Reasoning must reference specific competitive advantages, market opportunities, or cultural context
- CRITICAL: Include topics that directly address competitor threats and positioning advantages
- Balance hyper-local, regional, and broader/global relevance based on the provided context; when a location is present, include at least 2 globally adaptable topics anchored in local insight
- Ensure at least 3 topics focus on micro-local intent (neighborhoods, ZIP codes, local landmarks) and at least 1 focuses on reputation-building (reviews, testimonials, partnerships)
- Generate comparison topics that highlight unique value propositions against competitors
- Create counter-topics that challenge competitor strengths with alternative perspectives
- Sources: website_gap, competitor_advantage, content_opportunity, market_opportunity, competitive_gap, strategic_positioning, competitor_counter, differentiation_focus
- Format: "Topic Title | Specific Reasoning | Source"
- Topics must be complete sentences ending with proper punctuation
- Focus on practical, searchable topics that customers actually use
- Include topics that position the business favorably against known competitor advantages
- Clearly label in reasoning whether each topic targets "hyperlocal", "service-area", or "regional/global" intent

COMPETITOR-INTELLIGENT TOPIC REQUIREMENTS:
- Generate at least 3-4 topics that directly counter competitor advantages
- Include 2-3 comparison topics that address competitor strengths with alternative benefits
- Create topics that target identified competitor gaps (content, keyword, or geographic)
- Ensure topics address competitive threats with strategic positioning
- Generate topics that leverage emerging market opportunities before competitors capitalize

TOPIC TITLE QUALITY STANDARDS:
- Titles must be clear, actionable business topics (NOT technical identifiers)
- Do NOT include source identifiers like "competitor_advantage" or numbers in titles
- Each title should be a complete sentence that customers would actually search for
- Focus on customer problems, solutions, and benefits rather than internal business metrics
- Make topics sound like they were written by a business owner who understands customer needs`;

    return prompt;
  }

  /**
   * Generate enhanced user prompt from synthesized context
   */
  generateEnhancedUserPrompt(
    baseTopic: string,
    context: SynthesizedContext,
    seasonalTopics?: string[]
  ): string {
    const { businessIdentity, contentStrategy, competitiveStrategy, culturalContext, userPreferences } = context;

    const competitorAdvantages = competitiveStrategy.competitiveAdvantages.length > 0
      ? competitiveStrategy.competitiveAdvantages.slice(0, 3).join(', ')
      : 'Quality of service, customer trust, and rapid support';

    const competitorThreats = competitiveStrategy.competitorThreats.length > 0
      ? competitiveStrategy.competitorThreats.slice(0, 3).join(', ')
      : 'Generic marketplace competition and price-driven rivals';

    const comparisonOpportunities = competitiveStrategy.comparisonOpportunities.length > 0
      ? competitiveStrategy.comparisonOpportunities.slice(0, 3).join(', ')
      : 'Service packages, expertise depth, response time guarantees';

    const localTouchpoints = culturalContext.localReferences.length > 0
      ? culturalContext.localReferences.slice(0, 3).join(', ')
      : 'Landmarks, neighborhoods, and community events relevant to the audience';

    const locationSpecificFocus = contentStrategy.locationSpecificTopics.length > 0
      ? contentStrategy.locationSpecificTopics.slice(0, 3).join(', ')
      : 'Neighborhood landing pages, service area checklists, local compliance updates';

    const localSerpFocus = businessIdentity.location
      ? `Focus Areas: ${locationSpecificFocus}
Local SERP Targets: Google Business Profile updates, local landing pages, community guides, localized FAQs
Voice & "near me" Signals: ${localTouchpoints}
Local Proof Assets: Reviews, case studies, regional certifications`
      : `Focus Areas: Adaptable playbooks for top service regions, community partnerships, regulatory explainers
Local SERP Targets: Map pack entries, location-based blog clusters, franchise/location hub pages
Voice & "near me" Signals: ${localTouchpoints}
Local Proof Assets: Customer stories from priority regions, multi-location case studies, localized statistics`;

    const localImpactChecklist = `LOCAL IMPACT CHECKLIST:
- Prioritize hyperlocal variations (neighborhoods, ZIP codes, landmarks) alongside city-wide coverage
- Include at least one topic for local reputation building (reviews, testimonials, community involvement)
- Suggest ideas for seasonal or event-driven content relevant to ${businessIdentity.location || 'the local market'}
- Highlight how topics support map pack dominance, citation consistency, or Google Business Profile engagement
- Note when guidance scales to surrounding suburbs or regional audiences`;

    const userPreferenceChecklist = `USER INPUT DIRECTIVES:
- Requested Tone: ${userPreferences.desiredTone}
- Language Preference: ${userPreferences.languagePreference}
- Formality Preference: ${userPreferences.formalityPreference}
- Content Purpose: ${userPreferences.contentPurpose}
${userPreferences.additionalContext ? `- Campaign Notes: ${userPreferences.additionalContext}` : '- Campaign Notes: None provided; infer from context insights'}
${userPreferences.competitorUrls.length > 0 ? `- Competitors to monitor: ${userPreferences.competitorUrls.join(', ')}` : '- Competitors to monitor: Use crawled intelligence to infer threats'}
- Ensure every recommended topic can translate into content that matches tone & purpose instantly`;

    let prompt = `GENERATION REQUEST:
Base Topic: ${baseTopic}
Business: ${businessIdentity.type}
Target Audience: ${businessIdentity.targetAudience}
${businessIdentity.location ? `Location: ${businessIdentity.location}` : ''}

STRATEGIC CONTENT FOCUS:
Topic Priorities: ${contentStrategy.topicPriorities.join(', ')}
Content Angles: ${contentStrategy.contentAngles.join(', ')}
Strategic Keywords: ${contentStrategy.strategicKeywords.join(', ')}

SERVICE-SPECIFIC TOPICS TO CONSIDER:
${contentStrategy.serviceSpecificTopics.slice(0, 3).map(topic => `- ${topic}`).join('\n')}`;

    if (contentStrategy.locationSpecificTopics.length > 0) {
      prompt += `

LOCATION-SPECIFIC TOPICS:
${contentStrategy.locationSpecificTopics.map(topic => `- ${topic}`).join('\n')}`;
    }

    const regionalGuidance = businessIdentity.location
      ? `Primary Region: ${businessIdentity.location}
Localization Touchpoints: ${localTouchpoints}
Regional Scaling: Tie at least 2 topics to broader regional or national trends that reinforce ${businessIdentity.location}'s insights`
      : `Primary Region: Global or multi-market
Localization Playbook: Use cultural cues and local references when available to show adaptability
Regional Scaling: Include at least one topic that demonstrates how to localize the strategy for a priority market`;

    prompt += `

REGIONAL & GLOBAL DIRECTIVES:
${regionalGuidance}`;

    prompt += `

LOCAL SEARCH INTELLIGENCE:
${localSerpFocus}

${localImpactChecklist}`;

    prompt += `

USER PREFERENCE ALIGNMENT:
${userPreferenceChecklist}`;

    prompt += `

COMPETITIVE PRIORITIES:
- Leverage strengths: ${competitorAdvantages}
- Counter threats: ${competitorThreats}
- Comparison angles to emphasize: ${comparisonOpportunities}
- Differentiation levers: ${competitiveStrategy.strategicDifferentiation.slice(0, 3).join(', ') || 'Premium service experience and expertise-led guidance'}`;

    if (seasonalTopics && seasonalTopics.length > 0) {
      prompt += `

SEASONAL FOCUS:
${seasonalTopics.slice(0, 3).join(', ')}`;
    }

    prompt += `

Generate strategic SEO topics now using the comprehensive context provided in the system prompt. Start with "1."`;

    return prompt;
  }
}

// Singleton instance
export const contextSynthesizer = new ContextSynthesizer();

// Export helper functions
export function synthesizeContext(
  sources: ContextSources,
  customWeights?: Partial<ContextWeighting>
): SynthesizedContext {
  return contextSynthesizer.synthesizeContext(sources, customWeights);
}

export function generateEnhancedPrompts(
  baseTopic: string,
  sources: ContextSources,
  seasonalTopics?: string[],
  customWeights?: Partial<ContextWeighting>
): { systemPrompt: string; userPrompt: string; context: SynthesizedContext } {
  const context = synthesizeContext(sources, customWeights);
  const systemPrompt = contextSynthesizer.generateEnhancedSystemPrompt(context);
  const userPrompt = contextSynthesizer.generateEnhancedUserPrompt(baseTopic, context, seasonalTopics);

  return { systemPrompt, userPrompt, context };
}
