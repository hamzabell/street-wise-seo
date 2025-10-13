import { NextRequest, NextResponse } from 'next/server';
import { MobileValidator, ValidationInput } from '@/lib/seo/mobile-validator';
import { getSupabaseUserId } from '@/lib/db/queries';
import { z } from 'zod';

const validationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  metaDescription: z.string().optional(),
  targetKeywords: z.array(z.string()).optional(),
  contentType: z.enum(['blog', 'landing', 'product', 'service', 'general']).default('general'),
});

const contentBriefValidationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  briefContent: z.string().min(1, 'Brief content is required'),
  suggestedHeadings: z.array(z.string()),
  targetKeywords: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Check if this is a content brief validation or general content validation
    const isContentBriefValidation = 'briefContent' in body && 'suggestedHeadings' in body;

    let validationData;

    if (isContentBriefValidation) {
      // Validate content brief format
      const validatedData = contentBriefValidationSchema.parse(body);

      // Generate meta description from brief content if not provided
      const metaDescription = body.metaDescription ||
        validatedData.briefContent.substring(0, 160).replace(/\n/g, ' ').trim();

      validationData = {
        title: validatedData.title,
        content: validatedData.briefContent,
        metaDescription,
        targetKeywords: validatedData.targetKeywords,
        contentType: 'blog' as const
      };
    } else {
      // Validate general content format
      const validatedData = validationSchema.parse(body);
      validationData = validatedData;
    }

    // Perform mobile validation
    const validationResult = MobileValidator.validateContent(validationData);

    // Generate mobile preview
    const mobilePreview = MobileValidator.generateMobilePreview(validationData);

    return NextResponse.json({
      success: true,
      validation: validationResult,
      mobilePreview,
      metadata: {
        validatedAt: new Date().toISOString(),
        contentLength: validationData.content.length,
        titleLength: validationData.title.length,
        metaDescriptionLength: validationData.metaDescription?.length || 0,
        wordCount: validationData.content.split(/\s+/).filter(w => w.length > 0).length,
      }
    });

  } catch (error) {
    console.error('Error validating mobile content:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while validating mobile content' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for mobile validation statistics and health check
 */
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

    // Return validation service information
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'health') {
      return NextResponse.json({
        success: true,
        service: 'Mobile Content Validator',
        version: '1.0.0',
        features: [
          'Readability scoring',
          'Mobile preview generation',
          'Voice search optimization analysis',
          'Content structure analysis',
          'Recommendation engine'
        ],
        validationCriteria: {
          titleLength: { min: 30, max: 60, optimal: 40-55 },
          metaDescription: { min: 120, max: 160, optimal: 140-155 },
          sentenceLength: { max: 20, optimal: 12-18 },
          paragraphLength: { max: 5, optimal: 2-4 }
        }
      });
    }

    // Return basic service info
    return NextResponse.json({
      success: true,
      service: 'Mobile Content Validator API',
      endpoints: {
        POST: '/api/seo/validate - Validate content for mobile optimization',
        GET: '/api/seo/validate?action=health - Get service health and features'
      }
    });

  } catch (error) {
    console.error('Error in mobile validation GET endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}