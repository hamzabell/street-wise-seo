/**
 * API route for saving SEO topics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { createSavedTopic, isTopicSaved, getSavedTopicsCount, trackUserAction } from '@/lib/db/queries';
import { USAGE_LIMITS } from '@/lib/seo/utils';
import { z } from 'zod';

const SaveTopicSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  searchVolume: z.number().int().min(0).optional(),
  competitionLevel: z.enum(['low', 'medium', 'high']).optional(),
  sourceGenerationId: z.number().int().optional(),
  // Enhanced personalization fields
  businessType: z.string().optional(),
  targetAudience: z.string().optional(),
  location: z.string().optional(),
  detailedLocation: z.any().optional(), // JSON object with enhanced location data
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'conversational', 'humorous', 'inspirational']).optional(),
  additionalContext: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

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
    const validatedData = SaveTopicSchema.parse(body);

    // Check if topic is already saved
    const alreadySaved = await isTopicSaved(user.id, validatedData.topic);
    if (alreadySaved) {
      return NextResponse.json(
        { error: 'Topic already saved' },
        { status: 409 }
      );
    }

    // Check user's saved topics limit
    const userPlan = 'FREE'; // In a real app, this would come from user's subscription
    const limits = USAGE_LIMITS[userPlan];
    const currentSavedCount = await getSavedTopicsCount(user.id);

    if (limits.savedTopics > 0 && currentSavedCount >= limits.savedTopics) {
      return NextResponse.json(
        {
          error: 'Saved topics limit reached',
          limit: limits.savedTopics,
          current: currentSavedCount
        },
        { status: 429 }
      );
    }

    // Prepare tags for storage
    const tagsString = validatedData.tags && validatedData.tags.length > 0
      ? JSON.stringify(validatedData.tags)
      : undefined;

    // Process website URL for context if provided
    let websiteAnalysisContext = null;
    if (validatedData.websiteUrl) {
      try {
        // In a real implementation, you would analyze the website here
        // For now, we'll store a placeholder
        websiteAnalysisContext = JSON.stringify({
          url: validatedData.websiteUrl,
          brandVoice: validatedData.tone || 'professional',
          keyPhrases: [],
          services: [],
          aboutInfo: `Website analysis for ${validatedData.websiteUrl}`
        });
      } catch (error) {
        console.error('Website analysis failed:', error);
      }
    }

    // Prepare enhanced location data for storage
    const detailedLocationString = validatedData.detailedLocation
      ? JSON.stringify(validatedData.detailedLocation)
      : undefined;

    // Save the topic with enhanced personalization fields
    const savedTopic = await createSavedTopic({
      supabaseUserId: user.id,
      topic: validatedData.topic,
      description: validatedData.description,
      tags: tagsString,
      difficulty: validatedData.difficulty,
      searchVolume: validatedData.searchVolume,
      competitionLevel: validatedData.competitionLevel,
      sourceGenerationId: validatedData.sourceGenerationId,
      businessType: validatedData.businessType,
      targetAudience: validatedData.targetAudience,
      location: validatedData.location,
      detailedLocation: detailedLocationString,
      tone: validatedData.tone,
      additionalContext: validatedData.additionalContext,
      websiteUrl: validatedData.websiteUrl,
      websiteAnalysisContext: websiteAnalysisContext || undefined
    });

    // Track the save action
    await trackUserAction(user.id, 'save_topic', {
      topicId: savedTopic.id,
      topic: validatedData.topic,
      difficulty: validatedData.difficulty,
      searchVolume: validatedData.searchVolume,
      businessType: validatedData.businessType,
      targetAudience: validatedData.targetAudience,
      location: validatedData.location,
    });

    return NextResponse.json({
      success: true,
      message: 'Topic saved successfully',
      data: {
        id: savedTopic.id,
        topic: savedTopic.topic,
        savedAt: savedTopic.savedAt,
        totalSaved: currentSavedCount + 1,
        remainingSaved: Math.max(0, limits.savedTopics - (currentSavedCount + 1)),
      }
    });

  } catch (error) {
    console.error('Error saving topic:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}