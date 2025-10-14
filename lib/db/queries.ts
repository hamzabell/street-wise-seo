import { desc, and, eq, isNull, gte, lte, count, like, or, sum, avg } from 'drizzle-orm';
import { db } from './drizzle';
import {
  activityLogs,
  teamMembers,
  teams,
  users,
  topicGenerations,
  savedTopics,
  usageTracking,
  websiteAnalyses,
  crawledPages,
  contentGaps,
  competitorAnalyses,
  contentBriefs,
  performanceTracking,
  generatedContent,
  competitorMonitoring,
  gscConnections,
  backgroundJobs,
  jobNotifications,
  contentCalendars,
  citations,
  businessProfiles
} from './schema';
import { createClient } from '@/lib/supabase/server';

export async function getUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Don't log error for missing session - this is normal during initial load
      if (error && !error.message.includes('Auth session missing')) {
        console.error('Error getting Supabase user:', error);
      }
      return null;
    }

    return user;
  } catch (error) {
    // Handle any other errors gracefully
    console.error('Unexpected error in getUser:', error);
    return null;
  }
}

// Get the local database user record that matches the Supabase user
export async function getLocalUser() {
  const supabaseUser = await getUser();
  if (!supabaseUser) {
    return null;
  }

  const [localUser] = await db
    .select()
    .from(users)
    .where(eq(users.supabaseId, supabaseUser.id))
    .limit(1);

  return localUser || null;
}

// Helper function to get Supabase user ID for API routes
export async function getSupabaseUserId() {
  const user = await getUser();
  return user?.id || null;
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

// Primary Website URL management functions
export async function getUserPrimaryWebsiteUrl(supabaseUserId: string): Promise<string | null> {
  const [user] = await db
    .select({ primaryWebsiteUrl: users.primaryWebsiteUrl })
    .from(users)
    .where(eq(users.supabaseId, supabaseUserId))
    .limit(1);

  return user?.primaryWebsiteUrl || null;
}

// Business Information Storage for Schema Generation
export async function updateUserBusinessInfo(supabaseUserId: string, businessInfo: {
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessDescription?: string;
  businessCategories?: string[];
  businessCity?: string;
  businessState?: string;
  businessZipCode?: string;
  businessCountry?: string;
  businessLatitude?: number;
  businessLongitude?: number;
}): Promise<void> {
  console.log('🔧 [UPDATE USER] Starting business info update process');
  console.log('👤 [UPDATE USER] User ID:', supabaseUserId);
  console.log('🏢 [UPDATE USER] Business info:', businessInfo);

  try {
    // Validate inputs
    if (!supabaseUserId) {
      throw new Error('Supabase user ID is required');
    }

    // First check if user exists in local database by supabaseId
    console.log('🔍 [UPDATE USER] Checking for existing user record by Supabase ID...');
    const existingUser = await db
      .select({
        id: users.id,
        supabaseId: users.supabaseId,
        email: users.email,
        name: users.name,
        businessName: users.businessName,
        businessAddress: users.businessAddress,
        businessPhone: users.businessPhone,
        businessWebsite: users.businessWebsite,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.supabaseId, supabaseUserId))
      .limit(1);

    console.log('👤 [UPDATE USER] Existing user check result:', {
      found: existingUser.length > 0,
      user: existingUser.length > 0 ? {
        id: existingUser[0].id,
        email: existingUser[0].email,
        name: existingUser[0].name,
        currentBusinessName: existingUser[0].businessName,
        currentBusinessAddress: existingUser[0].businessAddress,
        currentBusinessPhone: existingUser[0].businessPhone,
        currentBusinessWebsite: existingUser[0].businessWebsite,
      } : null
    });

    if (existingUser.length === 0) {
      // User doesn't exist in local table by supabaseId, check if they exist by email
      console.log('🔍 [UPDATE USER] No user found by Supabase ID, checking by email...');

      // Get user details from Supabase
      console.log('🔐 [UPDATE USER] Fetching user details from Supabase...');
      const supabaseUser = await getUser();
      if (!supabaseUser) {
        throw new Error('Failed to get user details from Supabase - user not authenticated');
      }

      if (supabaseUser.id !== supabaseUserId) {
        throw new Error(`User ID mismatch: Supabase user ID (${supabaseUser.id}) != provided ID (${supabaseUserId})`);
      }

      const userEmail = supabaseUser.email || '';

      // Check if user exists by email (legacy user)
      const userByEmail = await db
        .select({
          id: users.id,
          supabaseId: users.supabaseId,
          email: users.email,
          name: users.name,
          businessName: users.businessName,
          businessAddress: users.businessAddress,
          businessPhone: users.businessPhone,
          businessWebsite: users.businessWebsite,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (userByEmail.length > 0 && !userByEmail[0].supabaseId) {
        // Found legacy user with same email, migrate them to Supabase auth
        console.log('🔄 [UPDATE USER] Found legacy user by email, migrating to Supabase auth...');

        const updateData = {
          supabaseId: supabaseUserId,
          name: supabaseUser.user_metadata?.name || userByEmail[0].name || userEmail.split('@')[0] || 'User',
          ...businessInfo,
          businessCategories: businessInfo.businessCategories ? JSON.stringify(businessInfo.businessCategories) : undefined,
          updatedAt: new Date()
        };

        console.log('💾 [UPDATE USER] Migrating legacy user to Supabase auth...');
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userByEmail[0].id));

        console.log('✅ [UPDATE USER] Successfully migrated legacy user to Supabase auth');

      } else {
        // No legacy user found, create new user record
        console.log('➕ [UPDATE USER] No existing record found, creating new user record...');

        const userData = {
          supabaseId: supabaseUserId,
          email: userEmail,
          name: supabaseUser.user_metadata?.name || userEmail.split('@')[0] || 'User',
          ...businessInfo,
          businessCategories: businessInfo.businessCategories ? JSON.stringify(businessInfo.businessCategories) : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log('📧 [UPDATE USER] User data to insert:', {
          supabaseId: userData.supabaseId,
          email: userData.email,
          name: userData.name,
          businessName: userData.businessName,
          businessAddress: userData.businessAddress,
          businessPhone: userData.businessPhone,
          businessWebsite: userData.businessWebsite,
          createdAt: userData.createdAt.toISOString()
        });

        console.log('💾 [UPDATE USER] Executing database insert...');
        const insertResult = await db
          .insert(users)
          .values(userData);

        console.log('✅ [UPDATE USER] Successfully created new user record');
        console.log('📊 [UPDATE USER] Insert result:', insertResult);
      }

    } else {
      // User exists, update their record
      console.log('🔄 [UPDATE USER] Updating existing user record...');
      console.log('📝 [UPDATE USER] Current business info:', {
        businessName: existingUser[0].businessName,
        businessAddress: existingUser[0].businessAddress,
        businessPhone: existingUser[0].businessPhone,
        businessWebsite: existingUser[0].businessWebsite,
      });
      console.log('📝 [UPDATE USER] New business info:', businessInfo);

      const updateData = {
        ...businessInfo,
        businessCategories: businessInfo.businessCategories ? JSON.stringify(businessInfo.businessCategories) : undefined,
        updatedAt: new Date()
      };

      console.log('💾 [UPDATE USER] Executing database update...');
      const updateResult = await db
        .update(users)
        .set(updateData)
        .where(eq(users.supabaseId, supabaseUserId));

      console.log('✅ [UPDATE USER] Successfully updated user record');
      console.log('📊 [UPDATE USER] Update result:', updateResult);
    }

    console.log('🎉 [UPDATE USER] Business info update process completed successfully');

  } catch (error) {
    console.error('❌ [UPDATE USER] Error during business info update process');
    console.error('❌ [UPDATE USER] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
      supabaseUserId,
      businessInfo
    });
    throw error; // Re-throw to be caught by the API handler
  }
}

export async function getUserBusinessInfo(supabaseUserId: string): Promise<{
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessWebsite?: string;
  businessDescription?: string;
  businessCategories?: string[];
  businessCity?: string;
  businessState?: string;
  businessZipCode?: string;
  businessCountry?: string;
  businessLatitude?: number;
  businessLongitude?: number;
} | null> {
  console.log('🔍 [GET USER] Getting business info for user:', supabaseUserId);

  const [user] = await db
    .select({
      businessName: users.businessName,
      businessAddress: users.businessAddress,
      businessPhone: users.businessPhone,
      businessWebsite: users.businessWebsite,
      businessDescription: users.businessDescription,
      businessCategories: users.businessCategories,
      businessCity: users.businessCity,
      businessState: users.businessState,
      businessZipCode: users.businessZipCode,
      businessCountry: users.businessCountry,
      businessLatitude: users.businessLatitude,
      businessLongitude: users.businessLongitude,
    })
    .from(users)
    .where(eq(users.supabaseId, supabaseUserId))
    .limit(1);

  if (!user) {
    console.log('❌ [GET USER] No user found');
    return null;
  }

  console.log('✅ [GET USER] Found user business info:', {
    businessName: user.businessName,
    businessAddress: user.businessAddress,
    businessPhone: user.businessPhone,
    businessWebsite: user.businessWebsite,
  });

  return {
    businessName: user.businessName || undefined,
    businessAddress: user.businessAddress || undefined,
    businessPhone: user.businessPhone || undefined,
    businessWebsite: user.businessWebsite || undefined,
    businessDescription: user.businessDescription || undefined,
    businessCategories: user.businessCategories ? JSON.parse(user.businessCategories) : undefined,
    businessCity: user.businessCity || undefined,
    businessState: user.businessState || undefined,
    businessZipCode: user.businessZipCode || undefined,
    businessCountry: user.businessCountry || undefined,
    businessLatitude: user.businessLatitude || undefined,
    businessLongitude: user.businessLongitude || undefined,
  };
}

export async function updateUserPrimaryWebsiteUrl(supabaseUserId: string, websiteUrl: string): Promise<void> {
  console.log('🔧 [UPDATE USER] Starting website URL update process');
  console.log('👤 [UPDATE USER] User ID:', supabaseUserId);
  console.log('🌐 [UPDATE USER] Website URL:', websiteUrl || '(empty)');

  try {
    // Validate inputs
    if (!supabaseUserId) {
      throw new Error('Supabase user ID is required');
    }

    // First check if user exists in local database by supabaseId
    console.log('🔍 [UPDATE USER] Checking for existing user record by Supabase ID...');
    const existingUser = await db
      .select({
        id: users.id,
        supabaseId: users.supabaseId,
        email: users.email,
        name: users.name,
        primaryWebsiteUrl: users.primaryWebsiteUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.supabaseId, supabaseUserId))
      .limit(1);

    console.log('👤 [UPDATE USER] Existing user check result:', {
      found: existingUser.length > 0,
      user: existingUser.length > 0 ? {
        id: existingUser[0].id,
        email: existingUser[0].email,
        name: existingUser[0].name,
        currentWebsiteUrl: existingUser[0].primaryWebsiteUrl
      } : null
    });

    if (existingUser.length === 0) {
      // User doesn't exist in local table by supabaseId, check if they exist by email
      console.log('🔍 [UPDATE USER] No user found by Supabase ID, checking by email...');

      // Get user details from Supabase
      console.log('🔐 [UPDATE USER] Fetching user details from Supabase...');
      const supabaseUser = await getUser();
      if (!supabaseUser) {
        throw new Error('Failed to get user details from Supabase - user not authenticated');
      }

      if (supabaseUser.id !== supabaseUserId) {
        throw new Error(`User ID mismatch: Supabase user ID (${supabaseUser.id}) != provided ID (${supabaseUserId})`);
      }

      const userEmail = supabaseUser.email || '';

      // Check if user exists by email (legacy user)
      const userByEmail = await db
        .select({
          id: users.id,
          supabaseId: users.supabaseId,
          email: users.email,
          name: users.name,
          primaryWebsiteUrl: users.primaryWebsiteUrl,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (userByEmail.length > 0 && !userByEmail[0].supabaseId) {
        // Found legacy user with same email, migrate them to Supabase auth
        console.log('🔄 [UPDATE USER] Found legacy user by email, migrating to Supabase auth...');

        const updateData = {
          supabaseId: supabaseUserId,
          name: supabaseUser.user_metadata?.name || userByEmail[0].name || userEmail.split('@')[0] || 'User',
          primaryWebsiteUrl: websiteUrl,
          updatedAt: new Date()
        };

        console.log('💾 [UPDATE USER] Migrating legacy user to Supabase auth...');
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, userByEmail[0].id));

        console.log('✅ [UPDATE USER] Successfully migrated legacy user to Supabase auth');

      } else {
        // No legacy user found, create new user record
        console.log('➕ [UPDATE USER] No existing record found, creating new user record...');

        const userData = {
          supabaseId: supabaseUserId,
          email: userEmail,
          name: supabaseUser.user_metadata?.name || userEmail.split('@')[0] || 'User',
          primaryWebsiteUrl: websiteUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log('📧 [UPDATE USER] User data to insert:', {
          supabaseId: userData.supabaseId,
          email: userData.email,
          name: userData.name,
          primaryWebsiteUrl: userData.primaryWebsiteUrl,
          createdAt: userData.createdAt.toISOString()
        });

        console.log('💾 [UPDATE USER] Executing database insert...');
        const insertResult = await db
          .insert(users)
          .values(userData);

        console.log('✅ [UPDATE USER] Successfully created new user record');
        console.log('📊 [UPDATE USER] Insert result:', insertResult);
      }

      // Verify the insert worked
      const verifyUser = await db
        .select({ primaryWebsiteUrl: users.primaryWebsiteUrl })
        .from(users)
        .where(eq(users.supabaseId, supabaseUserId))
        .limit(1);

      console.log('🔍 [UPDATE USER] Verification after insert:', {
        found: verifyUser.length > 0,
        savedWebsiteUrl: verifyUser[0]?.primaryWebsiteUrl
      });

      if (verifyUser.length === 0) {
        throw new Error('Failed to verify user record was created');
      }

      if (verifyUser[0].primaryWebsiteUrl !== websiteUrl) {
        throw new Error(`Website URL mismatch after insert: expected "${websiteUrl}", got "${verifyUser[0].primaryWebsiteUrl}"`);
      }

    } else {
      // User exists, update their record
      console.log('🔄 [UPDATE USER] Updating existing user record...');
      console.log('📝 [UPDATE USER] Current website URL:', existingUser[0].primaryWebsiteUrl);
      console.log('📝 [UPDATE USER] New website URL:', websiteUrl);

      const updateData = {
        primaryWebsiteUrl: websiteUrl,
        updatedAt: new Date()
      };

      console.log('💾 [UPDATE USER] Executing database update...');
      const updateResult = await db
        .update(users)
        .set(updateData)
        .where(eq(users.supabaseId, supabaseUserId));

      console.log('✅ [UPDATE USER] Successfully updated user record');
      console.log('📊 [UPDATE USER] Update result:', updateResult);

      // Verify the update worked
      const verifyUser = await db
        .select({ primaryWebsiteUrl: users.primaryWebsiteUrl })
        .from(users)
        .where(eq(users.supabaseId, supabaseUserId))
        .limit(1);

      console.log('🔍 [UPDATE USER] Verification after update:', {
        found: verifyUser.length > 0,
        savedWebsiteUrl: verifyUser[0]?.primaryWebsiteUrl
      });

      if (verifyUser.length === 0) {
        throw new Error('Failed to verify user record was updated');
      }

      if (verifyUser[0].primaryWebsiteUrl !== websiteUrl) {
        throw new Error(`Website URL mismatch after update: expected "${websiteUrl}", got "${verifyUser[0].primaryWebsiteUrl}"`);
      }
    }

    console.log('🎉 [UPDATE USER] Website URL update process completed successfully');

  } catch (error) {
    console.error('❌ [UPDATE USER] Error during website URL update process');
    console.error('❌ [UPDATE USER] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
      supabaseUserId,
      websiteUrl
    });
    throw error; // Re-throw to be caught by the API handler
  }
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.supabaseUserId, users.supabaseId))
    .where(eq(activityLogs.supabaseUserId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  // Find the user in our local database by Supabase ID
  const localUser = await db
    .select()
    .from(users)
    .where(and(eq(users.supabaseId, user.id), isNull(users.deletedAt)))
    .limit(1);

  if (localUser.length === 0) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, localUser[0].id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });

  return result?.team || null;
}

