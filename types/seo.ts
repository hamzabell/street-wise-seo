/**
 * TypeScript types for SEO topic generation and website analysis
 */

import { z } from 'zod';
import type { WebsiteCrawlerRequest, CrawledPage, WebsiteAnalysisResult } from '@/lib/seo/website-crawler';

// Re-export website crawler types
export type { WebsiteCrawlerRequest };
export type { CrawledPage as CrawledPageData };
export type { WebsiteAnalysisResult };

// Note: ContentAnalysisResult and related types are not available in the current implementation

// Enhanced topic generation with website analysis
export interface EnhancedTopicGenerationRequest {
  topic: string;
  businessType: string;
  targetAudience: string;
  location?: string;
  websiteUrl?: string;
  competitorUrl?: string;
  includeWebsiteAnalysis: boolean;
}

export interface EnhancedGeneratedTopic {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  suggestedTags: string[];
  relevanceScore?: number;
  websiteContext?: {
    relatedContent: string[];
    contentGapOpportunity: boolean;
    internalLinkingOpportunities: string[];
    competitorAdvantage?: string;
  };
}

export interface EnhancedTopicGenerationResult {
  inputTopic: string;
  websiteAnalysis?: WebsiteAnalysisResult;
  contentAnalysis?: any; // Placeholder until content analyzer is implemented
  generatedTopics: EnhancedGeneratedTopic[];
  metadata: {
    businessType: string;
    targetAudience: string;
    location?: string;
    websiteUrl?: string;
    competitorUrl?: string;
    generatedAt: string;
    totalTopics: number;
    averageDifficulty: string;
    totalEstimatedVolume: number;
    personalizationScore: number;
  };
}

// Website analysis UI types
export interface WebsiteAnalysisDisplay {
  url: string;
  domain: string;
  crawledAt: string;
  summary: {
    pagesCrawled: number;
    totalWords: number;
    topicsFound: number;
    technicalIssues: number;
    contentGaps: number;
  };
  qualityScores: {
    contentQuality: number;
    topicalAuthority: number;
    technicalSEO: number;
    overall: number;
  };
}

export interface ContentGapDisplay {
  id: string;
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  competitorAdvantage?: string;
  suggestedAction: string;
}

export interface KeywordOpportunityDisplay {
  keyword: string;
  currentUsage: number;
  potentialUsage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  searchVolume: 'low' | 'medium' | 'high';
  opportunityScore: number;
}

export interface TechnicalIssueDisplay {
  type: string;
  url: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  fixPriority: string;
  estimatedEffort: string;
}

// Form validation schemas
export const EnhancedTopicGenerationSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long'),
  businessType: z.string().min(2, 'Business type is required'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  location: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  competitorUrl: z.string().url('Invalid competitor URL').optional().or(z.literal('')),
  includeWebsiteAnalysis: z.boolean().default(false),
});

export const WebsiteCrawlRequestSchema = z.object({
  url: z.string().url('Please enter a valid website URL'),
  maxPages: z.number().min(1).max(20).default(10),
  includeExternalLinks: z.boolean().default(false),
});

// API response types
export interface WebsiteAnalysisResponse {
  success: boolean;
  data: WebsiteAnalysisResult;
  usage?: {
    crawlsUsed: number;
    crawlsLimit: number;
    remaining: number;
  };
}

export interface EnhancedTopicGenerationResponse {
  success: boolean;
  data: EnhancedTopicGenerationResult;
  usage?: {
    generationsUsed: number;
    generationsLimit: number;
    crawlsUsed?: number;
    crawlsLimit?: number;
    remaining: number;
  };
}

export interface ContentAnalysisResponse {
  success: boolean;
  data: any; // Placeholder until content analyzer is implemented
}

// Error types
export interface SEOError {
  error: string;
  type: 'validation' | 'crawling' | 'analysis' | 'generation' | 'usage_limit';
  details?: Record<string, any>;
  requiresUpgrade?: boolean;
}

// Usage tracking types
export interface SEOUsage {
  daily: {
    generations: number;
    crawls: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  monthly: {
    generations: number;
    crawls: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  features: {
    websiteAnalysis: boolean;
    competitorAnalysis: boolean;
    advancedInsights: boolean;
  };
}

// Component props types
export interface TopicCardProps {
  topic: EnhancedGeneratedTopic;
  onSave: (topic: EnhancedGeneratedTopic) => void;
  saved: boolean;
  showWebsiteContext?: boolean;
}

export interface WebsiteAnalysisCardProps {
  analysis: WebsiteAnalysisDisplay;
  onViewDetails: () => void;
  onGenerateTopics: () => void;
}

export interface ContentGapCardProps {
  gap: ContentGapDisplay;
  onAddressGap: (topic: string) => void;
}

export interface CompetitorAnalysisCardProps {
  competitorUrl: string;
  missingTopics: string[];
  opportunities: string[];
  onViewCompetitor: (url: string) => void;
}

// Subscription and feature gating types
export interface FeatureGates {
  websiteAnalysis: boolean;
  competitorAnalysis: boolean;
  advancedInsights: boolean;
  unlimitedGenerations: boolean;
  prioritySupport: boolean;
}

export interface PlanFeatures {
  name: string;
  price: number;
  features: FeatureGates;
  limits: {
    dailyGenerations: number;
    monthlyGenerations: number;
    dailyCrawls: number;
    monthlyCrawls: number;
    savedTopics: number;
  };
}

// Analytics and tracking types
export interface SEOAnalytics {
  topicGenerations: number;
  websiteCrawls: number;
  competitorAnalyses: number;
  topicsSaved: number;
  averageTopicsPerGeneration: number;
  popularBusinessTypes: Array<{
    type: string;
    count: number;
  }>;
  commonTopics: Array<{
    topic: string;
    frequency: number;
  }>;
}

// Export common Zod schemas for reuse
export { EnhancedTopicGenerationSchema as TopicGenerationSchema };
export { WebsiteCrawlRequestSchema as WebsiteAnalysisSchema };