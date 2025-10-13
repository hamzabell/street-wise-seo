/**
 * Website crawler service for analyzing website content and structure
 */

import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import { z } from 'zod';

export const WebsiteCrawlerRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  maxPages: z.number().min(1).max(50).default(10),
  includeExternalLinks: z.boolean().default(false),
  crawlDelay: z.number().min(100).max(5000).default(1000),
});

export type WebsiteCrawlerRequest = z.infer<typeof WebsiteCrawlerRequestSchema>;

export interface CrawledPage {
  url: string;
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: string;
  wordCount: number;
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{
    src: string;
    alt: string;
  }>;
  lastModified?: string;
}

export interface WebsiteAnalysisResult {
  url: string;
  domain: string;
  crawledPages: CrawledPage[];
  totalWordCount: number;
  totalImages: number;
  topics: string[];
  keywords: Array<{
    keyword: string;
    frequency: number;
    density: number;
  }>;
  internalLinkingScore: number;
  technicalIssues: Array<{
    type: 'missing_title' | 'missing_meta_description' | 'missing_h1' | 'thin_content';
    url: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  crawledAt: string;
}

export class WebsiteCrawler {
  private browser: Browser | null = null;
  private crawledUrls = new Set<string>();
  private crawlDelay: number;

  constructor(crawlDelay = 1000) {
    this.crawlDelay = crawlDelay;
  }

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async crawlWebsite(request: WebsiteCrawlerRequest): Promise<WebsiteAnalysisResult> {
    console.log('🕷️ [WEBSITE CRAWLER] Starting crawl with request:', request);
    const validated = WebsiteCrawlerRequestSchema.parse(request);

    await this.initialize();

    try {
      const domain = new URL(validated.url).hostname;
      const crawledPages: CrawledPage[] = [];
      const urlsToCrawl = [validated.url];
      this.crawledUrls.clear();

      console.log(`📍 [WEBSITE CRAWLER] Domain: ${domain}, Max pages: ${validated.maxPages}`);

      while (urlsToCrawl.length > 0 && crawledPages.length < validated.maxPages) {
        const currentUrl = urlsToCrawl.shift()!;

        if (this.crawledUrls.has(currentUrl)) {
          continue;
        }

        try {
          console.log(`📄 [WEBSITE CRAWLER] Crawling page: ${currentUrl}`);
          const pageData = await this.crawlPage(currentUrl);
          if (pageData) {
            crawledPages.push(pageData);
            this.crawledUrls.add(currentUrl);
            console.log(`✅ [WEBSITE CRAWLER] Successfully crawled: ${currentUrl} (Words: ${pageData.wordCount}, Internal links: ${pageData.internalLinks.length})`);

            // Add internal links to crawl queue
            if (validated.includeExternalLinks || this.isSameDomain(currentUrl, domain)) {
              pageData.internalLinks.forEach(link => {
                if (!this.crawledUrls.has(link) && urlsToCrawl.length < validated.maxPages) {
                  urlsToCrawl.push(link);
                }
              });
            }
          } else {
            console.log(`⚠️ [WEBSITE CRAWLER] No data returned for: ${currentUrl}`);
          }

          // Respect crawl delay
          if (urlsToCrawl.length > 0) {
            console.log(`⏳ [WEBSITE CRAWLER] Waiting ${this.crawlDelay}ms before next page...`);
            await this.sleep(this.crawlDelay);
          }
        } catch (error) {
          console.error(`❌ [WEBSITE CRAWLER] Failed to crawl ${currentUrl}:`, error);
        }
      }

      return this.analyzeCrawledData(crawledPages, domain);
    } finally {
      await this.close();
    }
  }

