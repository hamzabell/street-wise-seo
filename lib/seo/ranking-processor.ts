import { getPerformanceTrackingByKeyword, getPerformanceTrackingByTopicId } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';

export interface RankingData {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  positionChange: number;
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  trend: 'up' | 'down' | 'stable';
  date: string;
}

export interface RankingAlert {
  type: 'position_drop' | 'significant_improvement' | 'new_keyword';
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: string;
}

export interface RankingAnalysis {
  totalKeywords: number;
  averagePosition: number;
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  rankings: RankingData[];
  alerts: RankingAlert[];
  topPerformers: RankingData[];
  declinedKeywords: RankingData[];
  newKeywords: RankingData[];
}

export class RankingProcessor {
  /**
   * Process ranking data for a topic
   */
  static async processTopicRankings(savedTopicId: number, days: number = 30): Promise<RankingAnalysis> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    // Get performance tracking data
    const trackingData = await getPerformanceTrackingByTopicId(savedTopicId, supabaseUserId, days * 2);

    if (trackingData.length === 0) {
      return {
        totalKeywords: 0,
        averagePosition: 0,
        totalClicks: 0,
        totalImpressions: 0,
        averageCTR: 0,
        rankings: [],
        alerts: [],
        topPerformers: [],
        declinedKeywords: [],
        newKeywords: []
      };
    }

    // Process the data
    const rankings = this.processRankingData(trackingData);
    const alerts = this.generateRankingAlerts(rankings);
    const topPerformers = this.getTopPerformers(rankings);
    const declinedKeywords = this.getDeclinedKeywords(rankings);
    const newKeywords = this.getNewKeywords(rankings);

    // Calculate aggregates
    const totalKeywords = rankings.length;
    const averagePosition = rankings.reduce((sum, r) => sum + r.currentPosition, 0) / totalKeywords;
    const totalClicks = rankings.reduce((sum, r) => sum + r.clicks, 0);
    const totalImpressions = rankings.reduce((sum, r) => sum + r.impressions, 0);
    const averageCTR = rankings.reduce((sum, r) => sum + r.ctr, 0) / totalKeywords;

