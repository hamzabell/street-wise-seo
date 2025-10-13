import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsIntegrator, fetchAnalyticsMetrics, generateAnalyticsInsights } from '@/lib/seo/analytics-integrator';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';
import { isFeatureEnabled } from '@/lib/utils';

const AnalyticsConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['google_analytics', 'plausible', 'simple_analytics', 'custom', 'server_logs']),
  config: z.object({
    measurementId: z.string().optional(),
    apiSecret: z.string().optional(),
    propertyId: z.string().optional(),
    siteId: z.string().optional(),
    apiKey: z.string().optional(),
    domain: z.string().optional(),
    endpoint: z.string().url().optional(),
    headers: z.record(z.string()).optional(),
    auth: z.object({
      type: z.enum(['bearer', 'basic', 'custom']),
      token: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
    }).optional(),
    logPath: z.string().optional(),
    logFormat: z.enum(['apache', 'nginx', 'custom']).optional(),
    dateRange: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
    filters: z.record(z.any()).optional(),
  }),
  isEnabled: z.boolean().default(false),
});

// GET /api/seo/analytics - Get analytics data or insights
export async function GET(request: NextRequest) {
  try {
    // Check if performance feature is enabled
    if (!isFeatureEnabled('PERFORMANCE_FEATURE')) {
      return NextResponse.json(
        { error: 'Performance tracking feature is not available' },
        { status: 403 }
      );
    }

    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'metrics';
    const sourceId = searchParams.get('source');
    const domain = searchParams.get('domain');

    console.log('📊 [API:ANALYTICS] Processing analytics request', {
      action,
      sourceId,
      domain,
      userId: supabaseUserId,
    });

    const integrator = getAnalyticsIntegrator();

    switch (action) {
      case 'sources': {
        const sources = sourceId
          ? [integrator.getSource(sourceId)].filter(Boolean)
          : integrator.getAllSources();

        return NextResponse.json({
          success: true,
          sources,
          metadata: {
            total: sources.length,
            enabled: sources.filter(s => s?.isEnabled).length,
          }
        });
      }

      case 'metrics': {
        let metrics;

        if (sourceId) {
          const source = integrator.getSource(sourceId);
          if (!source) {
            return NextResponse.json(
              { error: `Analytics source ${sourceId} not found` },
              { status: 404 }
            );
          }
          metrics = await integrator.fetchMetricsFromSource(source);
        } else {
          metrics = await fetchAnalyticsMetrics();
        }

        return NextResponse.json({
          success: true,
          metrics,
          metadata: {
            fetchedAt: new Date().toISOString(),
            sources: sourceId ? [sourceId] : Object.keys(metrics),
          }
        });
      }

      case 'insights': {
        const insights = await generateAnalyticsInsights();

        return NextResponse.json({
          success: true,
          insights,
          metadata: {
            generatedAt: new Date().toISOString(),
            totalInsights: insights.length,
            highPriorityInsights: insights.filter(i => i.impact === 'high').length,
          }
        });
      }

      case 'correlation': {
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain parameter is required for correlation analysis' },
            { status: 400 }
          );
        }

        const correlation = await integrator.correlateAnalyticsWithRankings(domain);

        return NextResponse.json({
          success: true,
          correlation,
          metadata: {
            domain,
            analyzedAt: new Date().toISOString(),
          }
        });
      }

      case 'cache-stats': {
        const cacheStats = integrator.getCacheStats();

        return NextResponse.json({
          success: true,
          cacheStats,
          metadata: {
            retrievedAt: new Date().toISOString(),
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: sources, metrics, insights, correlation, cache-stats' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [API:ANALYTICS] Error processing request:', error);

    if (error instanceof Error) {
      if (error.message === 'User not authenticated') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (error.message.includes('configuration is incomplete')) {
        return NextResponse.json(
          { error: 'Analytics source configuration is incomplete. Please check your settings.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing analytics request' },
      { status: 500 }
    );
  }
}

// POST /api/seo/analytics - Add or configure analytics source
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
    const { action, ...config } = body;

    const integrator = getAnalyticsIntegrator();

    console.log('⚙️ [API:ANALYTICS] Processing configuration request', {
      action,
      userId: supabaseUserId,
    });

    switch (action) {
      case 'add-source': {
        const validatedConfig = AnalyticsConfigSchema.parse(config);
        integrator.addSource({
          ...validatedConfig,
          lastSync: '',
          metrics: []
        });

        console.log(`➕ [API:ANALYTICS] Added analytics source: ${validatedConfig.name}`);

        return NextResponse.json({
          success: true,
          message: `Analytics source "${validatedConfig.name}" added successfully`,
          source: validatedConfig,
        });
      }

      case 'test-connection': {
        const { sourceId } = z.object({ sourceId: z.string().min(1) }).parse(config);
        const source = integrator.getSource(sourceId);

        if (!source) {
          return NextResponse.json(
            { error: `Analytics source ${sourceId} not found` },
            { status: 404 }
          );
        }

        // Temporarily enable source for testing
        const originalState = source.isEnabled;
        source.isEnabled = true;

        try {
          const metrics = await integrator.fetchMetricsFromSource(source);

          // Restore original state
          source.isEnabled = originalState;

          return NextResponse.json({
            success: true,
            message: 'Connection test successful',
            sampleData: {
              pageviews: metrics.pageviews,
              users: metrics.users,
              sessions: metrics.sessions,
            }
          });
        } catch (error) {
          // Restore original state
          source.isEnabled = originalState;
          throw error;
        }
      }

      case 'clear-cache': {
        integrator.clearCache();

        return NextResponse.json({
          success: true,
          message: 'Analytics cache cleared successfully',
        });
      }

      case 'refresh-all': {
        integrator.clearCache(); // Clear cache to force refresh
        const metrics = await fetchAnalyticsMetrics();

        return NextResponse.json({
          success: true,
          message: 'All analytics sources refreshed successfully',
          metrics,
          metadata: {
            refreshedAt: new Date().toISOString(),
            sourcesCount: Object.keys(metrics).length,
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: add-source, test-connection, clear-cache, refresh-all' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [API:ANALYTICS] Error processing configuration request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing configuration request' },
      { status: 500 }
    );
  }
}

// PUT /api/seo/analytics - Update analytics source
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
    const { sourceId, updates } = z.object({
      sourceId: z.string().min(1),
      updates: z.object({
        name: z.string().optional(),
        isEnabled: z.boolean().optional(),
        config: z.any().optional(),
      }),
    }).parse(body);

    const integrator = getAnalyticsIntegrator();
    const updated = integrator.updateSource(sourceId, updates);

    if (!updated) {
      return NextResponse.json(
        { error: `Analytics source ${sourceId} not found` },
        { status: 404 }
      );
    }

    const source = integrator.getSource(sourceId);

    console.log(`✏️ [API:ANALYTICS] Updated analytics source: ${source?.name}`);

    return NextResponse.json({
      success: true,
      message: `Analytics source updated successfully`,
      source,
    });

  } catch (error) {
    console.error('❌ [API:ANALYTICS] Error updating analytics source:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while updating analytics source' },
      { status: 500 }
    );
  }
}

// DELETE /api/seo/analytics - Remove analytics source
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
    const sourceId = searchParams.get('source');

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID parameter is required' },
        { status: 400 }
      );
    }

    const integrator = getAnalyticsIntegrator();
    const removed = integrator.removeSource(sourceId);

    if (!removed) {
      return NextResponse.json(
        { error: `Analytics source ${sourceId} not found` },
        { status: 404 }
      );
    }

    console.log(`➖ [API:ANALYTICS] Removed analytics source: ${sourceId}`);

    return NextResponse.json({
      success: true,
      message: `Analytics source removed successfully`,
    });

  } catch (error) {
    console.error('❌ [API:ANALYTICS] Error removing analytics source:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while removing analytics source' },
      { status: 500 }
    );
  }
}