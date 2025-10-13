/**
 * Content Brief Templates Generator for SEO Tool
 * Turns topic ideas into actionable content plans
 */

import { getLemonfoxClient } from './lemonfox-client';
import { cleanAIResponse, extractCleanJson } from './markdown-parser';
import { getSavedTopicById, getCrawledPagesByAnalysisId, getWebsiteAnalysisById } from '@/lib/db/queries';
import { getSupabaseUserId } from '@/lib/db/queries';

export interface ContentBrief {
  topic: string;
  outline: {
    introduction: string;
    keyPoints: string[];
    conclusion: string;
  };
  wordCountRecommendation: 'short' | 'medium' | 'long';
  seoChecklist: {
    titleSuggestion: string;
    metaDescription: string;
    internalLinking: string[];
    callToAction: string;
  };
  mobileOptimization: {
    readabilityScore: number;
    voiceSearchReady: boolean;
    paragraphsCount: number;
  };
}

export interface ContentBriefData {
  title: string;
  briefContent: string;
  suggestedHeadings: string[];
  targetKeywords: string[];
  wordCountEstimate: number;
  internalLinkingSuggestions: string[];
  contentRecommendations: string;
}

export interface ContentBriefGenerationOptions {
  industry?: string;
  targetAudience?: string;
  location?: string;
  businessType?: string;
  websiteContext?: {
    existingTopics?: string[];
    targetKeywords?: string[];
    contentStyle?: string;
  };
}

export class ContentBriefGenerator {
  /**
   * Generate a comprehensive content brief from a topic
   */
  static async generateContentBrief(
    topic: string,
    options: ContentBriefGenerationOptions = {}
  ): Promise<ContentBrief> {
    const client = getLemonfoxClient();

    const systemPrompt = `You are an expert content strategist and SEO specialist who creates detailed, actionable content briefs for service businesses.

Your content briefs must be:
- SPECIFIC and actionable, not generic advice
- Focused on business outcomes and customer value
- Optimized for both search engines and user experience
- Mobile-first and voice search ready
- Structured for easy content creation

CRITICAL REQUIREMENTS:
- Return VALID JSON only, no markdown formatting
- All string values must be in double quotes
- Ensure all suggestions are practical and specific to service businesses
- Focus on helping businesses attract and convert customers
- Make content actionable with clear, measurable outcomes`;

    const prompt = `Generate a comprehensive content brief for:

TOPIC: ${topic}
${options.businessType ? `BUSINESS TYPE: ${options.businessType}` : ''}
${options.targetAudience ? `TARGET AUDIENCE: ${options.targetAudience}` : ''}
${options.industry ? `INDUSTRY: ${options.industry}` : ''}
${options.location ? `LOCATION: ${options.location}` : ''}

CONTEXT:
${options.websiteContext ? `
EXISTING TOPICS: ${options.websiteContext.existingTopics?.slice(0, 5).join(', ') || 'None'}
TARGET KEYWORDS: ${options.websiteContext.targetKeywords?.slice(0, 3).join(', ') || 'None'}
CONTENT STYLE: ${options.websiteContext.contentStyle || 'Professional and informative'}
` : ''}

REQUIREMENTS:
1. Create a structured outline with introduction, 3 key points, and conclusion
2. Provide SEO-optimized title and meta description
3. Include internal linking suggestions
4. Add mobile optimization recommendations
5. Suggest appropriate word count based on topic complexity

WORD COUNT GUIDELINES:
- Short: 800-1,200 words (simple topics, quick answers)
- Medium: 1,200-2,000 words (standard comprehensive guides)
- Long: 2,000-3,000 words (complex, in-depth topics)

IMPORTANT: Return VALID JSON only using this exact structure:
{
  "topic": "the topic title",
  "outline": {
    "introduction": "Specific hook that addresses customer pain points",
    "keyPoints": [
      "First key point with actionable advice",
      "Second key point with specific examples",
      "Third key point with business outcomes"
    ],
    "conclusion": "Strong call to action with next steps"
  },
  "wordCountRecommendation": "medium",
  "seoChecklist": {
    "titleSuggestion": "SEO-optimized title under 60 characters",
    "metaDescription": "Compelling meta description under 160 characters",
    "internalLinking": ["Topic 1 to link to", "Topic 2 to link to"],
    "callToAction": "Specific CTA for business goals"
  },
  "mobileOptimization": {
    "readabilityScore": 85,
    "voiceSearchReady": true,
    "paragraphsCount": 12
  }
}`;

    try {
      const response = await client.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      // Extract and parse JSON
      const jsonContent = extractCleanJson(content);
      const parsed = JSON.parse(jsonContent);

      // Validate and enhance the brief
      return this.validateAndEnhanceBrief(parsed, topic, options);

    } catch (error) {
      console.error('Error generating content brief:', error);
      // Return a fallback brief if AI generation fails
      return this.generateFallbackBrief(topic, options);
    }
  }

