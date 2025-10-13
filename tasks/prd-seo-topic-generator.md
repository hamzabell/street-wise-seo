# PRD: SEO Topic Generator for Local Businesses

## Introduction/Overview

A simple but powerful SEO topic generator specifically designed for local business owners who have never used complex SEO tools like Ahrefs. The tool will generate high-quality, actionable SEO content ideas through one-click analysis of live keyword gaps, helping local businesses improve their online visibility with minimal technical knowledge.

## Goals

1. **Launch Quickly**: Build a minimum viable product that can be launched within 2-3 weeks
2. **User-Friendly**: Create an intuitive interface that requires no SEO knowledge
3. **High Value**: Generate genuinely useful, local-specific content ideas that businesses can implement immediately
4. **Monetization**: Implement a freemium model with a clear upgrade path to $5/month paid plan
5. **Technical Excellence**: Use functional programming patterns with shadcn/ui and Tailwind CSS
6. **Services Differentiation**: Deliver packaged insights (audits, briefs, monitoring) that agencies can share with clients without extra tooling

## User Stories

### Primary User Stories
- **As a** local bakery owner, **I want to** enter my business details and get instant SEO topic ideas, **so that** I can create content that attracts more local customers
- **As a** small business owner, **I want to** see keyword gaps my competitors are targeting, **so that** I can stay competitive in my local market
- **As a** user with limited SEO knowledge, **I want to** receive topic ideas with simple explanations, **so that** I can understand why each topic matters for my business

### Secondary User Stories
- **As a** free user, **I want to** test the tool with 5 topic generations per month, **so that** I can see the value before upgrading
- **As a** paid user, **I want to** generate unlimited SEO topics, **so that** I can consistently create content for my business
- **As a** user, **I want to** save my favorite topic ideas, **so that** I can reference them later when creating content
- **As an** agency account manager, **I want to** export a branded audit from the crawl results, **so that** I have a deliverable for client meetings without manual formatting
- **As a** content writer, **I want to** open a full brief for each topic, **so that** I can move straight into drafting without additional research
- **As a** marketing lead, **I want to** see when generated topics affect search performance, **so that** I can double down on what works and rerun analysis when it drops
- **As a** franchise operator, **I want to** monitor multiple locations and their competitors, **so that** I can keep messaging and content aligned across markets

## Functional Requirements

### Core Features
1. **User Input Form**
   - The system must allow users to input:
     - Business website URL
     - Business type/category (dropdown selection)
     - Business location (city/state)
     - Optional business description (text area)
   - Form validation must ensure all required fields are completed
   - Real-time validation feedback for URL format

2. **AI-Powered Topic Generation**
   - The system must integrate with lemonfox.ai API for content generation
   - Must parse markdown responses from lemonfox.ai and display them appropriately
   - Generate 8-10 high-quality SEO topic suggestions per request
   - Include search volume estimates and difficulty scores where possible
   - Provide content brief outlines for each topic

3. **Competitor Analysis Integration**
   - The system must analyze competitor websites provided by users
   - Identify keyword gaps between user's site and competitors
   - Use Google Search API for trending local search terms
   - Combine multiple data sources for comprehensive analysis

4. **User Management**
   - User registration and authentication system
   - Usage tracking for free vs paid plans
   - Subscription management for $5/month paid plan
   - User profile management

5. **Usage Limits & Monetization**
   - Free users limited to 5 topic generations per month
   - Paid users have unlimited topic generations
   - Usage counter visible in user dashboard
   - Upgrade prompts when limit is reached

6. **Result Display**
   - Topic ideas displayed in clean, organized cards
   - Include metrics like estimated search volume and difficulty
   - One-click "Save Topic" functionality
   - Export topics to CSV/JSON for paid users

### Technical Requirements
7. **Database Schema (SQLite)**
   - Users table: id, email, password, subscription_type, created_at
   - TopicGenerations table: id, user_id, business_data, topics_generated, created_at
   - SavedTopics table: id, user_id, topic_data, created_at
   - UsageTracking table: id, user_id, month, generation_count

8. **API Integration**
   - Lemonfox.ai API integration with proper error handling
   - Google Search API for local trending keywords
   - Web scraping capabilities for competitor analysis
   - Rate limiting and API key management

9. **Frontend Requirements**
   - Responsive design using Tailwind CSS
   - shadcn/ui components for consistent UI
   - Real-time form validation
   - Loading states and error handling
   - Mobile-first design approach

