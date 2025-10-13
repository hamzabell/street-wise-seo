/**
 * API route for generating customer questions
 * Optimized for voice search and local queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateCustomerQuestions, QuestionGenerationRequestSchema } from '@/lib/seo/question-generator';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Verify user session
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = QuestionGenerationRequestSchema.parse(body);

    console.log('🎯 [API:QUESTIONS] Question generation request:', {
      supabaseUserId: user.id,
      topic: validatedRequest.topic,
      industryId: validatedRequest.industryId,
      targetAudience: validatedRequest.targetAudience,
      location: validatedRequest.location,
      maxQuestions: validatedRequest.maxQuestions
    });

    // Generate customer questions
    const result = await generateCustomerQuestions(validatedRequest);

    console.log('✅ [API:QUESTIONS] Question generation completed:', {
      totalQuestions: result.questions.length,
      voiceSearchOptimized: result.metadata.voiceSearchOptimized,
      localIntentHigh: result.metadata.localIntentHigh,
      categories: result.metadata.categories
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ [API:QUESTIONS] Error generating questions:', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate questions';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint for retrieving question generation history or templates
export async function GET(request: NextRequest) {
  try {
    // Verify user session
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'templates') {
      // Return question templates based on industry
      const industryId = searchParams.get('industryId');

      const templates = {
        how_to: [
          'How do I {action} for my {business_type}?',
          'What are the steps to {action} properly?',
          'Can you help me {action} step by step?',
          'What\'s the best way to {action} in {location}?'
        ],
        what_is: [
          'What is {concept} and why does it matter?',
          'Can you explain {concept} in simple terms?',
          'What does {concept} mean for {business_type}?',
          'How does {concept} affect my {business_type}?'
        ],
        where_can: [
          'Where can I find {service} near me?',
          'What\'s the best place to get {service} in {location}?',
          'Where should I look for {service} providers?',
          'Can you recommend {service} companies in {location}?'
        ],
        why_does: [
          'Why does my {system} keep {problem}?',
          'What causes {issue} in {business_type}?',
          'Why is {concept} important for my success?',
          'What are the reasons behind {problem}?'
        ],
        emergency: [
          'I need emergency {service} right now, who can help?',
          'What should I do if {emergency_situation}?',
          'Where can I get urgent {service} assistance?',
          'Help! My {system} is {problem}, what now?'
        ]
      };

      return NextResponse.json({
        success: true,
        data: {
          templates,
          industryId: industryId || 'general'
        }
      });
    }

    if (action === 'categories') {
      // Return available question categories with descriptions
      const categories = {
        how_to: {
          name: 'How To',
          description: 'Step-by-step guidance and instructions',
          icon: '📋',
          examples: [
            'How do I fix a leaky faucet?',
            'What are the steps to maintain my HVAC system?',
            'Can you help me troubleshoot my electrical issue?'
          ]
        },
        what_is: {
          name: 'What Is',
          description: 'Definitions and explanations of concepts',
          icon: '❓',
          examples: [
            'What is hydro-jetting and when do I need it?',
            'Can you explain SEER rating for air conditioners?',
            'What does GFCI protection mean for my home?'
          ]
        },
        where_can: {
          name: 'Where Can',
          description: 'Location-based service searches',
          icon: '📍',
          examples: [
            'Where can I find an emergency plumber near me?',
            'What\'s the best HVAC service company in Austin?',
            'Where should I look for reliable electricians?'
          ]
        },
        why_does: {
          name: 'Why Does',
          description: 'Problem explanations and root causes',
          icon: '🔍',
          examples: [
            'Why does my water heater make strange noises?',
            'What causes my lights to flicker randomly?',
            'Why does my AC unit keep tripping the breaker?'
          ]
        },
        emergency: {
          name: 'Emergency',
          description: 'Urgent situations and immediate help',
          icon: '🚨',
          examples: [
            'I need emergency plumbing help right now!',
            'What should I do if my power is out?',
            'Help! My basement is flooding, who can help?'
          ]
        }
      };

      return NextResponse.json({
        success: true,
        data: { categories }
      });
    }

    // Default response for invalid actions
    return NextResponse.json(
      { error: 'Invalid action. Use ?action=templates or ?action=categories' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ [API:QUESTIONS] Error in GET request:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}