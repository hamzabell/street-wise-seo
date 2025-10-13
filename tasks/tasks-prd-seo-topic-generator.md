# Task List: SEO Topic Generator with Website Content Analysis

## Relevant Files

- `lib/db/schema.ts` - Extended database schema for SEO topics, website analysis, usage tracking, and subscription management
- `lib/db/schema.test.ts` - Unit tests for database schema
- `lib/db/queries.ts` - Database queries for topic generation, website analysis, user management, and usage tracking
- `lib/db/queries.test.ts` - Unit tests for database queries
- `lib/seo/lemonfox-client.ts` - API client for Lemonfox.ai integration
- `lib/seo/lemonfox-client.test.ts` - Unit tests for Lemonfox.ai client
- `lib/seo/topic-generator.ts` - Core topic generation logic with website analysis integration
- `lib/seo/topic-generator.test.ts` - Unit tests for topic generation
- `lib/seo/website-crawler.ts` - Website crawler service for content analysis
- `lib/seo/website-crawler.test.ts` - Unit tests for website crawler
- `lib/seo/content-analyzer.ts` - Content analysis utilities for gap analysis and insights
- `lib/seo/content-analyzer.test.ts` - Unit tests for content analyzer
- `lib/seo/utils.ts` - Utility functions for SEO analysis and data processing
- `lib/seo/utils.test.ts` - Unit tests for SEO utilities
- `app/(dashboard)/dashboard/seo-generator/page.tsx` - Main SEO topic generator page with website analysis
- `app/(dashboard)/dashboard/seo-generator/generator-form.tsx` - Enhanced topic generation form with website URL input
- `app/(dashboard)/dashboard/seo-generator/results-display.tsx` - Results display with content gap analysis and insights
- `app/(dashboard)/dashboard/seo-generator/usage-tracker.tsx` - Usage tracking component
- `app/api/seo/generate/route.ts` - API route for topic generation with website analysis
- `app/api/seo/analyze/route.ts` - API route for website content analysis
- `app/api/seo/crawl/route.ts` - API route for website crawling
- `app/api/seo/usage/route.ts` - API route for usage tracking
- `app/api/auth/session/route.ts` - Enhanced session management for SEO tool
- `components/ui/form.tsx` - Form components for topic generation
- `components/ui/loading.tsx` - Loading states for AI processing
- `components/ui/topic-card.tsx` - Topic display cards with website insights
- `components/ui/metrics-badge.tsx` - Search volume and difficulty badges
- `components/ui/website-analysis-card.tsx` - Website analysis results display
- `app/page.tsx` - Updated landing page focusing on website content analysis value proposition
- `app/(dashboard)/pricing/page.tsx` - Updated pricing page for $5/month plan with website analysis features
- `lib/db/setup.ts` - Database setup adapted for SQLite
- `.env.example` - Updated environment variables for Lemonfox.ai API and website crawling
- `types/seo.ts` - TypeScript types for SEO topic generation and website analysis

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- The existing codebase uses PostgreSQL, but PRD specifies SQLite - migration needed.
- Existing Stripe integration can be extended for the $5/month subscription model.
- Leverage existing authentication and session management patterns.

## Tasks

- [ ] **1.0 Database Schema & Infrastructure Setup**
  - [ ] 1.1 Migrate from PostgreSQL to SQLite in database configuration
  - [ ] 1.2 Add SEO-specific tables to schema (topic_generations, saved_topics, usage_tracking)
  - [ ] 1.3 Add website analysis tables (website_analyses, crawled_pages, content_gaps, competitor_analysis)
  - [ ] 1.4 Update user schema to include subscription_type and seo_usage fields
  - [ ] 1.5 Create TypeScript types for SEO topic generation and website analysis
  - [ ] 1.6 Update database connection and Drizzle configuration for SQLite
  - [ ] 1.7 Create database migration files for new schema
  - [ ] 1.8 Set up environment variables for Lemonfox.ai API key and crawling configuration

- [ ] **2.0 User Authentication & Subscription Management**
  - [ ] 2.1 Extend existing user registration to include subscription tracking
  - [ ] 2.2 Create subscription management server actions
  - [ ] 2.3 Implement usage tracking middleware for free/paid limits
  - [ ] 2.4 Create subscription status indicators in UI
  - [ ] 2.5 Add subscription upgrade prompts and messaging
  - [ ] 2.6 Create user dashboard with SEO tool access and usage display

