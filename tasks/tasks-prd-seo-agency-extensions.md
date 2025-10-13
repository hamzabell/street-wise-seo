## Relevant Files

- `lib/db/schema.ts` - Contains existing SEO tables and will need new tables for reports, content briefs, performance tracking, and competitor monitoring
- `lib/db/queries.ts` - Database query functions that will need extensions for new tables
- `app/(dashboard)/dashboard/page.tsx` - Main dashboard that needs new sections for reports and tracking
- `app/(dashboard)/dashboard/seo-generator/page.tsx` - SEO generator page that needs content brief functionality
- `lib/seo/website-crawler.ts` - Existing crawler that will need extensions for competitor monitoring
- `lib/seo/topic-generator.ts` - Existing topic generation that will feed content briefs
- `app/api/seo/generate/route.ts` - API route that will need new endpoints for reports and briefs
- `components/ui/dialog.tsx` - Dialog component for report generation interfaces
- `components/ui/button.tsx` - Button component for new actions
- `package.json` - Will need dependencies for PDF generation and Google API integration

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 **Database Schema Extensions**
  - [ ] 1.1 Add PDF reports table with fields for report type, client name, generation data, and file path
  - [ ] 1.2 Add content briefs table with fields for topic ID, brief content, and generation metadata
  - [ ] 1.3 Add performance tracking table with fields for topic ID, keyword position, traffic data, and sync timestamp
  - [ ] 1.4 Add competitor monitoring table with fields for competitor URL, last crawl date, and change detection data
  - [ ] 1.5 Add Google Search Console connections table with OAuth tokens and sync preferences
  - [ ] 1.6 Update Drizzle relations for new tables and export new types

- [ ] 2.0 **PDF Report Generation System**
  - [ ] 2.1 Install and configure Puppeteer for server-side PDF generation
  - [ ] 2.2 Create HTML template for professional audit reports with sections for executive summary, technical issues, and content gaps
  - [ ] 2.3 Build server action to compile crawl analysis data into report format
  - [ ] 2.4 Implement PDF generation API endpoint that accepts website analysis ID and client name
  - [ ] 2.5 Create file storage system for generated PDFs with download functionality
  - [ ] 2.6 Add loading states and error handling for report generation process
  - [ ] 2.7 Build UI component for report generation from website analysis results

- [ ] 3.0 **AI Content Brief Generator**
  - [ ] 3.1 Create content brief generation logic using existing topic data and crawl insights
  - [ ] 3.2 Build prompt engineering for H1/H2 structure generation with keyword integration
  - [ ] 3.3 Implement internal linking suggestion algorithm based on crawled website data
  - [ ] 3.4 Create API endpoint for content brief generation using saved topic ID
  - [ ] 3.5 Build UI component for brief generation with copy-to-clipboard functionality
  - [ ] 3.6 Add brief generation interface to saved topics management section
  - [ ] 3.7 Implement word count estimation and basic content structure recommendations

- [ ] 4.0 **Google Search Console Integration**
  - [ ] 4.1 Install and configure Google APIs client library for OAuth 2.0 flow
  - [ ] 4.2 Create OAuth connection flow with redirect handling and token storage
  - [ ] 4.3 Build API endpoints for connecting and disconnecting Google Search Console accounts
  - [ ] 4.4 Implement manual sync functionality for importing keyword ranking data
  - [ ] 4.5 Create data processing logic to correlate rankings with tracked topics
  - [ ] 4.6 Build UI components for Google account connection and data sync
  - [ ] 4.7 Add performance tracking interface showing ranking changes over time
  - [ ] 4.8 Implement basic alert system for ranking position drops

- [ ] 5.0 **Basic Competitor Monitoring**
  - [ ] 5.1 Extend website crawler to handle competitor URL analysis
  - [ ] 5.2 Create competitor comparison logic for content gap identification
  - [ ] 5.3 Build weekly cron job for automated competitor crawling
  - [ ] 5.4 Implement change detection algorithm for new competitor content
  - [ ] 5.5 Create API endpoints for competitor setup and monitoring data retrieval
  - [ ] 5.6 Build UI interface for selecting and monitoring single competitor
  - [ ] 5.7 Add competitor analysis dashboard with new content alerts
  - [ ] 5.8 Implement on-demand manual competitor crawling functionality

- [ ] 6.0 **Dashboard UI Extensions**
  - [ ] 6.1 Add new "Reports" section to main dashboard navigation
  - [ ] 6.2 Create reports management interface showing generated PDFs and download options
  - [ ] 6.3 Add "Performance" section to dashboard with Google Search Console data
  - [ ] 6.4 Build performance tracking charts showing ranking trends for tracked topics
  - [ ] 6.5 Create "Competitors" section with monitoring dashboard
  - [ ] 6.6 Integrate content brief generation into existing saved topics interface
  - [ ] 6.7 Add quick action buttons for report generation from website analysis results
  - [ ] 6.8 Update dashboard stats cards to include reports generated and competitors tracked