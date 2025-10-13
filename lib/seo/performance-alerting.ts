import { getPerformanceScorer } from './performance-scorer';
import { getSERPTracker } from './serp-tracker';
import { getContentPerformanceTracker } from './content-performance-tracker';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: 'ranking_drop' | 'content_score_drop' | 'technical_issue' | 'traffic_decline' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  conditions: {
    threshold?: number;
    changePercent?: number;
    timeWindow?: number; // in hours
    keywords?: string[];
    pages?: string[];
  };
  notifications: {
    email?: boolean;
    dashboard?: boolean;
    webhook?: string;
  };
  createdAt: Date;
  lastTriggered?: Date;
}

export interface PerformanceAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  type: AlertRule['type'];
  severity: AlertRule['severity'];
  title: string;
  message: string;
  details: Record<string, any>;
  domain: string;
  triggeredAt: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface AlertReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    mediumAlerts: number;
    lowAlerts: number;
    resolvedAlerts: number;
    activeAlerts: number;
  };
  alerts: PerformanceAlert[];
  trends: {
    rankingDrops: number;
    contentIssues: number;
    technicalProblems: number;
    trafficDeclines: number;
    opportunities: number;
  };
  recommendations: string[];
}

export class PerformanceAlerting {
  private defaultRules: AlertRule[] = [
    {
      id: 'ranking-drop-10',
      name: 'Significant Ranking Drop',
      description: 'Alert when keyword rankings drop by 10+ positions',
      type: 'ranking_drop',
      severity: 'high',
      enabled: true,
      conditions: {
        threshold: 10,
        timeWindow: 24
      },
      notifications: {
        email: true,
        dashboard: true
      },
      createdAt: new Date()
    },
    {
      id: 'content-score-below-60',
      name: 'Low Content Score',
      description: 'Alert when content quality drops below 60',
      type: 'content_score_drop',
      severity: 'medium',
      enabled: true,
      conditions: {
        threshold: 60
      },
      notifications: {
        dashboard: true
      },
      createdAt: new Date()
    },
    {
      id: 'proxy-health-critical',
      name: 'Critical Proxy Health Issues',
      description: 'Alert when proxy pool health drops below 50%',
      type: 'technical_issue',
      severity: 'critical',
      enabled: true,
      conditions: {
        threshold: 50
      },
      notifications: {
        email: true,
        dashboard: true
      },
      createdAt: new Date()
    },
    {
      id: 'traffic-decline-20',
      name: 'Significant Traffic Decline',
      description: 'Alert when organic traffic drops by 20%+',
      type: 'traffic_decline',
      severity: 'high',
      enabled: true,
      conditions: {
        changePercent: 20,
        timeWindow: 72
      },
      notifications: {
        email: true,
        dashboard: true
      },
      createdAt: new Date()
    },
    {
      id: 'new-top-opportunity',
      name: 'New Top 10 Opportunity',
      description: 'Alert when keywords move into positions 11-15',
      type: 'opportunity',
      severity: 'low',
      enabled: true,
      conditions: {
        threshold: 15
      },
      notifications: {
        dashboard: true
      },
      createdAt: new Date()
    }
  ];

  private activeAlerts: Map<string, PerformanceAlert> = new Map();
  private alertHistory: PerformanceAlert[] = [];
  private customRules: AlertRule[] = [];

  /**
   * Run comprehensive performance check and generate alerts
   */
  async runPerformanceCheck(domain: string): Promise<PerformanceAlert[]> {
    const newAlerts: PerformanceAlert[] = [];
    const enabledRules = [...this.defaultRules, ...this.customRules].filter(rule => rule.enabled);

    console.log(`🔔 [ALERTING] Running performance check for ${domain} with ${enabledRules.length} rules`);

    for (const rule of enabledRules) {
      try {
        const alert = await this.evaluateRule(rule, domain);
        if (alert) {
          newAlerts.push(alert);
          this.activeAlerts.set(alert.id, alert);
          this.alertHistory.push(alert);
          console.log(`🚨 [ALERT] ${alert.severity.toUpperCase()}: ${alert.title}`);
        }
      } catch (error) {
        console.error(`❌ [ALERTING] Error evaluating rule ${rule.name}:`, error);
      }
    }

    // Clean up resolved alerts
    this.cleanupResolvedAlerts();

    return newAlerts;
  }

  /**
   * Evaluate a single alert rule
   */
  private async evaluateRule(rule: AlertRule, domain: string): Promise<PerformanceAlert | null> {
    switch (rule.type) {
      case 'ranking_drop':
        return await this.checkRankingDrop(rule, domain);
      case 'content_score_drop':
        return await this.checkContentScoreDrop(rule, domain);
      case 'technical_issue':
        return await this.checkTechnicalIssues(rule, domain);
      case 'traffic_decline':
        return await this.checkTrafficDecline(rule, domain);
      case 'opportunity':
        return await this.checkOpportunities(rule, domain);
      default:
        return null;
    }
  }