  /**
   * Generate enhanced content brief using website analysis data
   */
  static async generateEnhancedContentBrief(
    savedTopicId: number,
    websiteAnalysisId?: number
  ): Promise<ContentBriefData> {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      throw new Error('User not authenticated');
    }

    // Get the saved topic
    const savedTopic = await getSavedTopicById(savedTopicId, supabaseUserId);
    if (!savedTopic) {
      throw new Error('Saved topic not found');
    }

    // Get website analysis data if available
    let websiteAnalysis = null;
    let crawledPages: any[] = [];

    if (websiteAnalysisId) {
      websiteAnalysis = await getWebsiteAnalysisById(websiteAnalysisId, supabaseUserId);
      if (websiteAnalysis) {
        crawledPages = await getCrawledPagesByAnalysisId(websiteAnalysisId);
      }
    }

    // Parse existing data
    let tags: string[] = [];
    try {
      tags = savedTopic.tags ? JSON.parse(savedTopic.tags) : [];
    } catch (error) {
      console.error('Error parsing tags:', error);
    }

    // Create options for the new brief generation
    const options: ContentBriefGenerationOptions = {
      businessType: savedTopic.description?.includes('business') ? 'service business' : undefined,
      websiteContext: {
        existingTopics: websiteAnalysis?.topics ?
          (Array.isArray(websiteAnalysis.topics) ? websiteAnalysis.topics : []) : [],
        targetKeywords: tags,
        contentStyle: this.analyzeContentStyle(websiteAnalysis),
      },
    };

    // Generate the new structured brief
    const newBrief = await this.generateContentBrief(savedTopic.topic, options);

