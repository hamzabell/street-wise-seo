/**
 * Proxy management and anti-detection system for SERP scraping
 * Provides proxy rotation, user agent randomization, and request throttling
 */

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
  protocol: 'http' | 'https' | 'socks5';
  country?: string;
  lastUsed?: Date;
  failureCount?: number;
  isHealthy?: boolean;
}

export interface UserAgentConfig {
  browsers: {
    chrome: string[];
    firefox: string[];
    safari: string[];
    edge: string[];
  };
  mobile: {
    chrome: string[];
    safari: string[];
  };
}

export interface ProxyPool {
  proxies: ProxyConfig[];
  currentIndex: number;
  rotationStrategy: 'round-robin' | 'random' | 'health-based';
  healthCheckInterval: number;
  maxFailures: number;
}

export interface RequestThrottler {
  minDelay: number;
  maxDelay: number;
  lastRequestTime: number;
  requestCount: number;
  requestsPerMinute: number;
  requestsPerHour: number;
}

export class ProxyManager {
  private proxyPool: ProxyPool;
  private userAgents: UserAgentConfig;
  private throttler: RequestThrottler;
  private blockedIPs = new Set<string>();
  private lastHealthCheck = 0;

  constructor() {
    this.proxyPool = {
      proxies: [],
      currentIndex: 0,
      rotationStrategy: 'health-based',
      healthCheckInterval: 5 * 60 * 1000, // 5 minutes
      maxFailures: 3,
    };

    this.throttler = {
      minDelay: 2000,
      maxDelay: 8000,
      lastRequestTime: 0,
      requestCount: 0,
      requestsPerMinute: 30,
      requestsPerHour: 1000,
    };

    this.userAgents = this.generateUserAgents();
    this.initializeDefaultProxies();
  }

  private generateUserAgents(): UserAgentConfig {
    return {
      browsers: {
        chrome: [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ],
        firefox: [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
          'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
        ],
        safari: [
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        ],
        edge: [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        ],
      },
      mobile: {
        chrome: [
          'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
        ],
        safari: [
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        ],
      },
    };
  }

  private initializeDefaultProxies(): void {
    // Initialize with empty proxy pool - users will add their own proxies
    // This is a placeholder for future proxy service integrations
    console.log('🔧 [PROXY MANAGER] Initialized empty proxy pool');
  }

  /**
   * Add proxy to the pool
   */
  addProxy(proxy: ProxyConfig): void {
    proxy.lastUsed = new Date();
    proxy.failureCount = 0;
    proxy.isHealthy = true;

    this.proxyPool.proxies.push(proxy);
    console.log(`➕ [PROXY MANAGER] Added proxy: ${proxy.server}`);
  }

  /**
   * Remove proxy from the pool
   */
  removeProxy(server: string): boolean {
    const index = this.proxyPool.proxies.findIndex(p => p.server === server);
    if (index !== -1) {
      this.proxyPool.proxies.splice(index, 1);
      console.log(`➖ [PROXY MANAGER] Removed proxy: ${server}`);
      return true;
    }
    return false;
  }

  /**
   * Get next proxy based on rotation strategy
   */
  getNextProxy(): ProxyConfig | null {
    const healthyProxies = this.proxyPool.proxies.filter(p => p.isHealthy !== false);

    if (healthyProxies.length === 0) {
      console.warn('⚠️ [PROXY MANAGER] No healthy proxies available');
      return null;
    }

    let selectedProxy: ProxyConfig;

    switch (this.proxyPool.rotationStrategy) {
      case 'round-robin':
        selectedProxy = healthyProxies[this.proxyPool.currentIndex % healthyProxies.length];
        this.proxyPool.currentIndex++;
        break;

      case 'random':
        const randomIndex = Math.floor(Math.random() * healthyProxies.length);
        selectedProxy = healthyProxies[randomIndex];
        break;

      case 'health-based':
        // Sort by failure count (ascending) and last used time (ascending)
        selectedProxy = healthyProxies.sort((a, b) => {
          if ((a.failureCount || 0) !== (b.failureCount || 0)) {
            return (a.failureCount || 0) - (b.failureCount || 0);
          }
          return (a.lastUsed?.getTime() || 0) - (b.lastUsed?.getTime() || 0);
        })[0];
        break;

      default:
        selectedProxy = healthyProxies[0];
    }

    if (selectedProxy) {
      selectedProxy.lastUsed = new Date();
      console.log(`🔄 [PROXY MANAGER] Selected proxy: ${selectedProxy.server}`);
    }

    return selectedProxy;
  }

