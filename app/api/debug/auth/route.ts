import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG AUTH] Starting authentication debug');

    // Try to get the user
    const user = await getUser();

    console.log('🔍 [DEBUG AUTH] User result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userMetadata: user?.user_metadata
    });

    // Check cookies
    const cookies = request.cookies.getAll();
    console.log('🔍 [DEBUG AUTH] Available cookies:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));

    // Check environment variables
    console.log('🔍 [DEBUG AUTH] Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
    });

    return NextResponse.json({
      success: true,
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      } : null,
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });

  } catch (error) {
    console.error('🔍 [DEBUG AUTH] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}