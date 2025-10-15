import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  serial,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  supabaseId: text('supabase_id').notNull().unique(),
  role: text('role').notNull().default('member'),
  primaryWebsiteUrl: text('primary_website_url'),
  // Business profile fields for citation tracking
  businessName: text('business_name'),
  businessAddress: text('business_address'),
  businessPhone: text('business_phone'),
  businessWebsite: text('business_website'),
  businessDescription: text('business_description'),
  businessCategories: text('business_categories'), // JSON string array
  businessCity: text('business_city'),
  businessState: text('business_state'),
  businessZipCode: text('business_zip_code'),
  businessCountry: text('business_country'),
  businessLatitude: real('business_latitude'),
  businessLongitude: real('business_longitude'),
  // Setup wizard fields
  setupWizardCompleted: boolean('setup_wizard_completed').default(false),
  setupProgress: text('setup_progress'), // JSON string with step completion status
  setupWizardCompletedAt: timestamp('setup_wizard_completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: text('plan_name'),
  subscriptionStatus: text('subscription_status'),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  supabaseUserId: text('supabase_user_id'), // Optional since some actions may not have user
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: text('ip_address'),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: text('status').notNull().default('pending'),
});

// SEO-specific tables - using Supabase user IDs directly
export const topicGenerations = pgTable('topic_generations', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  inputTopic: text('input_topic').notNull(),
  generatedTopics: text('generated_topics').notNull(), // JSON string
  metadata: text('metadata'), // JSON string with metrics, difficulty, etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const savedTopics = pgTable('saved_topics', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  topic: text('topic').notNull(),
  description: text('description'),
  tags: text('tags'), // JSON string array
  difficulty: text('difficulty'), // easy, medium, hard
  searchVolume: integer('search_volume'),
  competitionLevel: text('competition_level'), // low, medium, high
  sourceGenerationId: integer('source_generation_id').references(() => topicGenerations.id),
  // Enhanced fields for content generation personalization
  businessType: text('business_type'),
  targetAudience: text('target_audience'),
  location: text('location'),
  detailedLocation: text('detailed_location'), // JSON string with enhanced location data
  tone: text('tone'), // professional, casual, friendly, authoritative, conversational, humorous, inspirational
  additionalContext: text('additional_context'), // User's specific instructions and preferences
  websiteUrl: text('website_url'), // Website to use for context during content generation
  websiteAnalysisContext: text('website_analysis_context'), // JSON string with analyzed website data
  // Enhanced cultural context fields
  languagePreference: text('language_preference'), // english, cultural_english, native
  formalityLevel: text('formality_level'), // formal, professional, casual, slang_heavy
  contentPurpose: text('content_purpose'), // marketing, educational, conversational, technical
  brandVoiceAnalysis: text('brand_voice_analysis'), // JSON string with brand voice analysis
  businessOfferings: text('business_offerings'), // JSON string with business offerings
  competitorIntelligence: text('competitor_intelligence'), // JSON string with competitor intelligence
  culturalContext: text('cultural_context'), // JSON string with cultural context
  marketPositioning: text('market_positioning'), // JSON string with market positioning
  contextWeights: text('context_weights'), // JSON string with context weights
  savedAt: timestamp('saved_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const usageTracking = pgTable('usage_tracking', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  action: text('action').notNull(), // generate_topic, save_topic, crawl_website, etc.
  metadata: text('metadata'), // JSON string with additional info
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Website analysis tables - using Supabase user IDs directly
export const websiteAnalyses = pgTable('website_analyses', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  url: text('url').notNull(),
  domain: text('domain').notNull(),
  totalWordCount: integer('total_word_count').notNull().default(0),
  totalImages: integer('total_images').notNull().default(0),
  topics: text('topics'), // JSON string array
  keywords: text('keywords'), // JSON string with keyword data
  contentGaps: text('content_gaps'), // JSON string array
  internalLinkingScore: integer('internal_linking_score').default(0),
  technicalIssues: text('technical_issues'), // JSON string array
  crawledAt: timestamp('crawled_at').notNull().defaultNow(),
});

export const crawledPages = pgTable('crawled_pages', {
  id: serial('id').primaryKey(),
  websiteAnalysisId: integer('website_analysis_id')
    .notNull()
    .references(() => websiteAnalyses.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  title: text('title').notNull(),
  metaDescription: text('meta_description'),
  headings: text('headings'), // JSON string with h1, h2, h3 arrays
  content: text('content'),
  wordCount: integer('word_count').notNull().default(0),
  internalLinks: text('internal_links'), // JSON string array
  externalLinks: text('external_links'), // JSON string array
  images: text('images'), // JSON string array
  lastModified: timestamp('last_modified'),
});

export const contentGaps = pgTable('content_gaps', {
  id: serial('id').primaryKey(),
  websiteAnalysisId: integer('website_analysis_id')
    .notNull()
    .references(() => websiteAnalyses.id, { onDelete: 'cascade' }),
  topic: text('topic').notNull(),
  reason: text('reason').notNull(),
  priority: text('priority').notNull(), // high, medium, low
  estimatedDifficulty: text('estimated_difficulty').notNull(), // easy, medium, hard
  competitorAdvantage: text('competitor_advantage'),
  identifiedAt: timestamp('identified_at').notNull().defaultNow(),
});

export const competitorAnalyses = pgTable('competitor_analyses', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  primaryWebsiteAnalysisId: integer('primary_website_analysis_id')
    .notNull()
    .references(() => websiteAnalyses.id, { onDelete: 'cascade' }),
  competitorUrl: text('competitor_url').notNull(),
  competitorDomain: text('competitor_domain').notNull(),
  missingTopics: text('missing_topics'), // JSON string array - topics competitor has that we don't
  weakerContent: text('weaker_content'), // JSON string array - topics we have that competitor doesn't
  opportunities: text('opportunities'), // JSON string array
  // Enhanced analysis fields
  analysisData: text('analysis_data'), // JSON string with full CompetitorAnalysisResult
  contentGapAnalysis: text('content_gap_analysis'), // JSON string with ContentGapAnalysis
  performanceComparison: text('performance_comparison'), // JSON string with PerformanceComparison
  keywordOverlapAnalysis: text('keyword_overlap_analysis'), // JSON string with KeywordOverlapAnalysis
  recommendations: text('recommendations'), // JSON string array with recommendations
  industryId: text('industry_id'),
  competitorStrengthScore: integer('competitor_strength_score').default(0),
  contentSimilarityScore: integer('content_similarity_score').default(0),
  backlinkProfile: text('backlink_profile'), // JSON string with backlink data
  technicalSeoScore: integer('technical_seo_score').default(0),
  socialPresence: text('social_presence'), // JSON string with social media presence
  analyzedAt: timestamp('analyzed_at').notNull().defaultNow(),
});


// Content Briefs table
export const contentBriefs = pgTable('content_briefs', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  savedTopicId: integer('saved_topic_id').references(() => savedTopics.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  briefContent: text('brief_content').notNull(), // JSON string with structured brief data
  suggestedHeadings: text('suggested_headings'), // JSON string array of H1/H2 structure
  targetKeywords: text('target_keywords'), // JSON string array
  wordCountEstimate: integer('word_count_estimate'),
  internalLinkingSuggestions: text('internal_linking_suggestions'), // JSON string array
  contentRecommendations: text('content_recommendations'), // JSON string
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
});

// Generated Content table - AI-generated content with personalization
export const generatedContent = pgTable('generated_content', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  savedTopicId: integer('saved_topic_id').references(() => savedTopics.id, { onDelete: 'cascade' }),
  contentType: text('content_type').notNull(), // blog_post, social_media, website_page, email, google_business_profile
  variantNumber: integer('variant_number').notNull(), // 1, 2, 3, etc. for multiple variants
  title: text('title').notNull(),
  content: text('content').notNull(), // Raw content (markdown/plain text)
  htmlContent: text('html_content'), // Rendered HTML content
  tone: text('tone').notNull(), // professional, casual, friendly, authoritative, etc.
  additionalContext: text('additional_context'), // User's specific instructions used
  websiteAnalysisContext: text('website_analysis_context'), // JSON string with website data used
  wordCount: integer('word_count').notNull().default(0),
  readingTime: integer('reading_time'), // Estimated reading time in minutes
  targetKeywords: text('target_keywords'), // JSON string array
  seoScore: integer('seo_score'), // 0-100 SEO optimization score
  status: text('status').notNull().default('draft'), // draft, published, archived
  metadata: text('metadata'), // JSON string with additional data (platform-specific, etc.)
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
});

