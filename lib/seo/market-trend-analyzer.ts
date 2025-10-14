/**
 * Market trend analysis system for predictive content intelligence
 */

import { getLemonfoxClient } from './lemonfox-client';

export interface MarketTrend {
  trend: string;
  category: string;
  growthRate: number; // Percentage growth over last 30 days
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  seasonality: 'seasonal' | 'evergreen' | 'emerging' | 'declining';
  geographicRelevance: string[];
  relatedKeywords: string[];
  contentOpportunities: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'short_term' | 'medium_term' | 'long_term';
  confidenceScore: number;
}

export interface MarketInsight {
  insight: string;
  category: 'opportunity' | 'threat' | 'trend' | 'seasonal' | 'competitive';
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  actionableRecommendations: string[];
  dataPoints: string[];
  confidenceLevel: number;
}

export interface TrendAnalysisResult {
  analyzedTopic: string;
  industry: string;
  location?: string;
  currentTrends: MarketTrend[];
  emergingOpportunities: MarketTrend[];
  decliningTrends: MarketTrend[];
  marketInsights: MarketInsight[];
  seasonalForecast: SeasonalForecast[];
  competitiveLandscape: CompetitiveAnalysis[];
  recommendations: TrendRecommendation[];
  analyzedAt: string;
  nextUpdateRecommended: string;
}

export interface SeasonalForecast {
  season: string;
  year: number;
  predictedTrends: string[];
  searchVolumeProjection: number;
  competitionLevel: 'increasing' | 'stable' | 'decreasing';
  opportunityScore: number;
  recommendedActions: string[];
}

export interface CompetitiveAnalysis {
  competitorType: 'direct' | 'indirect' | 'content';
  trendFocus: string[];
  marketShare: number;
  strengthScore: number;
  gapOpportunities: string[];
  recommendations: string[];
}

export interface TrendRecommendation {
  recommendation: string;
  type: 'content' | 'timing' | 'format' | 'angle' | 'strategy';
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedImpact: number;
  implementationComplexity: 'low' | 'medium' | 'high';
  timeframe: string;
  resources: string[];
  successMetrics: string[];
}

export interface MarketTrendRequest {
  topic: string;
  industry: string;
  location?: string;
  timeframe: 'current' | '30_days' | '90_days' | '6_months' | '1_year';
  includeCompetitors: boolean;
  includeSeasonal: boolean;
  detailLevel: 'basic' | 'comprehensive' | 'deep';
}

export class MarketTrendAnalyzer {
  private lemonfoxClient = getLemonfoxClient();

  async analyzeMarketTrends(request: MarketTrendRequest): Promise<TrendAnalysisResult> {
    console.log('🔍 [MARKET ANALYZER] Starting market trend analysis:', {
      topic: request.topic,
      industry: request.industry,
      location: request.location,
      timeframe: request.timeframe
    });

    try {
      // Step 1: Analyze current market trends
      const currentTrends = await this.analyzeCurrentTrends(request);

      // Step 2: Identify emerging opportunities
      const emergingOpportunities = await this.identifyEmergingOpportunities(request);

      // Step 3: Analyze declining trends
      const decliningTrends = await this.analyzeDecliningTrends(request);

      // Step 4: Generate market insights
      const marketInsights = await this.generateMarketInsights(request, currentTrends, emergingOpportunities);

      // Step 5: Create seasonal forecast
      const seasonalForecast = request.includeSeasonal
        ? await this.generateSeasonalForecast(request)
        : [];

      // Step 6: Analyze competitive landscape
      const competitiveLandscape = request.includeCompetitors
        ? await this.analyzeCompetitiveLandscape(request)
        : [];

      // Step 7: Generate actionable recommendations
      const recommendations = await this.generateTrendRecommendations(
        request,
        currentTrends,
        emergingOpportunities,
        marketInsights
      );

      const result: TrendAnalysisResult = {
        analyzedTopic: request.topic,
        industry: request.industry,
        location: request.location,
        currentTrends,
        emergingOpportunities,
        decliningTrends,
        marketInsights,
        seasonalForecast,
        competitiveLandscape,
        recommendations,
        analyzedAt: new Date().toISOString(),
        nextUpdateRecommended: this.calculateNextUpdate()
      };

      console.log('✅ [MARKET ANALYZER] Market trend analysis completed:', {
        currentTrends: currentTrends.length,
        emergingOpportunities: emergingOpportunities.length,
        marketInsights: marketInsights.length,
        recommendations: recommendations.length
      });

      return result;

    } catch (error) {
      console.error('❌ [MARKET ANALYZER] Market trend analysis failed:', error);
      throw new Error('Failed to analyze market trends. Please try again.');
    }
  }

