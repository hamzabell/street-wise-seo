import { NextRequest, NextResponse } from 'next/server';
import { getProxyManager } from '@/lib/seo/proxy-manager';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';

const ProxyConfigSchema = z.object({
  server: z.string().min(1),
  username: z.string().optional(),
  password: z.string().optional(),
  protocol: z.enum(['http', 'https', 'socks5']).default('http'),
  country: z.string().optional(),
});

const ProxyManagerConfigSchema = z.object({
  rotationStrategy: z.enum(['round-robin', 'random', 'health-based']).optional(),
  throttling: z.object({
    minDelay: z.number().min(500).max(30000).optional(),
    maxDelay: z.number().min(1000).max(60000).optional(),
    requestsPerMinute: z.number().min(1).max(100).optional(),
    requestsPerHour: z.number().min(10).max(1000).optional(),
  }).optional(),
});

// GET /api/seo/proxy-manager - Get proxy pool status and configuration
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

    const proxyManager = getProxyManager();
    const stats = proxyManager.getProxyPoolStats();

    console.log('📊 [API:PROXY-MANAGER] Fetched proxy pool statistics', {
      userId: supabaseUserId,
      totalProxies: stats.totalProxies,
      healthyProxies: stats.healthyProxies,
    });

    return NextResponse.json({
      success: true,
      stats,
      metadata: {
        lastUpdated: new Date().toISOString(),
        features: [
          'proxy-rotation',
          'user-agent-randomization',
          'request-throttling',
          'health-checking',
          'anti-detection',
        ],
      }
    });

  } catch (error) {
    console.error('❌ [API:PROXY-MANAGER] Error fetching proxy pool status:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching proxy pool status' },
      { status: 500 }
    );
  }
}

// POST /api/seo/proxy-manager - Add proxy or configure proxy manager
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

    const proxyManager = getProxyManager();

    console.log('⚙️ [API:PROXY-MANAGER] Processing proxy manager request', {
      action,
      userId: supabaseUserId,
    });

    switch (action) {
      case 'add-proxy': {
        const validatedProxy = ProxyConfigSchema.parse(config);
        proxyManager.addProxy(validatedProxy);

        console.log(`➕ [API:PROXY-MANAGER] Added proxy: ${validatedProxy.server}`);

        return NextResponse.json({
          success: true,
          message: `Proxy ${validatedProxy.server} added successfully`,
          proxy: {
            server: validatedProxy.server,
            protocol: validatedProxy.protocol,
            country: validatedProxy.country,
          }
        });
      }

      case 'remove-proxy': {
        const { server } = z.object({ server: z.string().min(1) }).parse(config);
        const removed = proxyManager.removeProxy(server);

        if (removed) {
          console.log(`➖ [API:PROXY-MANAGER] Removed proxy: ${server}`);
          return NextResponse.json({
            success: true,
            message: `Proxy ${server} removed successfully`,
          });
        } else {
          return NextResponse.json(
            { error: `Proxy ${server} not found` },
            { status: 404 }
          );
        }
      }

      case 'configure': {
        const validatedConfig = ProxyManagerConfigSchema.parse(config);

        if (validatedConfig.rotationStrategy) {
          proxyManager.setRotationStrategy(validatedConfig.rotationStrategy);
        }

        if (validatedConfig.throttling) {
          proxyManager.configureThrottling(validatedConfig.throttling);
        }

        console.log('⚙️ [API:PROXY-MANAGER] Configuration updated', validatedConfig);

        return NextResponse.json({
          success: true,
          message: 'Proxy manager configuration updated successfully',
          config: validatedConfig,
        });
      }

      case 'reset-failed': {
        proxyManager.resetFailedProxies();
        console.log('🔄 [API:PROXY-MANAGER] Reset all failed proxies');

        return NextResponse.json({
          success: true,
          message: 'All failed proxies have been reset',
        });
      }

      case 'health-check': {
        const { server } = z.object({
          server: z.string().optional()
        }).parse(config);

        let results;

        if (server) {
          // Health check specific proxy
          const proxy = proxyManager.getProxyPoolStats().totalProxies > 0 ?
            proxyManager.getNextProxy() : null;

          if (proxy && proxy.server === server) {
            const isHealthy = await proxyManager.checkProxyHealth(proxy);
            results = { server, healthy: isHealthy };
          } else {
            return NextResponse.json(
              { error: `Proxy ${server} not found in pool` },
              { status: 404 }
            );
          }
        } else {
          // Health check all proxies (simplified version)
          const stats = proxyManager.getProxyPoolStats();
          results = {
            totalProxies: stats.totalProxies,
            healthyProxies: stats.healthyProxies,
            unhealthyProxies: stats.unhealthyProxies,
            averageFailureCount: stats.averageFailureCount,
          };
        }

        return NextResponse.json({
          success: true,
          results,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: add-proxy, remove-proxy, configure, reset-failed, health-check' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [API:PROXY-MANAGER] Error processing request:', error);

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
      { error: 'An unexpected error occurred while processing proxy manager request' },
      { status: 500 }
    );
  }
}

// PUT /api/seo/proxy-manager - Update proxy configuration
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
    const { server, updates } = z.object({
      server: z.string().min(1),
      updates: z.object({
        username: z.string().optional(),
        password: z.string().optional(),
        protocol: z.enum(['http', 'https', 'socks5']).optional(),
        country: z.string().optional(),
      }),
    }).parse(body);

    console.log(`🔄 [API:PROXY-MANAGER] Updating proxy configuration: ${server}`);

    // Note: This would require extending the ProxyManager to support updating existing proxies
    // For now, we'll remove and re-add the proxy with new configuration

    const proxyManager = getProxyManager();
    const removed = proxyManager.removeProxy(server);

    if (removed) {
      const updatedProxy = {
        server,
        protocol: (updates.protocol || 'http') as 'http' | 'https' | 'socks5', // Default protocol with type assertion
        ...updates
      };
      proxyManager.addProxy(updatedProxy);

      return NextResponse.json({
        success: true,
        message: `Proxy ${server} updated successfully`,
        proxy: updatedProxy,
      });
    } else {
      return NextResponse.json(
        { error: `Proxy ${server} not found` },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ [API:PROXY-MANAGER] Error updating proxy:', error);

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
      { error: 'An unexpected error occurred while updating proxy' },
      { status: 500 }
    );
  }
}

// DELETE /api/seo/proXY-MANAGER - Remove proxy or reset proxy pool
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
    const action = searchParams.get('action');
    const server = searchParams.get('server');

    const proxyManager = getProxyManager();

    console.log('🗑️ [API:PROXY-MANAGER] Processing delete request', {
      action,
      server,
      userId: supabaseUserId,
    });

    if (action === 'reset-all') {
      // This would require extending ProxyManager to clear all proxies
      // For now, we'll reset failed proxies
      proxyManager.resetFailedProxies();

      return NextResponse.json({
        success: true,
        message: 'Proxy pool reset - all failed proxies have been marked as healthy',
      });
    }

    if (server) {
      const removed = proxyManager.removeProxy(server);

      if (removed) {
        return NextResponse.json({
          success: true,
          message: `Proxy ${server} removed successfully`,
        });
      } else {
        return NextResponse.json(
          { error: `Proxy ${server} not found` },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide server parameter or action=reset-all' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ [API:PROXY-MANAGER] Error processing delete request:', error);

    if (error instanceof Error && error.message === 'User not authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while processing delete request' },
      { status: 500 }
    );
  }
}