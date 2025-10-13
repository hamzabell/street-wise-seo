/**
 * SERP (Search Engine Results Page) tracking service for monitoring keyword rankings
 * without relying on Google Search Console API
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { z } from 'zod';
import { getPerformanceTrackingByKeyword, createPerformanceTracking } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';
import { getProxyManager, getRandomBrowserFingerprint } from './proxy-manager';

export const SERPTrackingRequestSchema = z.object({
  keywords: z.array(z.string().min(1)).min(1).max(50),
  domain: z.string().min(1),
  searchEngine: z.enum(['google', 'bing', 'duckduckgo']).default('google'),
  location: z.string().optional(), // e.g., "United States", "United Kingdom"
  language: z.string().default('en'),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
  maxResults: z.number().min(10).max(100).default(50),
  useProxy: z.boolean().default(false),
  proxyConfig: z.object({
    server: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
  }).optional(),
});

export type SERPTrackingRequest = z.infer<typeof SERPTrackingRequestSchema>;

export interface SERPResult {
  position: number;
  title: string;
  url: string;
  description: string;
  domain: string;
  isLocalResult: boolean;
  featuredSnippet: boolean;
  sitelinks: string[];
}

export interface KeywordRankingResult {
  keyword: string;
  rank: number;
  url: string;
  title: string;
  description: string;
  searchEngine: string;
  location: string;
  device: string;
  timestamp: string;
  serpFeatures: {
    featuredSnippet: boolean;
    localPack: boolean;
    shoppingResults: boolean;
    videoResults: boolean;
    newsResults: boolean;
  };
  competitorRankings: SERPResult[];
}

export interface SERPTrackingSession {
  id: string;
  request: SERPTrackingRequest;
  results: KeywordRankingResult[];
  errors: string[];
  startTime: string;
  endTime: string;
  totalKeywords: number;
  successfulQueries: number;
  failedQueries: number;
}

export class SERPTracker {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private sessionId: string;
  private currentProxy: any = null;
  private browserFingerprint: any = null;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `serp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initialize(request: SERPTrackingRequest): Promise<void> {
    console.log(`🔍 [SERP TRACKER] Initializing session ${this.sessionId}`, {
      keywords: request.keywords.length,
      domain: request.domain,
      searchEngine: request.searchEngine,
      device: request.device
    });

    // Get proxy manager and generate browser fingerprint
    const proxyManager = getProxyManager();
    this.browserFingerprint = getRandomBrowserFingerprint();

    // Override device-specific settings from fingerprint
    if (request.device === 'mobile') {
      this.browserFingerprint = getRandomBrowserFingerprint();
      this.browserFingerprint.viewport = { width: 375, height: 667 };
    }

    // Get proxy if enabled
    if (request.useProxy) {
      this.currentProxy = await proxyManager.getNextProxy();
      if (!this.currentProxy && !request.proxyConfig?.server) {
        console.warn('⚠️ [SERP TRACKER] No proxy available from pool, using direct connection');
      }
    }

    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-ipc-flooding-protection',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images', // Speed up scraping
        '--disable-javascript', // May be needed for some sites
      ]
    };

    // Add proxy configuration
    if (this.currentProxy?.server) {
      launchOptions.args.push(`--proxy-server=${this.currentProxy.server}`);
    } else if (request.proxyConfig?.server) {
      launchOptions.args.push(`--proxy-server=${request.proxyConfig.server}`);
    }

    try {
      this.browser = await puppeteer.launch(launchOptions);
      this.page = await this.browser.newPage();

      // Set browser fingerprint
      await this.page.setUserAgent(this.browserFingerprint.userAgent);
      await this.page.setViewport(this.browserFingerprint.viewport);

      // Set extra headers from fingerprint
      await this.page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': `${this.browserFingerprint.acceptLanguage},en;q=0.9`,
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      });

      // Handle proxy authentication
      const proxyCredentials = this.currentProxy || request.proxyConfig;
      if (proxyCredentials?.username && proxyCredentials?.password) {
        await this.page.authenticate({
          username: proxyCredentials.username,
          password: proxyCredentials.password,
        });
      }

      // Set timezone and locale
      await this.page.emulateTimezone(this.browserFingerprint.timezone);
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': this.browserFingerprint.acceptLanguage,
      });

      // Hide webdriver properties
      await this.page.evaluateOnNewDocument(() => {
        // @ts-ignore
        delete navigator.__proto__.webdriver;
        // @ts-ignore
        delete navigator.plugins;
        // @ts-ignore
        delete navigator.languages;
      });

      console.log(`✅ [SERP TRACKER] Session ${this.sessionId} initialized successfully`, {
        userAgent: this.browserFingerprint.userAgent.substring(0, 50) + '...',
        proxy: this.currentProxy?.server || 'direct',
        viewport: this.browserFingerprint.viewport,
      });
    } catch (error) {
      // Mark proxy as failed if initialization failed
      if (this.currentProxy?.server) {
        proxyManager.markProxyFailed(this.currentProxy.server);
      }
      throw error;
    }
  }

  async trackKeywords(request: SERPTrackingRequest): Promise<SERPTrackingSession> {
    const session: SERPTrackingSession = {
      id: this.sessionId,
      request,
      results: [],
      errors: [],
      startTime: new Date().toISOString(),
      endTime: '',
      totalKeywords: request.keywords.length,
      successfulQueries: 0,
      failedQueries: 0,
    };

    console.log(`🚀 [SERP TRACKER] Starting keyword tracking for ${request.keywords.length} keywords`);

    const proxyManager = getProxyManager();

    await this.initialize(request);

    try {
      for (let i = 0; i < request.keywords.length; i++) {
        const keyword = request.keywords[i];
        console.log(`📊 [SERP TRACKER] Processing keyword ${i + 1}/${request.keywords.length}: "${keyword}"`);

        try {
          // Use proxy manager throttling
          await proxyManager.throttleRequest();

          const result = await this.trackSingleKeyword(keyword, request);
          session.results.push(result);
          session.successfulQueries++;

          // Mark proxy as successful
          if (this.currentProxy?.server) {
            proxyManager.markProxySuccess(this.currentProxy.server);
          }

        } catch (error) {
          const errorMessage = `Failed to track keyword "${keyword}": ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`❌ [SERP TRACKER] ${errorMessage}`);
          session.errors.push(errorMessage);
          session.failedQueries++;

          // Mark proxy as failed
          if (this.currentProxy?.server) {
            proxyManager.markProxyFailed(this.currentProxy.server);

            // Try to get a new proxy for the next request
            this.currentProxy = await proxyManager.getNextProxy();
            if (this.currentProxy) {
              console.log(`🔄 [SERP TRACKER] Switching to new proxy: ${this.currentProxy.server}`);
              await this.reinitializeWithNewProxy();
            }
          }

          // Add extra delay on error
          await this.sleep(5000);
        }

        // Add delay between requests if not the last keyword
        if (i < request.keywords.length - 1) {
          const delay = this.getRandomDelay(3000, 8000); // 3-8 seconds with proxy management
          console.log(`⏳ [SERP TRACKER] Waiting ${delay}ms before next query...`);
          await this.sleep(delay);
        }
      }
    } finally {
      await this.cleanup();
      session.endTime = new Date().toISOString();
    }

    console.log(`✅ [SERP TRACKER] Session completed. Success: ${session.successfulQueries}, Failed: ${session.failedQueries}`);
    return session;
  }

  private async reinitializeWithNewProxy(): Promise<void> {
    try {
      // Close current page
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      // Create new page with new proxy
      if (this.browser) {
        this.page = await this.browser.newPage();

        // Reapply browser fingerprint
        await this.page.setUserAgent(this.browserFingerprint.userAgent);
        await this.page.setViewport(this.browserFingerprint.viewport);

        // Set extra headers
        await this.page.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': `${this.browserFingerprint.acceptLanguage},en;q=0.9`,
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0',
        });

        // Handle proxy authentication
        if (this.currentProxy?.username && this.currentProxy?.password) {
          await this.page.authenticate({
            username: this.currentProxy.username,
            password: this.currentProxy.password,
          });
        }

        console.log(`✅ [SERP TRACKER] Reinitialized with new proxy: ${this.currentProxy?.server}`);
      }
    } catch (error) {
      console.error('❌ [SERP TRACKER] Failed to reinitialize with new proxy:', error);
    }
  }

  private async trackSingleKeyword(keyword: string, request: SERPTrackingRequest): Promise<KeywordRankingResult> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const searchUrl = this.buildSearchUrl(keyword, request);
    console.log(`🔍 [SERP TRACKER] Searching for: "${keyword}" at ${searchUrl}`);

    // Navigate to search results
    await this.page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for results to load
    await this.waitForSearchResults();

    // Extract SERP data
    const serpResults = await this.extractSERPResults(request.domain);

    // Check for SERP features
    const serpFeatures = await this.detectSERPFeatures();

    // Find our domain's ranking
    const ourRanking = serpResults.find(result => result.domain === request.domain || result.url.includes(request.domain));

    if (!ourRanking) {
      // Domain not found in results - return ranking as 0
      return {
        keyword,
        rank: 0,
        url: '',
        title: '',
        description: '',
        searchEngine: request.searchEngine,
        location: request.location || 'Global',
        device: request.device,
        timestamp: new Date().toISOString(),
        serpFeatures,
        competitorRankings: serpResults.slice(0, 10), // Top 10 competitors
      };
    }

    return {
      keyword,
      rank: ourRanking.position,
      url: ourRanking.url,
      title: ourRanking.title,
      description: ourRanking.description,
      searchEngine: request.searchEngine,
      location: request.location || 'Global',
      device: request.device,
      timestamp: new Date().toISOString(),
      serpFeatures,
      competitorRankings: serpResults.filter(result => result.domain !== request.domain).slice(0, 10),
    };
  }

  private buildSearchUrl(keyword: string, request: SERPTrackingRequest): string {
    const encodedKeyword = encodeURIComponent(keyword);
    const baseUrl = this.getSearchEngineBaseUrl(request.searchEngine);

    let url = `${baseUrl}?q=${encodedKeyword}&num=${request.maxResults}&hl=${request.language}`;

    // Add device parameter
    if (request.device === 'mobile') {
      url += '&device=m';
    }

    // Add location parameter if specified
    if (request.location) {
      url += `&gl=${this.getLocationCode(request.location)}`;
    }

    return url;
  }

  private getSearchEngineBaseUrl(searchEngine: string): string {
    switch (searchEngine) {
      case 'bing':
        return 'https://www.bing.com/search';
      case 'duckduckgo':
        return 'https://duckduckgo.com/';
      default:
        return 'https://www.google.com/search';
    }
  }

  private getLocationCode(location: string): string {
    // Simple location code mapping
    const locationMap: { [key: string]: string } = {
      'United States': 'us',
      'United Kingdom': 'uk',
      'Canada': 'ca',
      'Australia': 'au',
      'Germany': 'de',
      'France': 'fr',
      'India': 'in',
      'Japan': 'jp',
    };
    return locationMap[location] || 'us';
  }

  private async waitForSearchResults(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Wait for common search result selectors
    const selectors = [
      '#search .g',           // Google standard results
      '.b_algo',              // Bing results
      '.result__body',        // DuckDuckGo results
      '[data-hveid]',         // Google results with tracking
    ];

    try {
      await this.page.waitForFunction(
        (selArray) => {
          return selArray.some(selector => document.querySelector(selector));
        },
        { timeout: 10000 },
        selectors
      );
    } catch (error) {
      console.warn('⚠️ [SERP TRACKER] Search results loading timeout, proceeding anyway');
    }

    // Additional wait for dynamic content
    await this.sleep(2000);
  }

  private async extractSERPResults(targetDomain: string): Promise<SERPResult[]> {
    if (!this.page) throw new Error('Page not initialized');

    const results = await this.page.evaluate((domain) => {
      const serpResults: SERPResult[] = [];

      // Try different selectors for search engines
      const resultSelectors = [
        '#search .g',           // Google
        '.b_algo',              // Bing
        '.result__body',        // DuckDuckGo
        '.g',                   // Generic Google results
      ];

      let searchResults: NodeListOf<Element> | null = null;

      // Find the first working selector
      for (const selector of resultSelectors) {
        searchResults = document.querySelectorAll(selector);
        if (searchResults.length > 0) break;
      }

      if (!searchResults) return [];

      Array.from(searchResults).forEach((result, index) => {
        try {
          // Try different selectors for title, link, and description
          const titleElement = result.querySelector('h3') ||
                              result.querySelector('a h2') ||
                              result.querySelector('.result__title');
          const linkElement = result.querySelector('a') ||
                             result.querySelector('.result__a');
          const descElement = result.querySelector('.VwiC3b') ||
                             result.querySelector('.b_caption p') ||
                             result.querySelector('.result__snippet');

          if (titleElement && linkElement) {
            const title = titleElement.textContent?.trim() || '';
            const url = (linkElement as HTMLAnchorElement).href;
            const description = descElement?.textContent?.trim() || '';

            // Extract domain from URL
            const urlObj = new URL(url);
            const resultDomain = urlObj.hostname;

            // Check if it's a local result
            const isLocalResult = title.toLowerCase().includes('near') ||
                                description.toLowerCase().includes('near') ||
                                result.querySelector('[data-local-result]') !== null;

            // Check for featured snippet
            const featuredSnippet = result.closest('.g')?.querySelector('.hgKElc') !== null ||
                                   result.querySelector('.featured-snippet') !== null;

            // Extract sitelinks
            const sitelinks: string[] = [];
            const sitelinkElements = result.querySelectorAll('.fl, .TbwUpd');
            sitelinkElements.forEach(link => {
              const text = link.textContent?.trim();
              if (text) sitelinks.push(text);
            });

            serpResults.push({
              position: index + 1,
              title,
              url,
              description,
              domain: resultDomain,
              isLocalResult,
              featuredSnippet,
              sitelinks,
            });
          }
        } catch (error) {
          console.warn('Error extracting result:', error);
        }
      });

      return serpResults;
    }, targetDomain);

    return results;
  }

  private async detectSERPFeatures(): Promise<{
    featuredSnippet: boolean;
    localPack: boolean;
    shoppingResults: boolean;
    videoResults: boolean;
    newsResults: boolean;
  }> {
    if (!this.page) throw new Error('Page not initialized');

    const features = await this.page.evaluate(() => {
      return {
        featuredSnippet: !!document.querySelector('.g .hgKElc, .featured-snippet'),
        localPack: !!document.querySelector('.lclilr, .local-pack'),
        shoppingResults: !!document.querySelector('.pla-unit, .sh-prd-product'),
        videoResults: !!document.querySelector('.V3oC1b, .video-result'),
        newsResults: !!document.querySelector('.xpd EtOod, .news-result'),
      };
    });

    return features;
  }

  private getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async cleanup(): Promise<void> {
    console.log(`🧹 [SERP TRACKER] Cleaning up session ${this.sessionId}`);

    if (this.page) {
      await this.page.close();
      this.page = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Save ranking results to database
   */
  async saveRankingResults(results: KeywordRankingResult[]): Promise<void> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    console.log(`💾 [SERP TRACKER] Saving ${results.length} ranking results to database`);

    for (const result of results) {
      try {
        // Convert to match existing performanceTracking table structure
        await createPerformanceTracking({
          supabaseUserId,
          savedTopicId: 0, // Placeholder for untracked rankings
          keyword: result.keyword,
          position: result.rank * 100, // Convert to basis points (like GSC)
          url: result.url,
          clicks: 0, // Not available from SERP scraping
          impressions: 0, // Not available from SERP scraping
          ctr: 0, // Not available from SERP scraping
          device: result.device,
          country: result.location || 'US',
          date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        });
      } catch (error) {
        console.error(`❌ [SERP TRACKER] Failed to save ranking for "${result.keyword}":`, error);
      }
    }

    console.log(`✅ [SERP TRACKER] Ranking results saved successfully`);
  }

  /**
   * Compare current rankings with historical data
   */
  async compareWithHistory(keyword: string, currentRank: number): Promise<{
    previousRank: number;
    rankChange: number;
    trend: 'up' | 'down' | 'stable' | 'new';
  }> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return { previousRank: currentRank, rankChange: 0, trend: 'new' };
    }

    try {
      const historicalData = await getPerformanceTrackingByKeyword(keyword, supabaseUserId, 30);

      if (historicalData.length === 0) {
        return { previousRank: currentRank, rankChange: 0, trend: 'new' };
      }

      // Sort by date and get the most recent entry
      const sortedData = historicalData.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const mostRecent = sortedData[0];
      const previousRank = mostRecent.position / 100; // Convert from basis points
      const rankChange = previousRank - currentRank;

      let trend: 'up' | 'down' | 'stable' | 'new';
      if (Math.abs(rankChange) <= 2) {
        trend = 'stable';
      } else if (rankChange > 0) {
        trend = 'up';
      } else {
        trend = 'down';
      }

      return { previousRank, rankChange, trend };
    } catch (error) {
      console.error('Error comparing with history:', error);
      return { previousRank: currentRank, rankChange: 0, trend: 'new' };
    }
  }
}

// Singleton instance
let serpTracker: SERPTracker | null = null;

export function getSERPTracker(): SERPTracker {
  if (!serpTracker) {
    serpTracker = new SERPTracker();
  }
  return serpTracker;
}

// Export helper functions for use in API routes
export async function trackKeywordRankings(request: SERPTrackingRequest): Promise<SERPTrackingSession> {
  const tracker = getSERPTracker();
  const session = await tracker.trackKeywords(request);

  // Save results to database
  if (session.results.length > 0) {
    await tracker.saveRankingResults(session.results);
  }

  return session;
}