// SEO Topic Generation Queries - using Supabase user IDs
export async function createTopicGeneration(data: {
  supabaseUserId: string;
  inputTopic: string;
  generatedTopics: string;
  metadata: string;
}) {
  const [generation] = await db
    .insert(topicGenerations)
    .values({
      ...data,
      createdAt: new Date(),
    })
    .returning();

  return generation;
}

export async function getTopicGenerationsByUserId(
  supabaseUserId: string,
  limit = 10,
  offset = 0
) {
  return await db
    .select()
    .from(topicGenerations)
    .where(eq(topicGenerations.supabaseUserId, supabaseUserId))
    .orderBy(desc(topicGenerations.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getTopicGenerationById(id: number, supabaseUserId: string) {
  const [generation] = await db
    .select()
    .from(topicGenerations)
    .where(and(eq(topicGenerations.id, id), eq(topicGenerations.supabaseUserId, supabaseUserId)))
    .limit(1);

  return generation;
}

export async function deleteTopicGeneration(id: number, supabaseUserId: string) {
  await db
    .delete(topicGenerations)
    .where(and(eq(topicGenerations.id, id), eq(topicGenerations.supabaseUserId, supabaseUserId)));
}

// Saved Topics Queries - using Supabase user IDs
export async function createSavedTopic(data: {
  supabaseUserId: string;
  topic: string;
  description?: string;
  tags?: string;
  difficulty?: string;
  searchVolume?: number;
  competitionLevel?: string;
  sourceGenerationId?: number;
  // Enhanced personalization fields
  businessType?: string;
  targetAudience?: string;
  location?: string;
  detailedLocation?: string;
  tone?: string;
  additionalContext?: string;
  websiteUrl?: string;
  websiteAnalysisContext?: string;
}) {
  const [savedTopic] = await db
    .insert(savedTopics)
    .values({
      ...data,
      savedAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return savedTopic;
}

export async function getSavedTopicsByUserId(
  supabaseUserId: string,
  limit = 20,
  offset = 0,
  filters?: {
    difficulty?: ('easy' | 'medium' | 'hard')[];
    competitionLevel?: ('low' | 'medium' | 'high')[];
    minSearchVolume?: number;
    maxSearchVolume?: number;
  }
) {
  console.log('🔍 [GET SAVED TOPICS] Querying topics for user:', supabaseUserId);
  console.log('🔍 [GET SAVED TOPICS] Filters:', filters);

  const conditions = [eq(savedTopics.supabaseUserId, supabaseUserId)];

  if (filters) {
    if (filters.difficulty && filters.difficulty.length > 0) {
      conditions.push(eq(savedTopics.difficulty, filters.difficulty[0]));
    }

    if (filters.competitionLevel && filters.competitionLevel.length > 0) {
      conditions.push(eq(savedTopics.competitionLevel, filters.competitionLevel[0]));
    }

    if (filters.minSearchVolume) {
      conditions.push(gte(savedTopics.searchVolume, filters.minSearchVolume));
    }

    if (filters.maxSearchVolume) {
      conditions.push(lte(savedTopics.searchVolume, filters.maxSearchVolume));
    }
  }

  console.log('🔍 [GET SAVED TOPICS] Final conditions count:', conditions.length);

  const result = await db
    .select()
    .from(savedTopics)
    .where(and(...conditions))
    .orderBy(desc(savedTopics.savedAt))
    .limit(limit)
    .offset(offset);

  console.log('🔍 [GET SAVED TOPICS] Query result:', result.length, 'topics found');

  return result;
}

export async function getSavedTopicById(id: number, supabaseUserId: string) {
  const [savedTopic] = await db
    .select()
    .from(savedTopics)
    .where(and(eq(savedTopics.id, id), eq(savedTopics.supabaseUserId, supabaseUserId)))
    .limit(1);

  return savedTopic;
}

export async function updateSavedTopic(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    topic: string;
    description: string;
    tags: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competitionLevel: 'low' | 'medium' | 'high';
  }>
) {
  await db
    .update(savedTopics)
    .set(data)
    .where(and(eq(savedTopics.id, id), eq(savedTopics.supabaseUserId, supabaseUserId)));
}

export async function deleteSavedTopic(id: number, supabaseUserId: string) {
  await db
    .delete(savedTopics)
    .where(and(eq(savedTopics.id, id), eq(savedTopics.supabaseUserId, supabaseUserId)));
}

export async function getSavedTopicsCount(supabaseUserId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(savedTopics)
    .where(eq(savedTopics.supabaseUserId, supabaseUserId));

  return result?.count || 0;
}

export async function isTopicSaved(supabaseUserId: string, topic: string) {
  const [result] = await db
    .select({ id: savedTopics.id })
    .from(savedTopics)
    .where(and(eq(savedTopics.supabaseUserId, supabaseUserId), eq(savedTopics.topic, topic)))
    .limit(1);

  return !!result;
}

export async function searchSavedTopics(
  supabaseUserId: string,
  searchQuery: string,
  limit = 20,
  offset = 0
) {
  const searchConditions = [
    eq(savedTopics.supabaseUserId, supabaseUserId),
    like(savedTopics.topic, `%${searchQuery}%`)
  ];

  return await db
    .select()
    .from(savedTopics)
    .where(and(...searchConditions))
    .orderBy(desc(savedTopics.savedAt))
    .limit(limit)
    .offset(offset);
}

// Usage Tracking Queries - using Supabase user IDs
export async function createUsageTracking(data: {
  supabaseUserId: string;
  action: string;
  metadata?: string;
}) {
  const [tracking] = await db
    .insert(usageTracking)
    .values({
      ...data,
      createdAt: new Date(),
    })
    .returning();

  return tracking;
}

export async function getUserUsageStats(
  supabaseUserId: string,
  period: 'daily' | 'monthly' = 'daily'
) {
  const now = new Date();
  let startDate: Date;

  if (period === 'daily') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const usageStats = await db
    .select({
      action: usageTracking.action,
      count: count(),
    })
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.supabaseUserId, supabaseUserId),
        gte(usageTracking.createdAt, startDate)
      )
    )
    .groupBy(usageTracking.action);

  // Initialize with default values
  const stats = {
    totalGenerations: 0,
    totalSaves: 0,
    totalActions: 0,
    dailyGenerations: 0,
    monthlyGenerations: 0,
  };

  usageStats.forEach(stat => {
    stats.totalActions += stat.count;

    switch (stat.action) {
      case 'generate_topic':
        stats.totalGenerations = stat.count;
        if (period === 'daily') {
          stats.dailyGenerations = stat.count;
        } else {
          stats.monthlyGenerations = stat.count;
        }
        break;
      case 'save_topic':
        stats.totalSaves = stat.count;
        break;
    }
  });

  return stats;
}

export async function getDailyUsageCount(supabaseUserId: string, action: string) {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [result] = await db
    .select({ count: count() })
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.supabaseUserId, supabaseUserId),
        eq(usageTracking.action, action),
        gte(usageTracking.createdAt, startDate)
      )
    );

  return result?.count || 0;
}