  /**
   * Mark proxy as failed
   */
  markProxyFailed(server: string): void {
    const proxy = this.proxyPool.proxies.find(p => p.server === server);
    if (proxy) {
      proxy.failureCount = (proxy.failureCount || 0) + 1;

      if (proxy.failureCount >= this.proxyPool.maxFailures) {
        proxy.isHealthy = false;
        console.warn(`❌ [PROXY MANAGER] Proxy marked as unhealthy: ${server} (${proxy.failureCount} failures)`);
      } else {
        console.warn(`⚠️ [PROXY MANAGER] Proxy failure recorded: ${server} (${proxy.failureCount}/${this.proxyPool.maxFailures})`);
      }
    }
  }

  /**
   * Mark proxy as successful
   */
  markProxySuccess(server: string): void {
    const proxy = this.proxyPool.proxies.find(p => p.server === server);
    if (proxy) {
      proxy.failureCount = 0;
      proxy.isHealthy = true;
      console.log(`✅ [PROXY MANAGER] Proxy marked as successful: ${server}`);
    }
  }

  /**
   * Get random user agent
   */
  getRandomUserAgent(device: 'desktop' | 'mobile' = 'desktop'): string {
    const userAgentPool = device === 'mobile' ? this.userAgents.mobile : this.userAgents.browsers;
    const browserTypes = Object.keys(userAgentPool) as Array<keyof typeof userAgentPool>;
    const randomBrowser = browserTypes[Math.floor(Math.random() * browserTypes.length)];
    const browserUserAgents = userAgentPool[randomBrowser];

    return browserUserAgents[Math.floor(Math.random() * browserUserAgents.length)];
  }

