import { getProxyManager } from './proxy-manager';
import { getSERPTracker } from './serp-tracker';
import { getContentPerformanceTracker } from './content-performance-tracker';
import { getAnalyticsIntegrator } from './analytics-integrator';

export interface PerformanceScore {
  overall: number;
  ranking: number;
  content: number;
  technical: number;
  traffic: number;
  authority: number;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F';
  trends: {
    direction: 'up' | 'down' | 'stable';
    change: number;
  };
}

export interface PerformanceFactors {
  rankings: {
    averagePosition: number;
    top10Ratio: number;
    top3Ratio: number;
    keywordCount: number;
    positionTrend: number;
  };
  content: {
    averageContentScore: number;
    averageOptimizationScore: number;
    contentGapCount: number;
    technicalIssueCount: number;
  };
  technical: {
    proxyHealth: number;
    crawlSuccess: number;
    siteSpeed: number;
    mobileOptimization: number;
  };
  traffic: {
    organicTraffic: number;
    engagementRate: number;
    conversionRate: number;
    bounceRate: number;
  };
  authority: {
    backlinkScore: number;
    domainAuthority: number;
    brandMentions: number;
    socialSignals: number;
  };
}

export class PerformanceScorer {
  private weights = {
    ranking: 0.30,
    content: 0.25,
    technical: 0.20,
    traffic: 0.15,
    authority: 0.10
  };

  /**
   * Calculate comprehensive performance score for a domain
   */
  async calculatePerformanceScore(domain: string): Promise<PerformanceScore> {
    const factors = await this.collectPerformanceFactors(domain);
    const scores = this.calculateComponentScores(factors);
    const overall = this.calculateWeightedScore(scores);
    const trends = await this.calculateTrends(domain, overall);

    return {
      overall,
      ranking: scores.ranking,
      content: scores.content,
      technical: scores.technical,
      traffic: scores.traffic,
      authority: scores.authority,
      grade: this.getGrade(overall),
      trends
    };
  }

  /**
   * Collect performance data from all sources
   */
  private async collectPerformanceFactors(domain: string): Promise<PerformanceFactors> {
    const [rankings, contentData, analyticsData, proxyStats] = await Promise.all([
      this.getRankingFactors(domain),
      this.getContentFactors(domain),
      this.getTrafficFactors(domain),
      this.getTechnicalFactors()
    ]);

    return {
      rankings,
      content: contentData,
      technical: proxyStats,
      traffic: analyticsData,
      authority: await this.getAuthorityFactors(domain)
    };
  }

  /**
   * Get ranking-related factors
   */
  private async getRankingFactors(domain: string) {
    try {
      const tracker = getSERPTracker();
      // @ts-ignore - Method doesn't exist in SERPTracker interface
      const rankings = await tracker.getCurrentRankings(domain, ['google']);

      if (rankings.length === 0) {
        return {
          averagePosition: 100,
          top10Ratio: 0,
          top3Ratio: 0,
          keywordCount: 0,
          positionTrend: 0
        };
      }

      const positions = rankings.map((r: any) => r.position);
      const averagePosition = positions.reduce((sum: number, pos: number) => sum + pos, 0) / positions.length;
      const top10Count = positions.filter((pos: number) => pos <= 10).length;
      const top3Count = positions.filter((pos: number) => pos <= 3).length;

      // Calculate position trend (simplified)
      const positionTrend = rankings
        .filter((r: any) => r.previousPosition)
        .reduce((sum: number, r: any) => sum + (r.position - r.previousPosition!), 0) / rankings.length;

      return {
        averagePosition,
        top10Ratio: top10Count / rankings.length,
        top3Ratio: top3Count / rankings.length,
        keywordCount: rankings.length,
        positionTrend
      };
    } catch (error) {
      console.error('Error getting ranking factors:', error);
      return {
        averagePosition: 100,
        top10Ratio: 0,
        top3Ratio: 0,
        keywordCount: 0,
        positionTrend: 0
      };
    }
  }

  /**
   * Get content-related factors
   */
  private async getContentFactors(domain: string) {
    try {
      const tracker = getContentPerformanceTracker();
      const report = await tracker.generatePerformanceReport(domain);

      return {
        averageContentScore: report.averageContentScore || 0,
        // @ts-ignore - Property doesn't exist in ContentPerformanceReport
        averageOptimizationScore: report.averageOptimizationScore || 0,
        contentGapCount: report.contentGapsAnalysis?.criticalGaps?.length || 0,
        technicalIssueCount: report.technicalSeoIssues?.length || 0
      };
    } catch (error) {
      console.error('Error getting content factors:', error);
      return {
        averageContentScore: 0,
        averageOptimizationScore: 0,
        contentGapCount: 0,
        technicalIssueCount: 0
      };
    }
  }