export async function getMonthlyUsageCount(supabaseUserId: string, action: string) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const [result] = await db
    .select({ count: count() })
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.supabaseUserId, supabaseUserId),
        eq(usageTracking.action, action),
        gte(usageTracking.createdAt, startDate)
      )
    );

  return result?.count || 0;
}

export async function trackUserAction(
  supabaseUserId: string,
  action: string,
  metadata?: Record<string, any>
) {
  await createUsageTracking({
    supabaseUserId,
    action,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
  });
}

// Analytics and Reporting Queries - using Supabase user IDs
export async function getTopicGenerationAnalytics(supabaseUserId: string) {
  const stats = await db
    .select({
      totalGenerations: count(topicGenerations.id),
    })
    .from(topicGenerations)
    .where(eq(topicGenerations.supabaseUserId, supabaseUserId));

  // Get all generations to calculate average
  const generations = await getTopicGenerationsByUserId(supabaseUserId, 1000, 0);
  let totalGeneratedTopics = 0;

  generations.forEach(gen => {
    try {
      const topics = JSON.parse(gen.generatedTopics);
      totalGeneratedTopics += Array.isArray(topics) ? topics.length : 0;
    } catch (e) {
      // Ignore parsing errors
    }
  });

  const avgTopicsPerGeneration = generations.length > 0
    ? Math.round(totalGeneratedTopics / generations.length)
    : 0;

  return {
    totalGenerations: stats[0]?.totalGenerations || 0,
    totalGeneratedTopics,
    avgTopicsPerGeneration,
  };
}

export async function getSavedTopicsAnalytics(supabaseUserId: string) {
  const analytics = await db
    .select({
      difficulty: savedTopics.difficulty,
      competitionLevel: savedTopics.competitionLevel,
      count: count(),
    })
    .from(savedTopics)
    .where(eq(savedTopics.supabaseUserId, supabaseUserId))
    .groupBy(savedTopics.difficulty, savedTopics.competitionLevel);

  // Get average search volume
  const allTopics = await getSavedTopicsByUserId(supabaseUserId, 1000, 0);
  const totalSearchVolume = allTopics.reduce((sum, topic) => sum + (topic.searchVolume || 0), 0);
  const avgSearchVolume = allTopics.length > 0 ? Math.round(totalSearchVolume / allTopics.length) : 0;

  return {
    byDifficulty: analytics.filter(a => a.difficulty),
    byCompetition: analytics.filter(a => a.competitionLevel),
    totalSavedTopics: allTopics.length,
    avgSearchVolume,
  };
}

// Website Analysis Queries - using Supabase user IDs
export async function createWebsiteAnalysis(data: {
  supabaseUserId: string;
  url: string;
  domain: string;
  totalWordCount?: number;
  totalImages?: number;
  topics?: string;
  keywords?: string;
  contentGaps?: string;
  internalLinkingScore?: number;
  technicalIssues?: string;
}) {
  const [analysis] = await db
    .insert(websiteAnalyses)
    .values({
      ...data,
      crawledAt: new Date(),
    })
    .returning();

  return analysis;
}

export async function getWebsiteAnalysesByUserId(
  supabaseUserId: string,
  limit = 10,
  offset = 0
) {
  return await db
    .select()
    .from(websiteAnalyses)
    .where(eq(websiteAnalyses.supabaseUserId, supabaseUserId))
    .orderBy(desc(websiteAnalyses.crawledAt))
    .limit(limit)
    .offset(offset);
}

export async function getWebsiteAnalysisById(id: number, supabaseUserId: string) {
  const [analysis] = await db
    .select()
    .from(websiteAnalyses)
    .where(and(eq(websiteAnalyses.id, id), eq(websiteAnalyses.supabaseUserId, supabaseUserId)))
    .limit(1);

  return analysis;
}

