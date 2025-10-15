/**
 * Advanced Competitor Intelligence System
 * Provides comprehensive competitor analysis for strategic content differentiation
 */

import { WebsiteAnalysisResult } from './website-crawler';
import { analyzeBrandVoice, type BrandAnalysisInsights } from './brand-voice-analyzer';
import { extractBusinessOfferings, type BusinessOfferings } from './service-extractor';

export interface CompetitorAnalysis {
  competitorInfo: {
    domain: string;
    name: string;
    description: string;
    estimatedTraffic: number;
    authorityScore: number;
  };
  contentStrategy: {
    topicClusters: string[];
    contentGaps: string[];
    contentStrengths: string[];
    contentFrequency: 'high' | 'medium' | 'low';
    avgContentLength: number;
    contentTone: string;
  };
  seoPerformance: {
    rankingKeywords: number;
    topRankingTopics: string[];
    keywordGaps: string[];
    backlinkProfile: 'strong' | 'moderate' | 'weak';
    technicalSEO: 'excellent' | 'good' | 'fair' | 'poor';
  };
  marketPosition: {
    uniqueValueProps: string[];
    differentiators: string[];
    targetAudience: string[];
    pricingPosition: 'premium' | 'mid-range' | 'budget';
    serviceAreas: string[];
  };
  contentOpportunities: {
    underservedTopics: string[];
    seasonalOpportunities: string[];
    localIntentGaps: string[];
    questionBasedContent: string[];
    comparisonOpportunities: string[];
  };
  strategicInsights: {
    competitiveAdvantages: string[];
    weaknesses: string[];
    marketOpportunities: string[];
    threats: string[];
  };
}

export interface CompetitiveAdvantage {
  type: 'service_quality' | 'pricing' | 'expertise' | 'coverage' | 'technology' | 'customer_service' | 'brand_recognition' | 'speed' | 'convenience';
  advantage: string;
  evidence: string[];
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  targetable: boolean; // Can we create content to address this advantage
  counterStrategy: string;
}

export interface CompetitorAnalysis {
  competitorInfo: {
    domain: string;
    name: string;
    description: string;
    estimatedTraffic: number;
    authorityScore: number;
  };
  contentStrategy: {
    topicClusters: string[];
    contentGaps: string[];
    contentStrengths: string[];
    contentFrequency: 'high' | 'medium' | 'low';
    avgContentLength: number;
    contentTone: string;
  };
  seoPerformance: {
    rankingKeywords: number;
    topRankingTopics: string[];
    keywordGaps: string[];
    backlinkProfile: 'strong' | 'moderate' | 'weak';
    technicalSEO: 'excellent' | 'good' | 'fair' | 'poor';
  };
  marketPosition: {
    uniqueValueProps: string[];
    differentiators: string[];
    targetAudience: string[];
    pricingPosition: 'premium' | 'mid-range' | 'budget';
    serviceAreas: string[];
  };
  contentOpportunities: {
    underservedTopics: string[];
    seasonalOpportunities: string[];
    localIntentGaps: string[];
    questionBasedContent: string[];
    comparisonOpportunities: string[];
  };
  strategicInsights: {
    competitiveAdvantages: string[];
    weaknesses: string[];
    marketOpportunities: string[];
    threats: string[];
  };
  advantages: CompetitiveAdvantage[]; // New detailed advantages analysis
}

export interface CompetitiveIntelligenceReport {
  primaryCompetitors: CompetitorAnalysis[];
  marketAnalysis: {
    totalMarketSize: number;
    marketLeaders: string[];
    emergingTrends: string[];
    seasonalPatterns: string[];
    localMarketDynamics: string[];
  };
  competitiveGaps: {
    contentGaps: string[];
    serviceGaps: string[];
    keywordGaps: string[];
    geographicGaps: string[];
  };
  strategicRecommendations: {
    contentStrategy: string[];
    topicPriorities: string[];
    differentiationTactics: string[];
    marketPositioning: string[];
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitorAdvantages: {
    criticalThreats: CompetitiveAdvantage[];
    addressableAdvantages: CompetitiveAdvantage[];
    strategicCounters: CompetitiveAdvantage[];
    comparisonOpportunities: CompetitiveAdvantage[];
  };
}

export class CompetitorIntelligenceAnalyzer {
  private industryKeywords = {
    'plumbing': ['plumber', 'plumbing', 'pipe', 'drain', 'leak', 'fixture', 'water heater', 'sewer'],
    'hvac': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace', 'ac repair', 'ventilation'],
    'electrical': ['electrician', 'electrical', 'wiring', 'circuit', 'panel', 'outlet', 'lighting'],
    'cleaning': ['cleaning', 'maid', 'janitorial', 'housekeeping', 'commercial cleaning', 'residential'],
    'landscaping': ['landscaping', 'lawn care', 'gardening', 'landscape design', 'yard maintenance'],
    'roofing': ['roofing', 'roofer', 'roof repair', 'roof replacement', 'shingles', 'gutters'],
    'painting': ['painting', 'painter', 'interior painting', 'exterior painting', 'commercial painting'],
    'pest-control': ['pest control', 'exterminator', 'pest removal', 'termite', 'rodent', 'insects']
  };

