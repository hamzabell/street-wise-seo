/**
 * API route for fetching detailed topic information
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/lib/db/queries';
import { getLemonfoxClient } from '@/lib/seo/lemonfox-client';

// Request validation schema
const TopicDetailsRequestSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long'),
  businessType: z.string().min(2, 'Business type is required'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  location: z.string().optional(),
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
    const validationResult = TopicDetailsRequestSchema.safeParse(body);

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

    const { topic, businessType, targetAudience, location } = validationResult.data;

    // Get LemonFox client
    const lemonfoxClient = getLemonfoxClient();

    // Generate detailed topic information
    try {
      const detailedInfo = await lemonfoxClient.generateDetailedTopicInfo(
        topic,
        businessType,
        targetAudience,
        location
      );

      return NextResponse.json({
        success: true,
        data: detailedInfo
      });

    } catch (error) {
      console.error('Failed to generate detailed topic info:', error);

      // Return enhanced fallback data if API fails
      const locationModifier = location ? ` in ${location}` : '';
      const businessContext = `${businessType} businesses${locationModifier}`;

      return NextResponse.json({
        success: true,
        data: {
          description: `A strategic guide to ${topic} specifically designed for ${businessContext} targeting ${targetAudience}. This comprehensive approach combines industry best practices with actionable insights that deliver measurable business results and address real-world challenges.`,
          contentBrief: `This in-depth topic covers: 1) Key challenges and opportunities in ${topic} for ${businessContext}, 2) Step-by-step implementation strategies tailored for ${targetAudience} with specific timelines and milestones, 3) Measurable metrics and KPIs to track success and ROI, 4) Common pitfalls and how to avoid them with real examples, 5) Industry-specific case studies and success stories, 6) Tools and resources for efficient execution and automation, 7) Long-term maintenance strategies and optimization techniques.`,
          contentAngle: `Focus on a data-driven approach that combines ${businessType} industry expertise with practical ${targetAudience} insights, highlighting measurable ROI and competitive advantages that generic content often overlooks. This unique perspective addresses specific pain points and provides actionable solutions that can be implemented immediately.`,
          estimatedTimeToWrite: '3-4 hours',
          competitorAnalysis: `Most competitors provide generic ${topic} advice that lacks ${businessType} industry specificity. This topic stands out by focusing on data-driven strategies with measurable outcomes, addressing the specific challenges that ${targetAudience} faces, and providing practical implementation guidance that delivers real business value rather than theoretical concepts.`,
          keywordInsights: [
            `Primary: "${topic} for ${businessContext}" - high commercial intent targeting decision-makers with specific solutions`,
            `Secondary: "how to ${topic.toLowerCase()} for ${targetAudience}" - informational intent addressing specific pain points and challenges`,
            `Long-tail: "${topic} strategies that improve [specific business outcome]" - problem-solving with measurable results and ROI focus`,
            location ? `Local: "${topic} ${location} ${businessType}" - geo-targeted commercial intent for regional market dominance` : `Industry: "${businessType} ${topic} best practices and benchmarks" - industry-specific authority building`,
            `Implementation: "${topic} step-by-step guide for ${targetAudience}" - practical execution with clear milestones`
          ],
          relatedTopics: [
            `Advanced ${topic} strategies for ${businessType} growth and scaling`,
            `Measuring ROI from ${topic} initiatives for ${targetAudience} success stories`,
            `${topic} automation and scaling techniques for ${businessContext}`,
            `Common ${topic} mistakes that cost ${businessType} businesses money and time`,
            `Integrating ${topic} with existing ${businessType} workflows and systems`,
            `${topic} case studies: Successful ${targetAudience} implementations`,
            `Future trends in ${topic} for ${businessContext} competitive advantage`
          ]
        }
      });
    }

  } catch (error) {
    console.error('Unexpected error in topic details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}