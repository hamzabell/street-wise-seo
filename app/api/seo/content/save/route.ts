import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db, generatedContent, savedTopics } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

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

// Function to create a content hash for deduplication
function createContentHash(title: string, content: string, savedTopicId?: number, contentType?: string): string {
  const data = `${title}|${content}|${savedTopicId || ''}|${contentType || ''}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

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

    // Create hash for the content
    const contentHash = createContentHash(
      validatedData.title,
      validatedData.content,
      validatedData.savedTopicId,
      validatedData.contentType
    );

    // Check if content with this hash already exists for this user
    const existingContent = await db
      .select({ id: generatedContent.id })
      .from(generatedContent)
      .where(
        and(
          eq(generatedContent.supabaseUserId, user.id),
          eq(generatedContent.metadata, JSON.stringify({ contentHash }))
        )
      )
      .limit(1);

    if (existingContent.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Content already exists in your library',
        existingContentId: existingContent[0].id,
        isDuplicate: true,
      }, { status: 409 }); // 409 Conflict
    }

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
        metadata: JSON.stringify({ contentHash }),
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