  private async analyzeCurrentTrends(request: MarketTrendRequest): Promise<MarketTrend[]> {
    const prompt = `Analyze current market trends for the following topic and industry:

TOPIC: ${request.topic}
INDUSTRY: ${request.industry}
${request.location ? `LOCATION: ${request.location}` : ''}
TIMEFRAME: ${request.timeframe}

Please provide a comprehensive analysis of current market trends including:
1. Search volume trends and growth rates
2. Competition levels and market saturation
3. Seasonal patterns and geographic relevance
4. Related keywords and content opportunities
5. Risk assessment and confidence scores

Return the data as a JSON array of trend objects with the following structure:
{
  "trend": "specific trend name",
  "category": "technology|behavior|market|seasonal|content",
  "growthRate": 85.2,
  "searchVolume": 15000,
  "competition": "low|medium|high",
  "seasonality": "seasonal|evergreen|emerging|declining",
  "geographicRelevance": ["US", "UK", "Canada"],
  "relatedKeywords": ["keyword1", "keyword2"],
  "contentOpportunities": ["opportunity1", "opportunity2"],
  "riskLevel": "low|medium|high",
  "timeframe": "short_term|medium_term|long_term",
  "confidenceScore": 0.85
}

Focus on trends with high growth potential and actionable content opportunities.`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are an expert market analyst specializing in digital trends, SEO, and content marketing. Provide data-driven insights with confidence scores.',
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const trends = JSON.parse(content);
        return Array.isArray(trends) ? trends : [];
      } catch (parseError) {
        console.warn('Failed to parse trends as JSON, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Failed to analyze current trends:', error);
      return [];
    }
  }

  private async identifyEmergingOpportunities(request: MarketTrendRequest): Promise<MarketTrend[]> {
    const prompt = `Identify emerging market opportunities and trends for:

TOPIC: ${request.topic}
INDUSTRY: ${request.industry}
${request.location ? `LOCATION: ${request.location}` : ''}

Focus on:
1. Newly emerging trends (last 30-90 days)
2. Underserved market segments
3. Low-competition, high-growth opportunities
4. Innovative content angles and formats
5. Technology or behavior shifts creating new opportunities

Return as JSON array with the same structure as trends, but focus on opportunities with:
- High growth potential (>50% growth rate)
- Low to medium competition
- High confidence scores (>0.7)
- Clear content opportunities

Example structure:
{
  "trend": "emerging trend name",
  "category": "emerging",
  "growthRate": 125.5,
  "searchVolume": 5000,
  "competition": "low",
  "seasonality": "emerging",
  "geographicRelevance": ["US"],
  "relatedKeywords": ["new", "innovative"],
  "contentOpportunities": ["first-mover content", "educational content"],
  "riskLevel": "medium",
  "timeframe": "short_term",
  "confidenceScore": 0.75
}`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are a trend-spotting expert who identifies emerging market opportunities before they become mainstream.',
        max_tokens: 1500,
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const opportunities = JSON.parse(content);
        return Array.isArray(opportunities) ? opportunities : [];
      } catch (parseError) {
        console.warn('Failed to parse emerging opportunities as JSON');
        return [];
      }
    } catch (error) {
      console.error('Failed to identify emerging opportunities:', error);
      return [];
    }
  }

  private async analyzeDecliningTrends(request: MarketTrendRequest): Promise<MarketTrend[]> {
    const prompt = `Analyze declining or saturated trends for:

TOPIC: ${request.topic}
INDUSTRY: ${request.industry}
${request.location ? `LOCATION: ${request.location}` : ''}

Identify trends that are:
1. Losing search volume or engagement
2. Becoming oversaturated with competition
3. Outdated or being replaced by new technologies
4. Seasonal trends that are ending
5. Content formats that no longer perform well

Return as JSON array with:
- Negative growth rates
- High competition levels
- "declining" or "saturated" seasonality
- Higher risk levels
- Content opportunity warnings

Use same structure as other trends but highlight what to avoid.`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are an analyst who identifies market trends to avoid, helping businesses pivot away from declining opportunities.',
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const decliningTrends = JSON.parse(content);
        return Array.isArray(decliningTrends) ? decliningTrends : [];
      } catch (parseError) {
        console.warn('Failed to parse declining trends as JSON');
        return [];
      }
    } catch (error) {
      console.error('Failed to analyze declining trends:', error);
      return [];
    }
  }

  private async generateMarketInsights(
    request: MarketTrendRequest,
    currentTrends: MarketTrend[],
    emergingOpportunities: MarketTrend[]
  ): Promise<MarketInsight[]> {
    const prompt = `Generate strategic market insights based on the following trend analysis:

TOPIC: ${request.topic}
INDUSTRY: ${request.industry}
${request.location ? `LOCATION: ${request.location}` : ''}

CURRENT TRENDS ANALYSIS:
${JSON.stringify(currentTrends.slice(0, 5), null, 2)}

EMERGING OPPORTUNITIES:
${JSON.stringify(emergingOpportunities.slice(0, 5), null, 2)}

Generate actionable insights in these categories:
1. Market opportunities to capitalize on
2. Competitive threats to monitor
3. Timing considerations for content
4. Strategic recommendations for positioning

Return as JSON array with structure:
{
  "insight": "specific actionable insight",
  "category": "opportunity|threat|trend|seasonal|competitive",
  "urgency": "low|medium|high|immediate",
  "impact": "low|medium|high|critical",
  "timeframe": "specific timeframe recommendation",
  "actionableRecommendations": ["action1", "action2"],
  "dataPoints": ["supporting data point1", "data point2"],
  "confidenceLevel": 0.85
}

Focus on insights that are immediately actionable for content strategy.`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are a strategic market analyst who transforms trend data into actionable business insights.',
        max_tokens: 1500,
        temperature: 0.4,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const insights = JSON.parse(content);
        return Array.isArray(insights) ? insights : [];
      } catch (parseError) {
        console.warn('Failed to parse market insights as JSON');
        return [];
      }
    } catch (error) {
      console.error('Failed to generate market insights:', error);
      return [];
    }
  }

  private async generateSeasonalForecast(request: MarketTrendRequest): Promise<SeasonalForecast[]> {
    const currentSeason = this.getCurrentSeason();
    const currentYear = new Date().getFullYear();

    const prompt = `Generate seasonal forecast for the next 12 months:

TOPIC: ${request.topic}
INDUSTRY: ${request.industry}
${request.location ? `LOCATION: ${request.location}` : ''}
CURRENT SEASON: ${currentSeason}

Provide forecasts for each season including:
1. Predicted trending topics
2. Search volume projections
3. Competition changes
4. Opportunity scores
5. Recommended actions

Return as JSON array with structure:
{
  "season": "spring|summer|fall|winter|holiday",
  "year": 2024,
  "predictedTrends": ["trend1", "trend2"],
  "searchVolumeProjection": 25000,
  "competitionLevel": "increasing|stable|decreasing",
  "opportunityScore": 85,
  "recommendedActions": ["action1", "action2"]
}

Focus on seasonal content planning opportunities.`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are a seasonal trends analyst who helps businesses plan content around seasonal patterns.',
        max_tokens: 1200,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const forecasts = JSON.parse(content);
        return Array.isArray(forecasts) ? forecasts : [];
      } catch (parseError) {
        console.warn('Failed to parse seasonal forecast as JSON');
        return [];
      }
    } catch (error) {
      console.error('Failed to generate seasonal forecast:', error);
      return [];
    }
  }

  private async analyzeCompetitiveLandscape(request: MarketTrendRequest): Promise<CompetitiveAnalysis[]> {
    const prompt = `Analyze competitive landscape for:

TOPIC: ${request.topic}
INDUSTRY: ${request.industry}
${request.location ? `LOCATION: ${request.location}` : ''}

Provide analysis of:
1. Direct competitors in the topic space
2. Indirect competitors targeting similar keywords
3. Content competitors creating similar content
4. Market share and positioning
5. Strengths and weaknesses
6. Gap opportunities

Return as JSON array with structure:
{
  "competitorType": "direct|indirect|content",
  "trendFocus": ["trend1", "trend2"],
  "marketShare": 15.5,
  "strengthScore": 75,
  "gapOpportunities": ["gap1", "gap2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Focus on actionable competitive intelligence.`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are a competitive intelligence analyst who identifies opportunities to outperform competitors.',
        max_tokens: 1200,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const analysis = JSON.parse(content);
        return Array.isArray(analysis) ? analysis : [];
      } catch (parseError) {
        console.warn('Failed to parse competitive analysis as JSON');
        return [];
      }
    } catch (error) {
      console.error('Failed to analyze competitive landscape:', error);
      return [];
    }
  }

  private async generateTrendRecommendations(
    request: MarketTrendRequest,
    currentTrends: MarketTrend[],
    emergingOpportunities: MarketTrend[],
    marketInsights: MarketInsight[]
  ): Promise<TrendRecommendation[]> {
    const prompt = `Generate comprehensive trend-based recommendations using this analysis:

TOPIC: ${request.topic}
INDUSTRY: ${request.industry}
${request.location ? `LOCATION: ${request.location}` : ''}

KEY TRENDS:
${JSON.stringify(currentTrends.slice(0, 3), null, 2)}

EMERGING OPPORTUNITIES:
${JSON.stringify(emergingOpportunities.slice(0, 3), null, 2)}

MARKET INSIGHTS:
${JSON.stringify(marketInsights.slice(0, 3), null, 2)}

Generate specific recommendations for:
1. Content topics and angles
2. Timing and scheduling
3. Format optimization
4. Strategic positioning
5. Resource allocation

Return as JSON array with structure:
{
  "recommendation": "specific actionable recommendation",
  "type": "content|timing|format|angle|strategy",
  "priority": "low|medium|high|critical",
  "expectedImpact": 85,
  "implementationComplexity": "low|medium|high",
  "timeframe": "specific timeframe",
  "resources": ["resource1", "resource2"],
  "successMetrics": ["metric1", "metric2"]
}

Prioritize high-impact, actionable recommendations.`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are a strategic content consultant who transforms market analysis into actionable recommendations.',
        max_tokens: 1500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const recommendations = JSON.parse(content);
        return Array.isArray(recommendations) ? recommendations : [];
      } catch (parseError) {
        console.warn('Failed to parse trend recommendations as JSON');
        return [];
      }
    } catch (error) {
      console.error('Failed to generate trend recommendations:', error);
      return [];
    }
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  private calculateNextUpdate(): string {
    const nextUpdate = new Date();
    nextUpdate.setDate(nextUpdate.getDate() + 7); // Update weekly
    return nextUpdate.toISOString();
  }

  // Helper method to get quick trend insights
  async getQuickTrendInsights(topic: string, industry: string): Promise<MarketInsight[]> {
    const request: MarketTrendRequest = {
      topic,
      industry,
      timeframe: '30_days',
      includeCompetitors: false,
      includeSeasonal: false,
      detailLevel: 'basic'
    };

    const result = await this.analyzeMarketTrends(request);
    return result.marketInsights.slice(0, 5); // Return top 5 insights
  }

  // Method to validate trend relevance for a specific business
  async validateTrendRelevance(
    trend: MarketTrend,
    businessContext: {
      industry: string;
      location?: string;
      targetAudience: string;
      businessGoals: string[];
    }
  ): Promise<{
    relevanceScore: number;
    alignmentReasons: string[];
    implementationSuggestions: string[];
  }> {
    const prompt = `Evaluate how relevant this trend is for a specific business:

TREND: ${JSON.stringify(trend, null, 2)}

BUSINESS CONTEXT:
${JSON.stringify(businessContext, null, 2)}

Return analysis as JSON:
{
  "relevanceScore": 85,
  "alignmentReasons": ["reason1", "reason2"],
  "implementationSuggestions": ["suggestion1", "suggestion2"]
}

Score 0-100 based on business alignment and opportunity.`;

    try {
      const response = await this.lemonfoxClient.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: 'You are a business strategy consultant who evaluates market trends for specific business relevance.',
        max_tokens: 500,
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content || '';

      try {
        const analysis = JSON.parse(content);
        return analysis;
      } catch (parseError) {
        return {
          relevanceScore: 50,
          alignmentReasons: ['Unable to analyze automatically'],
          implementationSuggestions: ['Manual evaluation recommended']
        };
      }
    } catch (error) {
      console.error('Failed to validate trend relevance:', error);
      return {
        relevanceScore: 50,
        alignmentReasons: ['Analysis failed'],
        implementationSuggestions: ['Manual review required']
      };
    }
  }
}

// Singleton instance
let marketTrendAnalyzer: MarketTrendAnalyzer | null = null;

export function getMarketTrendAnalyzer(): MarketTrendAnalyzer {
  if (!marketTrendAnalyzer) {
    marketTrendAnalyzer = new MarketTrendAnalyzer();
  }
  return marketTrendAnalyzer;
}

// Export convenience functions
export async function analyzeMarketTrends(request: MarketTrendRequest): Promise<TrendAnalysisResult> {
  const analyzer = getMarketTrendAnalyzer();
  return await analyzer.analyzeMarketTrends(request);
}

export async function getQuickTrendInsights(topic: string, industry: string): Promise<MarketInsight[]> {
  const analyzer = getMarketTrendAnalyzer();
  return await analyzer.getQuickTrendInsights(topic, industry);
}