  /**
   * Get viewport configuration for user agent
   */
  getViewportForUserAgent(userAgent: string): { width: number; height: number } {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      // Common mobile viewport sizes
      const mobileViewports = [
        { width: 375, height: 667 },   // iPhone SE
        { width: 375, height: 812 },   // iPhone 12/13
        { width: 414, height: 896 },   // iPhone 12/13 Pro Max
        { width: 360, height: 640 },   // Android small
        { width: 412, height: 915 },   // Android large
      ];
      return mobileViewports[Math.floor(Math.random() * mobileViewports.length)];
    } else {
      // Common desktop viewport sizes
      const desktopViewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 },
        { width: 1280, height: 720 },
      ];
      return desktopViewports[Math.floor(Math.random() * desktopViewports.length)];
    }
  }

  /**
   * Throttle requests to avoid rate limiting
   */
  async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.throttler.lastRequestTime;

    // Calculate delay based on rate limits
    let delay = this.getRandomDelay(this.throttler.minDelay, this.throttler.maxDelay);

    // Check if we're exceeding rate limits
    if (timeSinceLastRequest < 60000) { // Within last minute
      if (this.throttler.requestCount >= this.throttler.requestsPerMinute) {
        delay = Math.max(delay, 60000 - timeSinceLastRequest);
      }
    }

    if (delay > 0) {
      console.log(`⏳ [PROXY MANAGER] Throttling request: waiting ${delay}ms`);
      await this.sleep(delay);
    }

    this.throttler.lastRequestTime = Date.now();
    this.throttler.requestCount++;

    // Reset request count every minute
    setTimeout(() => {
      this.throttler.requestCount = Math.max(0, this.throttler.requestCount - this.throttler.requestsPerMinute);
    }, 60000);
  }

  /**
   * Get random delay
   */
  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate random browser fingerprints
   */
  generateBrowserFingerprint(): {
    userAgent: string;
    viewport: { width: number; height: number };
    acceptLanguage: string;
    platform: string;
    timezone: string;
  } {
    const device = Math.random() > 0.3 ? 'desktop' : 'mobile'; // 70% desktop, 30% mobile
    const userAgent = this.getRandomUserAgent(device);
    const viewport = this.getViewportForUserAgent(userAgent);

    const languages = ['en-US', 'en-GB', 'en-CA', 'en-AU', 'fr-FR', 'de-DE', 'es-ES'];
    const acceptLanguage = languages[Math.floor(Math.random() * languages.length)];

    const platforms = ['Win32', 'MacIntel', 'Linux x86_64', 'iPhone', 'Android'];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];

    const timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'];
    const timezone = timezones[Math.floor(Math.random() * timezones.length)];

    return {
      userAgent,
      viewport,
      acceptLanguage,
      platform,
      timezone,
    };
  }

  /**
   * Check proxy health
   */
  async checkProxyHealth(proxy: ProxyConfig): Promise<boolean> {
    try {
      // Simple health check - try to make a request to a reliable endpoint
      const response = await fetch('https://httpbin.org/ip', {
        method: 'GET',
        // @ts-ignore
        agent: require('https-proxy-agent')(proxy.server),
        timeout: 10000,
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ [PROXY MANAGER] Proxy health check passed: ${proxy.server} (IP: ${data.origin})`);
        return true;
      } else {
        console.warn(`⚠️ [PROXY MANAGER] Proxy health check failed: ${proxy.server} (Status: ${response.status})`);
        return false;
      }
    } catch (error) {
      console.error(`❌ [PROXY MANAGER] Proxy health check error: ${proxy.server}`, error);
      return false;
    }
  }

  /**
   * Get proxy pool statistics
   */
  getProxyPoolStats(): {
    totalProxies: number;
    healthyProxies: number;
    unhealthyProxies: number;
    averageFailureCount: number;
    rotationStrategy: string;
  } {
    const healthyProxies = this.proxyPool.proxies.filter(p => p.isHealthy !== false);
    const averageFailureCount = this.proxyPool.proxies.length > 0
      ? this.proxyPool.proxies.reduce((sum, p) => sum + (p.failureCount || 0), 0) / this.proxyPool.proxies.length
      : 0;

    return {
      totalProxies: this.proxyPool.proxies.length,
      healthyProxies: healthyProxies.length,
      unhealthyProxies: this.proxyPool.proxies.length - healthyProxies.length,
      averageFailureCount: Math.round(averageFailureCount * 100) / 100,
      rotationStrategy: this.proxyPool.rotationStrategy,
    };
  }

  /**
   * Reset failed proxies
   */
  resetFailedProxies(): void {
    this.proxyPool.proxies.forEach(proxy => {
      if (proxy.isHealthy === false) {
        proxy.failureCount = 0;
        proxy.isHealthy = true;
        console.log(`🔄 [PROXY MANAGER] Reset failed proxy: ${proxy.server}`);
      }
    });
  }

  /**
   * Configure proxy rotation strategy
   */
  setRotationStrategy(strategy: 'round-robin' | 'random' | 'health-based'): void {
    this.proxyPool.rotationStrategy = strategy;
    console.log(`⚙️ [PROXY MANAGER] Rotation strategy set to: ${strategy}`);
  }

  /**
   * Configure request throttling
   */
  configureThrottling(config: {
    minDelay?: number;
    maxDelay?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
  }): void {
    if (config.minDelay) this.throttler.minDelay = config.minDelay;
    if (config.maxDelay) this.throttler.maxDelay = config.maxDelay;
    if (config.requestsPerMinute) this.throttler.requestsPerMinute = config.requestsPerMinute;
    if (config.requestsPerHour) this.throttler.requestsPerHour = config.requestsPerHour;

    console.log('⚙️ [PROXY MANAGER] Throttling configuration updated:', config);
  }
}

// Singleton instance
let proxyManager: ProxyManager | null = null;

export function getProxyManager(): ProxyManager {
  if (!proxyManager) {
    proxyManager = new ProxyManager();
  }
  return proxyManager;
}

// Export helper functions for use in other modules
export async function getProxyWithRotation(): Promise<ProxyConfig | null> {
  const manager = getProxyManager();
  await manager.throttleRequest();
  return manager.getNextProxy();
}

export function getRandomBrowserFingerprint(): ReturnType<ProxyManager['generateBrowserFingerprint']> {
  const manager = getProxyManager();
  return manager.generateBrowserFingerprint();
}