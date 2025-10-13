import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserId, getWebsiteAnalysisStatus } from '@/lib/db/queries';

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

    console.log('🔍 [WEBSITE STATUS] Fetching status for user:', supabaseUserId);

    // Get website analysis status
    const status = await getWebsiteAnalysisStatus(supabaseUserId);

    console.log('📊 [WEBSITE STATUS] Status result:', {
      hasPrimaryWebsite: status.hasPrimaryWebsite,
      primaryWebsiteUrl: status.primaryWebsiteUrl,
      hasBeenAnalyzed: status.hasBeenAnalyzed,
      lastAnalysisDate: status.lastAnalysisDate,
      analysisCount: status.analysisCount
    });

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error fetching website analysis status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch website analysis status' },
      { status: 500 }
    );
  }
}