  async analyzeCompetitors(
    businessWebsite: WebsiteAnalysisResult,
    competitorWebsites: WebsiteAnalysisResult[],
    industryContext?: string,
    location?: string
  ): Promise<CompetitiveIntelligenceReport> {
    console.log('🏁 [COMPETITOR INTELLIGENCE] Starting comprehensive competitor analysis');

    // Analyze each competitor
    const primaryCompetitors = await Promise.all(
      competitorWebsites.map(competitorSite =>
        this.analyzeSingleCompetitor(competitorSite, businessWebsite, industryContext)
      )
    );

    // Analyze overall market
    const marketAnalysis = this.analyzeMarket(primaryCompetitors, industryContext, location);

    // Identify competitive gaps
    const competitiveGaps = this.identifyCompetitiveGaps(businessWebsite, primaryCompetitors);

    // Generate strategic recommendations
    const strategicRecommendations = this.generateStrategicRecommendations(
      businessWebsite,
      primaryCompetitors,
      competitiveGaps
    );

    // Create SWOT analysis
    const swotAnalysis = this.createSWOTAnalysis(businessWebsite, primaryCompetitors, marketAnalysis);

    // Analyze competitor advantages for strategic positioning
    const competitorAdvantages = this.analyzeCompetitorAdvantagesStrategic(primaryCompetitors, businessWebsite);

    console.log('✅ [COMPETITOR INTELLIGENCE] Analysis completed', {
      competitorsAnalyzed: primaryCompetitors.length,
      marketSize: marketAnalysis.totalMarketSize,
      contentGaps: competitiveGaps.contentGaps.length,
      strategicRecommendations: strategicRecommendations.contentStrategy.length,
      competitorAdvantages: competitorAdvantages.criticalThreats.length,
      addressableOpportunities: competitorAdvantages.addressableAdvantages.length
    });

    return {
      primaryCompetitors,
      marketAnalysis,
      competitiveGaps,
      strategicRecommendations,
      swotAnalysis,
      competitorAdvantages
    };
  }

  private async analyzeSingleCompetitor(
    competitorSite: WebsiteAnalysisResult,
    businessSite: WebsiteAnalysisResult,
    industryContext?: string
  ): Promise<CompetitorAnalysis> {
    // Extract business offerings for competitor
    const competitorOfferings = extractBusinessOfferings(competitorSite);
    const businessOfferings = extractBusinessOfferings(businessSite);

    // Analyze competitor brand voice
    const competitorBrandVoice = analyzeBrandVoice(competitorSite);

    // Analyze competitor advantages in detail
    const advantages = await this.analyzeCompetitorAdvantages(competitorSite, businessSite, competitorOfferings, businessOfferings);

    return {
      competitorInfo: this.analyzeCompetitorInfo(competitorSite),
      contentStrategy: this.analyzeContentStrategy(competitorSite, competitorBrandVoice),
      seoPerformance: this.analyzeSEOPerformance(competitorSite, businessSite),
      marketPosition: this.analyzeMarketPosition(competitorOfferings, competitorBrandVoice),
      contentOpportunities: this.identifyContentOpportunities(competitorSite, businessSite, competitorOfferings),
      strategicInsights: this.generateStrategicInsights(competitorSite, businessSite, competitorOfferings),
      advantages
    };
  }

  private analyzeCompetitorInfo(website: WebsiteAnalysisResult) {
    return {
      domain: website.domain,
      name: this.extractCompanyName(website),
      description: this.extractCompanyDescription(website),
      estimatedTraffic: this.estimateTraffic(website),
      authorityScore: this.calculateAuthorityScore(website)
    };
  }

  private analyzeContentStrategy(website: WebsiteAnalysisResult, brandVoice: BrandAnalysisInsights) {
    const topics = website.topics || [];
    const allContent = website.crawledPages.map(page => page.content).join(' ');

    return {
      topicClusters: this.identifyTopicClusters(topics),
      contentGaps: this.identifyContentGaps(website),
      contentStrengths: this.identifyContentStrengths(topics, allContent),
      contentFrequency: this.assessContentFrequency(website.crawledPages.length),
      avgContentLength: this.calculateAvgContentLength(website.crawledPages),
      contentTone: brandVoice.brandVoiceProfile.primaryTone
    };
  }

  private analyzeSEOPerformance(competitorSite: WebsiteAnalysisResult, businessSite: WebsiteAnalysisResult) {
    const competitorKeywords = this.extractKeywords(competitorSite);
    const businessKeywords = this.extractKeywords(businessSite);

    return {
      rankingKeywords: competitorKeywords.length,
      topRankingTopics: this.identifyTopRankingTopics(competitorKeywords),
      keywordGaps: this.identifyKeywordGaps(businessKeywords, competitorKeywords),
      backlinkProfile: this.assessBacklinkProfile(competitorSite),
      technicalSEO: this.assessTechnicalSEO(competitorSite)
    };
  }

  private analyzeMarketPosition(offerings: BusinessOfferings, brandVoice: BrandAnalysisInsights) {
    return {
      uniqueValueProps: offerings.uniqueSellingPoints,
      differentiators: this.identifyDifferentiators(offerings, brandVoice),
      targetAudience: offerings.targetAudiences,
      pricingPosition: this.assessPricingPosition(offerings),
      serviceAreas: offerings.serviceAreas
    };
  }

  private identifyContentOpportunities(
    competitorSite: WebsiteAnalysisResult,
    businessSite: WebsiteAnalysisResult,
    offerings: BusinessOfferings
  ) {
    const competitorTopics = competitorSite.topics || [];
    const businessTopics = businessSite.topics || [];

    return {
      underservedTopics: this.findUnderservedTopics(businessTopics, competitorTopics),
      seasonalOpportunities: this.identifySeasonalOpportunities(competitorSite, offerings),
      localIntentGaps: this.identifyLocalIntentGaps(competitorSite, businessSite),
      questionBasedContent: this.identifyQuestionOpportunities(competitorSite),
      comparisonOpportunities: this.identifyComparisonOpportunities(offerings, competitorTopics)
    };
  }

  private generateStrategicInsights(
    competitorSite: WebsiteAnalysisResult,
    businessSite: WebsiteAnalysisResult,
    offerings: BusinessOfferings
  ) {
    return {
      competitiveAdvantages: this.identifyCompetitorAdvantages(competitorSite, businessSite),
      weaknesses: this.identifyCompetitorWeaknesses(competitorSite),
      marketOpportunities: this.identifyMarketOpportunities(competitorSite, offerings),
      threats: this.identifyCompetitiveThreats(competitorSite, businessSite)
    };
  }

  private analyzeMarket(
    competitors: CompetitorAnalysis[],
    industryContext?: string,
    location?: string
  ) {
    return {
      totalMarketSize: this.estimateMarketSize(competitors),
      marketLeaders: this.identifyMarketLeaders(competitors),
      emergingTrends: this.identifyEmergingTrends(competitors),
      seasonalPatterns: this.identifySeasonalPatterns(competitors),
      localMarketDynamics: this.analyzeLocalMarketDynamics(competitors, location)
    };
  }

