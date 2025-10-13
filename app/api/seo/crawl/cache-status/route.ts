/**
 * API route for checking website crawl cache status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser, getSupabaseUserId } from '@/lib/db/queries';
import { isWebsiteRecentlyCrawled } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Extract domain from URL
    let domain: string;
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname.replace('www.', '');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check cache status
    const cacheStatus = await isWebsiteRecentlyCrawled(domain, user.id, 30);

    return NextResponse.json({
      success: true,
      data: {
        ...cacheStatus,
        lastCrawledAt: cacheStatus.lastCrawledAt?.toISOString() || null,
      },
    });

  } catch (error) {
    console.error('Error checking cache status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}