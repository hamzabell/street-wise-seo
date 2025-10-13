import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db, savedTopics, generatedContent, usageTracking } from '@/lib/db';
import { eq, and, desc, count } from 'drizzle-orm';
import { generatePersonalizedContent } from '@/lib/seo/content-generator';
import { trackUsage } from '@/lib/seo/usage-tracker';

const CONTENT_TYPES = {
  blog_post: {
    name: 'Blog Post',
    wordCount: { min: 800, max: 1500 },
    description: 'In-depth article perfect for your website blog'
  },
  social_media: {
    name: 'Social Media Post',
    wordCount: { min: 150, max: 300 },
    description: 'Engaging content for social platforms'
  },
  website_page: {
    name: 'Website Page',
    wordCount: { min: 400, max: 800 },
    description: 'Service page or informational content for your website'
  },
  email: {
    name: 'Email Newsletter',
    wordCount: { min: 300, max: 600 },
    description: 'Email content for your subscriber list'
  },
  google_business_profile: {
    name: 'Google Business Profile Post',
    wordCount: { min: 100, max: 200 },
    description: 'Local-focused content for your Google Business Profile'
  }
};

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

    const body = await request.json();
    const { savedTopicId, contentType, variantCount = 1 } = body;

    // Validate required fields
    if (!savedTopicId || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: savedTopicId, contentType' },
        { status: 400 }
      );
    }

    // Validate content type
    if (!CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]) {
      return NextResponse.json(
        { error: `Invalid content type. Must be one of: ${Object.keys(CONTENT_TYPES).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate variant count (max 5 for performance, 3 for free users)
    const maxVariants = 5;
    const actualVariantCount = Math.min(variantCount, maxVariants);

    // Get the saved topic with all personalization data
    const savedTopic = await db
      .select()
      .from(savedTopics)
      .where(eq(savedTopics.id, savedTopicId))
      .limit(1);

    if (!savedTopic.length) {
      return NextResponse.json(
        { error: 'Saved topic not found' },
        { status: 404 }
      );
    }

    const topic = savedTopic[0];

    // Verify user owns this topic
    if (topic.supabaseUserId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check usage limits (3 variants for free users, unlimited for paid)
    // For now, we'll implement the 3 variant limit
    if (actualVariantCount > 3) {
      // Check if user has exceeded their limit
      const existingContent = await db
        .select({ count: count() })
        .from(generatedContent)
        .where(
          and(
            eq(generatedContent.supabaseUserId, user.id),
            eq(generatedContent.savedTopicId, savedTopicId)
          )
        );

      const currentVariants = Number(existingContent[0]?.count || 0);

      if (currentVariants >= 3) {
        return NextResponse.json(
          {
            error: 'Variant limit exceeded',
            message: 'Free users can generate up to 3 variants per topic. Upgrade to Pro for unlimited variants.',
            currentVariants,
            limit: 3
          },
          { status: 429 }
        );
      }
    }

    // Track usage for content generation
    await trackUsage(user.id, 'generate_content', {
      savedTopicId,
      contentType,
      variantCount: actualVariantCount
    });

    // Generate content variants
    const generatedVariants = [];
    const contentTypeConfig = CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES];

    for (let i = 0; i < actualVariantCount; i++) {
      try {
        const variantNumber = (i + 1);

        // Generate content using AI
        const generatedContentData = await generatePersonalizedContent({
          topic: topic.topic,
          contentType,
          variantNumber,
          tone: (topic.tone as any) || 'professional',
          additionalContext: topic.additionalContext || '',
          websiteAnalysisContext: topic.websiteAnalysisContext ? JSON.parse(topic.websiteAnalysisContext) : null,
          businessType: topic.businessType || undefined,
          targetAudience: topic.targetAudience || undefined,
          location: topic.location || undefined,
          targetWordCount: Math.floor(
            (contentTypeConfig.wordCount.min + contentTypeConfig.wordCount.max) / 2
          ),
          tags: topic.tags ? JSON.parse(topic.tags) : []
        });

        // Calculate reading time (average 200 words per minute)
        const readingTime = Math.ceil(generatedContentData.wordCount / 200);

        // Store in database
        const insertedContent = await db
          .insert(generatedContent)
          .values({
            supabaseUserId: user.id,
            savedTopicId,
            contentType,
            variantNumber,
            title: generatedContentData.title,
            content: generatedContentData.content,
            htmlContent: generatedContentData.htmlContent,
            tone: (topic.tone as any) || 'professional',
            additionalContext: topic.additionalContext || '',
            websiteAnalysisContext: topic.websiteAnalysisContext,
            wordCount: generatedContentData.wordCount,
            readingTime,
            targetKeywords: JSON.stringify(generatedContentData.targetKeywords || []),
            seoScore: generatedContentData.seoScore || 0,
            status: 'draft',
            metadata: JSON.stringify({
              contentType: contentTypeConfig.name,
              generatedAt: new Date().toISOString(),
              aiModel: 'lemonfox',
              generationPrompt: generatedContentData.generationPrompt
            }),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();

        generatedVariants.push({
          id: insertedContent[0].id,
          variantNumber,
          title: generatedContentData.title,
          content: generatedContentData.content,
          htmlContent: generatedContentData.htmlContent,
          wordCount: generatedContentData.wordCount,
          readingTime,
          seoScore: generatedContentData.seoScore || 0,
          targetKeywords: generatedContentData.targetKeywords || [],
          contentType: contentType,
          tone: (topic.tone as any) || 'professional'
        });

      } catch (variantError) {
        console.error(`Error generating variant ${i + 1}:`, variantError);
        // Continue with other variants even if one fails
      }
    }

    if (generatedVariants.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any content variants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        savedTopicId,
        contentType,
        contentTypeConfig,
        variants: generatedVariants,
        totalVariants: generatedVariants.length,
        requestedVariants: actualVariantCount
      },
      usage: {
        variantsGenerated: generatedVariants.length,
        contentType: contentTypeConfig.name
      }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const savedTopicId = searchParams.get('savedTopicId');
    const contentType = searchParams.get('contentType');

    // Build query conditions
    const conditions = [eq(generatedContent.supabaseUserId, user.id)];

    if (savedTopicId) {
      conditions.push(eq(generatedContent.savedTopicId, parseInt(savedTopicId)));
    }

    if (contentType) {
      conditions.push(eq(generatedContent.contentType, contentType));
    }

    const content = await db
      .select()
      .from(generatedContent)
      .where(and(...conditions))
      .orderBy(desc(generatedContent.createdAt));

    return NextResponse.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}