  private identifyCompetitiveGaps(
    businessSite: WebsiteAnalysisResult,
    competitors: CompetitorAnalysis[]
  ) {
    const businessTopics = businessSite.topics || [];
    const allCompetitorTopics = competitors.flatMap(c => c.contentStrategy.topicClusters);

    return {
      contentGaps: this.findContentGaps(businessTopics, allCompetitorTopics),
      serviceGaps: this.findServiceGaps(businessSite, competitors),
      keywordGaps: this.findKeywordGaps(businessSite, competitors),
      geographicGaps: this.findGeographicGaps(businessSite, competitors)
    };
  }

  private generateStrategicRecommendations(
    businessSite: WebsiteAnalysisResult,
    competitors: CompetitorAnalysis[],
    gaps: any
  ) {
    return {
      contentStrategy: this.generateContentStrategyRecommendations(gaps),
      topicPriorities: this.generateTopicPriorities(gaps, competitors),
      differentiationTactics: this.generateDifferentiationTactics(businessSite, competitors),
      marketPositioning: this.generateMarketPositioningRecommendations(businessSite, competitors)
    };
  }

  private createSWOTAnalysis(
    businessSite: WebsiteAnalysisResult,
    competitors: CompetitorAnalysis[],
    market: any
  ) {
    return {
      strengths: this.identifyStrengths(businessSite, competitors),
      weaknesses: this.identifyWeaknesses(businessSite, competitors),
      opportunities: this.identifyOpportunities(businessSite, competitors, market),
      threats: this.identifyThreats(businessSite, competitors, market)
    };
  }

  // Enhanced competitor advantage analysis methods
  private async analyzeCompetitorAdvantages(
    competitorSite: WebsiteAnalysisResult,
    businessSite: WebsiteAnalysisResult,
    competitorOfferings: BusinessOfferings,
    businessOfferings: BusinessOfferings
  ): Promise<CompetitiveAdvantage[]> {
    const advantages: CompetitiveAdvantage[] = [];
    const allContent = competitorSite.crawledPages.map(page => page.content).join(' ').toLowerCase();

    // Analyze service quality advantages
    const serviceQualityAdvantages = this.analyzeServiceQualityAdvantages(competitorSite, competitorOfferings, allContent);
    advantages.push(...serviceQualityAdvantages);

    // Analyze pricing advantages
    const pricingAdvantages = this.analyzePricingAdvantages(competitorSite, competitorOfferings, businessOfferings, allContent);
    advantages.push(...pricingAdvantages);

    // Analyze expertise advantages
    const expertiseAdvantages = this.analyzeExpertiseAdvantages(competitorSite, competitorOfferings, allContent);
    advantages.push(...expertiseAdvantages);

    // Analyze coverage advantages
    const coverageAdvantages = this.analyzeCoverageAdvantages(competitorSite, competitorOfferings, businessOfferings, allContent);
    advantages.push(...coverageAdvantages);

    // Analyze technology advantages
    const technologyAdvantages = this.analyzeTechnologyAdvantages(competitorSite, allContent);
    advantages.push(...technologyAdvantages);

    // Analyze customer service advantages
    const customerServiceAdvantages = this.analyzeCustomerServiceAdvantages(competitorSite, allContent);
    advantages.push(...customerServiceAdvantages);

    // Analyze speed/convenience advantages
    const speedAdvantages = this.analyzeSpeedAdvantages(competitorSite, allContent);
    advantages.push(...speedAdvantages);

    return advantages.sort((a, b) => {
      const impactOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return impactOrder[b.impactLevel] - impactOrder[a.impactLevel];
    });
  }

  private analyzeCompetitorAdvantagesStrategic(
    primaryCompetitors: CompetitorAnalysis[],
    businessSite: WebsiteAnalysisResult
  ): CompetitiveIntelligenceReport['competitorAdvantages'] {
    const allAdvantages = primaryCompetitors.flatMap(comp => comp.advantages);

    // Categorize advantages by strategic importance
    const criticalThreats = allAdvantages.filter(adv =>
      adv.impactLevel === 'critical' && adv.targetable
    );

    const addressableAdvantages = allAdvantages.filter(adv =>
      adv.targetable && (adv.impactLevel === 'high' || adv.impactLevel === 'medium')
    );

    const strategicCounters = allAdvantages.filter(adv =>
      adv.targetable && adv.counterStrategy.includes('strategic')
    );

    const comparisonOpportunities = allAdvantages.filter(adv =>
      adv.type === 'pricing' || adv.type === 'service_quality' || adv.type === 'expertise'
    );

    return {
      criticalThreats,
      addressableAdvantages,
      strategicCounters,
      comparisonOpportunities
    };
  }

  private analyzeServiceQualityAdvantages(
    website: WebsiteAnalysisResult,
    offerings: BusinessOfferings,
    content: string
  ): CompetitiveAdvantage[] {
    const advantages: CompetitiveAdvantage[] = [];
    const qualityIndicators = [
      'certified', 'licensed', 'insured', 'guarantee', 'warranty',
      'quality', 'professional', 'expert', 'trained', 'experienced',
      'award winning', 'best rated', 'top rated', '5 star', 'five star'
    ];

    const foundIndicators = qualityIndicators.filter(indicator => content.includes(indicator));

    if (foundIndicators.length >= 3) {
      advantages.push({
        type: 'service_quality',
        advantage: 'Strong quality credentials and guarantees',
        evidence: foundIndicators.slice(0, 5),
        impactLevel: 'high',
        targetable: true,
        counterStrategy: 'Highlight unique quality aspects and differentiators'
      });
    }

    if (offerings.services.some(s => s.qualityIndicators && s.qualityIndicators.length > 0)) {
      advantages.push({
        type: 'service_quality',
        advantage: 'Service-specific quality certifications',
        evidence: offerings.services.filter(s => s.qualityIndicators && s.qualityIndicators.length > 0).map(s => s.name),
        impactLevel: 'medium',
        targetable: true,
        counterStrategy: 'Create comparison content showing quality differences'
      });
    }

    return advantages;
  }

