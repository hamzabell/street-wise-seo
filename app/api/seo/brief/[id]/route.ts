import { NextRequest, NextResponse } from 'next/server';
import { getContentBriefById, deleteContentBrief } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const briefId = parseInt(id);
    if (isNaN(briefId)) {
      return NextResponse.json(
        { error: 'Invalid brief ID' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the brief
    const brief = await getContentBriefById(briefId, supabaseUserId);
    if (!brief) {
      return NextResponse.json(
        { error: 'Content brief not found or access denied' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    let suggestedHeadings: string[] = [];
    let targetKeywords: string[] = [];
    let internalLinkingSuggestions: string[] = [];

    try {
      suggestedHeadings = brief.suggestedHeadings ? JSON.parse(brief.suggestedHeadings) : [];
    } catch (error) {
      console.error('Error parsing suggested headings:', error);
    }

    try {
      targetKeywords = brief.targetKeywords ? JSON.parse(brief.targetKeywords) : [];
    } catch (error) {
      console.error('Error parsing target keywords:', error);
    }

    try {
      internalLinkingSuggestions = brief.internalLinkingSuggestions ? JSON.parse(brief.internalLinkingSuggestions) : [];
    } catch (error) {
      console.error('Error parsing internal linking suggestions:', error);
    }

    return NextResponse.json({
      success: true,
      brief: {
        id: brief.id,
        title: brief.title,
        briefContent: brief.briefContent,
        suggestedHeadings,
        targetKeywords,
        wordCountEstimate: brief.wordCountEstimate,
        internalLinkingSuggestions,
        contentRecommendations: brief.contentRecommendations,
        generatedAt: brief.generatedAt.toISOString(),
        savedTopicId: brief.savedTopicId
      }
    });

  } catch (error) {
    console.error('Error fetching content brief:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the content brief' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const briefId = parseInt(id);
    if (isNaN(briefId)) {
      return NextResponse.json(
        { error: 'Invalid brief ID' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the brief
    await deleteContentBrief(briefId, supabaseUserId);

    return NextResponse.json({
      success: true,
      message: 'Content brief deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting content brief:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the content brief' },
      { status: 500 }
    );
  }
}