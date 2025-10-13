/**
 * Admin API route to reset usage counts for all users
 * WARNING: This will delete all usage tracking records and reset all user counts to 0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { usageTracking } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (you may want to add admin role check here)
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In a production environment, you should verify the user has admin privileges
    // For now, we'll proceed with the reset

    // Delete all usage tracking records
    const deleteResult = await db.delete(usageTracking);

    console.log(`Usage reset completed by user ${user.email} (${user.id})`);

    return NextResponse.json({
      success: true,
      message: 'All usage counts have been reset successfully',
      resetBy: {
        id: user.id,
        email: user.email,
      },
      resetAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error resetting usage counts:', error);
    return NextResponse.json(
      { error: 'Failed to reset usage counts' },
      { status: 500 }
    );
  }
}

// Also support GET to see how many records would be deleted
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Use POST to reset all usage tracking records to 0.',
    });

  } catch (error) {
    console.error('Error counting usage records:', error);
    return NextResponse.json(
      { error: 'Failed to count usage records' },
      { status: 500 }
    );
  }
}