import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserId } from '@/lib/db/queries';
import { updateUserBusinessInfo, getUserBusinessInfo } from '@/lib/db/queries';
import { z } from 'zod';

const BusinessInfoSchema = z.object({
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().optional(),
  businessDescription: z.string().optional(),
  businessCategories: z.array(z.string()).optional(),
  businessCity: z.string().optional(),
  businessState: z.string().optional(),
  businessZipCode: z.string().optional(),
  businessCountry: z.string().optional(),
  businessLatitude: z.number().optional(),
  businessLongitude: z.number().optional(),
});

// GET - Fetch business information
export async function GET() {
  try {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const businessInfo = await getUserBusinessInfo(supabaseUserId);

    return NextResponse.json({
      success: true,
      data: businessInfo
    });
  } catch (error) {
    console.error('Error fetching business info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Update business information
export async function POST(request: NextRequest) {
  try {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = BusinessInfoSchema.parse(body);

    await updateUserBusinessInfo(supabaseUserId, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Business information updated successfully'
    });
  } catch (error) {
    console.error('Error updating business info:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}