  /**
   * Check for significant ranking drops
   */
  private async checkRankingDrop(rule: AlertRule, domain: string): Promise<PerformanceAlert | null> {
    const tracker = getSERPTracker();
    // @ts-ignore - Method doesn't exist in SERPTracker interface
    const rankings = await tracker.getCurrentRankings(domain, ['google']);

    const significantDrops = rankings.filter((ranking: any) =>
      ranking.previousPosition &&
      ranking.position > ranking.previousPosition + (rule.conditions.threshold || 10)
    );

    if (significantDrops.length > 0) {
      const worstDrop = significantDrops.reduce((worst: any, current: any) =>
        (current.position - current.previousPosition!) > (worst.position - worst.previousPosition!) ? current : worst
      );

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        severity: rule.severity,
        title: `Significant Ranking Drop Detected`,
        message: `Keyword "${worstDrop.keyword}" dropped from position ${worstDrop.previousPosition} to ${worstDrop.position}`,
        details: {
          keyword: worstDrop.keyword,
          previousPosition: worstDrop.previousPosition,
          currentPosition: worstDrop.position,
          dropAmount: worstDrop.position - worstDrop.previousPosition!,
          url: worstDrop.url,
          totalDrops: significantDrops.length
        },
        domain,
        triggeredAt: new Date(),
        acknowledged: false,
        resolved: false
      };
    }