    // Convert to legacy format for backward compatibility
    return this.convertToLegacyFormat(newBrief, savedTopic, tags);
  }

  /**
   * Legacy method for backward compatibility
   */
  static async generateContentBriefLegacy(savedTopicId: number): Promise<ContentBriefData> {
    return this.generateEnhancedContentBrief(savedTopicId);
  }

  /**
   * Validate and enhance the generated brief
   */
  private static validateAndEnhanceBrief(
    brief: any,
    originalTopic: string,
    options: ContentBriefGenerationOptions
  ): ContentBrief {
    // Validate required fields
    const validatedBrief: ContentBrief = {
      topic: brief.topic || originalTopic,
      outline: {
        introduction: brief.outline?.introduction || this.generateIntroduction(originalTopic, options),
        keyPoints: Array.isArray(brief.outline?.keyPoints) && brief.outline.keyPoints.length >= 3
          ? brief.outline.keyPoints.slice(0, 3)
          : this.generateKeyPoints(originalTopic, options),
        conclusion: brief.outline?.conclusion || this.generateConclusion(originalTopic, options),
      },
      wordCountRecommendation: ['short', 'medium', 'long'].includes(brief.wordCountRecommendation)
        ? brief.wordCountRecommendation
        : this.determineWordCount(originalTopic, options),
      seoChecklist: {
        titleSuggestion: brief.seoChecklist?.titleSuggestion || this.generateTitleSuggestion(originalTopic, options),
        metaDescription: brief.seoChecklist?.metaDescription || this.generateMetaDescription(originalTopic, options),
        internalLinking: Array.isArray(brief.seoChecklist?.internalLinking)
          ? brief.seoChecklist.internalLinking.slice(0, 5)
          : this.generateInternalLinkingSuggestions(originalTopic, options),
        callToAction: brief.seoChecklist?.callToAction || this.generateCallToAction(originalTopic, options),
      },
      mobileOptimization: {
        readabilityScore: typeof brief.mobileOptimization?.readabilityScore === 'number'
          ? Math.min(100, Math.max(0, brief.mobileOptimization.readabilityScore))
          : 85,
        voiceSearchReady: typeof brief.mobileOptimization?.voiceSearchReady === 'boolean'
          ? brief.mobileOptimization.voiceSearchReady
          : this.isVoiceSearchReady(originalTopic),
        paragraphsCount: typeof brief.mobileOptimization?.paragraphsCount === 'number'
          ? brief.mobileOptimization.paragraphsCount
          : this.estimateParagraphCount(brief.wordCountRecommendation || 'medium'),
      },
    };

    return validatedBrief;
  }

  /**
   * Generate fallback brief if AI generation fails
   */
  private static generateFallbackBrief(topic: string, options: ContentBriefGenerationOptions): ContentBrief {
    return {
      topic,
      outline: {
        introduction: this.generateIntroduction(topic, options),
        keyPoints: this.generateKeyPoints(topic, options),
        conclusion: this.generateConclusion(topic, options),
      },
      wordCountRecommendation: this.determineWordCount(topic, options),
      seoChecklist: {
        titleSuggestion: this.generateTitleSuggestion(topic, options),
        metaDescription: this.generateMetaDescription(topic, options),
        internalLinking: this.generateInternalLinkingSuggestions(topic, options),
        callToAction: this.generateCallToAction(topic, options),
      },
      mobileOptimization: {
        readabilityScore: 85,
        voiceSearchReady: this.isVoiceSearchReady(topic),
        paragraphsCount: this.estimateParagraphCount('medium'),
      },
    };
  }

  /**
   * Convert new ContentBrief to legacy ContentBriefData format
   */
  private static convertToLegacyFormat(brief: ContentBrief, savedTopic: any, tags: string[]): ContentBriefData {
    const headings = [
      'Introduction',
      ...brief.outline.keyPoints.map((point, index) => `Key Point ${index + 1}`),
      'Conclusion'
    ];

    return {
      title: brief.seoChecklist.titleSuggestion,
      briefContent: `# Content Brief: ${brief.topic}

## Overview
${brief.outline.introduction}

## Key Points
${brief.outline.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

## Conclusion
${brief.outline.conclusion}

## SEO Checklist
- **Title:** ${brief.seoChecklist.titleSuggestion}
- **Meta Description:** ${brief.seoChecklist.metaDescription}
- **Call to Action:** ${brief.seoChecklist.callToAction}

## Mobile Optimization
- **Readability Score:** ${brief.mobileOptimization.readabilityScore}/100
- **Voice Search Ready:** ${brief.mobileOptimization.voiceSearchReady ? 'Yes' : 'No'}
- **Estimated Paragraphs:** ${brief.mobileOptimization.paragraphsCount}

## Internal Linking
${brief.seoChecklist.internalLinking.map(link => `- ${link}`).join('\n')}
`,
      suggestedHeadings: headings,
      targetKeywords: tags,
      wordCountEstimate: this.wordCountToNumber(brief.wordCountRecommendation),
      internalLinkingSuggestions: brief.seoChecklist.internalLinking,
      contentRecommendations: brief.outline.conclusion
    };
  }

  /**
   * Helper methods for generating content brief components
   */
  private static generateIntroduction(topic: string, options: ContentBriefGenerationOptions): string {
    const audience = options.targetAudience || 'business customers';
    return `A comprehensive guide to ${topic.toLowerCase()} designed specifically for ${audience} seeking practical solutions and actionable insights.`;
  }

  private static generateKeyPoints(topic: string, options: ContentBriefGenerationOptions): string[] {
    const businessType = options.businessType || 'service business';
    return [
      `Understanding the core principles of ${topic.toLowerCase()} and how they apply to ${businessType} operations`,
      `Step-by-step implementation strategies with measurable outcomes and real-world examples`,
      `Advanced techniques and best practices for maximizing results and avoiding common pitfalls`,
    ];
  }

  private static generateConclusion(topic: string, options: ContentBriefGenerationOptions): string {
    const businessType = options.businessType || 'service business';
    return `By implementing these ${topic.toLowerCase()} strategies, ${businessType} owners can achieve measurable improvements in customer satisfaction and business growth. Take the first step today and transform your approach.`;
  }

  private static determineWordCount(topic: string, options: ContentBriefGenerationOptions): 'short' | 'medium' | 'long' {
    // Simple heuristic based on topic complexity
    const complexIndicators = ['comprehensive', 'complete', 'advanced', 'detailed', 'in-depth'];
    const simpleIndicators = ['quick', 'simple', 'basic', 'introduction', 'overview'];

    const topicLower = topic.toLowerCase();

    if (complexIndicators.some(indicator => topicLower.includes(indicator))) {
      return 'long';
    } else if (simpleIndicators.some(indicator => topicLower.includes(indicator))) {
      return 'short';
    }

    return 'medium';
  }

  private static generateTitleSuggestion(topic: string, options: ContentBriefGenerationOptions): string {
    const currentYear = new Date().getFullYear();
    const location = options.location ? ` in ${options.location}` : '';
    return `${topic} Guide ${currentYear}: Expert Strategies${location}`;
  }

  private static generateMetaDescription(topic: string, options: ContentBriefGenerationOptions): string {
    const audience = options.targetAudience || 'business owners';
    return `Discover proven ${topic.toLowerCase()} strategies for ${audience}. Learn actionable techniques to improve results and grow your business.`;
  }

  private static generateInternalLinkingSuggestions(topic: string, options: ContentBriefGenerationOptions): string[] {
    const businessType = options.businessType || 'business';
    return [
      `${businessType} Marketing Strategies`,
      'Customer Engagement Techniques',
      'Business Growth Tips',
    ];
  }

  private static generateCallToAction(topic: string, options: ContentBriefGenerationOptions): string {
    const businessType = options.businessType || 'service business';
    return `Ready to transform your ${businessType} with these ${topic.toLowerCase()} strategies? Contact us today for a personalized consultation.`;
  }

  private static isVoiceSearchReady(topic: string): boolean {
    // Check if topic sounds like a natural question or uses conversational language
    const questionWords = ['how', 'what', 'why', 'when', 'where', 'best', 'top'];
    const topicLower = topic.toLowerCase();
    return questionWords.some(word => topicLower.includes(word));
  }

  private static estimateParagraphCount(wordCount: 'short' | 'medium' | 'long'): number {
    // Estimate paragraphs based on word count (assuming 150-200 words per paragraph for mobile)
    const wordCounts = { short: 1000, medium: 1600, long: 2500 };
    return Math.ceil(wordCounts[wordCount] / 175);
  }

  private static wordCountToNumber(wordCount: 'short' | 'medium' | 'long'): number {
    const wordCounts = { short: 1000, medium: 1600, long: 2500 };
    return wordCounts[wordCount];
  }

  private static analyzeContentStyle(websiteAnalysis: any): string {
    // Analyze existing content to determine style
    if (websiteAnalysis && websiteAnalysis.crawledPages && websiteAnalysis.crawledPages.length > 0) {
      const avgWordCount = websiteAnalysis.totalWordCount / websiteAnalysis.crawledPages.length;
      if (avgWordCount > 1500) return 'Comprehensive and detailed';
      if (avgWordCount > 800) return 'Professional and informative';
      return 'Concise and practical';
    }
    return 'Professional and informative';
  }
}