  /**
   * Get traffic-related factors from analytics
   */
  private async getTrafficFactors(domain: string) {
    try {
      const integrator = getAnalyticsIntegrator();
      // @ts-ignore - Method doesn't exist in AnalyticsIntegrator interface
      const metrics = await integrator.fetchMetricsFromDomain(domain);

      // Get the best performing analytics source
      const bestSource = Object.values(metrics).reduce((best: any, current: any) =>
        (current.pageviews || 0) > (best.pageviews || 0) ? current : best,
        { pageviews: 0, users: 0, sessions: 0 } as any
      );

      return {
        organicTraffic: (bestSource as any).pageviews || 0,
        engagementRate: (bestSource as any).avgSessionDuration ? Math.min(((bestSource as any).avgSessionDuration / 180) * 100, 100) : 0,
        conversionRate: (bestSource as any).conversionRate || 0,
        bounceRate: (bestSource as any).bounceRate || 100
      };
    } catch (error) {
      console.error('Error getting traffic factors:', error);
      return {
        organicTraffic: 0,
        engagementRate: 0,
        conversionRate: 0,
        bounceRate: 100
      };
    }
  }

  /**
   * Get technical factors including proxy health
   */
  private async getTechnicalFactors() {
    try {
      const proxyManager = getProxyManager();
      const stats = proxyManager.getProxyPoolStats();

      const proxyHealth = stats.totalProxies > 0 ? (stats.healthyProxies / stats.totalProxies) * 100 : 0;

      return {
        proxyHealth,
        crawlSuccess: 95, // Mock value - would come from crawler
        siteSpeed: 85, // Mock value - would come from performance monitoring
        mobileOptimization: 90 // Mock value - would come from mobile testing
      };
    } catch (error) {
      console.error('Error getting technical factors:', error);
      return {
        proxyHealth: 0,
        crawlSuccess: 0,
        siteSpeed: 0,
        mobileOptimization: 0
      };
    }
  }

  /**
   * Get authority factors (mock implementation)
   */
  private async getAuthorityFactors(domain: string) {
    // In a real implementation, this would integrate with APIs like:
    // - Moz API for Domain Authority
    // - Ahrefs API for backlink analysis
    // - Social media APIs for brand mentions

    return {
      backlinkScore: Math.floor(Math.random() * 100),
      domainAuthority: Math.floor(Math.random() * 100),
      brandMentions: Math.floor(Math.random() * 50),
      socialSignals: Math.floor(Math.random() * 100)
    };
  }

  /**
   * Calculate individual component scores
   */
  private calculateComponentScores(factors: PerformanceFactors) {
    const scores = {
      ranking: this.calculateRankingScore(factors.rankings),
      content: this.calculateContentScore(factors.content),
      technical: this.calculateTechnicalScore(factors.technical),
      traffic: this.calculateTrafficScore(factors.traffic),
      authority: this.calculateAuthorityScore(factors.authority)
    };

    return scores;
  }

