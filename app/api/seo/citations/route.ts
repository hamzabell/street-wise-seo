import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { citationHelper, BusinessInfo, CitationOpportunity, CitationReport } from '@/lib/seo/citation-helper';
import { getUser } from '@/lib/db/queries';
import { getUserBusinessInfo } from '@/lib/db/queries';

// Schema for business information input
const BusinessInfoSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  website: z.string().url('Invalid website URL'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Schema for citation opportunity updates
const CitationUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(['claimed', 'unclaimed', 'needs_update', 'not_applicable']),
  notes: z.string().optional(),
});

// Schema for search options
const SearchOptionsSchema = z.object({
  categories: z.array(z.string()).optional(),
  difficulty: z.array(z.string()).optional(),
  includePaid: z.boolean().optional(),
  location: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// GET /api/seo/citations - Retrieve citation opportunities or report
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Get user's business information
    const userInfo = await getUserBusinessInfo(user.id);

    // Extract business info from user profile or use defaults
    const businessInfo: BusinessInfo = {
      name: userInfo?.businessName || user.user_metadata?.name || user.email?.split('@')[0] || '',
      address: userInfo?.businessAddress || '',
      phone: userInfo?.businessPhone || '',
      website: userInfo?.businessWebsite || '',
      description: userInfo?.businessDescription || '',
      categories: userInfo?.businessCategories || [],
      city: userInfo?.businessCity || '',
      state: userInfo?.businessState || '',
      zipCode: userInfo?.businessZipCode || '',
      country: userInfo?.businessCountry || '',
      latitude: userInfo?.businessLatitude || undefined,
      longitude: userInfo?.businessLongitude || undefined,
    };

    if (!businessInfo.name || !businessInfo.address || !businessInfo.phone) {
      return NextResponse.json({
        error: 'Business information incomplete',
        message: 'Please complete your business profile first'
      }, { status: 400 });
    }

    if (type === 'report') {
      // Generate comprehensive citation report
      const options = {
        categories: searchParams.get('categories')?.split(','),
        difficulty: searchParams.get('difficulty')?.split(','),
        includePaid: searchParams.get('includePaid') === 'true',
        location: searchParams.get('location') || undefined,
      };

      const report: CitationReport = citationHelper.generateCitationReport(
        businessInfo,
        [], // TODO: Load existing citations from database
        options
      );

      return NextResponse.json({
        success: true,
        data: report,
      });

    } else {
      // Get citation opportunities
      const options = {
        categories: searchParams.get('categories')?.split(','),
        difficulty: searchParams.get('difficulty')?.split(','),
        includePaid: searchParams.get('includePaid') === 'true',
        location: searchParams.get('location') || undefined,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0'),
      };

      const opportunities = citationHelper.findCitationOpportunities(businessInfo, options);

      // Apply pagination
      const paginatedOpportunities = opportunities.slice(
        options.offset,
        options.offset + options.limit
      );

      return NextResponse.json({
        success: true,
        data: {
          opportunities: paginatedOpportunities,
          total: opportunities.length,
          hasMore: options.offset + options.limit < opportunities.length,
        },
      });
    }

  } catch (error) {
    console.error('Citation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/seo/citations - Find citation opportunities
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = BusinessInfoSchema.parse(body);

    // Extract search options if provided
    const options = {
      categories: body.categories,
      difficulty: body.difficulty,
      includePaid: body.includePaid !== false, // Default to true
      location: body.location,
    };

    // Find citation opportunities
    const opportunities = citationHelper.findCitationOpportunities(validatedData, options);

    // Generate NAP consistency check
    const napCheck = citationHelper.checkNapConsistency(validatedData);

    return NextResponse.json({
      success: true,
      data: {
        opportunities,
        napConsistency: napCheck,
        totalFound: opportunities.length,
        businessInfo: validatedData,
      },
    });

  } catch (error) {
    console.error('Citation POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/seo/citations - Update citation status
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    if (action === 'update_status') {
      // Validate input
      const validatedData = CitationUpdateSchema.parse(data);

      // TODO: Update citation status in database
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: 'Citation status updated successfully',
        data: validatedData,
      });

    } else if (action === 'bulk_update') {
      // Handle bulk updates
      const { citationIds, status, notes } = data;

      if (!Array.isArray(citationIds) || citationIds.length === 0) {
        return NextResponse.json({
          error: 'Invalid citation IDs',
        }, { status: 400 });
      }

      // TODO: Bulk update citations in database
      return NextResponse.json({
        success: true,
        message: `${citationIds.length} citations updated successfully`,
        data: {
          updatedCount: citationIds.length,
          status,
        },
      });

    } else {
      return NextResponse.json({
        error: 'Invalid action',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Citation PUT error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/seo/citations - Export citations
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const citationIds = searchParams.get('ids')?.split(',');

    // Get user's business information
    const userInfo = await getUserBusinessInfo(user.id);

    const businessInfo: BusinessInfo = {
      name: userInfo?.businessName || user.user_metadata?.name || user.email?.split('@')[0] || '',
      address: userInfo?.businessAddress || '',
      phone: userInfo?.businessPhone || '',
      website: userInfo?.businessWebsite || '',
      description: userInfo?.businessDescription || '',
      categories: userInfo?.businessCategories || [],
      city: userInfo?.businessCity || '',
      state: userInfo?.businessState || '',
      zipCode: userInfo?.businessZipCode || '',
      country: userInfo?.businessCountry || '',
      latitude: userInfo?.businessLatitude || undefined,
      longitude: userInfo?.businessLongitude || undefined,
    };

    // Get all opportunities
    const allOpportunities = citationHelper.findCitationOpportunities(businessInfo);

    // Filter by IDs if provided
    const opportunities = citationIds
      ? allOpportunities.filter(c => citationIds.includes(c.id))
      : allOpportunities;

    // Export data
    const exportData = citationHelper.exportCitations(opportunities, format as 'csv' | 'json');

    // Return appropriate response format
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: JSON.parse(exportData),
        filename: `citations-${new Date().toISOString().split('T')[0]}.json`,
      });
    } else {
      return new NextResponse(exportData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="citations-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

  } catch (error) {
    console.error('Citation DELETE (export) error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}