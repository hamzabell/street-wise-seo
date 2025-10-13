#!/usr/bin/env tsx

import { db } from '../lib/db/drizzle';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '../lib/supabase/server';

/**
 * Script to clean up orphaned website URLs and fix database inconsistencies
 * Run with: npx tsx scripts/cleanup-website-url.ts
 */

async function cleanupWebsiteUrls() {
  console.log('🧹 Starting website URL cleanup process...');

  try {
    // Get all users from the database
    const allUsers = await db
      .select({
        id: users.id,
        supabaseId: users.supabaseId,
        email: users.email,
        name: users.name,
        primaryWebsiteUrl: users.primaryWebsiteUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users);

    console.log(`📊 Found ${allUsers.length} users in local database`);

    // Check for users with suspicious website URLs
    const suspiciousUsers = allUsers.filter(user =>
      user.primaryWebsiteUrl &&
      (user.primaryWebsiteUrl.includes('clickup.com') ||
       user.primaryWebsiteUrl.trim() === '' ||
       user.primaryWebsiteUrl === 'undefined')
    );

    console.log(`⚠️  Found ${suspiciousUsers.length} users with suspicious website URLs:`);

    for (const user of suspiciousUsers) {
      console.log(`  - User ID: ${user.id}, Email: ${user.email}, URL: "${user.primaryWebsiteUrl}"`);
    }

    // Check if users exist in Supabase but not in local database
    const supabase = await createClient();
    const { data: supabaseUsers } = await supabase.auth.admin.listUsers();

    console.log(`🔐 Found ${supabaseUsers.users.length} users in Supabase`);

    const supabaseIds = supabaseUsers.users.map(u => u.id);
    const localUserIds = allUsers.map(u => u.supabaseId);

    const missingInLocal = supabaseIds.filter(id => !localUserIds.includes(id));

    if (missingInLocal.length > 0) {
      console.log(`❗ Found ${missingInLocal.length} users in Supabase but missing from local database`);
      console.log('  Missing Supabase IDs:', missingInLocal.slice(0, 3)); // Show first 3
    }

    // Clean up suspicious website URLs
    if (suspiciousUsers.length > 0) {
      console.log('🧹 Cleaning up suspicious website URLs...');

      for (const user of suspiciousUsers) {
        console.log(`  🗑️  Removing website URL for user ${user.email}...`);

        const result = await db
          .update(users)
          .set({
            primaryWebsiteUrl: '',
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));

        console.log(`  ✅ Updated 1 record for user ${user.email}`);
      }
    }

    // Verify cleanup
    const remainingUsers = await db
      .select({
        id: users.id,
        email: users.email,
        primaryWebsiteUrl: users.primaryWebsiteUrl
      })
      .from(users)
      .where(eq(users.primaryWebsiteUrl, 'www.clickup.com'));

    console.log(`🔍 After cleanup: ${remainingUsers.length} users still have clickup.com as URL`);

    console.log('✅ Website URL cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupWebsiteUrls().then(() => {
  console.log('🎉 Cleanup script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Cleanup script failed:', error);
  process.exit(1);
});