export async function deleteWebsiteAnalysis(id: number, supabaseUserId: string) {
  await db
    .delete(websiteAnalyses)
    .where(and(eq(websiteAnalyses.id, id), eq(websiteAnalyses.supabaseUserId, supabaseUserId)));
}

export async function updateWebsiteAnalysis(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    totalWordCount: number;
    totalImages: number;
    topics: string;
    keywords: string;
    contentGaps: string;
    internalLinkingScore: number;
    technicalIssues: string;
  }>
) {
  await db
    .update(websiteAnalyses)
    .set(data)
    .where(and(eq(websiteAnalyses.id, id), eq(websiteAnalyses.supabaseUserId, supabaseUserId)));
}

// Crawled Pages Queries
export async function createCrawledPage(data: {
  websiteAnalysisId: number;
  url: string;
  title: string;
  metaDescription?: string;
  headings?: string;
  content?: string;
  wordCount?: number;
  internalLinks?: string;
  externalLinks?: string;
  images?: string;
  lastModified?: Date;
}) {
  const [page] = await db
    .insert(crawledPages)
    .values(data)
    .returning();

  return page;
}

export async function getCrawledPagesByAnalysisId(websiteAnalysisId: number) {
  return await db
    .select()
    .from(crawledPages)
    .where(eq(crawledPages.websiteAnalysisId, websiteAnalysisId))
    .orderBy(crawledPages.url);
}

export async function getCrawledPageById(id: number) {
  const [page] = await db
    .select()
    .from(crawledPages)
    .where(eq(crawledPages.id, id))
    .limit(1);

  return page;
}

export async function updateCrawledPage(
  id: number,
  data: Partial<{
    title: string;
    metaDescription: string;
    headings: string;
    content: string;
    wordCount: number;
    internalLinks: string;
    externalLinks: string;
    images: string;
    lastModified: Date;
  }>
) {
  await db
    .update(crawledPages)
    .set(data)
    .where(eq(crawledPages.id, id));
}

export async function deleteCrawledPagesByAnalysisId(websiteAnalysisId: number) {
  await db
    .delete(crawledPages)
    .where(eq(crawledPages.websiteAnalysisId, websiteAnalysisId));
}

// Content Gaps Queries
export async function createContentGap(data: {
  websiteAnalysisId: number;
  topic: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDifficulty: 'easy' | 'medium' | 'hard';
  competitorAdvantage?: string;
}) {
  const [gap] = await db
    .insert(contentGaps)
    .values({
      ...data,
      identifiedAt: new Date(),
    })
    .returning();

  return gap;
}

export async function getContentGapsByAnalysisId(websiteAnalysisId: number, supabaseUserId?: string) {
  if (supabaseUserId) {
    // Join with websiteAnalyses to ensure user owns the analysis
    return await db
      .select({
        id: contentGaps.id,
        websiteAnalysisId: contentGaps.websiteAnalysisId,
        topic: contentGaps.topic,
        reason: contentGaps.reason,
        priority: contentGaps.priority,
        estimatedDifficulty: contentGaps.estimatedDifficulty,
        competitorAdvantage: contentGaps.competitorAdvantage,
        identifiedAt: contentGaps.identifiedAt
      })
      .from(contentGaps)
      .innerJoin(websiteAnalyses, eq(contentGaps.websiteAnalysisId, websiteAnalyses.id))
      .where(and(
        eq(contentGaps.websiteAnalysisId, websiteAnalysisId),
        eq(websiteAnalyses.supabaseUserId, supabaseUserId)
      ))
      .orderBy(desc(contentGaps.priority), contentGaps.identifiedAt);
  } else {
    return await db
      .select()
      .from(contentGaps)
      .where(eq(contentGaps.websiteAnalysisId, websiteAnalysisId))
      .orderBy(desc(contentGaps.priority), contentGaps.identifiedAt);
  }
}

export async function getContentGapsByUserId(supabaseUserId: string, limit = 50) {
  return await db
    .select({
      id: contentGaps.id,
      topic: contentGaps.topic,
      reason: contentGaps.reason,
      priority: contentGaps.priority,
      estimatedDifficulty: contentGaps.estimatedDifficulty,
      competitorAdvantage: contentGaps.competitorAdvantage,
      identifiedAt: contentGaps.identifiedAt,
      domain: websiteAnalyses.domain,
      url: websiteAnalyses.url,
    })
    .from(contentGaps)
    .innerJoin(websiteAnalyses, eq(contentGaps.websiteAnalysisId, websiteAnalyses.id))
    .where(eq(websiteAnalyses.supabaseUserId, supabaseUserId))
    .orderBy(desc(contentGaps.priority), desc(contentGaps.identifiedAt))
    .limit(limit);
}

export async function updateContentGap(
  id: number,
  data: Partial<{
    topic: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    estimatedDifficulty: 'easy' | 'medium' | 'hard';
    competitorAdvantage: string;
  }>
) {
  await db
    .update(contentGaps)
    .set(data)
    .where(eq(contentGaps.id, id));
}

export async function deleteContentGap(id: number) {
  await db
    .delete(contentGaps)
    .where(eq(contentGaps.id, id));
}

export async function deleteContentGapsByAnalysisId(websiteAnalysisId: number) {
  await db
    .delete(contentGaps)
    .where(eq(contentGaps.websiteAnalysisId, websiteAnalysisId));
}

// Competitor Analysis Queries
export async function createCompetitorAnalysis(data: {
  supabaseUserId: string;
  primaryWebsiteAnalysisId: number;
  competitorUrl: string;
  competitorDomain: string;
  missingTopics?: string;
  weakerContent?: string;
  opportunities?: string;
  // Enhanced analysis fields
  analysisData?: string;
  contentGapAnalysis?: string;
  performanceComparison?: string;
  keywordOverlapAnalysis?: string;
  recommendations?: string;
  industryId?: string;
  competitorStrengthScore?: number;
  contentSimilarityScore?: number;
  backlinkProfile?: string;
  technicalSeoScore?: number;
  socialPresence?: string;
}) {
  const [analysis] = await db
    .insert(competitorAnalyses)
    .values({
      ...data,
      analyzedAt: new Date(),
    })
    .returning();

  return analysis;
}

export async function getCompetitorAnalysesByUserId(supabaseUserId: string, limit = 20) {
  return await db
    .select({
      id: competitorAnalyses.id,
      competitorUrl: competitorAnalyses.competitorUrl,
      competitorDomain: competitorAnalyses.competitorDomain,
      missingTopics: competitorAnalyses.missingTopics,
      weakerContent: competitorAnalyses.weakerContent,
      opportunities: competitorAnalyses.opportunities,
      analyzedAt: competitorAnalyses.analyzedAt,
      primaryDomain: websiteAnalyses.domain,
      primaryUrl: websiteAnalyses.url,
    })
    .from(competitorAnalyses)
    .innerJoin(websiteAnalyses, eq(competitorAnalyses.primaryWebsiteAnalysisId, websiteAnalyses.id))
    .where(eq(competitorAnalyses.supabaseUserId, supabaseUserId))
    .orderBy(desc(competitorAnalyses.analyzedAt))
    .limit(limit);
}

export async function getCompetitorAnalysesByPrimaryAnalysisId(primaryWebsiteAnalysisId: number) {
  return await db
    .select()
    .from(competitorAnalyses)
    .where(eq(competitorAnalyses.primaryWebsiteAnalysisId, primaryWebsiteAnalysisId))
    .orderBy(desc(competitorAnalyses.analyzedAt));
}

export async function getCompetitorAnalysisById(id: number, supabaseUserId: string) {
  const [analysis] = await db
    .select()
    .from(competitorAnalyses)
    .where(and(eq(competitorAnalyses.id, id), eq(competitorAnalyses.supabaseUserId, supabaseUserId)))
    .limit(1);

  return analysis;
}

export async function updateCompetitorAnalysis(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    missingTopics: string;
    weakerContent: string;
    opportunities: string;
    // Enhanced analysis fields
    analysisData: string;
    contentGapAnalysis: string;
    performanceComparison: string;
    keywordOverlapAnalysis: string;
    recommendations: string;
    industryId: string;
    competitorStrengthScore: number;
    contentSimilarityScore: number;
    backlinkProfile: string;
    technicalSeoScore: number;
    socialPresence: string;
  }>
) {
  await db
    .update(competitorAnalyses)
    .set(data)
    .where(and(eq(competitorAnalyses.id, id), eq(competitorAnalyses.supabaseUserId, supabaseUserId)));
}

export async function deleteCompetitorAnalysis(id: number, supabaseUserId: string) {
  await db
    .delete(competitorAnalyses)
    .where(and(eq(competitorAnalyses.id, id), eq(competitorAnalyses.supabaseUserId, supabaseUserId)));
}

export async function deleteCompetitorAnalysesByPrimaryAnalysisId(primaryWebsiteAnalysisId: number) {
  await db
    .delete(competitorAnalyses)
    .where(eq(competitorAnalyses.primaryWebsiteAnalysisId, primaryWebsiteAnalysisId));
}

