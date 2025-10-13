/**
 * API route for storing and retrieving business information for schema generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser, getSupabaseUserId } from '@/lib/db/queries';
import { updateUserBusinessInfo, getUserBusinessInfo, trackUserAction } from '@/lib/db/queries';

// Request validation schema for storing business info
const StoreBusinessInfoRequestSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessAddress: z.string().min(1, 'Business address is required'),
  businessPhone: z.string().min(10, 'Valid phone number is required'),
  businessWebsite: z.string().url('Invalid website URL').optional().or(z.literal('')),
  businessDescription: z.string().min(10, 'Description must be at least 10 characters long'),
  businessCategories: z.array(z.string()).optional(),
  businessCity: z.string().min(1, 'City is required'),
  businessState: z.string().min(2, 'State is required'),
  businessZipCode: z.string().min(5, 'Postal code is required'),
  businessCountry: z.string().min(2, 'Country is required').default('US'),
  businessLatitude: z.number().min(-90).max(90).optional(),
  businessLongitude: z.number().min(-180).max(180).optional(),
});

type StoreBusinessInfoRequest = z.infer<typeof StoreBusinessInfoRequestSchema>;

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
    const validationResult = StoreBusinessInfoRequestSchema.safeParse(body);

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
    const supabaseUserId = await getSupabaseUserId();

    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unable to identify user' },
        { status: 400 }
      );
    }

    // Track the storage attempt
    await trackUserAction(supabaseUserId, 'store_business_info_attempt', {
      businessName: requestData.businessName,
      hasWebsite: !!requestData.businessWebsite,
      hasCoordinates: !!(requestData.businessLatitude && requestData.businessLongitude),
    });

    try {
      // Store business information
      await updateUserBusinessInfo(supabaseUserId, {
        businessName: requestData.businessName,
        businessAddress: requestData.businessAddress,
        businessPhone: requestData.businessPhone,
        businessWebsite: requestData.businessWebsite,
        businessDescription: requestData.businessDescription,
        businessCategories: requestData.businessCategories,
        businessCity: requestData.businessCity,
        businessState: requestData.businessState,
        businessZipCode: requestData.businessZipCode,
        businessCountry: requestData.businessCountry,
        businessLatitude: requestData.businessLatitude,
        businessLongitude: requestData.businessLongitude,
      });

      // Track successful storage
      await trackUserAction(supabaseUserId, 'store_business_info', {
        businessName: requestData.businessName,
        hasWebsite: !!requestData.businessWebsite,
        hasCoordinates: !!(requestData.businessLatitude && requestData.businessLongitude),
      });

      return NextResponse.json({
        success: true,
        message: 'Business information stored successfully',
        data: {
          businessName: requestData.businessName,
          businessAddress: requestData.businessAddress,
          businessPhone: requestData.businessPhone,
          businessWebsite: requestData.businessWebsite,
          businessCity: requestData.businessCity,
          businessState: requestData.businessState,
          businessCountry: requestData.businessCountry,
        }
      });

    } catch (error) {
      console.error('Failed to store business information:', error);

      // Track the failure
      await trackUserAction(supabaseUserId, 'store_business_info_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        businessName: requestData.businessName,
      });

      return NextResponse.json(
        { error: 'Failed to store business information. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unexpected error in business info API:', error);
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

    const supabaseUserId = await getSupabaseUserId();

    if (!supabaseUserId) {
      return NextResponse.json(
        { error: 'Unable to identify user' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'get-stored-info') {
      // Retrieve stored business information
      try {
        const businessInfo = await getUserBusinessInfo(supabaseUserId);

        if (!businessInfo) {
          return NextResponse.json({
            success: true,
            data: null,
            message: 'No business information stored yet'
          });
        }

        // Track the retrieval
        await trackUserAction(supabaseUserId, 'get_business_info', {
          hasStoredInfo: true,
          hasWebsite: !!businessInfo.businessWebsite,
          hasCoordinates: !!(businessInfo.businessLatitude && businessInfo.businessLongitude),
        });

        return NextResponse.json({
          success: true,
          data: businessInfo,
          message: 'Business information retrieved successfully'
        });

      } catch (error) {
        console.error('Failed to retrieve business information:', error);
        return NextResponse.json(
          { error: 'Failed to retrieve business information' },
          { status: 500 }
        );
      }
    }

    // Default response: usage information
    return NextResponse.json({
      success: true,
      data: {
        supportedActions: ['get-stored-info'],
        availableFields: [
          'businessName',
          'businessAddress',
          'businessPhone',
          'businessWebsite',
          'businessDescription',
          'businessCategories',
          'businessCity',
          'businessState',
          'businessZipCode',
          'businessCountry',
          'businessLatitude',
          'businessLongitude',
        ]
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET business info API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}