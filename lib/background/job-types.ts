/**
 * Background job types and interfaces
 */

export enum JobType {
  WEBSITE_CRAWL = 'website_crawl',
  PERFORMANCE_ANALYSIS = 'performance_analysis',
  COMPETITOR_MONITORING = 'competitor_monitoring',
  CONTENT_PERFORMANCE_TRACKING = 'content_performance_tracking',
  SERP_TRACKING = 'serp_tracking',
}

export enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
}

export enum JobPriority {
  LOW = 8,
  NORMAL = 5,
  HIGH = 3,
  URGENT = 1,
}

export enum NotificationType {
  JOB_STARTED = 'job_started',
  JOB_COMPLETED = 'job_completed',
  JOB_FAILED = 'job_failed',
  JOB_CANCELLED = 'job_cancelled',
  JOB_RETRYING = 'job_retrying',
}

// Base job input interface
export interface BaseJobInput {
  userId: string;
  priority?: JobPriority;
  maxRetries?: number;
}

// Website crawl job input
export interface WebsiteCrawlJobInput extends BaseJobInput {
  type: JobType.WEBSITE_CRAWL;
  url: string;
  maxPages?: number;
  includeExternalLinks?: boolean;
  crawlDelay?: number;
  competitorUrl?: string;
}

// Performance analysis job input
export interface PerformanceAnalysisJobInput extends BaseJobInput {
  type: JobType.PERFORMANCE_ANALYSIS;
  domain: string;
  includeRecommendations?: boolean;
  includeFactors?: boolean;
}

// Competitor monitoring job input
export interface CompetitorMonitoringJobInput extends BaseJobInput {
  type: JobType.COMPETITOR_MONITORING;
  competitorUrl: string;
  competitorDomain: string;
  primaryWebsiteUrl?: string;
  analysisType?: 'content_gap' | 'keyword_analysis' | 'full';
}

// Content performance tracking job input
export interface ContentPerformanceTrackingJobInput extends BaseJobInput {
  type: JobType.CONTENT_PERFORMANCE_TRACKING;
  domain: string;
  urls?: string[];
  timeRange?: '7d' | '30d' | '90d';
}

// SERP tracking job input
export interface SerpTrackingJobInput extends BaseJobInput {
  type: JobType.SERP_TRACKING;
  keywords: string[];
  domain: string;
  searchEngines?: string[];
  device?: 'desktop' | 'mobile' | 'tablet';
  location?: string;
}

// Union type for all job inputs
export type JobInput =
  | WebsiteCrawlJobInput
  | PerformanceAnalysisJobInput
  | CompetitorMonitoringJobInput
  | ContentPerformanceTrackingJobInput
  | SerpTrackingJobInput;

// Base job result interface
export interface BaseJobResult {
  success: boolean;
  jobId: number;
  completedAt: Date;
  duration: number; // in milliseconds
}

// Website crawl job result
export interface WebsiteCrawlJobResult extends BaseJobResult {
  type: JobType.WEBSITE_CRAWL;
  websiteAnalysis?: {
    id: number;
    url: string;
    domain: string;
    crawledPages: number;
    totalWordCount: number;
    topics: string[];
    keywords: Array<{ keyword: string; frequency: number; density: number }>;
  };
  competitorAnalysis?: {
    competitorUrl: string;
    missingTopics: string[];
    opportunities: string[];
  };
  contentAnalysis?: {
    contentGaps: Array<{
      topic: string;
      reason: string;
      priority: string;
    }>;
    recommendations: string[];
  };
}

// Performance analysis job result
export interface PerformanceAnalysisJobResult extends BaseJobResult {
  type: JobType.PERFORMANCE_ANALYSIS;
  performanceScore: {
    overall: number;
    ranking: number;
    content: number;
    technical: number;
    traffic: number;
    authority: number;
    grade: string;
    trends: {
      direction: 'up' | 'down' | 'stable';
      change: number;
    };
  };
  recommendations: string[];
  factors?: {
    rankings: any;
    content: any;
    technical: any;
    traffic: any;
    authority: any;
  };
}

// Competitor monitoring job result
export interface CompetitorMonitoringJobResult extends BaseJobResult {
  type: JobType.COMPETITOR_MONITORING;
  changes?: {
    totalChanges: number;
    alerts: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    newPagesCount: number;
    removedPagesCount: number;
  };
  competitorAnalysis?: {
    missingTopics: string[];
    weakerContent: string[];
    opportunities: string[];
  };
}

// Content performance tracking job result
export interface ContentPerformanceTrackingJobResult extends BaseJobResult {
  type: JobType.CONTENT_PERFORMANCE_TRACKING;
  report?: {
    topPerformingContent: Array<{
      url: string;
      title: string;
      contentScore: number;
      optimizationScore: number;
    }>;
    contentGapsAnalysis: {
      criticalGaps: Array<{
        topic: string;
        priority: string;
        estimatedDifficulty: string;
      }>;
    };
    technicalSeoIssues: Array<{
      type: string;
      severity: string;
      description: string;
    }>;
  };
}

// SERP tracking job result
export interface SerpTrackingJobResult extends BaseJobResult {
  type: JobType.SERP_TRACKING;
  rankings: Array<{
    keyword: string;
    position: number;
    url: string;
    searchEngine: string;
    device: string;
    previousPosition?: number;
    positionChange?: number;
    searchDate: string;
  }>;
  summary: {
    totalKeywords: number;
    averagePosition: number;
    top10Count: number;
    top3Count: number;
  };
}

// Union type for all job results
export type JobResult =
  | WebsiteCrawlJobResult
  | PerformanceAnalysisJobResult
  | CompetitorMonitoringJobResult
  | ContentPerformanceTrackingJobResult
  | SerpTrackingJobResult;

// Job progress information
export interface JobProgress {
  jobId: number;
  status: JobStatus;
  progress: number; // 0-100
  currentStep: string;
  startedAt?: Date;
  estimatedCompletion?: Date;
  error?: string;
}

// Job queue interface
export interface JobQueue {
  enqueue(job: JobInput): Promise<number>; // Returns job ID
  dequeue(): Promise<JobInput | null>;
  peek(): Promise<JobInput | null>;
  size(): Promise<number>;
  isEmpty(): Promise<boolean>;
  getJobsByStatus(status: JobStatus): Promise<JobInput[]>;
  getJobsByUser(userId: string): Promise<JobInput[]>;
}

// Job processor interface
export interface JobProcessor {
  process(job: JobInput): Promise<JobResult>;
  canProcess(jobType: JobType): boolean;
  getEstimatedDuration(job: JobInput): number; // in milliseconds
}

// Job notification interface
export interface JobNotificationData {
  userId: string;
  jobId: number;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  autoDismiss?: boolean;
  dismissAt?: Date;
}

// Job statistics
export interface JobStatistics {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageDuration: number;
  successRate: number;
  jobsByType: Record<JobType, number>;
  jobsByStatus: Record<JobStatus, number>;
  recentJobs: Array<{
    id: number;
    type: JobType;
    status: JobStatus;
    createdAt: Date;
    completedAt?: Date;
    duration?: number;
  }>;
}

// Job configuration
export interface JobConfig {
  maxConcurrentJobs: number;
  defaultRetries: number;
  retryDelay: number; // in milliseconds
  jobTimeout: number; // in milliseconds
  cleanupInterval: number; // in milliseconds
  maxJobAge: number; // in milliseconds
}

// Export utility types
export type JobTypeString = keyof typeof JobType;
export type JobStatusString = keyof typeof JobStatus;
export type NotificationTypeString = keyof typeof NotificationType;