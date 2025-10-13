/**
 * API route for fetching and managing saved SEO topics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import {
  getSavedTopicsByUserId,
  deleteSavedTopic,
  searchSavedTopics,
  getSavedTopicsCount
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    console.log('🔍 [SAVED TOPICS] User from getUser():', user?.id, user?.email);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const difficulty = searchParams.get('difficulty')?.split(',') as ('easy' | 'medium' | 'hard')[] | undefined;
    const competition = searchParams.get('competition')?.split(',') as ('low' | 'medium' | 'high')[] | undefined;
    const minVolume = searchParams.get('minVolume') ? parseInt(searchParams.get('minVolume')!) : undefined;
    const maxVolume = searchParams.get('maxVolume') ? parseInt(searchParams.get('maxVolume')!) : undefined;

    let topics;
    let totalCount;

    if (search.trim()) {
      // Use search functionality
      console.log('🔍 [SAVED TOPICS] Using search with query:', search);
      topics = await searchSavedTopics(user.id, search, limit, offset);
      // For search, we'll use a simple count (could be optimized with a searchCount function)
      totalCount = topics.length;
    } else {
      // Use filtered fetch
      const filters = {
        difficulty,
        competitionLevel: competition,
        minSearchVolume: minVolume,
        maxSearchVolume: maxVolume,
      };
      console.log('🔍 [SAVED TOPICS] Using filters for user:', user.id, 'filters:', filters);

      topics = await getSavedTopicsByUserId(user.id, limit, offset, filters);
      console.log('🔍 [SAVED TOPICS] Raw topics from DB:', topics.length, topics);
      totalCount = await getSavedTopicsCount(user.id);
      console.log('🔍 [SAVED TOPICS] Total count:', totalCount);
    }

    // Parse tags JSON for each topic
    const processedTopics = topics.map(topic => ({
      ...topic,
      suggestedTags: topic.tags ? JSON.parse(topic.tags) : [],
      relevanceScore: undefined, // Could be calculated if needed
    }));

    return NextResponse.json({
      success: true,
      data: processedTopics,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
      filters: {
        search,
        difficulty,
        competition,
        minVolume,
        maxVolume,
      },
    });

  } catch (error) {
    console.error('Error fetching saved topics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get topic ID from query parameters or request body
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('id');

    if (!topicId) {
      // If no ID in query params, check request body
      try {
        const body = await request.json();
        if (!body.id) {
          return NextResponse.json(
            { error: 'Topic ID is required' },
            { status: 400 }
          );
        }
        // Delete using body ID
        await deleteSavedTopic(parseInt(body.id), user.id);
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid request body or missing topic ID' },
          { status: 400 }
        );
      }
    } else {
      // Delete using query param ID
      await deleteSavedTopic(parseInt(topicId), user.id);
    }

    // Get updated count
    const newCount = await getSavedTopicsCount(user.id);

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully',
      data: {
        totalSaved: newCount,
      }
    });

  } catch (error) {
    console.error('Error deleting saved topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}