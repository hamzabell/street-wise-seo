import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db, generatedContent } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schema for checking content
const checkContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  savedTopicId: z.number().optional(),
  contentType: z.string().min(1, 'Content type is required'),
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
    const validatedData = checkContentSchema.parse(body);

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

    const isSaved = existingContent.length > 0;
    const savedContentId = isSaved ? existingContent[0].id : null;

    return NextResponse.json({
      success: true,
      isSaved,
      savedContentId,
      contentHash,
    });

  } catch (error) {
    console.error('Content check error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check content' },
      { status: 500 }
    );
  }
}