// Website Analysis Usage Tracking
export async function getWebsiteAnalysisUsageStats(supabaseUserId: string) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = await db
    .select({
      totalAnalyses: count(websiteAnalyses.id),
      totalPagesCrawled: count(crawledPages.id),
      totalContentGaps: count(contentGaps.id),
      totalCompetitorAnalyses: count(competitorAnalyses.id),
    })
    .from(websiteAnalyses)
    .where(
      and(
        eq(websiteAnalyses.supabaseUserId, supabaseUserId),
        gte(websiteAnalyses.crawledAt, startDate)
      )
    )
    .leftJoin(crawledPages, eq(websiteAnalyses.id, crawledPages.websiteAnalysisId))
    .leftJoin(contentGaps, eq(websiteAnalyses.id, contentGaps.websiteAnalysisId))
    .leftJoin(competitorAnalyses, eq(websiteAnalyses.id, competitorAnalyses.primaryWebsiteAnalysisId));

  return {
    monthlyAnalyses: stats[0]?.totalAnalyses || 0,
    monthlyPagesCrawled: stats[0]?.totalPagesCrawled || 0,
    monthlyContentGaps: stats[0]?.totalContentGaps || 0,
    monthlyCompetitorAnalyses: stats[0]?.totalCompetitorAnalyses || 0,
  };
}

export async function getWebsiteAnalysisByDomain(domain: string, supabaseUserId: string) {
  console.log('🔍 [ANALYSIS BY DOMAIN] Querying analysis for domain:', domain);

  const [analysis] = await db
    .select()
    .from(websiteAnalyses)
    .where(and(
      eq(websiteAnalyses.domain, domain),
      eq(websiteAnalyses.supabaseUserId, supabaseUserId)
    ))
    .orderBy(desc(websiteAnalyses.crawledAt))
    .limit(1);

  console.log('📊 [ANALYSIS BY DOMAIN] Query result:', analysis ? {
    id: analysis.id,
    url: analysis.url,
    domain: analysis.domain,
    crawledAt: analysis.crawledAt
  } : null);

  return analysis;
}

export async function getRecentWebsiteAnalysis(supabaseUserId: string) {
  console.log('🔍 [RECENT ANALYSIS] Querying recent analysis for user:', supabaseUserId);

  const analyses = await db
    .select()
    .from(websiteAnalyses)
    .where(eq(websiteAnalyses.supabaseUserId, supabaseUserId))
    .orderBy(desc(websiteAnalyses.crawledAt))
    .limit(1);

  console.log('📊 [RECENT ANALYSIS] Raw query result:', analyses);
  console.log('📊 [RECENT ANALYSIS] First record:', analyses[0]);

  if (analyses.length > 0) {
    console.log('✅ [RECENT ANALYSIS] Found analysis:', {
      id: analyses[0].id,
      url: analyses[0].url,
      domain: analyses[0].domain,
      crawledAt: analyses[0].crawledAt,
      supabaseUserId: analyses[0].supabaseUserId
    });
  } else {
    console.log('❌ [RECENT ANALYSIS] No analyses found');
  }

  return analyses;
}

/**
 * Get website analysis status for a user
 * Returns information about whether user has primary website set and analyzed
 */
export async function getWebsiteAnalysisStatus(supabaseUserId: string) {
  console.log('🔍 [STATUS] Getting website analysis status for user:', supabaseUserId);

  // Check if user has primary website URL set
  const primaryWebsiteUrl = await getUserPrimaryWebsiteUrl(supabaseUserId);
  console.log('🌐 [STATUS] Primary website URL:', primaryWebsiteUrl);

  // Check if user has any website analysis
  const recentAnalyses = await getRecentWebsiteAnalysis(supabaseUserId);
  const recentAnalysis = recentAnalyses.length > 0 ? recentAnalyses[0] : null;

  console.log('📈 [STATUS] Recent analysis found:', !!recentAnalysis, recentAnalysis ? {
    id: recentAnalysis.id,
    url: recentAnalysis.url,
    crawledAt: recentAnalysis.crawledAt
  } : null);

  const analysisCount = await getWebsiteAnalysisCount(supabaseUserId);
  console.log('🔢 [STATUS] Total analysis count:', analysisCount);

  const status = {
    hasPrimaryWebsite: !!primaryWebsiteUrl,
    primaryWebsiteUrl,
    hasBeenAnalyzed: !!recentAnalysis,
    lastAnalysisDate: recentAnalysis?.crawledAt || null,
    analysisCount
  };

  console.log('✅ [STATUS] Final status:', status);
  return status;
}

// Search and filtering functions for website analysis
export async function searchWebsiteAnalyses(
  supabaseUserId: string,
  searchQuery: string,
  limit = 10,
  offset = 0
) {
  const searchConditions = [
    eq(websiteAnalyses.supabaseUserId, supabaseUserId),
    or(
      like(websiteAnalyses.domain, `%${searchQuery}%`),
      like(websiteAnalyses.url, `%${searchQuery}%`)
    )
  ];

  return await db
    .select()
    .from(websiteAnalyses)
    .where(and(...searchConditions))
    .orderBy(desc(websiteAnalyses.crawledAt))
    .limit(limit)
    .offset(offset);
}

export async function getContentGapsByPriority(
  supabaseUserId: string,
  priority: 'high' | 'medium' | 'low',
  limit = 20
) {
  return await db
    .select({
      id: contentGaps.id,
      topic: contentGaps.topic,
      reason: contentGaps.reason,
      priority: contentGaps.priority,
      estimatedDifficulty: contentGaps.estimatedDifficulty,
      competitorAdvantage: contentGaps.competitorAdvantage,
      identifiedAt: contentGaps.identifiedAt,
      domain: websiteAnalyses.domain,
      url: websiteAnalyses.url,
    })
    .from(contentGaps)
    .innerJoin(websiteAnalyses, eq(contentGaps.websiteAnalysisId, websiteAnalyses.id))
    .where(
      and(
        eq(websiteAnalyses.supabaseUserId, supabaseUserId),
        eq(contentGaps.priority, priority)
      )
    )
    .orderBy(desc(contentGaps.identifiedAt))
    .limit(limit);
}

export async function getWebsiteAnalysisCount(supabaseUserId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(websiteAnalyses)
    .where(eq(websiteAnalyses.supabaseUserId, supabaseUserId));

  return result?.count || 0;
}

/**
 * Check if a website was recently crawled within the specified number of days
 * @param domain - The domain to check
 * @param supabaseUserId - The user ID
 * @param days - Number of days to check within (default: 30)
 * @returns Promise<{ recentlyCrawled: boolean; lastCrawledAt: Date | null; daysSinceCrawl: number | null }>
 */
export async function isWebsiteRecentlyCrawled(
  domain: string,
  supabaseUserId: string,
  days: number = 30
): Promise<{ recentlyCrawled: boolean; lastCrawledAt: Date | null; daysSinceCrawl: number | null }> {
  console.log('🔍 [RECENT CRAWL CHECK] Checking if domain was recently crawled:', {
    domain,
    supabaseUserId,
    days
  });

  // Calculate the date cutoff
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Find the most recent analysis for this domain
  const [recentAnalysis] = await db
    .select({
      id: websiteAnalyses.id,
      url: websiteAnalyses.url,
      domain: websiteAnalyses.domain,
      crawledAt: websiteAnalyses.crawledAt,
    })
    .from(websiteAnalyses)
    .where(and(
      eq(websiteAnalyses.domain, domain),
      eq(websiteAnalyses.supabaseUserId, supabaseUserId)
    ))
    .orderBy(desc(websiteAnalyses.crawledAt))
    .limit(1);

  if (!recentAnalysis) {
    console.log('❌ [RECENT CRAWL CHECK] No analysis found for domain:', domain);
    return {
      recentlyCrawled: false,
      lastCrawledAt: null,
      daysSinceCrawl: null
    };
  }

  const lastCrawledAt = new Date(recentAnalysis.crawledAt);
  const daysSinceCrawl = Math.floor((Date.now() - lastCrawledAt.getTime()) / (1000 * 60 * 60 * 24));
  const recentlyCrawled = lastCrawledAt >= cutoffDate;

  console.log('✅ [RECENT CRAWL CHECK] Analysis found:', {
    id: recentAnalysis.id,
    url: recentAnalysis.url,
    domain: recentAnalysis.domain,
    lastCrawledAt: lastCrawledAt.toISOString(),
    daysSinceCrawl,
    recentlyCrawled,
    cutoffDate: cutoffDate.toISOString()
  });

  return {
    recentlyCrawled,
    lastCrawledAt,
    daysSinceCrawl
  };
}


// Content Briefs Queries
export async function createContentBrief(data: {
  supabaseUserId: string;
  savedTopicId: number;
  title: string;
  briefContent: string;
  suggestedHeadings?: string;
  targetKeywords?: string;
  wordCountEstimate?: number;
  internalLinkingSuggestions?: string;
  contentRecommendations?: string;
}) {
  const [brief] = await db
    .insert(contentBriefs)
    .values({
      ...data,
      generatedAt: new Date(),
    })
    .returning();

  return brief;
}

