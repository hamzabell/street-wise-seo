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

    console.log('✅ [COMPETITOR INTELLIGENCE] Analysis completed', {
      competitorsAnalyzed: primaryCompetitors.length,
      marketSize: marketAnalysis.totalMarketSize,
      contentGaps: competitiveGaps.contentGaps.length,
      strategicRecommendations: strategicRecommendations.contentStrategy.length
    });

    return {
      primaryCompetitors,
      marketAnalysis,
      competitiveGaps,
      strategicRecommendations,
      swotAnalysis
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

    return {
      competitorInfo: this.analyzeCompetitorInfo(competitorSite),
      contentStrategy: this.analyzeContentStrategy(competitorSite, competitorBrandVoice),
      seoPerformance: this.analyzeSEOPerformance(competitorSite, businessSite),
      marketPosition: this.analyzeMarketPosition(competitorOfferings, competitorBrandVoice),
      contentOpportunities: this.identifyContentOpportunities(competitorSite, businessSite, competitorOfferings),
      strategicInsights: this.generateStrategicInsights(competitorSite, businessSite, competitorOfferings)
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