  private analyzePricingAdvantages(
    competitorSite: WebsiteAnalysisResult,
    competitorOfferings: BusinessOfferings,
    businessOfferings: BusinessOfferings,
    content: string
  ): CompetitiveAdvantage[] {
    const advantages: CompetitiveAdvantage[] = [];
    const pricingIndicators = [
      'affordable', 'cheap', 'low cost', 'budget', 'discount',
      'competitive pricing', 'best price', 'price match', 'free estimate',
      'financing', 'payment plans', 'affordable payment'
    ];

    const foundIndicators = pricingIndicators.filter(indicator => content.includes(indicator));

    if (foundIndicators.length >= 2) {
      const competitorPricingPosition = this.assessPricingPosition(competitorOfferings);
      const businessPricingPosition = this.assessPricingPosition(businessOfferings);

      let impactLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      if (competitorPricingPosition === 'budget' && businessPricingPosition === 'premium') {
        impactLevel = 'critical';
      } else if (competitorPricingPosition === 'budget' && businessPricingPosition === 'mid-range') {
        impactLevel = 'high';
      }

      advantages.push({
        type: 'pricing',
        advantage: `Competitive pricing positioning (${competitorPricingPosition})`,
        evidence: foundIndicators.slice(0, 4),
        impactLevel,
        targetable: true,
        counterStrategy: impactLevel === 'critical'
          ? 'Create value-focused content justifying premium positioning'
          : 'Develop comparison content highlighting value vs price'
      });
    }

    return advantages;
  }

  private analyzeExpertiseAdvantages(
    website: WebsiteAnalysisResult,
    offerings: BusinessOfferings,
    content: string
  ): CompetitiveAdvantage[] {
    const advantages: CompetitiveAdvantage[] = [];
    const expertiseIndicators = [
      'years experience', 'decades experience', 'since 19', 'established',
      'specialist', 'expert', 'master', 'certified technician', 'licensed',
      'trained', 'skilled', 'knowledgeable', 'professional'
    ];

    const foundIndicators = expertiseIndicators.filter(indicator => content.includes(indicator));

    if (foundIndicators.length >= 3) {
      advantages.push({
        type: 'expertise',
        advantage: 'Strong expertise and experience credentials',
        evidence: foundIndicators.slice(0, 4),
        impactLevel: 'medium',
        targetable: true,
        counterStrategy: 'Highlight unique expertise areas and specializations'
      });
    }

    // Check for specialized services
    const specializedServices = offerings.services.filter(s =>
      s.specialization || s.categories.includes('specialized')
    );

    if (specializedServices.length > 0) {
      advantages.push({
        type: 'expertise',
        advantage: 'Specialized service offerings',
        evidence: specializedServices.map(s => s.name),
        impactLevel: 'high',
        targetable: true,
        counterStrategy: 'Create content addressing niche vs general service trade-offs'
      });
    }

    return advantages;
  }

  private analyzeCoverageAdvantages(
    competitorSite: WebsiteAnalysisResult,
    competitorOfferings: BusinessOfferings,
    businessOfferings: BusinessOfferings,
    content: string
  ): CompetitiveAdvantage[] {
    const advantages: CompetitiveAdvantage[] = [];

    // Compare service areas
    if (competitorOfferings.serviceAreas.length > businessOfferings.serviceAreas.length) {
      advantages.push({
        type: 'coverage',
        advantage: 'Broader service area coverage',
        evidence: competitorOfferings.serviceAreas.slice(0, 5),
        impactLevel: 'medium',
        targetable: true,
        counterStrategy: 'Emphasize quality of service in focused areas'
      });
    }

    // Compare service range
    if (competitorOfferings.services.length > businessOfferings.services.length * 1.5) {
      advantages.push({
        type: 'coverage',
        advantage: 'Comprehensive service range',
        evidence: [`Offers ${competitorOfferings.services.length} services vs ${businessOfferings.services.length}`],
        impactLevel: 'medium',
        targetable: true,
        counterStrategy: 'Create content on depth vs breadth of services'
      });
    }

    // Check for 24/7 emergency services
    if (competitorOfferings.emergencyServices.length > 0 &&
        competitorOfferings.emergencyServices.some(s => s.availability?.includes('24/7'))) {
      advantages.push({
        type: 'coverage',
        advantage: '24/7 emergency service availability',
        evidence: competitorOfferings.emergencyServices.map(s => s.name),
        impactLevel: 'high',
        targetable: true,
        counterStrategy: 'Highlight response time and service quality during business hours'
      });
    }

    return advantages;
  }

  private analyzeTechnologyAdvantages(website: WebsiteAnalysisResult, content: string): CompetitiveAdvantage[] {
    const advantages: CompetitiveAdvantage[] = [];
    const technologyIndicators = [
      'modern equipment', 'latest technology', 'advanced tools',
      'state of the art', 'cutting edge', 'innovative', 'digital',
      'software', 'technology', 'equipment', 'tools', 'modern'
    ];

    const foundIndicators = technologyIndicators.filter(indicator => content.includes(indicator));

    if (foundIndicators.length >= 3) {
      advantages.push({
        type: 'technology',
        advantage: 'Advanced technology and equipment',
        evidence: foundIndicators.slice(0, 4),
        impactLevel: 'medium',
        targetable: true,
        counterStrategy: 'Focus on proven methods and customer service over technology'
      });
    }

    return advantages;
  }