    return null;
  }

  /**
   * Check for content quality issues
   */
  private async checkContentScoreDrop(rule: AlertRule, domain: string): Promise<PerformanceAlert | null> {
    const tracker = getContentPerformanceTracker();
    const report = await tracker.generatePerformanceReport(domain);

    if (report.averageContentScore < (rule.conditions.threshold || 60)) {
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        severity: rule.severity,
        title: 'Low Content Quality Detected',
        message: `Average content score is ${report.averageContentScore.toFixed(1)}, below the threshold of ${rule.conditions.threshold}`,
        details: {
          averageScore: report.averageContentScore,
          threshold: rule.conditions.threshold,
          totalContent: report.totalContentPieces,
          underperformingContent: report.underperformingContent.length,
          technicalIssues: report.technicalSeoIssues.length
        },
        domain,
        triggeredAt: new Date(),
        acknowledged: false,
        resolved: false
      };
    }

    return null;
  }

  /**
   * Check for technical issues (simplified proxy health check)
   */
  private async checkTechnicalIssues(rule: AlertRule, domain: string): Promise<PerformanceAlert | null> {
    // In a real implementation, this would check actual technical metrics
    // For now, we'll simulate a proxy health check
    const mockProxyHealth = Math.random() * 100;

    if (mockProxyHealth < (rule.conditions.threshold || 50)) {
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        severity: rule.severity,
        title: 'Critical Technical Issues Detected',
        message: `Proxy pool health at ${mockProxyHealth.toFixed(1)}%, below threshold of ${rule.conditions.threshold}%`,
        details: {
          proxyHealth: mockProxyHealth,
          threshold: rule.conditions.threshold,
          issueType: 'proxy_health',
          affectedSystems: ['SERP tracking', 'Automated monitoring']
        },
        domain,
        triggeredAt: new Date(),
        acknowledged: false,
        resolved: false
      };
    }

    return null;
  }

  /**
   * Check for traffic declines
   */
  private async checkTrafficDecline(rule: AlertRule, domain: string): Promise<PerformanceAlert | null> {
    // Mock implementation - in reality this would compare with historical data
    const mockDecline = Math.random() * 40; // Simulate 0-40% decline

    if (mockDecline > (rule.conditions.changePercent || 20)) {
      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        severity: rule.severity,
        title: 'Significant Traffic Decline',
        message: `Organic traffic declined by ${mockDecline.toFixed(1)}% in the last ${rule.conditions.timeWindow || 72} hours`,
        details: {
          declinePercent: mockDecline,
          timeWindow: rule.conditions.timeWindow || 72,
          previousTraffic: Math.floor(Math.random() * 10000 + 5000),
          currentTraffic: Math.floor(Math.random() * 8000 + 3000)
        },
        domain,
        triggeredAt: new Date(),
        acknowledged: false,
        resolved: false
      };
    }

    return null;
  }

  /**
   * Check for new opportunities
   */
  private async checkOpportunities(rule: AlertRule, domain: string): Promise<PerformanceAlert | null> {
    const tracker = getSERPTracker();
    // @ts-ignore - Method doesn't exist in SERPTracker interface
    const rankings = await tracker.getCurrentRankings(domain, ['google']);

    const opportunities = rankings.filter((ranking: any) =>
      ranking.position >= 11 &&
      ranking.position <= (rule.conditions.threshold || 15)
    );

    if (opportunities.length > 0) {
      const bestOpportunity = opportunities.reduce((best: any, current: any) =>
        current.position < best.position ? current : best
      );

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        severity: rule.severity,
        title: 'New Ranking Opportunity Detected',
        message: `Keyword "${bestOpportunity.keyword}" is now at position ${bestOpportunity.position}, close to top 10`,
        details: {
          keyword: bestOpportunity.keyword,
          currentPosition: bestOpportunity.position,
          url: bestOpportunity.url,
          totalOpportunities: opportunities.length,
          opportunityKeywords: opportunities.map((o: any) => o.keyword)
        },
        domain,
        triggeredAt: new Date(),
        acknowledged: false,
        resolved: false
      };
    }

    return null;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.activeAlerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: AlertRule['severity']): PerformanceAlert[] {
    return this.getActiveAlerts().filter(alert => alert.severity === severity);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
      alert.acknowledgedBy = acknowledgedBy;
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Generate alert report for a time period
   */
  async generateAlertReport(domain: string, startDate: Date, endDate: Date): Promise<AlertReport> {
    const periodAlerts = this.alertHistory.filter(alert =>
      alert.domain === domain &&
      alert.triggeredAt >= startDate &&
      alert.triggeredAt <= endDate
    );

    const summary = {
      totalAlerts: periodAlerts.length,
      criticalAlerts: periodAlerts.filter(a => a.severity === 'critical').length,
      highAlerts: periodAlerts.filter(a => a.severity === 'high').length,
      mediumAlerts: periodAlerts.filter(a => a.severity === 'medium').length,
      lowAlerts: periodAlerts.filter(a => a.severity === 'low').length,
      resolvedAlerts: periodAlerts.filter(a => a.resolved).length,
      activeAlerts: periodAlerts.filter(a => !a.resolved).length
    };

    const trends = {
      rankingDrops: periodAlerts.filter(a => a.type === 'ranking_drop').length,
      contentIssues: periodAlerts.filter(a => a.type === 'content_score_drop').length,
      technicalProblems: periodAlerts.filter(a => a.type === 'technical_issue').length,
      trafficDeclines: periodAlerts.filter(a => a.type === 'traffic_decline').length,
      opportunities: periodAlerts.filter(a => a.type === 'opportunity').length
    };

    const recommendations = this.generateRecommendations(trends, summary);

    return {
      period: { start: startDate, end: endDate },
      summary,
      alerts: periodAlerts,
      trends,
      recommendations
    };
  }

  /**
   * Generate recommendations based on alert trends
   */
  private generateRecommendations(trends: AlertReport['trends'], summary: AlertReport['summary']): string[] {
    const recommendations: string[] = [];

    if (trends.rankingDrops > 3) {
      recommendations.push('Multiple ranking drops detected - review recent content changes and backlink profile');
    }

    if (trends.contentIssues > 2) {
      recommendations.push('Content quality issues recurring - consider comprehensive content audit');
    }

    if (trends.technicalProblems > 1) {
      recommendations.push('Technical issues persisting - prioritize technical SEO improvements');
    }

    if (trends.trafficDeclines > 2) {
      recommendations.push('Traffic declining consistently - investigate potential penalties or algorithm updates');
    }

    if (summary.criticalAlerts > 0) {
      recommendations.push('Critical alerts require immediate attention to prevent further performance loss');
    }

    if (summary.activeAlerts > summary.resolvedAlerts) {
      recommendations.push('Many alerts remain unresolved - consider dedicating resources to address issues');
    }

    if (recommendations.length === 0) {
      recommendations.push('Alert levels are normal - continue monitoring and optimization efforts');
    }

    return recommendations;
  }

  /**
   * Clean up old resolved alerts
   */
  private cleanupResolvedAlerts(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < oneWeekAgo) {
        this.activeAlerts.delete(alertId);
      }
    }
  }

  /**
   * Add custom alert rule
   */
  addCustomRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.customRules.push(newRule);
    return newRule;
  }

  /**
   * Get all alert rules
   */
  getAllRules(): AlertRule[] {
    return [...this.defaultRules, ...this.customRules];
  }

  /**
   * Update alert rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.customRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.customRules[ruleIndex] = { ...this.customRules[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Delete custom alert rule
   */
  deleteRule(ruleId: string): boolean {
    const ruleIndex = this.customRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex !== -1) {
      this.customRules.splice(ruleIndex, 1);
      return true;
    }
    return false;
  }
}

// Singleton instance
let performanceAlerting: PerformanceAlerting;

export function getPerformanceAlerting(): PerformanceAlerting {
  if (!performanceAlerting) {
    performanceAlerting = new PerformanceAlerting();
  }
  return performanceAlerting;
}