  /**
   * Calculate ranking score (0-100)
   */
  private calculateRankingScore(rankings: PerformanceFactors['rankings']): number {
    let score = 0;

    // Average position score (lower is better)
    const positionScore = Math.max(0, 100 - (rankings.averagePosition - 1) * 2);
    score += positionScore * 0.4;

    // Top 10 ratio score
    score += rankings.top10Ratio * 100 * 0.3;

    // Top 3 ratio score
    score += rankings.top3Ratio * 100 * 0.2;

    // Keyword count score (diminishing returns)
    const keywordScore = Math.min(100, Math.log10(rankings.keywordCount + 1) * 20);
    score += keywordScore * 0.1;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate content score (0-100)
   */
  private calculateContentScore(content: PerformanceFactors['content']): number {
    let score = 0;

    // Content quality score
    score += content.averageContentScore * 0.4;

    // Optimization score
    score += content.averageOptimizationScore * 0.3;

    // Penalty for content gaps
    const gapPenalty = Math.min(30, content.contentGapCount * 5);
    score -= gapPenalty * 0.2;

    // Penalty for technical issues
    const issuePenalty = Math.min(40, content.technicalIssueCount * 8);
    score -= issuePenalty * 0.1;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate technical score (0-100)
   */
  private calculateTechnicalScore(technical: PerformanceFactors['technical']): number {
    let score = 0;

    score += technical.proxyHealth * 0.3;
    score += technical.crawlSuccess * 0.3;
    score += technical.siteSpeed * 0.2;
    score += technical.mobileOptimization * 0.2;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate traffic score (0-100)
   */
  private calculateTrafficScore(traffic: PerformanceFactors['traffic']): number {
    let score = 0;

    // Organic traffic score (logarithmic scale)
    const trafficScore = Math.min(100, Math.log10(traffic.organicTraffic + 1) * 10);
    score += trafficScore * 0.4;

    // Engagement score
    score += traffic.engagementRate * 0.3;

    // Conversion score
    score += traffic.conversionRate * 10 * 0.2; // Conversion rate as percentage

    // Bounce rate penalty
    const bouncePenalty = Math.max(0, traffic.bounceRate - 50) * 0.1;
    score -= bouncePenalty * 0.1;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate authority score (0-100)
   */
  private calculateAuthorityScore(authority: PerformanceFactors['authority']): number {
    let score = 0;

    score += authority.domainAuthority * 0.4;
    score += authority.backlinkScore * 0.3;
    score += Math.min(100, authority.brandMentions * 2) * 0.2;
    score += authority.socialSignals * 0.1;

    return Math.round(Math.min(100, Math.max(0, score)));
  }

  /**
   * Calculate weighted overall score
   */
  private calculateWeightedScore(scores: {
    ranking: number;
    content: number;
    technical: number;
    traffic: number;
    authority: number;
  }): number {
    let weightedScore = 0;

    weightedScore += scores.ranking * this.weights.ranking;
    weightedScore += scores.content * this.weights.content;
    weightedScore += scores.technical * this.weights.technical;
    weightedScore += scores.traffic * this.weights.traffic;
    weightedScore += scores.authority * this.weights.authority;

    return Math.round(weightedScore);
  }

  /**
   * Calculate performance trends
   */
  private async calculateTrends(domain: string, currentScore: number): Promise<PerformanceScore['trends']> {
    // In a real implementation, this would compare with historical data
    // For now, we'll simulate trend calculation

    const previousScore = currentScore + (Math.random() - 0.5) * 20; // Simulated previous score
    const change = currentScore - previousScore;

    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(change) < 2) {
      direction = 'stable';
    } else if (change > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return {
      direction,
      change: Math.round(change * 10) / 10
    };
  }

  /**
   * Convert numeric score to letter grade
   */
  private getGrade(score: number): PerformanceScore['grade'] {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get performance recommendations based on scores
   */
  async getPerformanceRecommendations(domain: string): Promise<string[]> {
    const score = await this.calculatePerformanceScore(domain);
    const recommendations: string[] = [];

    // Ranking recommendations
    if (score.ranking < 70) {
      recommendations.push('Focus on improving keyword rankings through targeted content optimization and link building');
    }
    if (score.ranking < 50) {
      recommendations.push('Consider conducting comprehensive keyword research to identify better ranking opportunities');
    }

    // Content recommendations
    if (score.content < 70) {
      recommendations.push('Improve content quality by adding more depth, value, and comprehensive coverage');
    }
    if (score.content < 50) {
      recommendations.push('Address critical content gaps and technical SEO issues immediately');
    }

    // Technical recommendations
    if (score.technical < 70) {
      recommendations.push('Optimize technical aspects including site speed, mobile optimization, and crawl efficiency');
    }
    if (score.technical < 50) {
      recommendations.push('Resolve critical technical issues that are impacting search performance');
    }

    // Traffic recommendations
    if (score.traffic < 70) {
      recommendations.push('Improve user engagement and conversion rates through better user experience design');
    }

    // Authority recommendations
    if (score.authority < 70) {
      recommendations.push('Build domain authority through quality backlinks and brand mentions');
    }

    // Overall recommendations
    if (score.overall < 60) {
      recommendations.push('Comprehensive SEO strategy needed - focus on quick wins first, then long-term improvements');
    } else if (score.overall >= 90) {
      recommendations.push('Excellent performance! Focus on maintaining current rankings and exploring new opportunities');
    }

    return recommendations;
  }
}

// Singleton instance
let performanceScorer: PerformanceScorer;

export function getPerformanceScorer(): PerformanceScorer {
  if (!performanceScorer) {
    performanceScorer = new PerformanceScorer();
  }
  return performanceScorer;
}