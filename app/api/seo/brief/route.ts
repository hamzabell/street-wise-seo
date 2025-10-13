import { NextRequest, NextResponse } from 'next/server';
import { ContentBriefGenerator, ContentBrief } from '@/lib/seo/content-brief-generator';
import { MobileValidator } from '@/lib/seo/mobile-validator';
import { createContentBrief, getSavedTopicById } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';

const generateBriefSchema = z.object({
  savedTopicId: z.number(),
  websiteAnalysisId: z.number().optional(),
  enhanceWithWebsiteData: z.boolean().default(false),
});

const generateStructuredBriefSchema = z.object({
  topic: z.string(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  location: z.string().optional(),
  businessType: z.string().optional(),
  websiteContext: z.object({
    existingTopics: z.array(z.string()).optional(),
    targetKeywords: z.array(z.string()).optional(),
    contentStyle: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    let supabaseUserId: string | null;
    try {
      supabaseUserId = await getSupabaseUserId();
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to generate content briefs' },
        { status: 401 }
      );
    }

    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to generate content briefs' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Check if this is a structured brief request or legacy request
    const isStructuredBrief = body.topic && !body.savedTopicId;

    if (isStructuredBrief) {
      // Handle new structured brief generation
      const validatedData = generateStructuredBriefSchema.parse(body);

      // Generate the structured content brief
      const briefData = await ContentBriefGenerator.generateContentBrief(
        validatedData.topic,
        {
          industry: validatedData.industry,
          targetAudience: validatedData.targetAudience,
          location: validatedData.location,
          businessType: validatedData.businessType,
          websiteContext: validatedData.websiteContext,
        }
      );

      return NextResponse.json({
        success: true,
        brief: briefData,
        type: 'structured',
      });

    } else {
      // Handle legacy brief generation
      const validatedData = generateBriefSchema.parse(body);

      // Verify that the saved topic belongs to the user
      const savedTopic = await getSavedTopicById(validatedData.savedTopicId, supabaseUserId);
      if (!savedTopic) {
        return NextResponse.json(
          { error: 'Saved topic not found or access denied' },
          { status: 404 }
        );
      }

      // Generate the content brief
      let briefData;
      if (validatedData.enhanceWithWebsiteData && validatedData.websiteAnalysisId) {
        briefData = await ContentBriefGenerator.generateEnhancedContentBrief(
          validatedData.savedTopicId,
          validatedData.websiteAnalysisId
        );
      } else {
        briefData = await ContentBriefGenerator.generateContentBriefLegacy(
          validatedData.savedTopicId
        );
      }

      // Validate mobile optimization for the content brief
      const mobileValidation = MobileValidator.validateContentBrief(
        briefData.title,
        briefData.briefContent,
        briefData.suggestedHeadings,
        briefData.targetKeywords
      );

      // Generate mobile preview
      const mobilePreview = MobileValidator.generateMobilePreview({
        title: briefData.title,
        content: briefData.briefContent,
        metaDescription: briefData.briefContent.substring(0, 160).replace(/\n/g, ' ').trim(),
        targetKeywords: briefData.targetKeywords,
        contentType: 'blog'
      });

      // Enhance brief content with mobile optimization recommendations
      const enhancedBriefContent = `${briefData.briefContent}

## Mobile Optimization Analysis

### Overall Mobile Score: ${mobileValidation.overallScore}/100
- **Readability Score**: ${mobileValidation.readabilityScore}/100
- **Voice Search Ready**: ${mobileValidation.voiceSearchOptimization.questionFormat &&
  mobileValidation.voiceSearchOptimization.conversationalTone ? 'Yes' : 'Needs Improvement'}

### Mobile Preview
- **Title Display**: ${mobileValidation.mobilePreview.titleLength}
- **Content Structure**: ${mobileValidation.mobilePreview.contentStructure}
- **Estimated Reading Time**: ${mobilePreview.readingTime} minutes
- **Mobile Scroll Actions**: ${mobilePreview.mobileViewport.estimatedScrolls}

### Key Mobile Recommendations
${mobileValidation.recommendations
  .filter(rec => rec.category === 'critical' || rec.category === 'important')
  .slice(0, 5)
  .map((rec, index) => `${index + 1}. **${rec.issue}**: ${rec.solution}`).join('\n')}
      `.trim();

      // Save the brief to database with mobile optimization data
      const savedBrief = await createContentBrief({
        supabaseUserId,
        savedTopicId: validatedData.savedTopicId,
        title: briefData.title,
        briefContent: enhancedBriefContent,
        suggestedHeadings: JSON.stringify(briefData.suggestedHeadings),
        targetKeywords: JSON.stringify(briefData.targetKeywords),
        wordCountEstimate: briefData.wordCountEstimate,
        internalLinkingSuggestions: JSON.stringify(briefData.internalLinkingSuggestions),
        contentRecommendations: briefData.contentRecommendations,
      });

      return NextResponse.json({
        success: true,
        brief: {
          id: savedBrief.id,
          title: briefData.title,
          briefContent: enhancedBriefContent,
          suggestedHeadings: briefData.suggestedHeadings,
          targetKeywords: briefData.targetKeywords,
          wordCountEstimate: briefData.wordCountEstimate,
          internalLinkingSuggestions: briefData.internalLinkingSuggestions,
          contentRecommendations: briefData.contentRecommendations,
          generatedAt: savedBrief.generatedAt.toISOString(),
        },
        mobileValidation,
        mobilePreview,
        type: 'legacy',
      });
    }

  } catch (error) {
    console.error('Error generating content brief:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle specific error cases
    if (error instanceof Error) {
      // Check for authentication errors
      if (error.message.includes('AuthSessionMissing') ||
          error.message.includes('User not authenticated') ||
          error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in to generate content briefs' },
          { status: 401 }
        );
      }

      if (error.message === 'Saved topic not found') {
        return NextResponse.json(
          { error: 'Saved topic not found' },
          { status: 404 }
        );
      }

      // Check for LemonFox API errors
      if (error.message.includes('LEMONFOX_API_KEY')) {
        return NextResponse.json(
          { error: 'API configuration error - Please contact support' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred while generating the content brief',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const savedTopicId = parseInt(searchParams.get('savedTopicId') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate parameters
    if (savedTopicId > 0) {
      // Get briefs for specific topic
      const { getContentBriefsByTopicId } = await import('@/lib/db/queries');
      const briefs = await getContentBriefsByTopicId(savedTopicId, supabaseUserId);

      const formattedBriefs = briefs.map(brief => ({
        id: brief.id,
        title: brief.title,
        wordCountEstimate: brief.wordCountEstimate,
        generatedAt: brief.generatedAt.toISOString(),
        // Note: We're not returning the full content in the list for performance
        hasContent: !!brief.briefContent
      }));

      return NextResponse.json({
        success: true,
        briefs: formattedBriefs,
        savedTopicId
      });

    } else {
      // Get all briefs for user
      const { getContentBriefsByUserId } = await import('@/lib/db/queries');
      const briefs = await getContentBriefsByUserId(supabaseUserId, limit, offset);

      const formattedBriefs = briefs.map(brief => ({
        id: brief.id,
        title: brief.title,
        topic: brief.topic,
        topicId: brief.topicId,
        wordCountEstimate: brief.wordCountEstimate,
        generatedAt: brief.generatedAt.toISOString(),
        hasContent: true
      }));

      return NextResponse.json({
        success: true,
        briefs: formattedBriefs,
        pagination: {
          limit,
          offset,
          hasMore: briefs.length === limit
        }
      });
    }

  } catch (error) {
    console.error('Error fetching content briefs:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching content briefs' },
      { status: 500 }
    );
  }
}