  private analyzeCustomerServiceAdvantages(website: WebsiteAnalysisResult, content: string): CompetitiveAdvantage[] {
    const advantages: CompetitiveAdvantage[] = [];
    const serviceIndicators = [
      'customer service', 'customer satisfaction', 'satisfaction guaranteed',
      'friendly service', 'professional service', 'responsive', 'available',
      'support', 'help', 'assistance', 'customer care'
    ];

    const foundIndicators = serviceIndicators.filter(indicator => content.includes(indicator));

    if (foundIndicators.length >= 3) {
      advantages.push({
        type: 'customer_service',
        advantage: 'Strong customer service focus',
        evidence: foundIndicators.slice(0, 4),
        impactLevel: 'medium',
        targetable: true,
        counterStrategy: 'Highlight unique customer service approaches and personalization'
      });
    }

    return advantages;
  }

  private analyzeSpeedAdvantages(website: WebsiteAnalysisResult, content: string): CompetitiveAdvantage[] {
    const advantages: CompetitiveAdvantage[] = [];
    const speedIndicators = [
      'fast', 'quick', 'rapid', 'same day', 'next day', 'immediate',
      'emergency', 'urgent', 'prompt', 'efficient', 'timely'
    ];

    const foundIndicators = speedIndicators.filter(indicator => content.includes(indicator));

    if (foundIndicators.length >= 3) {
      advantages.push({
        type: 'speed',
        advantage: 'Fast service and quick response times',
        evidence: foundIndicators.slice(0, 4),
        impactLevel: 'high',
        targetable: true,
        counterStrategy: 'Emphasize quality over speed and thorough service'
      });
    }

    return advantages;
  }

  // Helper methods for analysis
  private extractCompanyName(website: WebsiteAnalysisResult): string {
    const title = website.crawledPages[0]?.title || '';
    const match = title.match(/^([^|–-]+)/);
    return match ? match[1].trim() : website.domain;
  }

  private extractCompanyDescription(website: WebsiteAnalysisResult): string {
    const homepage = website.crawledPages.find(page => page.url === website.url);
    if (homepage) {
      const sentences = homepage.content.split(/[.!?]+/);
      return sentences.find(s => s.length > 50 && s.length < 200)?.trim() || '';
    }
    return '';
  }

  private estimateTraffic(website: WebsiteAnalysisResult): number {
    // Simple estimation based on content volume and quality
    const contentScore = website.crawledPages.length * 100;
    const qualityScore = website.internalLinkingScore * 10;
    return Math.max(contentScore + qualityScore, 1000);
  }

  private calculateAuthorityScore(website: WebsiteAnalysisResult): number {
    const baseScore = website.internalLinkingScore || 50;
    const contentBonus = Math.min(website.crawledPages.length * 2, 30);
    const qualityBonus = website.totalWordCount > 5000 ? 20 : 10;
    return Math.min(baseScore + contentBonus + qualityBonus, 100);
  }

  private identifyTopicClusters(topics: string[]): string[] {
    const clusters: Record<string, string[]> = {};

    topics.forEach(topic => {
      const words = topic.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      words.forEach(word => {
        if (!clusters[word]) clusters[word] = [];
        clusters[word].push(topic);
      });
    });

    return Object.entries(clusters)
      .filter(([, cluster]) => cluster.length >= 2)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 8)
      .map(([cluster]) => cluster);
  }

  private identifyContentGaps(website: WebsiteAnalysisResult): string[] {
    const topics = website.topics || [];
    const expectedTopics = this.getExpectedTopicsForIndustry(website);

    return expectedTopics.filter(expected =>
      !topics.some(topic =>
        topic.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(topic.toLowerCase())
      )
    );
  }

  private identifyContentStrengths(topics: string[], content: string): string[] {
    // Identify topics with good coverage and depth
    return topics.slice(0, 5).map(topic => `${topic} (comprehensive coverage)`);
  }

  private assessContentFrequency(pageCount: number): 'high' | 'medium' | 'low' {
    if (pageCount >= 20) return 'high';
    if (pageCount >= 10) return 'medium';
    return 'low';
  }

  private calculateAvgContentLength(pages: any[]): number {
    if (pages.length === 0) return 0;
    const totalWords = pages.reduce((sum, page) => sum + (page.content?.split(/\s+/).length || 0), 0);
    return Math.round(totalWords / pages.length);
  }

  private extractKeywords(website: WebsiteAnalysisResult): string[] {
    const allText = website.crawledPages.map(page => page.content).join(' ').toLowerCase();
    const words = allText.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);

    const keywordFreq: Record<string, number> = {};
    words.forEach(word => {
      keywordFreq[word] = (keywordFreq[word] || 0) + 1;
    });

    return Object.entries(keywordFreq)
      .filter(([, freq]) => freq >= 3)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  private identifyTopRankingTopics(keywords: string[]): string[] {
    return keywords.slice(0, 5);
  }

  private identifyKeywordGaps(businessKeywords: string[], competitorKeywords: string[]): string[] {
    return competitorKeywords.filter(keyword =>
      !businessKeywords.includes(keyword)
    );
  }

  private assessBacklinkProfile(website: WebsiteAnalysisResult): 'strong' | 'moderate' | 'weak' {
    // Simplified assessment based on domain authority indicators
    const authorityScore = this.calculateAuthorityScore(website);
    if (authorityScore >= 80) return 'strong';
    if (authorityScore >= 60) return 'moderate';
    return 'weak';
  }

  private assessTechnicalSEO(website: WebsiteAnalysisResult): 'excellent' | 'good' | 'fair' | 'poor' {
    const issues = website.technicalIssues?.length || 0;
    const structureScore = website.internalLinkingScore || 0;

    if (issues === 0 && structureScore >= 90) return 'excellent';
    if (issues <= 2 && structureScore >= 70) return 'good';
    if (issues <= 5 && structureScore >= 50) return 'fair';
    return 'poor';
  }

  private identifyDifferentiators(offerings: BusinessOfferings, brandVoice: BrandAnalysisInsights): string[] {
    const differentiators = [...offerings.uniqueSellingPoints];

    // Add brand voice differentiators
    if (brandVoice.brandVoiceProfile.primaryTone === 'professional') {
      differentiators.push('Professional brand voice');
    }
    if (brandVoice.competitiveDifferentiators.length > 0) {
      differentiators.push(...brandVoice.competitiveDifferentiators);
    }

    return differentiators.slice(0, 5);
  }