- [ ] **3.0 Website Analysis & Content Crawling**
  - [ ] 3.1 Install website crawling dependencies (cheerio, puppeteer)
  - [ ] 3.2 Create website crawler service with robots.txt checking and error handling
  - [ ] 3.3 Implement content extraction (titles, meta descriptions, headings, keywords)
  - [ ] 3.4 Create content analyzer for topic extraction and gap analysis
  - [ ] 3.5 Add competitor analysis functionality
  - [ ] 3.6 Implement caching for crawled content to avoid re-crawling
  - [ ] 3.7 Add rate limiting and respectful crawling practices

- [ ] **4.0 Enhanced Topic Generation Form & Input Validation**
  - [ ] 4.1 Update business input form with website URL validation
  - [ ] 4.2 Add website URL input field with real-time validation
  - [ ] 4.3 Add competitor URL input (optional)
  - [ ] 4.4 Implement crawling progress indicators and loading states
  - [ ] 4.5 Add business type/category dropdown with common local business types
  - [ ] 4.6 Add location input with city/state validation
  - [ ] 4.7 Add optional business description textarea
  - [ ] 4.8 Implement real-time form validation and error handling
  - [ ] 4.9 Create form submission server actions with website analysis integration

- [ ] **5.0 Enhanced Lemonfox.ai API Integration & AI Processing**
  - [ ] 5.1 Create Lemonfox.ai API client with error handling
  - [ ] 5.2 Implement enhanced prompt engineering for personalized SEO topic generation using website analysis
  - [ ] 5.3 Create markdown parsing utilities for AI responses
  - [ ] 5.4 Implement search volume and difficulty estimation logic with website context
  - [ ] 5.5 Add content gap analysis integration in AI prompts
  - [ ] 5.6 Create caching layer for repeated requests
  - [ ] 5.7 Implement API rate limiting and cost optimization
  - [ ] 5.8 Add competitor comparison insights in topic generation

- [ ] **6.0 Enhanced Topic Results Display & User Interface**
  - [ ] 6.1 Create enhanced topic card component with website insights and metrics display
  - [ ] 6.2 Implement results grid layout with responsive design
  - [ ] 6.3 Add search volume and difficulty score badges with website context
  - [ ] 6.4 Create content gap analysis visualization components
  - [ ] 6.5 Add website analysis insights display (topics covered, missing opportunities)
  - [ ] 6.6 Create competitor comparison results display
  - [ ] 6.7 Create topic save functionality for users
  - [ ] 6.8 Implement topic filtering and sorting options with analysis filters
  - [ ] 6.9 Add loading states and progress indicators for website crawling
  - [ ] 6.10 Create empty state and error state components
  - [ ] 6.11 Add website analysis card component showing crawling results

- [ ] **7.0 Enhanced Usage Tracking & Freemium Limits**
  - [ ] 7.1 Create usage tracking database queries and actions for website analysis
  - [ ] 7.2 Implement monthly usage counter for free users (limited website analysis)
  - [ ] 7.3 Create usage limit enforcement middleware for crawling operations
  - [ ] 7.4 Build usage dashboard component for users with website analysis tracking
  - [ ] 7.5 Add upgrade prompts when limit is reached for website analysis features
  - [ ] 7.6 Create usage analytics for admin monitoring including crawling costs
  - [ ] 7.7 Implement usage reset logic for monthly cycles
  - [ ] 7.8 Add website analysis-specific usage limits and tracking

- [ ] **8.0 Enhanced Stripe Payment Integration for Website Analysis**
  - [ ] 8.1 Create $5/month subscription product in Stripe with website analysis features
  - [ ] 8.2 Extend existing Stripe integration for SEO tool billing
  - [ ] 8.3 Create subscription checkout flow highlighting website analysis benefits
  - [ ] 8.4 Implement subscription status webhooks for premium features
  - [ ] 8.5 Create customer portal for subscription management
  - [ ] 8.6 Add billing history and invoice access
  - [ ] 8.7 Create subscription cancellation and reactivation flow
  - [ ] 8.8 Add feature gates for website analysis functionality

