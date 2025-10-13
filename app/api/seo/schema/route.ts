/**
 * API route for generating Local Business Schema
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getSupabaseUserId } from '@/lib/db/queries';
import {
  generateEnhancedBusinessSchema,
  generateJsonLdScript,
  validateSchema,
  BusinessInfoSchema,
  extractBusinessInfoFromMetadata
} from '@/lib/seo/schema-generator';
import { trackUserAction } from '@/lib/db/queries';

// Request validation schema
const GenerateSchemaRequestSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  telephone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.object({
    streetAddress: z.string().min(1, 'Street address is required'),
    addressLocality: z.string().min(1, 'City is required'),
    addressRegion: z.string().min(2, 'State/Region is required'),
    postalCode: z.string().min(5, 'Postal code is required'),
    addressCountry: z.string().min(2, 'Country is required').default('US'),
  }),
  geo: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  openingHours: z.array(z.string()).optional(),
  serviceArea: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  priceRange: z.string().max(4).optional(),
  serviceCategories: z.array(z.string()).optional(),
  paymentAccepted: z.array(z.string()).optional(),
  languagesSpoken: z.array(z.string()).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().min(1).optional(),
  ratingValue: z.number().min(1).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  industryId: z.string().optional(), // For industry-specific optimizations
  generateJsonLd: z.boolean().default(true), // Whether to generate HTML script tag
  format: z.enum(['json', 'html']).default('json'), // Response format
});

// Rate limiting configuration
const RATE_LIMITS = {
  requests: 20, // requests per hour
  window: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(userId: string): Promise<{ allowed: boolean; resetTime?: number }> {
  const now = Date.now();
  const userKey = `schema_${userId}`;
  const existing = rateLimitStore.get(userKey);

  if (existing) {
    if (now > existing.resetTime) {
      // Reset the window
      rateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMITS.window });
      return { allowed: true };
    } else if (existing.count >= RATE_LIMITS.requests) {
      return { allowed: false, resetTime: existing.resetTime };
    } else {
      existing.count++;
      return { allowed: true };
    }
  } else {
    rateLimitStore.set(userKey, { count: 1, resetTime: now + RATE_LIMITS.window });
    return { allowed: true };
  }
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

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = GenerateSchemaRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const requestData = validationResult.data;

    // Track the generation attempt
    await trackUserAction(user.id, 'generate_schema_attempt', {
      businessName: requestData.businessName,
      businessType: requestData.businessType,
      industryId: requestData.industryId,
    });

    try {
      // Generate the schema
      const schema = generateEnhancedBusinessSchema(
        {
          businessName: requestData.businessName,
          businessType: requestData.businessType,
          description: requestData.description,
          websiteUrl: requestData.websiteUrl,
          telephone: requestData.telephone,
          email: requestData.email,
          address: requestData.address,
          geo: requestData.geo,
          openingHours: requestData.openingHours,
          serviceArea: requestData.serviceArea,
          keywords: requestData.keywords,
          priceRange: requestData.priceRange,
          serviceCategories: requestData.serviceCategories,
          paymentAccepted: requestData.paymentAccepted,
          languagesSpoken: requestData.languagesSpoken,
          foundedYear: requestData.foundedYear,
          employeeCount: requestData.employeeCount,
          ratingValue: requestData.ratingValue,
          reviewCount: requestData.reviewCount,
        },
        requestData.industryId
      );

      // Validate the generated schema
      const validation = validateSchema(schema);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: 'Generated schema validation failed',
            validationErrors: validation.errors
          },
          { status: 400 }
        );
      }

      // Track successful generation
      await trackUserAction(user.id, 'generate_schema', {
        businessName: requestData.businessName,
        businessType: requestData.businessType,
        industryId: requestData.industryId,
        schemaType: schema['@type'],
      });

      // Prepare response based on requested format
      let responsePayload: any = {
        success: true,
        data: {
          schema,
          validation,
        }
      };

      if (requestData.generateJsonLd) {
        responsePayload.data.jsonLdScript = generateJsonLdScript(schema);
      }

      if (requestData.format === 'html') {
        // Return HTML format for direct embedding
        return new NextResponse(generateJsonLdScript(schema), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
          }
        });
      }

      return NextResponse.json(responsePayload);

    } catch (error) {
      console.error('Schema generation failed:', error);

      // Track the failure
      await trackUserAction(user.id, 'generate_schema_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        businessName: requestData.businessName,
      });

      return NextResponse.json(
        { error: 'Failed to generate schema. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unexpected error in schema generation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'extract-from-metadata') {
      // Extract business info from recent topic generation
      const metadataParam = searchParams.get('metadata');
      if (!metadataParam) {
        return NextResponse.json(
          { error: 'Metadata parameter is required' },
          { status: 400 }
        );
      }

      try {
        const metadata = JSON.parse(decodeURIComponent(metadataParam));
        const businessInfo = extractBusinessInfoFromMetadata(metadata);

        return NextResponse.json({
          success: true,
          data: {
            businessInfo,
            message: 'Business information extracted from metadata. Please complete the remaining fields.'
          }
        });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid metadata format' },
          { status: 400 }
        );
      }
    }

    // Return usage information
    await trackUserAction(user.id, 'get_schema_usage', {});
    const dailyGenerations = 0; // TODO: Implement actual usage tracking

    return NextResponse.json({
      success: true,
      data: {
        rateLimits: {
          maxRequests: RATE_LIMITS.requests,
          window: RATE_LIMITS.window,
          currentUsage: dailyGenerations || 0,
          remaining: Math.max(0, RATE_LIMITS.requests - (dailyGenerations || 0))
        },
        supportedFormats: ['json', 'html'],
        options: {
          generateJsonLd: true,
          validate: true,
          optimizeForIndustry: true
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET schema API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}