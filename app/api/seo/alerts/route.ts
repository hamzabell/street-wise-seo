import { NextRequest, NextResponse } from 'next/server';
import { getPerformanceAlerting } from '@/lib/seo/performance-alerting';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';

const AlertActionSchema = z.object({
  action: z.enum(['acknowledge', 'resolve', 'run-check', 'generate-report']),
  alertId: z.string().optional(),
  domain: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const CustomRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['ranking_drop', 'content_score_drop', 'technical_issue', 'traffic_decline', 'opportunity']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  enabled: z.boolean().default(true),
  conditions: z.object({
    threshold: z.number().optional(),
    changePercent: z.number().optional(),
    timeWindow: z.number().optional(),
    keywords: z.array(z.string()).optional(),
    pages: z.array(z.string()).optional(),
  }),
  notifications: z.object({
    email: z.boolean().optional(),
    dashboard: z.boolean().optional(),
    webhook: z.string().optional(),
  }),
});

// GET /api/seo/alerts - Get alerts or run performance check
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const domain = searchParams.get('domain');
    const severity = searchParams.get('severity') as any;

    const alerting = getPerformanceAlerting();

    console.log('🔔 [API:ALERTS] Processing alerts request', {
      action,
      domain,
      severity,
      userId: supabaseUserId,
    });

    switch (action) {
      case 'list': {
        let alerts = alerting.getActiveAlerts();

        if (domain) {
          alerts = alerts.filter(alert => alert.domain === domain);
        }

        if (severity) {
          alerts = alerts.filter(alert => alert.severity === severity);
        }

        // Sort by severity and triggered time
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        alerts.sort((a, b) => {
          if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity];
          }
          return b.triggeredAt.getTime() - a.triggeredAt.getTime();
        });

        return NextResponse.json({
          success: true,
          alerts,
          summary: {
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            high: alerts.filter(a => a.severity === 'high').length,
            medium: alerts.filter(a => a.severity === 'medium').length,
            low: alerts.filter(a => a.severity === 'low').length,
            unacknowledged: alerts.filter(a => !a.acknowledged).length,
          },
          metadata: {
            retrievedAt: new Date().toISOString(),
            filters: { domain, severity }
          }
        });
      }

      case 'run-check': {
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain parameter is required for performance check' },
            { status: 400 }
          );
        }

        const newAlerts = await alerting.runPerformanceCheck(domain);

        return NextResponse.json({
          success: true,
          alerts: newAlerts,
          summary: {
            newAlerts: newAlerts.length,
            critical: newAlerts.filter(a => a.severity === 'critical').length,
            high: newAlerts.filter(a => a.severity === 'high').length,
          },
          metadata: {
            domain,
            checkedAt: new Date().toISOString(),
          }
        });
      }

      case 'rules': {
        const rules = alerting.getAllRules();

        return NextResponse.json({
          success: true,
          rules,
          summary: {
            total: rules.length,
            enabled: rules.filter(r => r.enabled).length,
            default: rules.filter(r => r.id.startsWith('default')).length,
            custom: rules.filter(r => r.id.startsWith('custom')).length,
          },
          metadata: {
            retrievedAt: new Date().toISOString(),
          }
        });
      }

      case 'report': {
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain parameter is required for alert report' },
            { status: 400 }
          );
        }

        const startDate = searchParams.get('startDate')
          ? new Date(searchParams.get('startDate')!)
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago

        const endDate = searchParams.get('endDate')
          ? new Date(searchParams.get('endDate')!)
          : new Date();

        const report = await alerting.generateAlertReport(domain, startDate, endDate);

        return NextResponse.json({
          success: true,
          report,
          metadata: {
            domain,
            period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
            generatedAt: new Date().toISOString(),
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: list, run-check, rules, report' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [API:ALERTS] Error processing request:', error);

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing alerts request' },
      { status: 500 }
    );
  }
}