- [ ] **9.0 Landing Page & Marketing Pages for Website Analysis**
  - [ ] 9.1 Update main landing page to focus on website content analysis value proposition
  - [ ] 9.2 Create compelling value propositions highlighting differentiation from ChatGPT
  - [ ] 9.3 Add messaging about personalized insights based on actual website analysis
  - [ ] 9.4 Highlight content gap analysis and competitor comparison features
  - [ ] 9.5 Update pricing page with clear freemium vs paid comparison for website analysis
  - [ ] 9.6 Create demo section showing website analysis and personalized topic generation
  - [ ] 9.7 Add testimonials section focusing on website analysis benefits
  - [ ] 9.8 Create FAQ section addressing website analysis and SEO concerns
  - [ ] 9.9 Implement conversion tracking and analytics setup

- [ ] **10.0 Enhanced Testing & Quality Assurance**
  - [ ] 10.1 Write unit tests for all API endpoints including website analysis
  - [ ] 10.2 Create integration tests for Lemonfox.ai integration with website analysis
  - [ ] 10.3 Add tests for website crawler functionality and error handling
  - [ ] 10.4 Create tests for content analyzer and gap analysis
  - [ ] 10.5 Add component tests for enhanced form validation and UI interactions
  - [ ] 10.6 Implement E2E tests for complete website analysis user flow
  - [ ] 10.7 Add performance testing for website crawling and API response times
  - [ ] 10.8 Create error handling and edge case tests for crawling failures
  - [ ] 10.9 Add accessibility testing for UI components

- [ ] **11.0 Enhanced Deployment & Monitoring**
  - [ ] 11.1 Configure production environment variables for website crawling
  - [ ] 11.2 Set up monitoring for API costs and usage including crawling operations
  - [ ] 11.3 Create error tracking and alerting for website crawling failures
  - [ ] 11.4 Implement backup strategy for SQLite database with website analysis data
  - [ ] 11.5 Configure domain and SSL certificates
  - [ ] 11.6 Set up analytics for conversion tracking and feature usage
  - [ ] 11.7 Create deployment documentation and runbooks
  - [ ] 11.8 Add monitoring for crawling performance and rate limits

- [ ] **12.0 Shareable Audit Reports & Roadmaps**
  - [ ] 12.1 Define normalized summary models for crawl insights (content gaps, technical issues, keyword wins)
  - [ ] 12.2 Build server-side formatter that converts website/content analysis into audit summaries and prioritized roadmaps
  - [ ] 12.3 Integrate PDF/slide export service with branding, upgrade gating, and download throttling
  - [ ] 12.4 Add dashboard UI to preview audits, trigger exports, and copy secure share links
  - [ ] 12.5 Capture export metrics (owner, domain, timestamp) for usage analytics and billing

- [ ] **13.0 AI Content Brief Generator**
  - [ ] 13.1 Extend topic generation pipeline to request structured briefs (outline, talking points, CTAs, internal links)
  - [ ] 13.2 Persist generated briefs with relational links to topics and website analyses
  - [ ] 13.3 Design brief detail view with editing, tag management, and "mark as drafted" workflow
  - [ ] 13.4 Add batch export (Markdown/Google Docs) and email delivery for briefs
  - [ ] 13.5 Update usage limits/pricing to reflect brief generation costs and upgrade triggers

- [ ] **14.0 Performance Feedback & Search Console Integration**
  - [ ] 14.1 Create OAuth + ingestion pipeline for Google Search Console metrics (query, clicks, impressions)
  - [ ] 14.2 Extend schema to store per-topic and per-page performance snapshots
  - [ ] 14.3 Surface feedback dashboards that map generated topics to observed ranking trends
  - [ ] 14.4 Implement re-crawl/re-brief recommendations when performance drops or plateaus
  - [ ] 14.5 Add alerting preferences and notification digests summarizing gains and issues

- [ ] **15.0 Multi-Location & Competitor Monitoring**
  - [ ] 15.1 Model campaigns that bundle locations, priority keywords, and competitor URLs
  - [ ] 15.2 Schedule rolling crawls and diff detection for competitor/content changes per campaign
  - [ ] 15.3 Build comparative reporting UI (location heatmaps, competitor change logs, keyword share)
  - [ ] 15.4 Enable automated topic refreshes when new competitor content appears
  - [ ] 15.5 Provide campaign-level exports and team sharing permissions
