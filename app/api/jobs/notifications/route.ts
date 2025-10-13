/**
 * API route for job notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserId } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { jobNotifications } from '@/lib/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';

// GET /api/jobs/notifications - Get user's job notifications
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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    console.log(`📬 [NOTIFICATIONS API] Fetching notifications for user ${supabaseUserId}`);

    // Build query
    let whereConditions = [eq(jobNotifications.supabaseUserId, supabaseUserId)];

    if (unreadOnly) {
      whereConditions.push(eq(jobNotifications.isRead, false));
    }

    // Get notifications
    const notifications = await db
      .select()
      .from(jobNotifications)
      .where(and(...whereConditions))
      .orderBy(desc(jobNotifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform notifications for response
    const transformedNotifications = notifications.map(notification => ({
      id: notification.id,
      jobId: notification.jobId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: Boolean(notification.isRead),
      autoDismiss: Boolean(notification.autoDismiss),
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() || null,
      dismissAt: notification.dismissAt?.toISOString() || null,
    }));

    // Get unread count
    const unreadCount = await db
      .select({ count: jobNotifications.id })
      .from(jobNotifications)
      .where(
        and(
          eq(jobNotifications.supabaseUserId, supabaseUserId),
          eq(jobNotifications.isRead, false)
        )
      );

    console.log(`✅ [NOTIFICATIONS API] Retrieved ${notifications.length} notifications (${unreadCount.length} unread)`);

    return NextResponse.json({
      success: true,
      data: {
        notifications: transformedNotifications,
        unreadCount: unreadCount.length,
        pagination: {
          limit,
          offset,
          total: notifications.length,
          hasMore: notifications.length === limit,
        },
      },
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS API] Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/notifications - Create new notification or mark all as read
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'mark-all-read') {
      console.log(`📬 [NOTIFICATIONS API] Marking all notifications as read for user ${supabaseUserId}`);

      await db
        .update(jobNotifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(jobNotifications.supabaseUserId, supabaseUserId),
            eq(jobNotifications.isRead, false)
          )
        );

      console.log(`✅ [NOTIFICATIONS API] All notifications marked as read`);

      return NextResponse.json({
        success: true,
        data: {
          message: 'All notifications marked as read',
        },
      });
    }

    // Create new notification
    const body = await request.json();
    console.log('📥 [NOTIFICATIONS API] Creating new notification:', body);

    // Validate required fields
    if (!body.type || !body.title || !body.message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    const notificationData = {
      supabaseUserId,
      jobId: body.jobId || null,
      type: body.type,
      title: body.title,
      message: body.message,
      isRead: false,
      autoDismiss: body.autoDismiss || false,
      actionUrl: body.actionUrl || null,
      actionText: body.actionText || null,
      createdAt: new Date(),
    };

    const [notification] = await db
      .insert(jobNotifications)
      .values(notificationData)
      .returning();

    console.log(`✅ [NOTIFICATIONS API] Notification created: ${notification.id}`);

    return NextResponse.json({
      success: true,
      data: {
        notification: {
          id: notification.id,
          ...notificationData,
          createdAt: notification.createdAt.toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('❌ [NOTIFICATIONS API] Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}