export async function getContentBriefsByUserId(supabaseUserId: string, limit = 20, offset = 0) {
  return await db
    .select({
      id: contentBriefs.id,
      title: contentBriefs.title,
      wordCountEstimate: contentBriefs.wordCountEstimate,
      generatedAt: contentBriefs.generatedAt,
      topic: savedTopics.topic,
      topicId: savedTopics.id,
    })
    .from(contentBriefs)
    .innerJoin(savedTopics, eq(contentBriefs.savedTopicId, savedTopics.id))
    .where(eq(contentBriefs.supabaseUserId, supabaseUserId))
    .orderBy(desc(contentBriefs.generatedAt))
    .limit(limit)
    .offset(offset);
}

export async function getContentBriefById(id: number, supabaseUserId: string) {
  const [brief] = await db
    .select()
    .from(contentBriefs)
    .where(and(eq(contentBriefs.id, id), eq(contentBriefs.supabaseUserId, supabaseUserId)))
    .limit(1);

  return brief;
}

export async function getContentBriefsByTopicId(savedTopicId: number, supabaseUserId: string) {
  return await db
    .select()
    .from(contentBriefs)
    .where(and(
      eq(contentBriefs.savedTopicId, savedTopicId),
      eq(contentBriefs.supabaseUserId, supabaseUserId)
    ))
    .orderBy(desc(contentBriefs.generatedAt));
}

export async function deleteContentBrief(id: number, supabaseUserId: string) {
  await db
    .delete(contentBriefs)
    .where(and(eq(contentBriefs.id, id), eq(contentBriefs.supabaseUserId, supabaseUserId)));
}

// Performance Tracking Queries
export async function createPerformanceTracking(data: {
  supabaseUserId: string;
  savedTopicId: number;
  keyword: string;
  position: number;
  url: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  device?: string;
  country?: string;
  date: string;
}) {
  const [tracking] = await db
    .insert(performanceTracking)
    .values({
      ...data,
      syncTimestamp: new Date(),
    })
    .returning();

  return tracking;
}

export async function getPerformanceTrackingByTopicId(
  savedTopicId: number,
  supabaseUserId: string,
  limit = 100
) {
  return await db
    .select()
    .from(performanceTracking)
    .where(and(
      eq(performanceTracking.savedTopicId, savedTopicId),
      eq(performanceTracking.supabaseUserId, supabaseUserId)
    ))
    .orderBy(desc(performanceTracking.date))
    .limit(limit);
}

export async function getPerformanceTrackingByKeyword(
  keyword: string,
  supabaseUserId: string,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await db
    .select()
    .from(performanceTracking)
    .where(and(
      eq(performanceTracking.keyword, keyword),
      eq(performanceTracking.supabaseUserId, supabaseUserId),
      gte(performanceTracking.date, startDate.toISOString().split('T')[0])
    ))
    .orderBy(desc(performanceTracking.date));
}

export async function updatePerformanceTracking(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    position: number;
    clicks: number;
    impressions: number;
    ctr: number;
    device: string;
    country: string;
  }>
) {
  await db
    .update(performanceTracking)
    .set({
      ...data,
      syncTimestamp: new Date(),
    })
    .where(and(eq(performanceTracking.id, id), eq(performanceTracking.supabaseUserId, supabaseUserId)));
}

export async function deletePerformanceTracking(id: number, supabaseUserId: string) {
  await db
    .delete(performanceTracking)
    .where(and(eq(performanceTracking.id, id), eq(performanceTracking.supabaseUserId, supabaseUserId)));
}

export async function getPerformanceTrackingByUserId(
  supabaseUserId: string,
  limit = 100
) {
  return await db
    .select()
    .from(performanceTracking)
    .where(eq(performanceTracking.supabaseUserId, supabaseUserId))
    .orderBy(desc(performanceTracking.syncTimestamp))
    .limit(limit);
}

// Competitor Monitoring Queries
export async function createCompetitorMonitoring(data: {
  supabaseUserId: string;
  competitorUrl: string;
  competitorDomain: string;
  isActive?: boolean;
}) {
  const [monitoring] = await db
    .insert(competitorMonitoring)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return monitoring;
}

export async function getCompetitorMonitoringByUserId(supabaseUserId: string) {
  return await db
    .select()
    .from(competitorMonitoring)
    .where(eq(competitorMonitoring.supabaseUserId, supabaseUserId))
    .orderBy(desc(competitorMonitoring.updatedAt));
}

export async function getCompetitorMonitoringById(id: number, supabaseUserId: string) {
  const [monitoring] = await db
    .select()
    .from(competitorMonitoring)
    .where(and(eq(competitorMonitoring.id, id), eq(competitorMonitoring.supabaseUserId, supabaseUserId)))
    .limit(1);

  return monitoring;
}

export async function getActiveCompetitorMonitoring(supabaseUserId: string) {
  return await db
    .select()
    .from(competitorMonitoring)
    .where(and(
      eq(competitorMonitoring.supabaseUserId, supabaseUserId),
      eq(competitorMonitoring.isActive, true)
    ))
    .orderBy(desc(competitorMonitoring.lastCrawlDate));
}

export async function updateCompetitorMonitoring(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    isActive: boolean;
    lastCrawlDate: Date;
    previousPageCount: number;
    currentPageCount: number;
    newContentDetected: string;
    removedContentDetected: string;
    keywordChanges: string;
    changeScore: number;
    alertsSent: number;
    // Enhanced analysis fields
    analysisData: string;
    contentGapAnalysis: string;
    performanceComparison: string;
    keywordOverlapAnalysis: string;
    recommendations: string;
    lastAnalysisAt: Date;
  }>
) {
  await db
    .update(competitorMonitoring)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(competitorMonitoring.id, id), eq(competitorMonitoring.supabaseUserId, supabaseUserId)));
}

export async function deleteCompetitorMonitoring(id: number, supabaseUserId: string) {
  await db
    .delete(competitorMonitoring)
    .where(and(eq(competitorMonitoring.id, id), eq(competitorMonitoring.supabaseUserId, supabaseUserId)));
}

// Google Search Console Connections Queries
export async function createGscConnection(data: {
  supabaseUserId: string;
  siteUrl: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  syncFrequency?: 'daily' | 'weekly' | 'manual';
}) {
  const [connection] = await db
    .insert(gscConnections)
    .values({
      ...data,
      connectedAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return connection;
}

export async function getGscConnectionsByUserId(supabaseUserId: string) {
  return await db
    .select()
    .from(gscConnections)
    .where(eq(gscConnections.supabaseUserId, supabaseUserId))
    .orderBy(desc(gscConnections.connectedAt));
}

export async function getGscConnectionById(id: number, supabaseUserId: string) {
  const [connection] = await db
    .select()
    .from(gscConnections)
    .where(and(eq(gscConnections.id, id), eq(gscConnections.supabaseUserId, supabaseUserId)))
    .limit(1);

  return connection;
}

export async function getActiveGscConnections(supabaseUserId: string) {
  return await db
    .select()
    .from(gscConnections)
    .where(and(
      eq(gscConnections.supabaseUserId, supabaseUserId),
      eq(gscConnections.isActive, true)
    ))
    .orderBy(desc(gscConnections.lastSyncDate));
}

export async function updateGscConnection(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    accessToken: string;
    refreshToken: string;
    tokenExpiry: Date;
    isActive: boolean;
    syncFrequency: 'daily' | 'weekly' | 'manual';
    lastSyncDate: Date;
    totalKeywordsTracked: number;
    averagePosition: number;
  }>
) {
  await db
    .update(gscConnections)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(gscConnections.id, id), eq(gscConnections.supabaseUserId, supabaseUserId)));
}

export async function deleteGscConnection(id: number, supabaseUserId: string) {
  await db
    .delete(gscConnections)
    .where(and(eq(gscConnections.id, id), eq(gscConnections.supabaseUserId, supabaseUserId)));
}

// Website Data Cleanup Functions
export async function deleteUserWebsiteData(supabaseUserId: string): Promise<{
  websiteAnalysesCount: number;
  competitorAnalysesCount: number;
  competitorMonitoringCount: number;
}> {
  console.log('🗑️ [CLEANUP] Starting website data cleanup for user:', supabaseUserId);

  let websiteAnalysesCount = 0;
  let competitorAnalysesCount = 0;
  let competitorMonitoringCount = 0;

  try {
    // Get all website analyses for the user
    const userWebsiteAnalyses = await db
      .select({ id: websiteAnalyses.id })
      .from(websiteAnalyses)
      .where(eq(websiteAnalyses.supabaseUserId, supabaseUserId));

    console.log('📊 [CLEANUP] Found website analyses to delete:', userWebsiteAnalyses.length);

    // Delete website analyses and related data (cascade deletes will handle related tables)
    for (const analysis of userWebsiteAnalyses) {
      // Count competitor analyses associated with this analysis before deletion
      const competitorAnalysesToDelete = await db
        .select({ count: count() })
        .from(competitorAnalyses)
        .where(eq(competitorAnalyses.primaryWebsiteAnalysisId, analysis.id));

      competitorAnalysesCount += competitorAnalysesToDelete[0]?.count || 0;

      // Delete the website analysis (cascade deletes will handle crawled pages and content gaps)
      await db
        .delete(websiteAnalyses)
        .where(and(eq(websiteAnalyses.id, analysis.id), eq(websiteAnalyses.supabaseUserId, supabaseUserId)));

      websiteAnalysesCount += 1;
    }

    // Delete competitor monitoring records
    const deletedMonitoring = await db
      .delete(competitorMonitoring)
      .where(eq(competitorMonitoring.supabaseUserId, supabaseUserId))
      .returning();

    competitorMonitoringCount = deletedMonitoring.length || 0;

    console.log('✅ [CLEANUP] Cleanup completed:', {
      websiteAnalysesCount,
      competitorAnalysesCount,
      competitorMonitoringCount
    });

    return {
      websiteAnalysesCount,
      competitorAnalysesCount,
      competitorMonitoringCount
    };
  } catch (error) {
    console.error('❌ [CLEANUP] Error during website data cleanup:', error);
    throw error;
  }
}

