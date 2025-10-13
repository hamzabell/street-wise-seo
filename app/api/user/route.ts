import { getUser, getTeamForUser } from '@/lib/db/queries';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().optional(),
  businessDescription: z.string().optional(),
  businessCategories: z.string().optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessZipCode: z.string().optional(),
  businessCountry: z.string().optional(),
  businessLatitude: z.number().optional(),
  businessLongitude: z.number().optional(),
});

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    // Get user's team to access subscription status
    const team = await getTeamForUser();

    const userWithSubscription = {
      ...user,
      subscriptionStatus: team?.subscriptionStatus || null,
      planName: team?.planName || null,
      stripeCustomerId: team?.stripeCustomerId || null,
    };

    return Response.json({ data: userWithSubscription });
  } catch (error) {
    console.error('Error in user API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = UpdateUserSchema.parse(body);

    // Update user profile
    const updatedUser = await db
      .update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.supabaseId, user.id))
      .returning();

    if (!updatedUser.length) {
      return Response.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: updatedUser[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);

    if (error instanceof z.ZodError) {
      return Response.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
