import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db, generatedContent, savedTopics } from '@/lib/db';
import { eq, and, desc, like, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for saving content
const saveContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  htmlContent: z.string().optional(),
  contentType: z.string().min(1, 'Content type is required'),
  tone: z.string().min(1, 'Tone is required'),
  targetKeywords: z.array(z.string()).default([]),
  seoScore: z.number().min(0).max(100).default(0),
  wordCount: z.number().min(0).default(0),
  readingTime: z.number().min(0).default(0),
  savedTopicId: z.number().optional(),
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
    const validatedData = saveContentSchema.parse(body);

    // Get the next available variant number for this content type and topic
    let variantNumber = 1;
    if (validatedData.savedTopicId) {
      const lastVariant = await db
        .select({ variantNumber: generatedContent.variantNumber })
        .from(generatedContent)
        .where(
          and(
            eq(generatedContent.supabaseUserId, user.id),
            eq(generatedContent.savedTopicId, validatedData.savedTopicId),
            eq(generatedContent.contentType, validatedData.contentType)
          )
        )
        .orderBy(desc(generatedContent.variantNumber))
        .limit(1);

      if (lastVariant.length > 0) {
        variantNumber = lastVariant[0].variantNumber + 1;
      }
    }

    // Create new content entry
    const newContent = await db
      .insert(generatedContent)
      .values({
        supabaseUserId: user.id,
        savedTopicId: validatedData.savedTopicId || null,
        contentType: validatedData.contentType,
        variantNumber,
        title: validatedData.title,
        content: validatedData.content,
        htmlContent: validatedData.htmlContent || null,
        tone: validatedData.tone,
        wordCount: validatedData.wordCount,
        readingTime: validatedData.readingTime,
        targetKeywords: JSON.stringify(validatedData.targetKeywords),
        seoScore: validatedData.seoScore,
        status: 'draft',
        metadata: JSON.stringify({}),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Parse JSON fields for the response
    const formattedContent = {
      ...newContent[0],
      targetKeywords: JSON.parse(newContent[0].targetKeywords || '[]'),
      metadata: JSON.parse(newContent[0].metadata || '{}'),
    };

    return NextResponse.json({
      success: true,
      message: 'Content saved to library successfully',
      data: formattedContent,
    });

  } catch (error) {
    console.error('Content save error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save content' },
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
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const savedTopicId = searchParams.get('savedTopicId');
    const contentType = searchParams.get('contentType');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query conditions
    const conditions = [eq(generatedContent.supabaseUserId, user.id)];

    if (savedTopicId) {
      conditions.push(eq(generatedContent.savedTopicId, parseInt(savedTopicId)));
    }

    if (contentType) {
      conditions.push(eq(generatedContent.contentType, contentType));
    }

    if (status) {
      conditions.push(eq(generatedContent.status, status));
    }

    if (search) {
      conditions.push(like(generatedContent.title, `%${search}%`));
    }

    // Build base query
    const query = db
      .select({
        id: generatedContent.id,
        savedTopicId: generatedContent.savedTopicId,
        contentType: generatedContent.contentType,
        variantNumber: generatedContent.variantNumber,
        title: generatedContent.title,
        content: generatedContent.content,
        htmlContent: generatedContent.htmlContent,
        tone: generatedContent.tone,
        wordCount: generatedContent.wordCount,
        readingTime: generatedContent.readingTime,
        targetKeywords: generatedContent.targetKeywords,
        seoScore: generatedContent.seoScore,
        status: generatedContent.status,
        metadata: generatedContent.metadata,
        createdAt: generatedContent.createdAt,
        updatedAt: generatedContent.updatedAt,
        savedTopic: {
          topic: savedTopics.topic,
          tags: savedTopics.tags,
          businessType: savedTopics.businessType,
          targetAudience: savedTopics.targetAudience,
          location: savedTopics.location
        }
      })
      .from(generatedContent)
      .leftJoin(savedTopics, eq(generatedContent.savedTopicId, savedTopics.id))
      .where(and(...conditions));

    // Get total count for pagination
    const countQuery = db
      .select({ count: sql`count(${generatedContent.id})`.mapWith(Number) })
      .from(generatedContent)
      .where(eq(generatedContent.supabaseUserId, user.id));

    const totalCountResult = await countQuery;
    const totalCount = Number(totalCountResult[0]?.count || 0);

    // Apply pagination and ordering
    const content = await query
      .orderBy(desc(generatedContent.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Parse JSON fields for each content item
    const formattedContent = content.map(item => ({
      ...item,
      targetKeywords: item.targetKeywords ? JSON.parse(item.targetKeywords) : [],
      metadata: item.metadata ? JSON.parse(item.metadata) : {},
      savedTopic: item.savedTopic ? {
        ...item.savedTopic,
        tags: item.savedTopic.tags ? JSON.parse(item.savedTopic.tags) : []
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: formattedContent,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('📚 [GET] Content list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, title, content, htmlContent, status } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // Check if content exists and belongs to user
    const existingContent = await db
      .select()
      .from(generatedContent)
      .where(
        and(
          eq(generatedContent.id, id),
          eq(generatedContent.supabaseUserId, user.id)
        )
      )
      .limit(1);

    if (!existingContent.length) {
      return NextResponse.json(
        { error: 'Content not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    if (status !== undefined) updateData.status = status;

    // Update content
    const updatedContent = await db
      .update(generatedContent)
      .set(updateData)
      .where(eq(generatedContent.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent[0]
    });

  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  try {
    console.log('🗑️ [DELETE] Starting content deletion', {
      timestamp: new Date().toISOString()
    });

    // Get authenticated user
    const user = await getUser();
    console.log('🗑️ [DELETE] User authentication:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });

    if (!user) {
      console.log('🗑️ [DELETE] Authentication failed - returning 401');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.log('🗑️ [DELETE] Missing ID parameter');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id'
        },
        { status: 400 }
      );
    }

    const contentId = parseInt(id);
    if (isNaN(contentId)) {
      console.log('🗑️ [DELETE] Invalid ID format:', id);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid content ID format'
        },
        { status: 400 }
      );
    }

    // Check if content exists and belongs to user
    const existingContent = await db
      .select({
        id: generatedContent.id,
        title: generatedContent.title,
        supabaseUserId: generatedContent.supabaseUserId,
        createdAt: generatedContent.createdAt
      })
      .from(generatedContent)
      .where(
        and(
          eq(generatedContent.id, contentId),
          eq(generatedContent.supabaseUserId, user.id)
        )
      )
      .limit(1);

    console.log('🗑️ [DELETE] Content existence check:', {
      requestedId: contentId,
      userId: user.id,
      contentFound: existingContent.length > 0,
      contentDetails: existingContent.length > 0 ? {
        id: existingContent[0].id,
        title: existingContent[0].title,
        contentUserId: existingContent[0].supabaseUserId,
        createdAt: existingContent[0].createdAt
      } : null
    });

    if (!existingContent.length) {
      console.log('🗑️ [DELETE] Content not found or access denied');
      return NextResponse.json(
        {
          success: false,
          error: 'Content not found or access denied'
        },
        { status: 404 }
      );
    }

    // Perform the deletion with verification
    console.log('🗑️ [DELETE] Attempting to delete content:', contentId);

    const deleteResult = await db
      .delete(generatedContent)
      .where(eq(generatedContent.id, contentId));

    console.log('🗑️ [DELETE] Database deletion completed');

    // Verify the deletion was successful
    const verificationResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(generatedContent)
      .where(eq(generatedContent.id, contentId))
      .limit(1);

    const stillExists = verificationResult[0]?.count > 0;

    if (stillExists) {
      console.error('🗑️ [DELETE] CRITICAL: Content still exists after deletion attempt');
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete content - please try again'
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log('🗑️ [DELETE] Content deletion successful:', {
      contentId,
      deletedTitle: existingContent[0].title,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
      data: {
        deletedId: contentId,
        deletedTitle: existingContent[0].title
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('🗑️ [DELETE] Content deletion error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete content due to server error'
      },
      { status: 500 }
    );
  }
}