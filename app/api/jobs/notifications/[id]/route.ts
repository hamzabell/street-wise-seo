/**
 * API route for individual notification management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserId } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { jobNotifications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH /api/jobs/notifications/[id] - Mark notification as read/unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'isRead must be a boolean value' },
        { status: 400 }
      );
    }

    console.log(`📬 [NOTIFICATION API] Updating notification ${notificationId} for user ${supabaseUserId}`);

    // Check if notification exists and belongs to user
    const [notification] = await db
      .select()
      .from(jobNotifications)
      .where(
        and(
          eq(jobNotifications.id, notificationId),
          eq(jobNotifications.supabaseUserId, supabaseUserId)
        )
      )
      .limit(1);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update notification
    const updateData: any = {
      isRead: isRead ? 1 : 0,
      updatedAt: new Date(),
    };

    if (isRead) {
      updateData.readAt = new Date();
    } else {
      updateData.readAt = null;
    }

    await db
      .update(jobNotifications)
      .set(updateData)
      .where(eq(jobNotifications.id, notificationId));

    console.log(`✅ [NOTIFICATION API] Notification ${notificationId} marked as ${isRead ? 'read' : 'unread'}`);

    return NextResponse.json({
      success: true,
      data: {
        id: notificationId,
        isRead,
        message: `Notification marked as ${isRead ? 'read' : 'unread'}`,
      },
    });

  } catch (error) {
    console.error('❌ [NOTIFICATION API] Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    console.log(`🗑️ [NOTIFICATION API] Deleting notification ${notificationId} for user ${supabaseUserId}`);

    // Check if notification exists and belongs to user
    const [notification] = await db
      .select()
      .from(jobNotifications)
      .where(
        and(
          eq(jobNotifications.id, notificationId),
          eq(jobNotifications.supabaseUserId, supabaseUserId)
        )
      )
      .limit(1);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Delete notification
    await db
      .delete(jobNotifications)
      .where(eq(jobNotifications.id, notificationId));

    console.log(`✅ [NOTIFICATION API] Notification ${notificationId} deleted`);

    return NextResponse.json({
      success: true,
      data: {
        id: notificationId,
        message: 'Notification deleted successfully',
      },
    });

  } catch (error) {
    console.error('❌ [NOTIFICATION API] Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}