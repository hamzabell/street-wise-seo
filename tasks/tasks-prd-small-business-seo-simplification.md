## Relevant Files

- `app/(dashboard)/dashboard/seo-generator/page.tsx` - Main SEO generator page that needs simplification to single-page design
- `app/(dashboard)/dashboard/layout.tsx` - Dashboard navigation that needs to remove complex features like competitors, performance tracking
- `app/(dashboard)/dashboard/page.tsx` - Dashboard homepage that needs to focus on simplified value proposition
- `app/page.tsx` - Landing page that needs complete redesign for small business focus
- `lib/seo/lemonfox-client.ts` - AI client that needs industry template integration for topic generation
- `lib/seo/topic-generator.ts` - Topic generation logic that needs mobile-first optimization and template support
- `app/(dashboard)/dashboard/seo-generator/generator-form.tsx` - Form component that needs industry template dropdown
- `app/(dashboard)/dashboard/seo-generator/results-display.tsx` - Results component that needs simplification and clipboard functionality
- `app/(dashboard)/dashboard/reports/page.tsx` - Reports page that will be removed/simplified
- `app/(dashboard)/dashboard/competitors/page.tsx` - Competitors page that will be removed
- `app/(dashboard)/dashboard/performance/page.tsx` - Performance page that will be removed
- `lib/db/schema.ts` - Database schema that may need updates for industry templates
- `lib/db/queries.ts` - Database queries that may need updates for simplified features

### Notes

- Unit tests should be placed alongside the code files they are testing (e.g., `page.tsx` and `page.test.tsx` in the same directory)
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Remove Complex Agency Features
  - [ ] 1.1 Remove competitor monitoring navigation and routes from dashboard layout
  - [ ] 1.2 Remove performance tracking navigation and routes from dashboard layout
  - [ ] 1.3 Remove reports page navigation and routes from dashboard layout
  - [ ] 1.4 Delete unused page components: competitors, performance, and reports pages
  - [ ] 1.5 Remove team management and activity tracking features
  - [ ] 1.6 Clean up unused database queries and API endpoints for removed features

- [ ] 2.0 Simplify UI to Single-Page Design
  - [ ] 2.1 Refactor SEO generator page to remove tab navigation and implement single-page flow
  - [ ] 2.2 Simplify generator form to focus on essential inputs (topic, business type, location)
  - [ ] 2.3 Hide advanced options (website URL, competitor analysis) behind collapsible "Advanced Settings" toggle
  - [ ] 2.4 Update dashboard homepage to focus on core value proposition and simple navigation
  - [ ] 2.5 Simplify navigation to only show: Home, SEO Generator, and Settings
  - [ ] 2.6 Remove complex metrics and analytics from dashboard, focus on usage stats

- [ ] 3.0 Implement Industry Template System
  - [ ] 3.1 Create industry template configuration with 10 service business categories
  - [ ] 3.2 Update generator form to include industry template dropdown selection
  - [ ] 3.3 Modify Lemonfox AI client to use industry-specific prompts based on selected template
  - [ ] 3.4 Implement seasonal content suggestions logic based on industry and current month
  - [ ] 3.5 Add local service page topic generation (e.g., "emergency plumber in [city]")
  - [ ] 3.6 Update topic generation to prioritize industry-relevant content ideas

- [ ] 4.0 Add Mobile-First Content Optimization
  - [ ] 4.1 Enhance topic generation to create voice-search-friendly variations
  - [ ] 4.2 Implement mobile content length recommendations for generated topics
  - [ ] 4.3 Add local intent detection and tagging for topics using existing AI analysis
  - [ ] 4.4 Prioritize action-oriented topics that lead to immediate customer actions
  - [ ] 4.5 Update topic display to show mobile optimization indicators

- [ ] 5.0 Update Landing Page for Small Business Focus
  - [ ] 5.1 Redesign hero section with headline "Generate content ideas customers actually search for"
  - [ ] 5.2 Update features section to focus on service business benefits (not agency features)
  - [ ] 5.3 Add service business imagery and testimonials from local business owners
  - [ ] 5.4 Simplify pricing section to emphasize $5/month affordability for small businesses
  - [ ] 5.5 Update copy to speak directly to small business owners, not marketing teams
  - [ ] 5.6 Remove complex feature descriptions, focus on simple value propositions

- [ ] 6.0 Simplify Results Display and Export
  - [ ] 6.1 Redesign topic cards to show: title, brief description, search intent indicator, save button
  - [ ] 6.2 Add one-click clipboard copy functionality for individual topics
  - [ ] 6.3 Implement copy all topics to clipboard functionality
  - [ ] 6.4 Remove complex PDF generation, replace with simple text export
  - [ ] 6.5 Simplify save functionality with heart/bookmark icon without complex management
  - [ ] 6.6 Remove advanced SEO metrics display, focus on essential information