  private assessPricingPosition(offerings: BusinessOfferings): 'premium' | 'mid-range' | 'budget' {
    const services = offerings.services;
    const premiumServices = services.filter(s => s.priceIndicator === 'premium').length;
    const budgetServices = services.filter(s => s.priceIndicator === 'budget').length;

    if (premiumServices > budgetServices) return 'premium';
    if (budgetServices > premiumServices) return 'budget';
    return 'mid-range';
  }

  private findUnderservedTopics(businessTopics: string[], competitorTopics: string[]): string[] {
    const allTopics = [...businessTopics, ...competitorTopics];
    const topicCoverage: Record<string, { business: boolean; competitor: boolean }> = {};

    allTopics.forEach(topic => {
      topicCoverage[topic] = {
        business: businessTopics.includes(topic),
        competitor: competitorTopics.includes(topic)
      };
    });

    return Object.entries(topicCoverage)
      .filter(([, coverage]) => coverage.business && !coverage.competitor)
      .map(([topic]) => topic);
  }

  private identifySeasonalOpportunities(website: WebsiteAnalysisResult, offerings: BusinessOfferings): string[] {
    const allText = website.crawledPages.map(page => page.content).join(' ').toLowerCase();
    const seasonalKeywords = ['spring', 'summer', 'fall', 'winter', 'holiday', 'seasonal'];

    return seasonalKeywords.filter(keyword =>
      !allText.includes(keyword) &&
      offerings.services.some(s => s.localService)
    );
  }

  private identifyLocalIntentGaps(competitorSite: WebsiteAnalysisResult, businessSite: WebsiteAnalysisResult): string[] {
    const competitorContent = competitorSite.crawledPages.map(page => page.content).join(' ').toLowerCase();
    const businessContent = businessSite.crawledPages.map(page => page.content).join(' ').toLowerCase();

    const localIndicators = ['near me', 'local', 'in [city]', 'service area', 'your area'];

    return localIndicators.filter(indicator =>
      competitorContent.includes(indicator) && !businessContent.includes(indicator)
    );
  }

  private identifyQuestionOpportunities(website: WebsiteAnalysisResult): string[] {
    const allContent = website.crawledPages.map(page => page.content).join(' ');
    const questions = allContent.match(/[^.!?]*\?[^.!?]*/g) || [];

    return questions.slice(0, 5).map(q => q.trim());
  }

  private identifyComparisonOpportunities(offerings: BusinessOfferings, competitorTopics: string[]): string[] {
    return offerings.services.slice(0, 3).map(service =>
      `${service.name} vs alternatives comparison`
    );
  }

  private identifyCompetitorAdvantages(competitorSite: WebsiteAnalysisResult, businessSite: WebsiteAnalysisResult): string[] {
    const advantages: string[] = [];

    if (competitorSite.crawledPages.length > businessSite.crawledPages.length) {
      advantages.push('Larger content library');
    }

    if ((competitorSite.internalLinkingScore || 0) > (businessSite.internalLinkingScore || 0)) {
      advantages.push('Better internal linking structure');
    }

    return advantages;
  }

  private identifyCompetitorWeaknesses(competitorSite: WebsiteAnalysisResult): string[] {
    const weaknesses: string[] = [];

    if ((competitorSite.technicalIssues?.length || 0) > 3) {
      weaknesses.push('Technical SEO issues');
    }

    if (competitorSite.crawledPages.length < 10) {
      weaknesses.push('Limited content volume');
    }

    return weaknesses;
  }

  private identifyMarketOpportunities(competitorSite: WebsiteAnalysisResult, offerings: BusinessOfferings): string[] {
    const opportunities: string[] = [];

    if (offerings.emergencyServices.length > 0) {
      opportunities.push('Emergency services market');
    }

    if (offerings.services.some(s => s.localService)) {
      opportunities.push('Local service expansion');
    }

    return opportunities;
  }

  private identifyCompetitiveThreats(competitorSite: WebsiteAnalysisResult, businessSite: WebsiteAnalysisResult): string[] {
    const threats: string[] = [];

    if (competitorSite.internalLinkingScore > 80) {
      threats.push('Strong SEO authority');
    }

    if (competitorSite.crawledPages.length > 50) {
      threats.push('Extensive content coverage');
    }

    return threats;
  }

  // Additional helper methods for comprehensive analysis
  private getExpectedTopicsForIndustry(website: WebsiteAnalysisResult): string[] {
    // Return industry-specific expected topics based on content analysis
    return ['services', 'about', 'contact', 'pricing', 'testimonials'];
  }

  private estimateMarketSize(competitors: CompetitorAnalysis[]): number {
    return competitors.reduce((total, comp) => total + comp.competitorInfo.estimatedTraffic, 0);
  }

  private identifyMarketLeaders(competitors: CompetitorAnalysis[]): string[] {
    return competitors
      .sort((a, b) => b.competitorInfo.authorityScore - a.competitorInfo.authorityScore)
      .slice(0, 3)
      .map(comp => comp.competitorInfo.name);
  }

  private identifyEmergingTrends(competitors: CompetitorAnalysis[]): string[] {
    const allTopics = competitors.flatMap(c => c.contentStrategy.topicClusters);
    const recentTopics = allTopics.slice(-10);

    return recentTopics.slice(0, 5);
  }

  private identifySeasonalPatterns(competitors: CompetitorAnalysis[]): string[] {
    return ['Seasonal content planning', 'Holiday promotions', 'Weather-related services'];
  }

  private analyzeLocalMarketDynamics(competitors: CompetitorAnalysis[], location?: string): string[] {
    const dynamics: string[] = [];

    if (location) {
      dynamics.push(`${location} market competition`);
    }

    const localCompetitors = competitors.filter(c =>
      c.marketPosition.serviceAreas.some(area =>
        location && area.toLowerCase().includes(location.toLowerCase())
      )
    );

    if (localCompetitors.length > 0) {
      dynamics.push('Strong local competition');
    }

    return dynamics;
  }

