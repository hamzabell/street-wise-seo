/**
 * API route for fetching individual saved SEO topics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getSavedTopicById, deleteSavedTopic } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get topic ID from params
    const params = await context.params;
    const topicId = parseInt(params.id);
    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    // Fetch the topic from database
    const topic = await getSavedTopicById(topicId, user.id);
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Parse tags JSON and format the response
    const processedTopic = {
      ...topic,
      suggestedTags: topic.tags ? JSON.parse(topic.tags) : [],
      relevanceScore: undefined, // Could be calculated if needed
    };

    return NextResponse.json({
      success: true,
      data: processedTopic
    });

  } catch (error) {
    console.error('Error fetching saved topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get topic ID from params
    const params = await context.params;
    const topicId = parseInt(params.id);
    if (isNaN(topicId)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    // Delete the topic
    await deleteSavedTopic(topicId, user.id);

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting saved topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}