// POST /api/seo/alerts - Manage alerts or create custom rules
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = AlertActionSchema.parse(body);

    const alerting = getPerformanceAlerting();

    console.log('🔔 [API:ALERTS] Processing alert action', {
      action: validatedData.action,
      alertId: validatedData.alertId,
      domain: validatedData.domain,
      userId: supabaseUserId,
    });

    switch (validatedData.action) {
      case 'acknowledge': {
        if (!validatedData.alertId) {
          return NextResponse.json(
            { error: 'Alert ID is required for acknowledgment' },
            { status: 400 }
          );
        }

        const success = alerting.acknowledgeAlert(validatedData.alertId, supabaseUserId);

        if (!success) {
          return NextResponse.json(
            { error: 'Alert not found or already acknowledged' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged successfully',
          metadata: {
            alertId: validatedData.alertId,
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy: supabaseUserId,
          }
        });
      }

      case 'resolve': {
        if (!validatedData.alertId) {
          return NextResponse.json(
            { error: 'Alert ID is required for resolution' },
            { status: 400 }
          );
        }

        const success = alerting.resolveAlert(validatedData.alertId);

        if (!success) {
          return NextResponse.json(
            { error: 'Alert not found or already resolved' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully',
          metadata: {
            alertId: validatedData.alertId,
            resolvedAt: new Date().toISOString(),
          }
        });
      }

      case 'run-check': {
        if (!validatedData.domain) {
          return NextResponse.json(
            { error: 'Domain is required for performance check' },
            { status: 400 }
          );
        }

        const newAlerts = await alerting.runPerformanceCheck(validatedData.domain);

        return NextResponse.json({
          success: true,
          message: `Performance check completed. Found ${newAlerts.length} new alerts.`,
          alerts: newAlerts,
          metadata: {
            domain: validatedData.domain,
            checkedAt: new Date().toISOString(),
          }
        });
      }

      case 'generate-report': {
        if (!validatedData.domain) {
          return NextResponse.json(
            { error: 'Domain is required for report generation' },
            { status: 400 }
          );
        }

        const startDate = validatedData.startDate
          ? new Date(validatedData.startDate)
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const endDate = validatedData.endDate
          ? new Date(validatedData.endDate)
          : new Date();

        const report = await alerting.generateAlertReport(validatedData.domain, startDate, endDate);

        return NextResponse.json({
          success: true,
          message: 'Alert report generated successfully',
          report,
          metadata: {
            domain: validatedData.domain,
            period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
            generatedAt: new Date().toISOString(),
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: acknowledge, resolve, run-check, generate-report' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [API:ALERTS] Error processing action:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing alert action' },
      { status: 500 }
    );
  }
}

// PUT /api/seo/alerts - Create custom alert rules
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...ruleData } = body;

    const alerting = getPerformanceAlerting();

    console.log('🔔 [API:ALERTS] Processing rule management', {
      action,
      userId: supabaseUserId,
    });

    switch (action) {
      case 'create-rule': {
        const validatedRule = CustomRuleSchema.omit({}).parse(ruleData);
        const newRule = alerting.addCustomRule(validatedRule);

        console.log(`✅ [API:ALERTS] Created custom alert rule: ${newRule.name}`);

        return NextResponse.json({
          success: true,
          message: 'Custom alert rule created successfully',
          rule: newRule,
        });
      }

      case 'update-rule': {
        const { ruleId, updates } = z.object({
          ruleId: z.string().min(1),
          updates: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            enabled: z.boolean().optional(),
            conditions: z.any().optional(),
            notifications: z.any().optional(),
          }),
        }).parse(body);

        const success = alerting.updateRule(ruleId, updates);

        if (!success) {
          return NextResponse.json(
            { error: 'Custom rule not found' },
            { status: 404 }
          );
        }

        console.log(`✅ [API:ALERTS] Updated custom alert rule: ${ruleId}`);

        return NextResponse.json({
          success: true,
          message: 'Custom alert rule updated successfully',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: create-rule, update-rule' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [API:ALERTS] Error managing rules:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while managing alert rules' },
      { status: 500 }
    );
  }
}

// DELETE /api/seo/alerts - Delete custom alert rules
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get('ruleId');

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID parameter is required' },
        { status: 400 }
      );
    }

    const alerting = getPerformanceAlerting();
    const success = alerting.deleteRule(ruleId);

    if (!success) {
      return NextResponse.json(
        { error: 'Custom rule not found' },
        { status: 404 }
      );
    }

    console.log(`🗑️ [API:ALERTS] Deleted custom alert rule: ${ruleId}`);

    return NextResponse.json({
      success: true,
      message: 'Custom alert rule deleted successfully',
    });

  } catch (error) {
    console.error('❌ [API:ALERTS] Error deleting rule:', error);

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting alert rule' },
      { status: 500 }
    );
  }
}