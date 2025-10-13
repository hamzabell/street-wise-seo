import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      // Don't log error for missing session - this is normal during initial load
      if (error && !error.message.includes('Auth session missing')) {
        console.error('Error getting session:', error);
      }
      return null;
    }

    return session;
  } catch (error) {
    // Handle any other errors gracefully
    console.error('Unexpected error in getSession:', error);
    return null;
  }
}

export async function getUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Don't log error for missing session - this is normal during initial load
      if (error && !error.message.includes('Auth session missing')) {
        console.error('Error getting user:', error);
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