  private async crawlPage(url: string, retryCount = 0): Promise<CrawledPage | null> {
    const maxRetries = 2;

    try {
      console.log(`🌐 [WEBSITE CRAWLER] Opening browser page for: ${url} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      const page = await this.browser!.newPage();

      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to page with timeout
      console.log(`🚀 [WEBSITE CRAWLER] Navigating to: ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      console.log(`📱 [WEBSITE CRAWLER] Page loaded successfully: ${url}`);

      // Wait a bit for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract data
      const title = $('title').text().trim() || 'No Title';
      const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';

      const headings = {
        h1: this.extractHeadings($, 'h1'),
        h2: this.extractHeadings($, 'h2'),
        h3: this.extractHeadings($, 'h3')
      };

      const bodyText = $('body').text();
      const cleanContent = this.cleanText(bodyText);
      const wordCount = this.countWords(cleanContent);

      const links = this.extractLinks($, url);
      const images = this.extractImages($);

      console.log(`📊 [WEBSITE CRAWLER] Extracted data from ${url}:`, {
        title: title.substring(0, 50),
        h1Count: headings.h1.length,
        h2Count: headings.h2.length,
        h3Count: headings.h3.length,
        wordCount,
        internalLinks: links.internal.length,
        externalLinks: links.external.length,
        images: images.length
      });

      await page.close();

      // Validate content quality
      const qualityScore = this.validateContentQuality({
        title,
        metaDescription,
        headings,
        content: cleanContent,
        wordCount,
        internalLinks: links.internal.length
      });

      console.log(`🔍 [CONTENT QUALITY] Quality score for ${url}: ${qualityScore}/100`);

      // If quality is too low and we haven't exceeded retries, try again
      if (qualityScore < 30 && retryCount < maxRetries) {
        console.log(`⚠️ [CONTENT QUALITY] Low quality content (${qualityScore}/100) for ${url}, retrying...`);
        await this.sleep(2000); // Wait before retry
        return this.crawlPage(url, retryCount + 1);
      }

      return {
        url,
        title,
        metaDescription,
        headings,
        content: cleanContent,
        wordCount,
        internalLinks: links.internal,
        externalLinks: links.external,
        images,
        lastModified: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error crawling page ${url}:`, error);

      // Retry on network errors
      if (retryCount < maxRetries &&
          (error instanceof Error &&
           (error.message.includes('net::ERR_') ||
            error.message.includes('Timeout') ||
            error.message.includes('Navigation timeout')))) {
        console.log(`🔄 [WEBSITE CRAWLER] Retrying ${url} due to network error...`);
        await this.sleep(3000);
        return this.crawlPage(url, retryCount + 1);
      }

      return null;
    }
  }

  private validateContentQuality(data: {
    title: string;
    metaDescription: string;
    headings: { h1: string[]; h2: string[]; h3: string[] };
    content: string;
    wordCount: number;
    internalLinks: number;
  }): number {
    let score = 0;
    const maxScore = 100;

    // Title quality (25 points)
    if (data.title && data.title !== 'No Title') {
      score += 10;
      if (data.title.length > 10 && data.title.length < 70) score += 10;
      if (data.title.split(' ').length > 3) score += 5;
    }

    // Meta description (15 points)
    if (data.metaDescription && data.metaDescription.length > 50) {
      score += 10;
      if (data.metaDescription.length < 160) score += 5;
    }

    // Headings structure (20 points)
    if (data.headings.h1.length > 0) score += 8;
    if (data.headings.h2.length > 0) score += 7;
    if (data.headings.h3.length > 0) score += 5;

    // Content quantity (25 points)
    if (data.wordCount > 100) score += 10;
    if (data.wordCount > 300) score += 10;
    if (data.wordCount > 1000) score += 5;

    // Content quality (15 points)
    if (data.content && data.content.length > 500) {
      score += 8;
      // Check for meaningful content (not just navigation/links)
      const sentences = data.content.split('.').filter(s => s.trim().length > 20);
      if (sentences.length > 5) score += 7;
    }

    return Math.min(score, maxScore);
  }

  private extractHeadings($: cheerio.CheerioAPI, tag: string): string[] {
    const headings: string[] = [];
    $(tag).each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        headings.push(text);
      }
    });
    return headings;
  }

  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): { internal: string[]; external: string[] } {
    const internal: string[] = [];
    const external: string[] = [];
    const baseDomain = new URL(baseUrl).hostname;

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const fullUrl = new URL(href, baseUrl).toString();
          const urlDomain = new URL(fullUrl).hostname;

          if (urlDomain === baseDomain) {
            if (!internal.includes(fullUrl)) {
              internal.push(fullUrl);
            }
          } else {
            if (!external.includes(fullUrl)) {
              external.push(fullUrl);
            }
          }
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });

    return { internal, external };
  }

  private extractImages($: cheerio.CheerioAPI): Array<{ src: string; alt: string }> {
    const images: Array<{ src: string; alt: string }> = [];

    $('img').each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || '';

      if (src) {
        images.push({ src, alt });
      }
    });

    return images;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private isSameDomain(url: string, domain: string): boolean {
    try {
      return new URL(url).hostname === domain;
    } catch {
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private analyzeCrawledData(pages: CrawledPage[], domain: string): WebsiteAnalysisResult {
    const totalWordCount = pages.reduce((sum, page) => sum + page.wordCount, 0);
    const totalImages = pages.reduce((sum, page) => sum + page.images.length, 0);

    // Extract topics from headings and content
    const allHeadings = pages.flatMap(page => [
      ...page.headings.h1,
      ...page.headings.h2,
      ...page.headings.h3
    ]);

    const topics = this.extractTopics(allHeadings, pages);
    const keywords = this.extractKeywords(pages);
    const technicalIssues = this.identifyTechnicalIssues(pages);
    const internalLinkingScore = this.calculateInternalLinkingScore(pages);

    return {
      url: pages[0]?.url || '',
      domain,
      crawledPages: pages,
      totalWordCount,
      totalImages,
      topics,
      keywords,
      internalLinkingScore,
      technicalIssues,
      crawledAt: new Date().toISOString()
    };
  }

  private extractTopics(headings: string[], pages: CrawledPage[]): string[] {
    console.log('🔍 [TOPIC EXTRACTION] Starting enhanced topic extraction');
    console.log('📊 [TOPIC EXTRACTION] Input data:', {
      headingsCount: headings.length,
      pagesCount: pages.length,
      sampleHeadings: headings.slice(0, 5)
    });

    const topicFrequency = new Map<string, number>();
    const topicGroups = new Map<string, Set<string>>();

    // Enhanced topic extraction from headings with semantic grouping
    headings.forEach(heading => {
      const cleanHeading = this.normalizeText(heading);
      if (cleanHeading.length < 5) return;

      // Extract meaningful phrases (full headings with higher weight)
      topicFrequency.set(cleanHeading, (topicFrequency.get(cleanHeading) || 0) + 5);

      // Extract key terms from headings
      const keyTerms = this.extractKeyTerms(cleanHeading);
      keyTerms.forEach(term => {
        if (term.length > 3) {
          topicFrequency.set(term, (topicFrequency.get(term) || 0) + 2);

          // Group related terms
          const baseTerm = this.findBaseTerm(term, topicGroups);
          if (!topicGroups.has(baseTerm)) {
            topicGroups.set(baseTerm, new Set());
          }
          topicGroups.get(baseTerm)!.add(term);
        }
      });
    });

    // Extract topics from page titles with emphasis on business-relevant terms
    pages.forEach(page => {
      const cleanTitle = this.normalizeText(page.title);
      if (cleanTitle.length < 5) return;

      topicFrequency.set(cleanTitle, (topicFrequency.get(cleanTitle) || 0) + 6);

      const titleTerms = this.extractKeyTerms(cleanTitle);
      titleTerms.forEach(term => {
        if (term.length > 3 && !this.isStopWord(term)) {
          topicFrequency.set(term, (topicFrequency.get(term) || 0) + 3);
        }
      });

      // Extract topics from meta descriptions (lower weight)
      if (page.metaDescription) {
        const cleanDesc = this.normalizeText(page.metaDescription);
        const descTerms = this.extractKeyTerms(cleanDesc);
        descTerms.forEach(term => {
          if (term.length > 4 && !this.isStopWord(term)) {
            topicFrequency.set(term, (topicFrequency.get(term) || 0) + 1);
          }
        });
      }
    });

    // Extract topics from content samples (first 500 words of each page)
    pages.forEach(page => {
      const contentSample = page.content.split(/\s+/).slice(0, 500).join(' ');
      const cleanContent = this.normalizeText(contentSample);
      const contentTerms = this.extractKeyTerms(cleanContent);

      contentTerms.forEach(term => {
        if (term.length > 4 && !this.isStopWord(term) && this.isBusinessRelevant(term)) {
          topicFrequency.set(term, (topicFrequency.get(term) || 0) + 1);
        }
      });
    });

    // Consolidate and rank topics
    const consolidatedTopics = this.consolidateTopics(topicFrequency, topicGroups);
    const finalTopics = this.rankTopicsByRelevance(consolidatedTopics, pages);

    console.log('✅ [TOPIC EXTRACTION] Enhanced extraction completed:', {
      totalTopics: finalTopics.length,
      topics: finalTopics.slice(0, 10),
      topicGroups: topicGroups.size
    });

    return finalTopics;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractKeyTerms(text: string): string[] {
    // Extract meaningful terms including phrases
    const terms: string[] = [];

    // Extract multi-word phrases (2-3 words)
    const words = text.split(' ');
    for (let i = 0; i < words.length - 1; i++) {
      // 2-word phrases
      if (words[i].length > 2 && words[i + 1].length > 2) {
        terms.push(`${words[i]} ${words[i + 1]}`);
      }

      // 3-word phrases (skip common stop words)
      if (i < words.length - 2 &&
          words[i].length > 2 &&
          words[i + 1].length > 2 &&
          words[i + 2].length > 2 &&
          !this.isStopWord(words[i + 1])) {
        terms.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    // Extract individual words
    words.forEach(word => {
      if (word.length > 3) {
        terms.push(word);
      }
    });

    return terms;
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one',
      'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see',
      'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'was',
      'will', 'with', 'have', 'this', 'that', 'from', 'they', 'know', 'want', 'been', 'good',
      'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make',
      'many', 'over', 'such', 'take', 'than', 'them', 'well', 'only', 'most', 'even', 'find',
      'also', 'after', 'back', 'call', 'come', 'could', 'does', 'dont', 'first', 'into', 'more',
      'only', 'other', 'said', 'same', 'should', 'their', 'there', 'these', 'they', 'things',
      'think', 'those', 'under', 'very', 'want', 'well', 'were', 'what', 'where', 'which',
      'while', 'would', 'your', 'about', 'been', 'before', 'being', 'between', 'both', 'came',
      'come', 'each', 'every', 'find', 'found', 'give', 'going', 'great', 'have', 'here',
      'him', 'his', 'home', 'house', 'just', 'know', 'large', 'like', 'look', 'made', 'make',
      'many', 'more', 'most', 'much', 'must', 'name', 'need', 'never', 'next', 'night', 'now',
      'only', 'over', 'part', 'people', 'said', 'see', 'she', 'should', 'show', 'small', 'so',
      'some', 'still', 'such', 'take', 'tell', 'than', 'that', 'their', 'them', 'then', 'there',
      'these', 'they', 'thing', 'think', 'this', 'those', 'thought', 'three', 'through', 'time',
      'together', 'told', 'took', 'turn', 'two', 'under', 'until', 'upon', 'used', 'very', 'want',
      'water', 'well', 'went', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whole',
      'whose', 'will', 'with', 'within', 'without', 'work', 'would', 'write', 'year', 'yes', 'yet',
      'your', 'yours'
    ]);
    return stopWords.has(word.toLowerCase());
  }

  private isBusinessRelevant(term: string): boolean {
    const businessTerms = [
      'service', 'product', 'solution', 'business', 'company', 'client', 'customer',
      'expert', 'professional', 'team', 'about', 'contact', 'support', 'help',
      'price', 'cost', 'pricing', 'quote', 'estimate', 'free', 'best', 'top',
      'local', 'near', 'area', 'location', 'online', 'website', 'digital',
      'marketing', 'seo', 'design', 'development', 'consulting', 'management',
      'quality', 'experience', 'years', 'established', 'trusted', 'reliable'
    ];

    return businessTerms.some(businessTerm =>
      term.includes(businessTerm) || businessTerm.includes(term)
    );
  }

  private findBaseTerm(term: string, topicGroups: Map<string, Set<string>>): string {
    // Find existing group or create new base term
    for (const [baseTerm, terms] of topicGroups.entries()) {
      if (terms.has(term) || this.areTermsRelated(baseTerm, term)) {
        return baseTerm;
      }
    }
    return term;
  }

  private areTermsRelated(term1: string, term2: string): boolean {
    // Check if terms share significant words
    const words1 = term1.split(' ');
    const words2 = term2.split(' ');

    const commonWords = words1.filter(word =>
      words2.includes(word) && word.length > 3
    );

    return commonWords.length > 0;
  }

  private consolidateTopics(
    topicFrequency: Map<string, number>,
    topicGroups: Map<string, Set<string>>
  ): Map<string, number> {
    const consolidated = new Map(topicFrequency);

    // Merge related terms and boost their frequency
    for (const [baseTerm, relatedTerms] of topicGroups.entries()) {
      if (relatedTerms.size > 1) {
        const totalFrequency = Array.from(relatedTerms).reduce((sum, term) =>
          sum + (consolidated.get(term) || 0), 0
        );

        // Boost the base term with combined frequency
        consolidated.set(baseTerm, (consolidated.get(baseTerm) || 0) + totalFrequency * 0.5);
      }
    }

    return consolidated;
  }

  private rankTopicsByRelevance(
    topicFrequency: Map<string, number>,
    pages: CrawledPage[]
  ): string[] {
    const scoredTopics = Array.from(topicFrequency.entries()).map(([topic, frequency]) => {
      let relevanceScore = frequency;

      // Boost score for topics appearing in multiple contexts
      let contextCount = 0;
      pages.forEach(page => {
        if (page.title.toLowerCase().includes(topic) ||
            page.content.toLowerCase().includes(topic)) {
          contextCount++;
        }
      });

      relevanceScore += contextCount * 2;

      // Prefer longer, more specific topics
      if (topic.includes(' ')) {
        relevanceScore *= 1.2;
      }

      return { topic, score: relevanceScore };
    });

    return scoredTopics
      .sort((a, b) => b.score - a.score)
      .slice(0, 25)
      .map(item => item.topic);
  }

  private extractKeywords(pages: CrawledPage[]): Array<{ keyword: string; frequency: number; density: number }> {
    const allText = pages.map(page => page.content).join(' ').toLowerCase();
    const totalWords = this.countWords(allText);
    const wordFrequency = new Map<string, number>();

    allText.split(/\s+/).forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFrequency.entries())
      .map(([keyword, frequency]) => ({
        keyword,
        frequency,
        density: (frequency / totalWords) * 100
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 15);
  }

  
  private identifyTechnicalIssues(pages: CrawledPage[]): Array<{
    type: 'missing_title' | 'missing_meta_description' | 'missing_h1' | 'thin_content';
    url: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }> {
    const issues: Array<{
      type: 'missing_title' | 'missing_meta_description' | 'missing_h1' | 'thin_content';
      url: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }> = [];

    pages.forEach(page => {
      // Check for missing title
      if (!page.title || page.title === 'No Title') {
        issues.push({
          type: 'missing_title',
          url: page.url,
          severity: 'high',
          description: 'Page is missing a title tag'
        });
      }

      // Check for missing meta description
      if (!page.metaDescription) {
        issues.push({
          type: 'missing_meta_description',
          url: page.url,
          severity: 'medium',
          description: 'Page is missing a meta description'
        });
      }

      // Check for missing H1
      if (page.headings.h1.length === 0) {
        issues.push({
          type: 'missing_h1',
          url: page.url,
          severity: 'high',
          description: 'Page is missing an H1 heading'
        });
      }

      // Check for thin content
      if (page.wordCount < 300) {
        issues.push({
          type: 'thin_content',
          url: page.url,
          severity: page.wordCount < 100 ? 'high' : 'medium',
          description: `Page has thin content (${page.wordCount} words)`
        });
      }
    });

    return issues;
  }

  
  private calculateInternalLinkingScore(pages: CrawledPage[]): number {
    if (pages.length === 0) return 0;

    const totalInternalLinks = pages.reduce((sum, page) => sum + page.internalLinks.length, 0);
    const averageInternalLinks = totalInternalLinks / pages.length;

    // Score out of 100 based on average internal links per page
    return Math.min(100, (averageInternalLinks / 10) * 100);
  }
}

// Singleton instance
let websiteCrawler: WebsiteCrawler | null = null;

export function getWebsiteCrawler(): WebsiteCrawler {
  if (!websiteCrawler) {
    websiteCrawler = new WebsiteCrawler();
  }
  return websiteCrawler;
}

// Export helper functions for use in API routes
export async function crawlWebsite(request: WebsiteCrawlerRequest): Promise<WebsiteAnalysisResult> {
  const crawler = getWebsiteCrawler();
  return await crawler.crawlWebsite(request);
}