  private findContentGaps(businessTopics: string[], competitorTopics: string[]): string[] {
    return competitorTopics.filter(topic =>
      !businessTopics.some(bt =>
        bt.toLowerCase().includes(topic.toLowerCase()) ||
        topic.toLowerCase().includes(bt.toLowerCase())
      )
    );
  }

  private findServiceGaps(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[]): string[] {
    const businessOfferings = extractBusinessOfferings(businessSite);
    const competitorServices = competitors.flatMap(c => c.marketPosition.uniqueValueProps);

    return competitorServices.filter(service =>
      !businessOfferings.uniqueSellingPoints.includes(service)
    );
  }

  private findKeywordGaps(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[]): string[] {
    const businessKeywords = this.extractKeywords(businessSite);
    const competitorKeywords = competitors.flatMap(c => c.seoPerformance.topRankingTopics);

    return competitorKeywords.filter(keyword =>
      !businessKeywords.includes(keyword)
    );
  }

  private findGeographicGaps(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[]): string[] {
    const businessAreas = extractBusinessOfferings(businessSite).serviceAreas;
    const competitorAreas = competitors.flatMap(c => c.marketPosition.serviceAreas);

    return competitorAreas.filter(area =>
      !businessAreas.includes(area)
    );
  }

  private generateContentStrategyRecommendations(gaps: any): string[] {
    const recommendations: string[] = [];

    if (gaps.contentGaps.length > 0) {
      recommendations.push(`Address content gaps: ${gaps.contentGaps.slice(0, 3).join(', ')}`);
    }

    if (gaps.keywordGaps.length > 0) {
      recommendations.push(`Target missing keywords: ${gaps.keywordGaps.slice(0, 3).join(', ')}`);
    }

    return recommendations;
  }

  private generateTopicPriorities(gaps: any, competitors: CompetitorAnalysis[]): string[] {
    const priorities: string[] = [];

    // Prioritize gaps that competitors are ranking for
    const highValueGaps = gaps.keywordGaps.slice(0, 5);
    priorities.push(...highValueGaps);

    return priorities;
  }

  private generateDifferentiationTactics(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[]): string[] {
    return [
      'Focus on unique value propositions',
      'Create comparison content',
      'Highlight differentiators in all content',
      'Develop proprietary methodologies'
    ];
  }

  private generateMarketPositioningRecommendations(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[]): string[] {
    return [
      'Establish authority in niche areas',
      'Position as local expert',
      'Develop thought leadership content',
      'Create comprehensive guides'
    ];
  }

  private identifyStrengths(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[]): string[] {
    const strengths: string[] = [];

    if (businessSite.internalLinkingScore > 70) {
      strengths.push('Strong internal linking structure');
    }

    if (businessSite.crawledPages.length > 20) {
      strengths.push('Comprehensive content library');
    }

    return strengths;
  }

  private identifyWeaknesses(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[]): string[] {
    const weaknesses: string[] = [];

    if ((businessSite.technicalIssues?.length || 0) > 0) {
      weaknesses.push('Technical SEO improvements needed');
    }

    return weaknesses;
  }

  private identifyOpportunities(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[], market: any): string[] {
    return [
      'Expand into underserved topic areas',
      'Develop seasonal content strategies',
      'Create local-focused content',
      'Build authority in emerging trends'
    ];
  }

  private identifyThreats(businessSite: WebsiteAnalysisResult, competitors: CompetitorAnalysis[], market: any): string[] {
    return [
      'Increasing competition in key areas',
      'Competitive content saturation',
      'Changing market dynamics'
    ];
  }

  /**
   * Generate counter-topics to address competitor advantages
   */
  generateCounterTopics(
    competitorAdvantages: CompetitiveAdvantage[],
    businessContext: {
      businessType: string;
      targetAudience: string;
      location?: string;
      uniqueValueProps: string[];
    }
  ): Array<{
    topic: string;
    type: 'counter' | 'comparison' | 'differentiator' | 'value_proposition';
    targetAdvantage: CompetitiveAdvantage;
    reasoning: string;
    searchIntent: 'informational' | 'commercial' | 'transactional';
  }> {
    const counterTopics: Array<{
      topic: string;
      type: 'counter' | 'comparison' | 'differentiator' | 'value_proposition';
      targetAdvantage: CompetitiveAdvantage;
      reasoning: string;
      searchIntent: 'informational' | 'commercial' | 'transactional';
    }> = [];

    competitorAdvantages.forEach(advantage => {
      switch (advantage.type) {
        case 'pricing':
          counterTopics.push(...this.generatePricingCounterTopics(advantage, businessContext));
          break;
        case 'service_quality':
          counterTopics.push(...this.generateQualityCounterTopics(advantage, businessContext));
          break;
        case 'expertise':
          counterTopics.push(...this.generateExpertiseCounterTopics(advantage, businessContext));
          break;
        case 'coverage':
          counterTopics.push(...this.generateCoverageCounterTopics(advantage, businessContext));
          break;
        case 'speed':
          counterTopics.push(...this.generateSpeedCounterTopics(advantage, businessContext));
          break;
        case 'customer_service':
          counterTopics.push(...this.generateCustomerServiceCounterTopics(advantage, businessContext));
          break;
        case 'technology':
          counterTopics.push(...this.generateTechnologyCounterTopics(advantage, businessContext));
          break;
        default:
          counterTopics.push(...this.generateGenericCounterTopics(advantage, businessContext));
      }
    });

    return counterTopics;
  }