// Performance Tracking table
export const performanceTracking = pgTable('performance_tracking', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  savedTopicId: integer('saved_topic_id').references(() => savedTopics.id, { onDelete: 'cascade' }),
  keyword: text('keyword').notNull(),
  position: integer('position').notNull(),
  url: text('url').notNull(),
  clicks: integer('clicks').default(0),
  impressions: integer('impressions').default(0),
  ctr: integer('ctr'), // Click-through rate (store as basis points, e.g., 2500 = 25%)
  device: text('device'), // desktop, mobile, tablet
  country: text('country'),
  date: text('date').notNull(), // YYYY-MM-DD format
  syncTimestamp: timestamp('sync_timestamp').notNull().defaultNow(),
});

// Competitor Monitoring table
export const competitorMonitoring = pgTable('competitor_monitoring', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  competitorUrl: text('competitor_url').notNull(),
  competitorDomain: text('competitor_domain').notNull(),
  isActive: boolean('is_active').default(true),
  lastCrawlDate: timestamp('last_crawl_date'),
  previousPageCount: integer('previous_page_count').default(0),
  currentPageCount: integer('current_page_count').default(0),
  newContentDetected: text('new_content_detected'), // JSON string array
  removedContentDetected: text('removed_content_detected'), // JSON string array
  keywordChanges: text('keyword_changes'), // JSON string with keyword ranking changes
  changeScore: integer('change_score').default(0), // Overall change score (0-100)
  alertsSent: integer('alerts_sent').default(0),
  // Enhanced analysis storage fields
  analysisData: text('analysis_data'), // JSON string with full CompetitorAnalysisResult
  contentGapAnalysis: text('content_gap_analysis'), // JSON string with ContentGapAnalysis
  performanceComparison: text('performance_comparison'), // JSON string with PerformanceComparison
  keywordOverlapAnalysis: text('keyword_overlap_analysis'), // JSON string with KeywordOverlapAnalysis
  recommendations: text('recommendations'), // JSON string array with recommendations
  lastAnalysisAt: timestamp('last_analysis_at'), // When full analysis was performed
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Google Search Console Connections table
export const gscConnections = pgTable('gsc_connections', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  siteUrl: text('site_url').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  tokenExpiry: timestamp('token_expiry').notNull(),
  isActive: boolean('is_active').default(true),
  syncFrequency: text('sync_frequency').default('daily'), // daily, weekly, manual
  lastSyncDate: timestamp('last_sync_date'),
  totalKeywordsTracked: integer('total_keywords_tracked').default(0),
  averagePosition: integer('average_position'), // Store as basis points (e.g., 1250 = 12.5)
  connectedAt: timestamp('connected_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Background Jobs tables
export const backgroundJobs = pgTable('background_jobs', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  type: text('type').notNull(), // 'website_crawl', 'performance_analysis', 'competitor_monitoring'
  status: text('status').notNull().default('queued'), // 'queued', 'running', 'completed', 'failed', 'cancelled'
  priority: integer('priority').default(5), // 1-10, lower number = higher priority
  progress: integer('progress').default(0), // 0-100 percentage
  currentStep: text('current_step'), // Current step description
  input: text('input'), // JSON string with job input parameters
  result: text('result'), // JSON string with job results
  error: text('error'), // Error message if failed
  metadata: text('metadata'), // JSON string with additional metadata
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  nextRetryAt: timestamp('next_retry_at'),
});

export const jobNotifications = pgTable('job_notifications', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  jobId: integer('job_id')
    .notNull()
    .references(() => backgroundJobs.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'job_completed', 'job_failed', 'job_started'
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  autoDismiss: boolean('auto_dismiss').default(true),
  dismissAt: timestamp('dismiss_at'),
  actionUrl: text('action_url'), // URL to redirect when clicked
  actionText: text('action_text'), // Button text for action
  createdAt: timestamp('created_at').notNull().defaultNow(),
  readAt: timestamp('read_at'),
});

// Content Calendars table
export const contentCalendars = pgTable('content_calendars', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  calendarData: text('calendar_data').notNull(), // JSON string with calendar data
  year: integer('year').notNull(),
  industryId: text('industry_id'),
  location: text('location'),
  targetAudience: text('target_audience'), // JSON string with audience data
  contentThemes: text('content_themes'), // JSON string array
  publishingFrequency: text('publishing_frequency').default('weekly'),
  status: text('status').default('active'), // active, paused, archived
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Citations table
export const citations = pgTable('citations', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull(),
  directory: text('directory').notNull(),
  url: text('url'),
  status: text('status').notNull().default('unclaimed'), // unclaimed, claimed, pending, error
  priority: text('priority').notNull().default('medium'), // high, medium, low
  businessInfo: text('business_info'), // JSON string with business NAP data
  notes: text('notes'),
  citationType: text('citation_type').default('local'), // local, industry, general
  domainAuthority: integer('domain_authority'), // 0-100
  citationConfidence: integer('citation_confidence').default(0), // 0-100
  lastCheckedAt: timestamp('last_checked_at'),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Business Profiles table
export const businessProfiles = pgTable('business_profiles', {
  id: serial('id').primaryKey(),
  supabaseUserId: text('supabase_user_id').notNull().unique(),
  businessName: text('business_name').notNull(),
  address: text('address'),
  phone: text('phone'),
  website: text('website'),
  description: text('description'),
  categories: text('categories'), // JSON string array
  geoLat: real('geo_lat'), // Latitude
  geoLng: real('geo_lng'), // Longitude
  serviceArea: text('service_area'), // JSON string with service area data
  businessHours: text('business_hours'), // JSON string with hours
  napConsistencyScore: integer('nap_consistency_score').default(0), // 0-100
  profileCompleteness: integer('profile_completeness').default(0), // 0-100
  verifiedStatus: text('verified_status').default('unverified'), // unverified, pending, verified
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  }));

// SEO table relations - no direct user relations since we use Supabase IDs
export const topicGenerationsRelations = relations(topicGenerations, ({ many }) => ({
  savedTopics: many(savedTopics),
}));

// Website analysis table relations
export const crawledPagesRelations = relations(crawledPages, ({ one }) => ({
  websiteAnalysis: one(websiteAnalyses, {
    fields: [crawledPages.websiteAnalysisId],
    references: [websiteAnalyses.id],
  }),
}));

export const contentGapsRelations = relations(contentGaps, ({ one }) => ({
  websiteAnalysis: one(websiteAnalyses, {
    fields: [contentGaps.websiteAnalysisId],
    references: [websiteAnalyses.id],
  }),
}));

export const competitorAnalysesRelations = relations(competitorAnalyses, ({ one }) => ({
    primaryWebsiteAnalysis: one(websiteAnalyses, {
    fields: [competitorAnalyses.primaryWebsiteAnalysisId],
    references: [websiteAnalyses.id],
  }),
}));

// Website analysis table relations
export const websiteAnalysesRelations = relations(websiteAnalyses, ({ many }) => ({
  crawledPages: many(crawledPages),
  contentGaps: many(contentGaps),
  primaryCompetitorAnalyses: many(competitorAnalyses),
}));


export const contentBriefsRelations = relations(contentBriefs, ({ one }) => ({
  savedTopic: one(savedTopics, {
    fields: [contentBriefs.savedTopicId],
    references: [savedTopics.id],
  }),
}));

export const performanceTrackingRelations = relations(performanceTracking, ({ one }) => ({
  savedTopic: one(savedTopics, {
    fields: [performanceTracking.savedTopicId],
    references: [savedTopics.id],
  }),
}));

// Generated Content relations
export const generatedContentRelations = relations(generatedContent, ({ one }) => ({
  savedTopic: one(savedTopics, {
    fields: [generatedContent.savedTopicId],
    references: [savedTopics.id],
  }),
}));

// Update existing relations to include new ones
export const savedTopicsRelations = relations(savedTopics, ({ one, many }) => ({
  sourceGeneration: one(topicGenerations, {
    fields: [savedTopics.sourceGenerationId],
    references: [topicGenerations.id],
  }),
  contentBriefs: many(contentBriefs),
  performanceTracking: many(performanceTracking),
  generatedContent: many(generatedContent),
}));

// Background job relations
export const backgroundJobsRelations = relations(backgroundJobs, ({ many }) => ({
  notifications: many(jobNotifications),
}));

export const jobNotificationsRelations = relations(jobNotifications, ({ one }) => ({
  job: one(backgroundJobs, {
    fields: [jobNotifications.jobId],
    references: [backgroundJobs.id],
  }),
}));

// Content Calendar relations
export const contentCalendarsRelations = relations(contentCalendars, ({ many }) => ({
  // No direct relations yet - can be extended later
}));

// Citations relations
export const citationsRelations = relations(citations, ({ one }) => ({
  // No direct relations yet - can be extended later
}));

// Business Profile relations
export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
  // No direct relations yet - can be extended later
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TopicGeneration = typeof topicGenerations.$inferSelect;
export type NewTopicGeneration = typeof topicGenerations.$inferInsert;
export type SavedTopic = typeof savedTopics.$inferSelect;
export type NewSavedTopic = typeof savedTopics.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type NewUsageTracking = typeof usageTracking.$inferInsert;
export type WebsiteAnalysis = typeof websiteAnalyses.$inferSelect;
export type NewWebsiteAnalysis = typeof websiteAnalyses.$inferInsert;
export type CrawledPage = typeof crawledPages.$inferSelect;
export type NewCrawledPage = typeof crawledPages.$inferInsert;
export type ContentGap = typeof contentGaps.$inferSelect;
export type NewContentGap = typeof contentGaps.$inferInsert;
export type CompetitorAnalysis = typeof competitorAnalyses.$inferSelect;
export type NewCompetitorAnalysis = typeof competitorAnalyses.$inferInsert;

export type ContentBrief = typeof contentBriefs.$inferSelect;
export type NewContentBrief = typeof contentBriefs.$inferInsert;
export type PerformanceTracking = typeof performanceTracking.$inferSelect;
export type NewPerformanceTracking = typeof performanceTracking.$inferInsert;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type NewGeneratedContent = typeof generatedContent.$inferInsert;
export type CompetitorMonitoring = typeof competitorMonitoring.$inferSelect;
export type NewCompetitorMonitoring = typeof competitorMonitoring.$inferInsert;
export type GscConnection = typeof gscConnections.$inferSelect;
export type NewGscConnection = typeof gscConnections.$inferInsert;
export type BackgroundJob = typeof backgroundJobs.$inferSelect;
export type NewBackgroundJob = typeof backgroundJobs.$inferInsert;
export type JobNotification = typeof jobNotifications.$inferSelect;
export type NewJobNotification = typeof jobNotifications.$inferInsert;

// New table types for enhanced SEO features
export type ContentCalendar = typeof contentCalendars.$inferSelect;
export type NewContentCalendar = typeof contentCalendars.$inferInsert;
export type Citation = typeof citations.$inferSelect;
export type NewCitation = typeof citations.$inferInsert;
export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type NewBusinessProfile = typeof businessProfiles.$inferInsert;

export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
