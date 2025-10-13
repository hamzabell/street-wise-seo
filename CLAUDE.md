# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:setup` - Create .env file from template
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed database with test data (creates test@test.com / admin123)
- `pnpm db:generate` - Generate Drizzle migration files
- `pnpm db:studio` - Open Drizzle Studio for database management

For Stripe webhook testing locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Architecture Overview

This is a Next.js SaaS starter with authentication, team management, and Stripe payments.

### Database Schema & ORM
- **Database**: PostgreSQL with Drizzle ORM
- **Schema location**: `lib/db/schema.ts`
- **Key tables**: `users`, `teams`, `team_members`, `activity_logs`, `invitations`
- **Relations**: Full relational mapping between users, teams, and activity tracking
- **Queries**: Centralized in `lib/db/queries.ts`

### Authentication & Session Management
- **Auth system**: JWT-based with HTTP-only cookies
- **Session handling**: `lib/auth/session.ts` - token signing, verification, password hashing
- **Middleware**: Global middleware in `middleware.ts` protects `/dashboard/*` routes
- **Session duration**: 24 hours with automatic refresh on GET requests

### Application Structure
```
app/
├── (dashboard)/     # Protected dashboard routes with layout
│   ├── dashboard/   # Main dashboard pages
│   ├── pricing/     # Team pricing and billing
│   └── layout.tsx   # Dashboard layout with navigation
├── (login)/         # Public auth routes
├── api/             # API routes for auth, stripe, users
└── globals.css      # Global styles and Tailwind

lib/
├── auth/            # Authentication utilities
├── db/              # Database schema, queries, migrations
├── payments/        # Stripe integration
└── utils.ts         # Shared utilities
```

### UI Framework
- **Styling**: Tailwind CSS v4 with PostCSS
- **Components**: shadcn/ui components in `components/ui/`
- **Icons**: Lucide React
- **Font**: Manrope from Google Fonts

### State Management
- **SWR**: Used for client-side data fetching with fallback in root layout
- **Server Actions**: For mutations and form handling
- **Zod**: Schema validation for type safety

### Payment Integration
- **Provider**: Stripe with customer portal and checkout
- **Webhooks**: Handles subscription events at `/api/stripe/webhook`
- **Subscription management**: Team-based billing with plan tracking

### Team & Role System
- **Roles**: Owner/Member with RBAC permissions
- **Teams**: Multi-tenancy via team_members join table
- **Invitations**: Email-based team invitation system
- **Activity logging**: Comprehensive audit trail for all user actions

## Environment Setup

Copy `.env.example` to `.env` and configure:
- `POSTGRES_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `BASE_URL` - Application base URL (http://localhost:3000 for dev)
- `AUTH_SECRET` - Random secret for JWT signing (generate with `openssl rand -base64 32`)

## Key Implementation Details

### Server Actions Pattern
Most mutations use Server Actions with middleware for:
- Authentication checks via `getSession()`
- Zod schema validation
- Activity logging
- Error handling

### Route Protection
- Global middleware handles session refresh and protects dashboard routes
- Server-side checks in Server Actions for additional security
- Soft deletes implemented with `deletedAt` timestamps

### Database Seeding
Default test account created by seed script:
- Email: `test@test.com`
- Password: `admin123`

### Stripe Integration
- Teams linked to Stripe customers via `stripeCustomerId`
- Subscription status tracked in teams table
- Webhook handlers for subscription lifecycle events