// Agency Analytics Queries
export async function getAgencyDashboardStats(supabaseUserId: string) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const [briefs, tracking, monitoring, connections, calendars, citationResults, profileResults] = await Promise.all([
    db.select({ count: count() }).from(contentBriefs).where(eq(contentBriefs.supabaseUserId, supabaseUserId)),
    db.select({ count: count() }).from(performanceTracking).where(
      and(
        eq(performanceTracking.supabaseUserId, supabaseUserId),
        gte(performanceTracking.syncTimestamp, startDate)
      )
    ),
    db.select({ count: count() }).from(competitorMonitoring).where(
      and(
        eq(competitorMonitoring.supabaseUserId, supabaseUserId),
        eq(competitorMonitoring.isActive, true)
      )
    ),
    db.select({ count: count() }).from(gscConnections).where(
      and(
        eq(gscConnections.supabaseUserId, supabaseUserId),
        eq(gscConnections.isActive, true)
      )
    ),
    db.select({ count: count() }).from(contentCalendars).where(
      and(
        eq(contentCalendars.supabaseUserId, supabaseUserId),
        eq(contentCalendars.status, 'active')
      )
    ),
    db.select({ count: count() }).from(citations).where(
      and(
        eq(citations.supabaseUserId, supabaseUserId),
        eq(citations.status, 'claimed')
      )
    ),
    db.select({ count: count() }).from(businessProfiles).where(eq(businessProfiles.supabaseUserId, supabaseUserId)),
  ]);

  return {
    totalReportsGenerated: 0,
    totalContentBriefs: briefs[0]?.count || 0,
    monthlyTrackingDataPoints: tracking[0]?.count || 0,
    activeCompetitorMonitoring: monitoring[0]?.count || 0,
    activeGscConnections: connections[0]?.count || 0,
    activeContentCalendars: calendars[0]?.count || 0,
    claimedCitations: citationResults[0]?.count || 0,
    businessProfileComplete: profileResults[0]?.count || 0,
  };
}

// Content Calendar CRUD Operations
export async function createContentCalendar(data: {
  supabaseUserId: string;
  calendarData: string;
  year: number;
  industryId?: string;
  location?: string;
  targetAudience?: string;
  contentThemes?: string;
  publishingFrequency?: string;
}) {
  const [calendar] = await db
    .insert(contentCalendars)
    .values({
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return calendar;
}

export async function getContentCalendarsByUserId(supabaseUserId: string, limit = 10, offset = 0) {
  return await db
    .select()
    .from(contentCalendars)
    .where(eq(contentCalendars.supabaseUserId, supabaseUserId))
    .orderBy(desc(contentCalendars.year))
    .limit(limit)
    .offset(offset);
}

export async function getContentCalendarById(id: number, supabaseUserId: string) {
  const [calendar] = await db
    .select()
    .from(contentCalendars)
    .where(and(eq(contentCalendars.id, id), eq(contentCalendars.supabaseUserId, supabaseUserId)))
    .limit(1);

  return calendar;
}

export async function getContentCalendarByYear(supabaseUserId: string, year: number) {
  const [calendar] = await db
    .select()
    .from(contentCalendars)
    .where(and(
      eq(contentCalendars.supabaseUserId, supabaseUserId),
      eq(contentCalendars.year, year)
    ))
    .limit(1);

  return calendar;
}

export async function updateContentCalendar(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    calendarData: string;
    industryId: string;
    location: string;
    targetAudience: string;
    contentThemes: string;
    publishingFrequency: string;
    status: string;
  }>
) {
  await db
    .update(contentCalendars)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(contentCalendars.id, id), eq(contentCalendars.supabaseUserId, supabaseUserId)));
}

export async function deleteContentCalendar(id: number, supabaseUserId: string) {
  await db
    .delete(contentCalendars)
    .where(and(eq(contentCalendars.id, id), eq(contentCalendars.supabaseUserId, supabaseUserId)));
}

// Citations CRUD Operations
export async function createCitation(data: {
  supabaseUserId: string;
  directory: string;
  url?: string;
  status?: string;
  priority?: string;
  businessInfo?: string;
  notes?: string;
  citationType?: string;
  domainAuthority?: number;
}) {
  const [citation] = await db
    .insert(citations)
    .values({
      ...data,
      citationConfidence: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return citation;
}

export async function getCitationsByUserId(
  supabaseUserId: string,
  limit = 50,
  offset = 0,
  filters?: {
    status?: string;
    priority?: string;
    citationType?: string;
    directory?: string;
  }
) {
  const conditions = [eq(citations.supabaseUserId, supabaseUserId)];

  if (filters) {
    if (filters.status) {
      conditions.push(eq(citations.status, filters.status));
    }
    if (filters.priority) {
      conditions.push(eq(citations.priority, filters.priority));
    }
    if (filters.citationType) {
      conditions.push(eq(citations.citationType, filters.citationType));
    }
    if (filters.directory) {
      conditions.push(like(citations.directory, `%${filters.directory}%`));
    }
  }

  return await db
    .select()
    .from(citations)
    .where(and(...conditions))
    .orderBy(desc(citations.domainAuthority), citations.directory)
    .limit(limit)
    .offset(offset);
}

export async function getCitationById(id: number, supabaseUserId: string) {
  const [citation] = await db
    .select()
    .from(citations)
    .where(and(eq(citations.id, id), eq(citations.supabaseUserId, supabaseUserId)))
    .limit(1);

  return citation;
}

export async function updateCitation(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    url: string;
    status: string;
    priority: string;
    businessInfo: string;
    notes: string;
    citationType: string;
    domainAuthority: number;
    citationConfidence: number;
    lastCheckedAt: Date;
    claimedAt: Date;
  }>
) {
  await db
    .update(citations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(citations.id, id), eq(citations.supabaseUserId, supabaseUserId)));
}

export async function deleteCitation(id: number, supabaseUserId: string) {
  await db
    .delete(citations)
    .where(and(eq(citations.id, id), eq(citations.supabaseUserId, supabaseUserId)));
}

export async function getCitationsStats(supabaseUserId: string) {
  const stats = await db
    .select({
      status: citations.status,
      count: count(),
    })
    .from(citations)
    .where(eq(citations.supabaseUserId, supabaseUserId))
    .groupBy(citations.status);

  return stats.reduce((acc, stat) => {
    acc[stat.status || 'unknown'] = stat.count;
    return acc;
  }, {} as Record<string, number>);
}

// Business Profiles CRUD Operations
export async function createBusinessProfile(data: {
  supabaseUserId: string;
  businessName: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  categories?: string;
  geoLat?: number;
  geoLng?: number;
  serviceArea?: string;
  businessHours?: string;
}) {
  const [profile] = await db
    .insert(businessProfiles)
    .values({
      ...data,
      napConsistencyScore: 0,
      profileCompleteness: 0,
      verifiedStatus: 'unverified',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return profile;
}

export async function getBusinessProfileByUserId(supabaseUserId: string) {
  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.supabaseUserId, supabaseUserId))
    .limit(1);

  return profile;
}

export async function getBusinessProfileById(id: number, supabaseUserId: string) {
  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(and(eq(businessProfiles.id, id), eq(businessProfiles.supabaseUserId, supabaseUserId)))
    .limit(1);

  return profile;
}

export async function updateBusinessProfile(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    businessName: string;
    address: string;
    phone: string;
    website: string;
    description: string;
    categories: string;
    geoLat: number;
    geoLng: number;
    serviceArea: string;
    businessHours: string;
    napConsistencyScore: number;
    profileCompleteness: number;
    verifiedStatus: string;
  }>
) {
  await db
    .update(businessProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(businessProfiles.id, id), eq(businessProfiles.supabaseUserId, supabaseUserId)));
}

export async function deleteBusinessProfile(supabaseUserId: string) {
  await db
    .delete(businessProfiles)
    .where(eq(businessProfiles.supabaseUserId, supabaseUserId));
}