10. **Shareable Audit Reports & Roadmaps**
   - Provide a server-rendered audit summary that packages crawl findings (content gaps, technical issues, keyword opportunities) with prioritization and effort estimates
   - Support branded PDF/slide exports and secure share links gated to paid plans
   - Track export usage for billing, rate limiting, and customer success insights
   - *Why*: Agencies and consultants need a tangible artifact; packaging insights increases perceived value and drives upgrades

11. **AI Content Brief Generator**
   - Extend topic generation to include outlines, talking points, recommended CTAs, and internal link suggestions informed by crawl data
   - Persist briefs alongside topics with status tracking (drafted, published, needs update)
   - Offer exports (Markdown, Google Docs) and email delivery for collaboration
   - *Why*: Moving from ideas to execution removes another tool from the stack and increases daily active use

12. **Performance Feedback Loop**
   - Integrate Google Search Console (or CSV import) to map generated topics to actual clicks, impressions, and positions
   - Detect drops and wins, triggering re-crawl or re-brief suggestions
   - Provide alert preferences and dashboards summarizing recent performance changes
   - *Why*: Closing the loop proves impact, improves retention, and surfaces upsell moments when value is demonstrated

13. **Multi-Location & Competitor Monitoring**
   - Allow users to group locations, keywords, and competitors into campaigns with scheduled crawls
   - Highlight differences between locations, track competitor content changes, and refresh topics automatically when new gaps appear
   - Share campaign reports with stakeholders and manage permissions
   - *Why*: Multi-location businesses and agencies need scalable governance; continuous monitoring deepens lock-in

## Non-Goals (Out of Scope)

### Version 1.0 Exclusions
- Advanced keyword research tools
- SERP analysis features
- Content performance tracking
- Team collaboration features
- Advanced reporting dashboards
- Social media integration
- Bulk topic generation
- API access for third-party integrations

## Design Considerations

### UI/UX Requirements
- Clean, minimal interface focused on conversion
- Single-page application flow for topic generation
- Progress indicators for AI processing
- Clear pricing messaging and upgrade prompts
- Professional yet approachable design for small business owners

### Key Components
- Input form with validation states
- Results display cards with metrics
- Usage dashboard with subscription status
- Pricing/billing interface
- Navigation and header components

## Technical Considerations

### Architecture
- Next.js 14 with App Router
- SQLite database with Drizzle ORM
- Functional programming patterns throughout
- Server actions for form processing
- Client components for interactive UI elements

### Key Dependencies
- lemonfox.ai for AI content generation
- shadcn/ui component library
- Tailwind CSS for styling
- Stripe for payment processing
- NextAuth.js for authentication

### Performance
- Implement caching for repeated requests
- Optimize API calls to reduce costs
- Use server-side rendering for better SEO
- Lazy loading for non-critical components

## Success Metrics

### Business Metrics
- 100+ free user signups in first month
- 15-20% conversion rate from free to paid
- Average of 3+ topic generations per active user
- 90%+ user satisfaction rate (via feedback)

### Technical Metrics
- < 3 second average response time for topic generation
- 99%+ uptime for the service
- < 5% error rate for AI API calls
- Mobile usability score of 85+

## Open Questions

1. **API Rate Limits**: What are the rate limits for lemonfox.ai, and how should we handle throttling?
2. **Data Privacy**: How should we handle competitor data collection and storage?
3. **Content Quality**: What criteria should we use to measure the quality of generated topics?
4. **Local SEO Focus**: Should we prioritize certain types of local businesses over others in the initial launch?
5. **Competitor Analysis Depth**: How many competitor sites should we analyze per request to balance quality with performance?

## Implementation Priority

### Phase 1 (MVP - 2-3 weeks)
1. User authentication and basic profiles
2. Topic generation form with business inputs
3. Lemonfox.ai integration for topic generation
4. Basic result display with markdown parsing
5. Free plan usage limits (5 generations/month)
6. Stripe integration for $5/month subscriptions

### Phase 2 (Post-launch)
1. Competitor analysis features
2. Saved topics functionality
3. Advanced result filtering and sorting
4. Export functionality for paid users
5. User dashboard with usage analytics

### Phase 3 (Differentiators & Retention)
1. Shareable audit report exports with branded templates
2. AI content brief generation workflow
3. Search Console feedback dashboards and alerting
4. Multi-location and competitor monitoring campaigns

---

**Target Audience**: Junior developers familiar with Next.js, React, and modern web development patterns. All technical requirements should be implemented using functional programming principles where possible, with clean separation of concerns and maintainable code structure.