  private generatePricingCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType, location } = context;

    if (advantage.impactLevel === 'critical') {
      topics.push({
        topic: `Why Premium ${businessType} Services Are Worth The Investment`,
        type: 'value_proposition' as const,
        targetAdvantage: advantage,
        reasoning: 'Counters competitor budget positioning by emphasizing value over price',
        searchIntent: 'commercial' as const
      });

      if (location) {
        topics.push({
          topic: `The True Cost of Cheap ${businessType} in ${location}`,
          type: 'counter' as const,
          targetAdvantage: advantage,
          reasoning: 'Highlights risks and hidden costs of budget competitors',
          searchIntent: 'informational' as const
        });
      }
    }

    topics.push({
      topic: `${businessType} Price vs Value: What You're Really Paying For`,
      type: 'comparison' as const,
      targetAdvantage: advantage,
      reasoning: 'Direct comparison focusing on long-term value',
      searchIntent: 'commercial' as const
    });

    return topics;
  }

  private generateQualityCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType, location, uniqueValueProps } = context;

    topics.push({
      topic: `What Sets Top-Quality ${businessType} Services Apart`,
      type: 'differentiator' as const,
      targetAdvantage: advantage,
      reasoning: 'Establishes quality criteria where competitor may fall short',
      searchIntent: 'informational' as const
    });

    if (uniqueValueProps.length > 0) {
      topics.push({
        topic: `${uniqueValueProps[0]}: The ${businessType} Quality Difference`,
        type: 'value_proposition' as const,
        targetAdvantage: advantage,
        reasoning: 'Highlights unique quality aspects competitors lack',
        searchIntent: 'commercial' as const
      });
    }

    return topics;
  }

  private generateExpertiseCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType, location } = context;

    topics.push({
      topic: `Specialized vs General ${businessType}: When Expertise Matters`,
      type: 'comparison' as const,
      targetAdvantage: advantage,
      reasoning: 'Positions specialized expertise as superior to general knowledge',
      searchIntent: 'informational' as const
    });

    topics.push({
      topic: `Questions to Ask Before Hiring a ${businessType} Professional`,
      type: 'differentiator' as const,
      targetAdvantage: advantage,
      reasoning: 'Educates customers on expertise indicators competitors may lack',
      searchIntent: 'informational' as const
    });

    return topics;
  }

  private generateCoverageCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType, location } = context;

    if (advantage.advantage.includes('24/7')) {
      topics.push({
        topic: `Quality ${businessType} Service vs 24/7 Availability: What's More Important?`,
        type: 'comparison' as const,
        targetAdvantage: advantage,
        reasoning: 'Questions the value of 24/7 service vs business-hours quality',
        searchIntent: 'informational' as const
      });
    }

    if (advantage.advantage.includes('service area')) {
      topics.push({
        topic: `Local ${businessType} Expert: Better Than Large Service Areas`,
        type: 'value_proposition' as const,
        targetAdvantage: advantage,
        reasoning: 'Positions local expertise as superior to broad coverage',
        searchIntent: 'commercial' as const
      });
    }

    return topics;
  }

  private generateSpeedCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType } = context;

    topics.push({
      topic: `Fast vs Right: Why ${businessType} Quality Beats Speed`,
      type: 'counter' as const,
      targetAdvantage: advantage,
      reasoning: 'Challenges competitor speed advantage with quality focus',
      searchIntent: 'informational' as const
    });

    topics.push({
      topic: `How to Spot Rushed ${businessType} Work (And Avoid It)`,
      type: 'counter' as const,
      targetAdvantage: advantage,
      reasoning: 'Educates on risks of fast service that may lack quality',
      searchIntent: 'informational' as const
    });

    return topics;
  }

  private generateCustomerServiceCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType } = context;

    topics.push({
      topic: `What Makes Exceptional ${businessType} Customer Service`,
      type: 'differentiator' as const,
      targetAdvantage: advantage,
      reasoning: 'Sets higher customer service standards than competitors',
      searchIntent: 'informational' as const
    });

    topics.push({
      topic: `${businessType} Service: Beyond Basic Customer Support`,
      type: 'value_proposition' as const,
      targetAdvantage: advantage,
      reasoning: 'Positions superior customer service as key differentiator',
      searchIntent: 'commercial' as const
    });

    return topics;
  }

  private generateTechnologyCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType } = context;

    topics.push({
      topic: `Modern Tools vs Proven Methods in ${businessType}`,
      type: 'comparison' as const,
      targetAdvantage: advantage,
      reasoning: 'Questions the value of new technology over proven approaches',
      searchIntent: 'informational' as const
    });

    topics.push({
      topic: `Does Your ${businessType} Need the Latest Technology?`,
      type: 'counter' as const,
      targetAdvantage: advantage,
      reasoning: 'Challenges assumption that technology equals better service',
      searchIntent: 'informational' as const
    });

    return topics;
  }

  private generateGenericCounterTopics(
    advantage: CompetitiveAdvantage,
    context: any
  ) {
    const topics = [];
    const { businessType } = context;

    topics.push({
      topic: `Choosing the Right ${businessType}: More Than Just ${advantage.advantage}`,
      type: 'counter' as const,
      targetAdvantage: advantage,
      reasoning: 'Minimizes importance of competitor advantage',
      searchIntent: 'informational' as const
    });

    return topics;
  }
}

// Singleton instance
export const competitorIntelligenceAnalyzer = new CompetitorIntelligenceAnalyzer();

// Export helper functions
export async function analyzeCompetitors(
  businessWebsite: WebsiteAnalysisResult,
  competitorWebsites: WebsiteAnalysisResult[],
  industryContext?: string,
  location?: string
): Promise<CompetitiveIntelligenceReport> {
  return await competitorIntelligenceAnalyzer.analyzeCompetitors(
    businessWebsite,
    competitorWebsites,
    industryContext,
    location
  );
}

export async function performCompetitorAnalysis(
  competitorWebsites: WebsiteAnalysisResult[],
  industryContext?: string,
  location?: string,
  businessWebsite?: WebsiteAnalysisResult
): Promise<CompetitiveIntelligenceReport> {
  // If no business website provided, create a minimal one for analysis
  const businessSite = businessWebsite || {
    url: '',
    domain: 'your-business.com',
    crawledPages: [],
    topics: [],
    keywords: [],
    totalWordCount: 0,
    totalImages: 0,
    internalLinkingScore: 50,
    technicalIssues: [],
    crawledAt: new Date().toISOString()
  } as WebsiteAnalysisResult;

  return await competitorIntelligenceAnalyzer.analyzeCompetitors(
    businessSite,
    competitorWebsites,
    industryContext,
    location
  );
}