    return {
      totalKeywords,
      averagePosition: Math.round(averagePosition),
      totalClicks,
      totalImpressions,
      averageCTR: Math.round(averageCTR / 100), // Convert from basis points
      rankings,
      alerts,
      topPerformers,
      declinedKeywords,
      newKeywords
    };
  }

  /**
   * Process ranking data for a specific keyword
   */
  static async processKeywordRankings(keyword: string, days: number = 30): Promise<RankingAnalysis> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    // Get performance tracking data for keyword
    const trackingData = await getPerformanceTrackingByKeyword(keyword, supabaseUserId, days * 2);

    if (trackingData.length === 0) {
      return {
        totalKeywords: 0,
        averagePosition: 0,
        totalClicks: 0,
        totalImpressions: 0,
        averageCTR: 0,
        rankings: [],
        alerts: [],
        topPerformers: [],
        declinedKeywords: [],
        newKeywords: []
      };
    }

    // Process the data
    const rankings = this.processRankingData(trackingData);
    const alerts = this.generateRankingAlerts(rankings);

    // For single keyword, the rankings array will have one entry per URL
    const totalClicks = rankings.reduce((sum, r) => sum + r.clicks, 0);
    const totalImpressions = rankings.reduce((sum, r) => sum + r.impressions, 0);
    const averagePosition = rankings.reduce((sum, r) => sum + r.currentPosition, 0) / rankings.length;
    const averageCTR = rankings.reduce((sum, r) => sum + r.ctr, 0) / rankings.length;

    return {
      totalKeywords: 1,
      averagePosition: Math.round(averagePosition),
      totalClicks,
      totalImpressions,
      averageCTR: Math.round(averageCTR / 100),
      rankings,
      alerts,
      topPerformers: rankings.filter(r => r.currentPosition <= 10),
      declinedKeywords: rankings.filter(r => r.positionChange > 5),
      newKeywords: [] // Not applicable for keyword-specific analysis
    };
  }

  /**
   * Process raw tracking data into ranking insights
   */
  private static processRankingData(trackingData: any[]): RankingData[] {
    // Group by keyword and URL
    const groupedData = new Map<string, any[]>();

    trackingData.forEach(row => {
      const key = `${row.keyword}_${row.url}`;
      if (!groupedData.has(key)) {
        groupedData.set(key, []);
      }
      groupedData.get(key)!.push(row);
    });

    const rankings: RankingData[] = [];

    // Process each keyword/URL combination
    groupedData.forEach((entries, key) => {
      // Sort by date
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const latest = entries[0];
      const previous = entries[1];

      const currentPosition = latest.position / 100; // Convert from basis points
      const previousPosition = previous ? previous.position / 100 : currentPosition;
      const positionChange = previousPosition - currentPosition;

      // Determine trend
      let trend: 'up' | 'down' | 'stable';
      if (Math.abs(positionChange) <= 2) {
        trend = 'stable';
      } else if (positionChange > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }

      rankings.push({
        keyword: latest.keyword,
        currentPosition,
        previousPosition,
        positionChange,
        url: latest.url,
        clicks: latest.clicks,
        impressions: latest.impressions,
        ctr: latest.ctr / 10000, // Convert from basis points
        trend,
        date: latest.date
      });
    });

    return rankings.sort((a, b) => a.currentPosition - b.currentPosition);
  }

  /**
   * Generate ranking alerts based on significant changes
   */
  private static generateRankingAlerts(rankings: RankingData[]): RankingAlert[] {
    const alerts: RankingAlert[] = [];

    rankings.forEach(ranking => {
      // Position drop alerts
      if (ranking.positionChange > 10) {
        alerts.push({
          type: 'position_drop',
          keyword: ranking.keyword,
          currentPosition: ranking.currentPosition,
          previousPosition: ranking.previousPosition,
          severity: ranking.currentPosition <= 10 ? 'high' : 'medium',
          message: `${ranking.keyword} dropped from position ${ranking.previousPosition} to ${ranking.currentPosition}`,
          date: ranking.date
        });
      }

      // Significant improvement alerts
      if (ranking.positionChange < -10 && ranking.currentPosition <= 20) {
        alerts.push({
          type: 'significant_improvement',
          keyword: ranking.keyword,
          currentPosition: ranking.currentPosition,
          previousPosition: ranking.previousPosition,
          severity: 'low',
          message: `${ranking.keyword} improved from position ${ranking.previousPosition} to ${ranking.currentPosition}`,
          date: ranking.date
        });
      }

      // New keyword alerts (previous position was same as current, indicating first appearance)
      if (ranking.previousPosition === ranking.currentPosition && ranking.clicks > 0) {
        alerts.push({
          type: 'new_keyword',
          keyword: ranking.keyword,
          currentPosition: ranking.currentPosition,
          previousPosition: ranking.previousPosition,
          severity: ranking.currentPosition <= 10 ? 'medium' : 'low',
          message: `New keyword ${ranking.keyword} is ranking at position ${ranking.currentPosition}`,
          date: ranking.date
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Get top performing keywords
   */
  private static getTopPerformers(rankings: RankingData[]): RankingData[] {
    return rankings
      .filter(r => r.currentPosition <= 10 && r.clicks > 0)
      .sort((a, b) => {
        // Sort by position first, then by clicks
        if (a.currentPosition !== b.currentPosition) {
          return a.currentPosition - b.currentPosition;
        }
        return b.clicks - a.clicks;
      })
      .slice(0, 10);
  }

  /**
   * Get keywords with declining performance
   */
  private static getDeclinedKeywords(rankings: RankingData[]): RankingData[] {
    return rankings
      .filter(r => r.positionChange > 5)
      .sort((a, b) => b.positionChange - a.positionChange)
      .slice(0, 10);
  }

  /**
   * Get newly discovered keywords
   */
  private static getNewKeywords(rankings: RankingData[]): RankingData[] {
    return rankings
      .filter(r => r.previousPosition === r.currentPosition && r.clicks > 0)
      .sort((a, b) => a.currentPosition - b.currentPosition)
      .slice(0, 10);
  }

  /**
   * Calculate ranking velocity (rate of position change)
   */
  static calculateRankingVelocity(rankings: RankingData[], days: number = 30): number {
    if (rankings.length === 0) return 0;

    const totalChange = rankings.reduce((sum, r) => sum + r.positionChange, 0);
    return totalChange / days;
  }

  /**
   * Estimate traffic opportunity
   */
  static estimateTrafficOpportunity(rankings: RankingData[]): number {
    if (rankings.length === 0) return 0;

    // Simple estimation based on CTR potential improvement
    let totalOpportunity = 0;

    rankings.forEach(ranking => {
      if (ranking.currentPosition > 1) {
        // Estimate additional clicks if ranking improves to position 1
        const position1CTR = this.getExpectedCTR(1);
        const additionalCTR = position1CTR - ranking.ctr;
        const additionalClicks = Math.round(ranking.impressions * additionalCTR);
        totalOpportunity += additionalClicks;
      }
    });

    return totalOpportunity;
  }

  /**
   * Get expected CTR for a given position (based on industry averages)
   */
  private static getExpectedCTR(position: number): number {
    const ctrCurve = {
      1: 0.285,  // 28.5%
      2: 0.157,  // 15.7%
      3: 0.110,  // 11.0%
      4: 0.080,  // 8.0%
      5: 0.072,  // 7.2%
      6: 0.051,  // 5.1%
      7: 0.037,  // 3.7%
      8: 0.029,  // 2.9%
      9: 0.024,  // 2.4%
      10: 0.021, // 2.1%
    };

    return ctrCurve[position as keyof typeof ctrCurve] || 0.01;
  }

  /**
   * Get ranking distribution (how many keywords in each position tier)
   */
  static getRankingDistribution(rankings: RankingData[]): {
    top3: number;
    top5: number;
    top10: number;
    top20: number;
    beyond20: number;
  } {
    const distribution = {
      top3: 0,
      top5: 0,
      top10: 0,
      top20: 0,
      beyond20: 0
    };

    rankings.forEach(ranking => {
      if (ranking.currentPosition <= 3) {
        distribution.top3++;
      }
      if (ranking.currentPosition <= 5) {
        distribution.top5++;
      }
      if (ranking.currentPosition <= 10) {
        distribution.top10++;
      }
      if (ranking.currentPosition <= 20) {
        distribution.top20++;
      } else {
        distribution.beyond20++;
      }
    });

    return distribution;
  }
}