'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email address...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setMessage('Failed to confirm email. Please try again or sign in.');
          return;
        }

        // Get the current session after email confirmation
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setStatus('error');
          setMessage('Failed to get session after email confirmation.');
          return;
        }

        if (session) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to dashboard...');

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Email confirmation failed. Please try signing in again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during email confirmation.');
        console.error('Email confirmation error:', error);
      }
    };

    confirmEmail();
  }, [supabase, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <Image
              src="/logo.svg"
              alt="StreetWise SEO"
              width={180}
              height={40}
              className="h-16 w-auto"
            />
            <div className="absolute -bottom-2 -right-2">
              {status === 'loading' && <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
              {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {status === 'loading' && 'Confirming Email'}
          {status === 'success' && 'Email Confirmed'}
          {status === 'error' && 'Confirmation Failed'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {message}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {status === 'error' && (
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/sign-in')}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Go to Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/sign-up')}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Create New Account
            </Button>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              You will be redirected to your dashboard automatically.
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Go to Dashboard Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Image
              src="/logo.svg"
              alt="StreetWise SEO"
              width={180}
              height={40}
              className="h-16 w-auto"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}