export async function searchBusinessProfiles(
  searchQuery: string,
  limit = 20,
  offset = 0
) {
  return await db
    .select({
      id: businessProfiles.id,
      businessName: businessProfiles.businessName,
      address: businessProfiles.address,
      phone: businessProfiles.phone,
      website: businessProfiles.website,
      description: businessProfiles.description,
      categories: businessProfiles.categories,
      verifiedStatus: businessProfiles.verifiedStatus,
      profileCompleteness: businessProfiles.profileCompleteness,
    })
    .from(businessProfiles)
    .where(
      or(
        like(businessProfiles.businessName, `%${searchQuery}%`),
        like(businessProfiles.description, `%${searchQuery}%`),
        like(businessProfiles.categories, `%${searchQuery}%`)
      )
    )
    .orderBy(desc(businessProfiles.profileCompleteness))
    .limit(limit)
    .offset(offset);
}

// Generated Content Queries - using Supabase user IDs
export async function getGeneratedContentByUserId(
  supabaseUserId: string,
  limit = 20,
  offset = 0,
  filters?: {
    contentType?: string;
    status?: string;
    savedTopicId?: number;
  }
) {
  const conditions = [eq(generatedContent.supabaseUserId, supabaseUserId)];

  if (filters) {
    if (filters.contentType) {
      conditions.push(eq(generatedContent.contentType, filters.contentType));
    }
    if (filters.status) {
      conditions.push(eq(generatedContent.status, filters.status));
    }
    if (filters.savedTopicId) {
      conditions.push(eq(generatedContent.savedTopicId, filters.savedTopicId));
    }
  }

  return await db
    .select({
      id: generatedContent.id,
      savedTopicId: generatedContent.savedTopicId,
      contentType: generatedContent.contentType,
      variantNumber: generatedContent.variantNumber,
      title: generatedContent.title,
      content: generatedContent.content,
      htmlContent: generatedContent.htmlContent,
      tone: generatedContent.tone,
      wordCount: generatedContent.wordCount,
      readingTime: generatedContent.readingTime,
      targetKeywords: generatedContent.targetKeywords,
      seoScore: generatedContent.seoScore,
      status: generatedContent.status,
      metadata: generatedContent.metadata,
      createdAt: generatedContent.createdAt,
      updatedAt: generatedContent.updatedAt,
      savedTopic: {
        topic: savedTopics.topic,
        tags: savedTopics.tags,
        businessType: savedTopics.businessType,
        targetAudience: savedTopics.targetAudience,
        location: savedTopics.location
      }
    })
    .from(generatedContent)
    .leftJoin(savedTopics, eq(generatedContent.savedTopicId, savedTopics.id))
    .where(and(...conditions))
    .orderBy(desc(generatedContent.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getGeneratedContentById(id: number, supabaseUserId: string) {
  const [content] = await db
    .select({
      id: generatedContent.id,
      savedTopicId: generatedContent.savedTopicId,
      contentType: generatedContent.contentType,
      variantNumber: generatedContent.variantNumber,
      title: generatedContent.title,
      content: generatedContent.content,
      htmlContent: generatedContent.htmlContent,
      tone: generatedContent.tone,
      additionalContext: generatedContent.additionalContext,
      websiteAnalysisContext: generatedContent.websiteAnalysisContext,
      wordCount: generatedContent.wordCount,
      readingTime: generatedContent.readingTime,
      targetKeywords: generatedContent.targetKeywords,
      seoScore: generatedContent.seoScore,
      status: generatedContent.status,
      metadata: generatedContent.metadata,
      createdAt: generatedContent.createdAt,
      updatedAt: generatedContent.updatedAt,
      publishedAt: generatedContent.publishedAt,
      savedTopic: {
        topic: savedTopics.topic,
        description: savedTopics.description,
        tags: savedTopics.tags,
        businessType: savedTopics.businessType,
        targetAudience: savedTopics.targetAudience,
        location: savedTopics.location,
        tone: savedTopics.tone,
        additionalContext: savedTopics.additionalContext,
        websiteUrl: savedTopics.websiteUrl
      }
    })
    .from(generatedContent)
    .leftJoin(savedTopics, eq(generatedContent.savedTopicId, savedTopics.id))
    .where(and(eq(generatedContent.id, id), eq(generatedContent.supabaseUserId, supabaseUserId)))
    .limit(1);

  return content;
}

export async function getGeneratedContentByTopicId(
  savedTopicId: number,
  supabaseUserId: string,
  limit = 10
) {
  return await db
    .select()
    .from(generatedContent)
    .where(
      and(
        eq(generatedContent.savedTopicId, savedTopicId),
        eq(generatedContent.supabaseUserId, supabaseUserId)
      )
    )
    .orderBy(desc(generatedContent.variantNumber))
    .limit(limit);
}

export async function updateGeneratedContent(
  id: number,
  supabaseUserId: string,
  data: Partial<{
    title: string;
    content: string;
    htmlContent: string;
    status: string;
    seoScore: number;
    metadata: string;
    publishedAt: Date;
  }>
) {
  await db
    .update(generatedContent)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(generatedContent.id, id), eq(generatedContent.supabaseUserId, supabaseUserId)));
}

export async function deleteGeneratedContent(id: number, supabaseUserId: string) {
  await db
    .delete(generatedContent)
    .where(and(eq(generatedContent.id, id), eq(generatedContent.supabaseUserId, supabaseUserId)));
}

export async function getGeneratedContentStats(supabaseUserId: string) {
  const stats = await db
    .select({
      contentType: generatedContent.contentType,
      status: generatedContent.status,
      count: count(),
      totalWords: sum(generatedContent.wordCount),
      avgSeoScore: avg(generatedContent.seoScore),
    })
    .from(generatedContent)
    .where(eq(generatedContent.supabaseUserId, supabaseUserId))
    .groupBy(generatedContent.contentType, generatedContent.status);

  return stats;
}

export async function searchGeneratedContent(
  supabaseUserId: string,
  searchQuery: string,
  limit = 20,
  offset = 0
) {
  const searchConditions = [
    eq(generatedContent.supabaseUserId, supabaseUserId),
    or(
      like(generatedContent.title, `%${searchQuery}%`),
      like(generatedContent.content, `%${searchQuery}%`)
    )
  ];

  return await db
    .select({
      id: generatedContent.id,
      title: generatedContent.title,
      contentType: generatedContent.contentType,
      wordCount: generatedContent.wordCount,
      seoScore: generatedContent.seoScore,
      status: generatedContent.status,
      createdAt: generatedContent.createdAt,
      savedTopic: {
        topic: savedTopics.topic
      }
    })
    .from(generatedContent)
    .leftJoin(savedTopics, eq(generatedContent.savedTopicId, savedTopics.id))
    .where(and(...searchConditions))
    .orderBy(desc(generatedContent.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getGeneratedContentCount(supabaseUserId: string, filters?: {
  contentType?: string;
  status?: string;
  savedTopicId?: number;
}) {
  const conditions = [eq(generatedContent.supabaseUserId, supabaseUserId)];

  if (filters) {
    if (filters.contentType) {
      conditions.push(eq(generatedContent.contentType, filters.contentType));
    }
    if (filters.status) {
      conditions.push(eq(generatedContent.status, filters.status));
    }
    if (filters.savedTopicId) {
      conditions.push(eq(generatedContent.savedTopicId, filters.savedTopicId));
    }
  }

  const [result] = await db
    .select({ count: count() })
    .from(generatedContent)
    .where(and(...conditions));

  return result?.count || 0;
}

// Setup Wizard Queries
export async function getUserSetupWizardStatus(supabaseUserId: string) {
  const [user] = await db
    .select({
      setupWizardCompleted: users.setupWizardCompleted,
      setupProgress: users.setupProgress,
      setupWizardCompletedAt: users.setupWizardCompletedAt,
      primaryWebsiteUrl: users.primaryWebsiteUrl,
      businessName: users.businessName,
      businessDescription: users.businessDescription,
    })
    .from(users)
    .where(eq(users.supabaseId, supabaseUserId))
    .limit(1);

  if (!user) {
    return {
      setupWizardCompleted: false,
      setupProgress: null,
      setupWizardCompletedAt: null,
      primaryWebsiteUrl: null,
      businessName: null,
      businessDescription: null,
    };
  }

  // Parse setup progress if it exists
  let parsedProgress = {
    websiteSetup: false,
    businessInfo: false,
    topicGeneration: false,
  };

  if (user.setupProgress) {
    try {
      parsedProgress = JSON.parse(user.setupProgress);
    } catch (error) {
      console.error('Failed to parse setup progress:', error);
    }
  }

  // Determine completed steps based on actual user data
  const progress = {
    websiteSetup: !!user.primaryWebsiteUrl,
    businessInfo: !!(user.businessName || user.businessDescription),
    topicGeneration: parsedProgress.topicGeneration || false,
  };

  return {
    setupWizardCompleted: !!user.setupWizardCompleted,
    setupProgress: progress,
    setupWizardCompletedAt: user.setupWizardCompletedAt,
    primaryWebsiteUrl: user.primaryWebsiteUrl,
    businessName: user.businessName,
    businessDescription: user.businessDescription,
  };
}
