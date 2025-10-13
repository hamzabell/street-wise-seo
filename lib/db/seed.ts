import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { eq } from 'drizzle-orm';
import {
  users,
  teams,
  teamMembers,
  contentCalendars,
  citations,
  businessProfiles,
  competitorAnalyses,
  websiteAnalyses,
  savedTopics,
  topicGenerations,
  usageTracking
} from './schema';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  const email = 'test@test.com';
  // In Supabase migration, users are created through Supabase auth
  // This seed now creates a test user with a placeholder Supabase ID
  // In production, this user would be created when they sign up through Supabase

  // Check if user already exists
  let user;
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length === 0) {
    [user] = await db
      .insert(users)
      .values([
        {
          email: email,
          supabaseId: 'test-user-placeholder-id',
          name: 'Test User',
          role: "owner",
        },
      ])
      .returning();
    console.log('Initial user created.');
  } else {
    user = existingUser[0];
    console.log('Using existing user.');
  }

  // Check if team already exists
  let team;
  const existingTeam = await db
    .select()
    .from(teams)
    .where(eq(teams.name, 'Test Team'))
    .limit(1);

  if (existingTeam.length === 0) {
    [team] = await db
      .insert(teams)
      .values({
        name: 'Test Team',
      })
      .returning();

    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: 'owner',
    });
  } else {
    team = existingTeam[0];
  }

  // Create seed data for new SEO features (only if topic generation doesn't exist)
  const existingTopicGeneration = await db
    .select()
    .from(topicGenerations)
    .where(eq(topicGenerations.supabaseUserId, user.supabaseId))
    .limit(1);

  if (existingTopicGeneration.length === 0) {
    await createSeedData(user.id, user.supabaseId, team.id);
  } else {
    console.log('Seed data already exists for user.');
  }

  await createStripeProducts();
}

async function createSeedData(userId: number, supabaseUserId: string, teamId: number) {
  console.log('Creating seed data for new SEO features...');

  // Create sample topic generation and saved topics
  const [topicGeneration] = await db
    .insert(topicGenerations)
    .values({
      supabaseUserId: supabaseUserId,
      inputTopic: 'digital marketing strategies',
      generatedTopics: JSON.stringify([
        'Local SEO Strategies for Small Businesses',
        'Content Marketing Tips for Startups',
        'Social Media Marketing Best Practices',
        'Email Marketing Campaign Ideas',
        'Video Marketing for Business Growth'
      ]),
      metadata: JSON.stringify({
        businessType: 'marketing agency',
        targetAudience: 'small business owners',
        location: 'Springfield, IL',
        tone: 'professional',
        difficulty: 'medium'
      }),
    })
    .returning();

  // Create sample saved topics
  const sampleTopics = [
    {
      supabaseUserId: supabaseUserId,
      topic: 'Local SEO Strategies for Small Businesses',
      description: 'Comprehensive guide to improving local search rankings and attracting more local customers',
      tags: JSON.stringify(['local seo', 'small business', 'search optimization']),
      difficulty: 'medium',
      searchVolume: 1200,
      competitionLevel: 'medium',
      sourceGenerationId: topicGeneration.id,
      businessType: 'marketing agency',
      targetAudience: 'small business owners',
      location: 'Springfield, IL',
      tone: 'professional',
      additionalContext: 'Focus on practical, actionable tips that businesses can implement immediately',
      websiteUrl: 'https://example-business.com',
      savedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      supabaseUserId: supabaseUserId,
      topic: 'Content Marketing Tips for Startups',
      description: 'Essential content marketing strategies specifically designed for startup companies with limited budgets',
      tags: JSON.stringify(['content marketing', 'startups', 'budget marketing']),
      difficulty: 'easy',
      searchVolume: 800,
      competitionLevel: 'high',
      sourceGenerationId: topicGeneration.id,
      businessType: 'marketing agency',
      targetAudience: 'startup founders',
      location: 'Springfield, IL',
      tone: 'casual',
      additionalContext: 'Emphasize cost-effective strategies and quick wins',
      websiteUrl: 'https://example-business.com',
      savedAt: new Date(),
      updatedAt: new Date(),
    },
    {
      supabaseUserId: supabaseUserId,
      topic: 'Social Media Marketing Best Practices',
      description: 'Latest trends and proven strategies for effective social media marketing across multiple platforms',
      tags: JSON.stringify(['social media', 'digital marketing', 'engagement']),
      difficulty: 'medium',
      searchVolume: 2000,
      competitionLevel: 'high',
      sourceGenerationId: topicGeneration.id,
      businessType: 'marketing agency',
      targetAudience: 'business owners',
      location: 'Springfield, IL',
      tone: 'professional',
      additionalContext: 'Include platform-specific strategies for Facebook, Instagram, LinkedIn, and Twitter',
      websiteUrl: 'https://example-business.com',
      savedAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  for (const topic of sampleTopics) {
    await db.insert(savedTopics).values(topic);
  }

  // Create sample usage tracking data
  const usageData = [
    { supabaseUserId, action: 'generate_topic' },
    { supabaseUserId, action: 'save_topic' },
    { supabaseUserId, action: 'save_topic' },
    { supabaseUserId, action: 'save_topic' },
  ];

  for (const usage of usageData) {
    await db.insert(usageTracking).values({
      ...usage,
      createdAt: new Date()
    });
  }

  console.log('Seed data created successfully:');
  console.log(`- Topic Generation: ${topicGeneration.inputTopic}`);
  console.log(`- Saved Topics: ${sampleTopics.length} entries`);
  console.log(`- Usage Tracking: ${usageData.length} entries`);
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
