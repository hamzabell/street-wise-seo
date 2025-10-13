import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getTeamForUser } from '@/lib/db/queries';
import { activityLogs, ActivityType } from '@/lib/db/schema';
import { db } from '@/lib/db/drizzle';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirect = formData.get('redirect') as string;
    const priceId = formData.get('priceId') as string;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get user's team (if exists) - now using Supabase ID directly
    const team = await getTeamForUser();

    // Log activity using Supabase user ID
    if (team) {
      await db.insert(activityLogs).values({
        teamId: team.id,
        supabaseUserId: data.user.id, // Use Supabase ID directly
        action: ActivityType.SIGN_IN,
      });
    }

    // Handle checkout redirect
    if (redirect === 'checkout' && priceId) {
      if (team) {
        const checkoutUrl = await createCheckoutSession({ team, priceId });
        return NextResponse.json({ url: checkoutUrl });
      } else {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}