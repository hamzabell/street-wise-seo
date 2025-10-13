import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const SetupProgressSchema = z.object({
  setupWizardCompleted: z.boolean().optional(),
  setupProgress: z.string().optional(),
});

// GET - Fetch setup progress
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const [userRecord] = await db
      .select({
        setupWizardCompleted: users.setupWizardCompleted,
        setupProgress: users.setupProgress,
        setupWizardCompletedAt: users.setupWizardCompletedAt,
        primaryWebsiteUrl: users.primaryWebsiteUrl,
        businessName: users.businessName,
        businessDescription: users.businessDescription,
      })
      .from(users)
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (!userRecord) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // Parse setup progress if it exists
    let parsedProgress = {
      websiteSetup: false,
      businessInfo: false,
      topicGeneration: false,
    };

    if (userRecord.setupProgress) {
      try {
        parsedProgress = JSON.parse(userRecord.setupProgress);
      } catch (error) {
        console.error('Failed to parse setup progress:', error);
      }
    }

    // Determine completed steps based on actual data
    const progress = {
      websiteSetup: !!userRecord.primaryWebsiteUrl,
      businessInfo: !!(userRecord.businessName || userRecord.businessDescription),
      topicGeneration: parsedProgress.topicGeneration || false,
    };

    const response = {
      data: {
        setupWizardCompleted: !!userRecord.setupWizardCompleted,
        setupProgress: progress,
        setupWizardCompletedAt: userRecord.setupWizardCompletedAt,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching setup progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update setup progress
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = SetupProgressSchema.parse(body);

    // First check if user exists in local database
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.supabaseId, user.id))
      .limit(1);

    if (!existingUser) {
      // Create user record if it doesn't exist
      const supabaseUser = await getUser();
      if (!supabaseUser) {
        return NextResponse.json({ error: 'Failed to get user details' }, { status: 400 });
      }

      await db.insert(users).values({
        supabaseId: user.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        setupWizardCompleted: validatedData.setupWizardCompleted || false,
        setupProgress: validatedData.setupProgress,
        setupWizardCompletedAt: validatedData.setupWizardCompleted ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // Update existing user record
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (validatedData.setupWizardCompleted !== undefined) {
        updateData.setupWizardCompleted = validatedData.setupWizardCompleted;
        updateData.setupWizardCompletedAt = validatedData.setupWizardCompleted ? new Date() : null;
      }

      if (validatedData.setupProgress !== undefined) {
        updateData.setupProgress = validatedData.setupProgress;
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.supabaseId, user.id));
    }

    return NextResponse.json({
      success: true,
      message: 'Setup progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating setup progress:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}