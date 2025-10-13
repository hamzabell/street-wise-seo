import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserId, getUserPrimaryWebsiteUrl, updateUserPrimaryWebsiteUrl, deleteUserWebsiteData } from '@/lib/db/queries';
import { z } from 'zod';

const websiteUpdateSchema = z.object({
  websiteUrl: z.string().url('Invalid website URL').or(z.literal('')),
  replaceExisting: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's primary website URL
    const primaryWebsiteUrl = await getUserPrimaryWebsiteUrl(supabaseUserId);

    return NextResponse.json({
      success: true,
      data: {
        primaryWebsiteUrl
      }
    });

  } catch (error) {
    console.error('Error fetching primary website URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch primary website URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 [WEBSITE URL] Starting POST request to update website URL');

  try {
    // Get authenticated user
    console.log('🔐 [WEBSITE URL] Authenticating user...');
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      console.log('❌ [WEBSITE URL] Authentication failed - no user ID found');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          details: 'You must be signed in to update your website URL'
        },
        { status: 401 }
      );
    }

    console.log('✅ [WEBSITE URL] User authenticated:', supabaseUserId);

    // Parse and validate request body
    console.log('📥 [WEBSITE URL] Parsing request body...');
    const body = await request.json();
    console.log('📋 [WEBSITE URL] Request body:', {
      websiteUrl: body.websiteUrl || '(empty)',
      replaceExisting: body.replaceExisting || false
    });

    const validatedData = websiteUpdateSchema.parse(body);
    console.log('✅ [WEBSITE URL] Validated data:', validatedData);

    // Check if user already has a primary website URL
    console.log('🔍 [WEBSITE URL] Checking for existing website URL...');
    const existingUrl = await getUserPrimaryWebsiteUrl(supabaseUserId);
    console.log('📝 [WEBSITE URL] Existing URL:', existingUrl || '(none)');

    // Validation: Prevent multiple website URLs without explicit replacement
    if (existingUrl && validatedData.websiteUrl && !validatedData.replaceExisting) {
      console.log('⚠️ [WEBSITE URL] Conflict: User already has a website URL');
      return NextResponse.json(
        {
          success: false,
          error: 'Primary website URL already exists',
          details: 'You already have a primary website URL set. Use replaceExisting=true to replace it, or delete the existing one first.',
          existingUrl,
          requiresAction: 'replace_or_delete'
        },
        { status: 409 }
      );
    }

    // If replacing existing URL with new one, clean up old data
    if (existingUrl && validatedData.websiteUrl && validatedData.replaceExisting) {
      console.log('🔄 [WEBSITE URL] Replacing existing URL and cleaning up old data');
      console.log('🗑️ [WEBSITE URL] Starting data cleanup...');

      try {
        // Clean up existing website data
        const cleanupResult = await deleteUserWebsiteData(supabaseUserId);
        console.log('✅ [WEBSITE URL] Cleanup completed:', cleanupResult);
      } catch (cleanupError) {
        console.error('❌ [WEBSITE URL] Cleanup failed:', cleanupError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to clean up existing website data',
            details: cleanupError instanceof Error ? cleanupError.message : 'Unknown cleanup error',
            originalUrl: existingUrl
          },
          { status: 500 }
        );
      }
    }

    // Update user's primary website URL
    console.log('💾 [WEBSITE URL] Updating primary website URL...');
    try {
      await updateUserPrimaryWebsiteUrl(supabaseUserId, validatedData.websiteUrl);
      console.log('✅ [WEBSITE URL] Database update completed');
    } catch (updateError) {
      console.error('❌ [WEBSITE URL] Database update failed:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save website URL to database',
          details: updateError instanceof Error ? updateError.message : 'Unknown database error',
          attemptedUrl: validatedData.websiteUrl
        },
        { status: 500 }
      );
    }

    // Verify the update
    console.log('🔍 [WEBSITE URL] Verifying update...');
    const verifyUrl = await getUserPrimaryWebsiteUrl(supabaseUserId);
    console.log('📝 [WEBSITE URL] Verification - URL after update:', verifyUrl);

    if (verifyUrl !== validatedData.websiteUrl) {
      console.error('❌ [WEBSITE URL] Verification failed - URL mismatch');
      console.error('❌ [WEBSITE URL] Expected:', validatedData.websiteUrl);
      console.error('❌ [WEBSITE URL] Got:', verifyUrl);
      return NextResponse.json(
        {
          success: false,
          error: 'Verification failed - website URL was not saved correctly',
          details: `Expected "${validatedData.websiteUrl}" but found "${verifyUrl}" in database`,
          attemptedUrl: validatedData.websiteUrl,
          actualUrl: verifyUrl
        },
        { status: 500 }
      );
    }

    console.log('🎉 [WEBSITE URL] Website URL update completed successfully');

    const successMessage = validatedData.websiteUrl
      ? (validatedData.replaceExisting
          ? 'Primary website URL replaced successfully. Previous website data has been removed.'
          : 'Primary website URL saved successfully')
      : 'Primary website URL removed successfully';

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: {
        primaryWebsiteUrl: validatedData.websiteUrl || null
      },
      cleanupResult: existingUrl && validatedData.replaceExisting ? {
        message: 'Previous website data has been cleaned up'
      } : undefined
    });

  } catch (error) {
    console.error('❌ [WEBSITE URL] Unexpected error in POST handler');
    console.error('❌ [WEBSITE URL] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });

    if (error instanceof z.ZodError) {
      console.log('❌ [WEBSITE URL] Validation error:', error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid website URL format',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    // Return more detailed error info for debugging
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while updating your website URL',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🚀 [WEBSITE URL] Starting DELETE request to remove website URL');

  try {
    // Get authenticated user
    console.log('🔐 [WEBSITE URL] Authenticating user for DELETE...');
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      console.log('❌ [WEBSITE URL] Authentication failed - no user ID found');
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          details: 'You must be signed in to delete your website URL'
        },
        { status: 401 }
      );
    }

    console.log('✅ [WEBSITE URL] User authenticated for DELETE:', supabaseUserId);

    // Check if user has a primary website URL
    console.log('🔍 [WEBSITE URL] Checking for existing website URL to delete...');
    const existingUrl = await getUserPrimaryWebsiteUrl(supabaseUserId);
    if (!existingUrl) {
      console.log('❌ [WEBSITE URL] No website URL found to delete');
      return NextResponse.json(
        {
          success: false,
          error: 'No primary website URL found',
          details: 'You do not have a primary website URL set'
        },
        { status: 404 }
      );
    }

    console.log('📝 [WEBSITE URL] Website URL to delete:', existingUrl);

    // Clean up all website data first
    console.log('🗑️ [WEBSITE URL] Starting data cleanup...');
    try {
      const cleanupResult = await deleteUserWebsiteData(supabaseUserId);
      console.log('✅ [WEBSITE URL] Cleanup completed:', cleanupResult);
    } catch (cleanupError) {
      console.error('❌ [WEBSITE URL] Cleanup failed:', cleanupError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to clean up website data',
          details: cleanupError instanceof Error ? cleanupError.message : 'Unknown cleanup error'
        },
        { status: 500 }
      );
    }

    // Remove the primary website URL
    console.log('💾 [WEBSITE URL] Removing primary website URL from user record...');
    try {
      await updateUserPrimaryWebsiteUrl(supabaseUserId, '');
      console.log('✅ [WEBSITE URL] Website URL removal completed');
    } catch (updateError) {
      console.error('❌ [WEBSITE URL] Website URL removal failed:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to remove website URL from database',
          details: updateError instanceof Error ? updateError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }

    // Verify the deletion
    console.log('🔍 [WEBSITE URL] Verifying deletion...');
    const verifyUrl = await getUserPrimaryWebsiteUrl(supabaseUserId);
    console.log('📝 [WEBSITE URL] Verification - URL after deletion:', verifyUrl || '(null)');

    if (verifyUrl) {
      console.error('❌ [WEBSITE URL] Verification failed - URL still exists');
      return NextResponse.json(
        {
          success: false,
          error: 'Verification failed - website URL was not removed correctly',
          details: `Website URL still exists in database: "${verifyUrl}"`
        },
        { status: 500 }
      );
    }

    console.log('🎉 [WEBSITE URL] Website URL deletion completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Primary website URL and all associated data deleted successfully',
      data: {
        primaryWebsiteUrl: null
      }
    });

  } catch (error) {
    console.error('❌ [WEBSITE URL] Unexpected error in DELETE handler');
    console.error('❌ [WEBSITE URL] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while deleting your website URL',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}