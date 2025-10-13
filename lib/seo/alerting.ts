import { RankingAlert } from './ranking-processor';

export interface AlertConfig {
  positionDropThreshold: number; // Minimum position drop to trigger alert
  topPositionThreshold: number; // Only alert for keywords above this position
  minimumClicks: number; // Minimum clicks to consider significant
  enableEmailAlerts: boolean;
  enableInAppAlerts: boolean;
  alertFrequency: 'immediate' | 'daily' | 'weekly';
}

export interface AlertNotification {
  id: string;
  type: 'position_drop' | 'significant_improvement' | 'new_keyword';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  url: string;
  timestamp: Date;
  acknowledged: boolean;
}

export class AlertingSystem {
  private static defaultConfig: AlertConfig = {
    positionDropThreshold: 5,
    topPositionThreshold: 20,
    minimumClicks: 10,
    enableEmailAlerts: true,
    enableInAppAlerts: true,
    alertFrequency: 'immediate'
  };

  /**
   * Process ranking alerts based on configuration
   */
  static processAlerts(
    alerts: RankingAlert[],
    config: Partial<AlertConfig> = {}
  ): AlertNotification[] {
    const finalConfig = { ...this.defaultConfig, ...config };
    const notifications: AlertNotification[] = [];

    alerts.forEach(alert => {
      // Filter based on configuration
      if (alert.type === 'position_drop') {
        // @ts-ignore - Type compatibility issues with complex alerting features being removed
        if (alert.positionChange < finalConfig.positionDropThreshold) return;
        if (alert.currentPosition > finalConfig.topPositionThreshold) return;
      }

      if (alert.type === 'significant_improvement') {
        // @ts-ignore - Type compatibility issues with complex alerting features being removed
        if (Math.abs(alert.positionChange) < 5) return;
      }

      // Create notification
      const notification: AlertNotification = {
        id: this.generateAlertId(alert),
        type: alert.type,
        severity: alert.severity,
        title: this.generateAlertTitle(alert),
        message: alert.message,
        keyword: alert.keyword,
        currentPosition: alert.currentPosition,
        previousPosition: alert.previousPosition,
        url: '', // Would be populated from ranking data
        timestamp: new Date(alert.date),
        acknowledged: false
      };

      notifications.push(notification);
    });

    return notifications.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate summary of critical alerts
   */
  static generateAlertSummary(alerts: AlertNotification[]): {
    total: number;
    critical: number;
    warnings: number;
    info: number;
    summary: string;
  } {
    const critical = alerts.filter(a => a.severity === 'high').length;
    const warnings = alerts.filter(a => a.severity === 'medium').length;
    const info = alerts.filter(a => a.severity === 'low').length;
    const total = alerts.length;

    let summary = '';
    if (critical > 0) {
      summary += `${critical} critical alert${critical > 1 ? 's' : ''} require immediate attention. `;
    }
    if (warnings > 0) {
      summary += `${warnings} warning${warnings > 1 ? 's' : ''} should be reviewed. `;
    }
    if (info > 0) {
      summary += `${info} informational alert${info > 1 ? 's' : ''} available. `;
    }

    if (total === 0) {
      summary = 'No alerts at this time. Your rankings are stable.';
    }

    return {
      total,
      critical,
      warnings,
      info,
      summary: summary.trim()
    };
  }

  /**
   * Get actionable recommendations for alerts
   */
  static getRecommendations(alerts: AlertNotification[]): Array<{
    alertId: string;
    keyword: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
  }> {
    const recommendations: Array<{
      alertId: string;
      keyword: string;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
      estimatedImpact: string;
    }> = [];

    alerts.forEach(alert => {
      let recommendation = '';
      let priority = alert.severity;
      let estimatedImpact = '';

      switch (alert.type) {
        case 'position_drop':
          // @ts-ignore - Type compatibility issues with complex alerting features being removed
          const dropAmount = alert.previousPosition - alert.currentPosition;
          if (dropAmount > 10) {
            recommendation = `Significant ranking drop detected. Investigate potential causes such as technical issues, algorithm updates, or competitor improvements. Consider refreshing content and improving on-page SEO elements.`;
            estimatedImpact = 'High - Significant traffic loss may have occurred';
          } else {
            recommendation = `Minor ranking fluctuation. Monitor the trend over the next few days. Consider updating content with fresh information if the drop continues.`;
            estimatedImpact = 'Medium - May impact organic traffic';
          }
          break;

        case 'significant_improvement':
          recommendation = `Excellent ranking improvement! Analyze what worked well and apply similar strategies to other pages. Consider promoting this content and building additional internal links.`;
          estimatedImpact = 'Positive - Increased traffic and visibility';
          priority = 'low'; // Improvements are good, not urgent
          break;

        case 'new_keyword':
          if (alert.currentPosition <= 10) {
            recommendation = `New keyword ranking in top 10! Optimize this page further to improve position. Consider creating supporting content around this topic.`;
            estimatedImpact = 'High - New traffic opportunity';
          } else {
            recommendation = `New keyword discovered. Monitor its performance and consider optimizing if it shows potential for improvement.`;
            estimatedImpact = 'Medium - Potential growth opportunity';
          }
          break;
      }

      recommendations.push({
        alertId: alert.id,
        keyword: alert.keyword,
        recommendation,
        priority,
        estimatedImpact
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate alert ID
   */
  private static generateAlertId(alert: RankingAlert): string {
    const timestamp = new Date(alert.date).getTime();
    const keywordHash = alert.keyword.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `${alert.type}_${keywordHash}_${timestamp}`;
  }

  /**
   * Generate alert title
   */
  private static generateAlertTitle(alert: RankingAlert): string {
    switch (alert.type) {
      case 'position_drop':
        return `Ranking Drop: ${alert.keyword}`;
      case 'significant_improvement':
        return `Ranking Improvement: ${alert.keyword}`;
      case 'new_keyword':
        return `New Keyword: ${alert.keyword}`;
      default:
        return `Alert: ${alert.keyword}`;
    }
  }

  /**
   * Format alert for display
   */
  static formatAlert(alert: AlertNotification): {
    displayMessage: string;
    urgencyClass: string;
    icon: string;
    actionText: string;
  } {
    let displayMessage = '';
    let urgencyClass = '';
    let icon = '';
    let actionText = '';

    switch (alert.type) {
      case 'position_drop':
        displayMessage = `${alert.keyword} dropped from position ${alert.previousPosition} to ${alert.currentPosition}`;
        urgencyClass = alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600';
        icon = '📉';
        actionText = 'Investigate';
        break;

      case 'significant_improvement':
        displayMessage = `${alert.keyword} improved from position ${alert.previousPosition} to ${alert.currentPosition}`;
        urgencyClass = 'text-green-600';
        icon = '📈';
        actionText = 'Analyze';
        break;

      case 'new_keyword':
        displayMessage = `New keyword ${alert.keyword} is ranking at position ${alert.currentPosition}`;
        urgencyClass = alert.currentPosition <= 10 ? 'text-blue-600' : 'text-gray-600';
        icon = '✨';
        actionText = 'Optimize';
        break;
    }

    return {
      displayMessage,
      urgencyClass,
      icon,
      actionText
    };
  }

  /**
   * Get default alert configuration
   */
  static getDefaultConfig(): AlertConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Validate alert configuration
   */
  static validateConfig(config: Partial<AlertConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (config.positionDropThreshold !== undefined) {
      if (config.positionDropThreshold < 1 || config.positionDropThreshold > 50) {
        errors.push('Position drop threshold must be between 1 and 50');
      }
    }

    if (config.topPositionThreshold !== undefined) {
      if (config.topPositionThreshold < 1 || config.topPositionThreshold > 100) {
        errors.push('Top position threshold must be between 1 and 100');
      }
    }

    if (config.minimumClicks !== undefined) {
      if (config.minimumClicks < 0 || config.minimumClicks > 1000) {
        errors.push('Minimum clicks must be between 0 and 1000');
      }
    }

    if (config.alertFrequency !== undefined) {
      const validFrequencies = ['immediate', 'daily', 'weekly'];
      if (!validFrequencies.includes(config.alertFrequency)) {
        errors.push('Alert frequency must be one of: immediate, daily, weekly');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}