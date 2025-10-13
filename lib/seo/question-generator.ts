/**
 * Customer Question Generator for FAQ-style content optimized for voice search and local queries
 */

import { z } from 'zod';
import { getLemonfoxClient } from './lemonfox-client';
import { getIndustryTemplate, getLocalServicePatterns } from './industry-templates';

export interface CustomerQuestion {
  question: string;
  category: 'how_to' | 'what_is' | 'where_can' | 'why_does' | 'emergency';
  voiceSearchOptimized: boolean;
  localIntent: 'high' | 'medium' | 'low';
  answerOutline: string;
  suggestedTitle: string;
}

export interface QuestionGenerationRequest {
  topic: string;
  industryId: string;
  targetAudience: string;
  location?: string;
  businessType?: string;
  maxQuestions?: number;
}

export interface QuestionGenerationResult {
  topic: string;
  questions: CustomerQuestion[];
  metadata: {
    totalQuestions: number;
    voiceSearchOptimized: number;
    localIntentHigh: number;
    categories: Record<string, number>;
    generatedAt: string;
  };
}

export const QuestionGenerationRequestSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long'),
  industryId: z.string().min(1, 'Industry selection is required'),
  targetAudience: z.string().min(2, 'Target audience is required'),
  location: z.string().optional(),
  businessType: z.string().optional(),
  maxQuestions: z.number().min(5).max(20).optional().default(12),
});

export type QuestionGenerationRequestType = z.infer<typeof QuestionGenerationRequestSchema>;

export class QuestionGenerator {
  private lemonfoxClient = getLemonfoxClient();

  async generateQuestions(request: QuestionGenerationRequestType): Promise<QuestionGenerationResult> {
    const validated = QuestionGenerationRequestSchema.parse(request);
    const industryTemplate = getIndustryTemplate(validated.industryId);
    const businessType = validated.businessType || industryTemplate?.name || 'Service Business';
    const localServicePatterns = getLocalServicePatterns(validated.industryId);

    console.log('🎯 [QUESTION GENERATOR] Starting question generation:', {
      topic: validated.topic,
      industryId: validated.industryId,
      businessType,
      targetAudience: validated.targetAudience,
      location: validated.location,
      maxQuestions: validated.maxQuestions
    });

    try {
      // Generate AI-powered questions
      const aiQuestions = await this.lemonfoxClient.generateCustomerQuestions(
        validated.topic,
        businessType,
        validated.targetAudience,
        validated.location,
        validated.industryId,
        localServicePatterns
      );

      // Process and categorize questions
      const processedQuestions = this.processQuestions(aiQuestions, validated, localServicePatterns);

      // Generate metadata
      const metadata = this.generateQuestionMetadata(processedQuestions, validated);

      console.log(`✅ [QUESTION GENERATOR] Generated ${processedQuestions.length} questions`);

      return {
        topic: validated.topic,
        questions: processedQuestions,
        metadata
      };
    } catch (error) {
      console.error('❌ [QUESTION GENERATOR] Error generating questions:', error);
      // Fallback to template-based questions
      return this.generateFallbackQuestions(validated, businessType, localServicePatterns);
    }
  }

  private processQuestions(
    aiQuestions: Array<{
      question: string;
      category: string;
      reasoning: string;
    }>,
    request: QuestionGenerationRequestType,
    localServicePatterns: string[]
  ): CustomerQuestion[] {
    return aiQuestions.map(q => {
      const category = this.validateQuestionCategory(q.category);
      const voiceSearchOptimized = this.analyzeVoiceSearchOptimization(q.question);
      const localIntent = this.analyzeLocalIntent(q.question, request.location, localServicePatterns);
      const answerOutline = this.generateAnswerOutline(q.question, category, request.businessType);
      const suggestedTitle = this.generateSuggestedTitle(q.question, category);

      return {
        question: this.cleanQuestion(q.question),
        category,
        voiceSearchOptimized,
        localIntent,
        answerOutline,
        suggestedTitle
      };
    }).slice(0, request.maxQuestions || 12);
  }

  private validateQuestionCategory(category: string): CustomerQuestion['category'] {
    const validCategories: CustomerQuestion['category'][] = ['how_to', 'what_is', 'where_can', 'why_does', 'emergency'];
    const normalized = category.toLowerCase().replace(/[^a-z_]/g, '_');

    if (validCategories.includes(normalized as CustomerQuestion['category'])) {
      return normalized as CustomerQuestion['category'];
    }

    // Fallback logic based on question content
    if (normalized.includes('how') || normalized.includes('guide')) return 'how_to';
    if (normalized.includes('what') || normalized.includes('definition')) return 'what_is';
    if (normalized.includes('where') || normalized.includes('location')) return 'where_can';
    if (normalized.includes('why') || normalized.includes('reason')) return 'why_does';
    if (normalized.includes('emergency') || normalized.includes('urgent')) return 'emergency';

    return 'what_is'; // Default fallback
  }

  private analyzeVoiceSearchOptimization(question: string): boolean {
    const questionLower = question.toLowerCase();

    // Check for conversational patterns
    const conversationalPatterns = [
      /^how do i/i,
      /^what is/i,
      /^where can/i,
      /^why does/i,
      /^when should/i,
      /^can you/i,
      /^help me/i,
      /near me$/,
      /for me$/,
      /my business$/,
      /our company$/,
      /we need$/,
      /i'm looking for/
    ];

    const hasConversationalPattern = conversationalPatterns.some(pattern => pattern.test(questionLower));

    // Check length (voice queries are typically longer but not too long)
    const appropriateLength = questionLower.length >= 15 && questionLower.length <= 100;

    // Check for natural language words
    const naturalLanguageWords = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'they', 'have', 'had'];
    const hasNaturalLanguage = naturalLanguageWords.some(word => questionLower.includes(` ${word} `));

    // Avoid overly technical or keyword-stuffed language
    const notOverlyTechnical = !questionLower.includes(':') &&
                               !questionLower.includes('|') &&
                               !questionLower.includes('/') &&
                               questionLower.split(' ').length <= 12;

    return hasConversationalPattern && appropriateLength && hasNaturalLanguage && notOverlyTechnical;
  }

  private analyzeLocalIntent(
    question: string,
    location?: string,
    localServicePatterns: string[] = []
  ): 'high' | 'medium' | 'low' {
    const questionLower = question.toLowerCase();

    // High local intent indicators
    const highIntentPatterns = [
      /near me/i,
      /in \w+(\s+\w+)?$/i, // "in [city]" at end
      /local/i,
      /closest/i,
      /nearest/i,
      /around me/i,
      /in my area/i,
      /nearby/i
    ];

    // Medium local intent indicators
    const mediumIntentPatterns = [
      /service/i,
      /provider/i,
      /company/i,
      /business/i,
      /professional/i,
      /expert/i,
      /specialist/i
    ];

    // Check for explicit location mention
    if (location && questionLower.includes(location.toLowerCase())) {
      return 'high';
    }

    // Check for high intent patterns
    if (highIntentPatterns.some(pattern => pattern.test(question))) {
      return 'high';
    }

    // Check for medium intent patterns
    if (mediumIntentPatterns.some(pattern => pattern.test(question))) {
      return 'medium';
    }

    // Check against local service patterns
    if (localServicePatterns.some(pattern =>
      pattern.toLowerCase().includes(questionLower) ||
      questionLower.includes(pattern.toLowerCase())
    )) {
      return 'medium';
    }

    return 'low';
  }

  private generateAnswerOutline(
    question: string,
    category: CustomerQuestion['category'],
    businessType?: string
  ): string {
    const businessContext = businessType || 'service business';

    switch (category) {
      case 'how_to':
        return `Provide step-by-step instructions that ${businessContext} customers can follow. Include: 1) Preparation steps, 2) Detailed process, 3) Common mistakes to avoid, 4) Expected timeline, 5) When to call a professional.`;

      case 'what_is':
        return `Define the concept in simple terms for ${businessContext} customers. Include: 1) Clear definition, 2) Why it matters to them, 3) Key benefits, 4) Related terminology, 5) Common misconceptions cleared up.`;

      case 'where_can':
        return `Help customers find solutions for their ${businessContext} needs. Include: 1) Local search strategies, 2) What to look for in providers, 3) Questions to ask, 4) Red flags to avoid, 5) Alternative options if local isn't available.`;

      case 'why_does':
        return `Explain the underlying reasons that affect ${businessContext} customers. Include: 1) Root causes, 2) Contributing factors, 3) Impact on customers, 4) Prevention strategies, 5) Solutions that address the core issue.`;

      case 'emergency':
        return `Provide immediate guidance for urgent ${businessContext} situations. Include: 1) Immediate safety steps, 2) Who to call right now, 3) Temporary fixes, 4) Warning signs, 5) Prevention for the future.`;

      default:
        return `Provide comprehensive information relevant to ${businessContext} customers. Include: 1) Direct answer, 2) Supporting details, 3) Practical examples, 4) Next steps, 5) Additional resources.`;
    }
  }

  private generateSuggestedTitle(question: string, category: CustomerQuestion['category']): string {
    const questionClean = question.replace(/[?.!]+$/, ''); // Remove trailing punctuation

    switch (category) {
      case 'how_to':
        return `Complete Guide: ${questionClean}`;
      case 'what_is':
        return `Understanding ${questionClean}`;
      case 'where_can':
        return `Finding ${questionClean}: Local Options`;
      case 'why_does':
        return `${questionClean}: Causes and Solutions`;
      case 'emergency':
        return `Emergency Guide: ${questionClean}`;
      default:
        return questionClean;
    }
  }

  private cleanQuestion(question: string): string {
    return question
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private generateQuestionMetadata(questions: CustomerQuestion[], request: QuestionGenerationRequestType) {
    const categories = questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const voiceSearchOptimized = questions.filter(q => q.voiceSearchOptimized).length;
    const localIntentHigh = questions.filter(q => q.localIntent === 'high').length;

    return {
      totalQuestions: questions.length,
      voiceSearchOptimized,
      localIntentHigh,
      categories,
      generatedAt: new Date().toISOString(),
      industryId: request.industryId,
      location: request.location,
    };
  }

  private generateFallbackQuestions(
    request: QuestionGenerationRequestType,
    businessType: string,
    localServicePatterns: string[]
  ): QuestionGenerationResult {
    console.log('🔄 [QUESTION GENERATOR] Using fallback question generation');

    const locationText = request.location ? ` in ${request.location}` : '';
    const baseQuestions = this.getIndustrySpecificQuestions(request.industryId, businessType, locationText);

    const questions: CustomerQuestion[] = baseQuestions.slice(0, request.maxQuestions || 12).map(q => ({
      question: q.question,
      category: q.category,
      voiceSearchOptimized: this.analyzeVoiceSearchOptimization(q.question),
      localIntent: this.analyzeLocalIntent(q.question, request.location, localServicePatterns),
      answerOutline: this.generateAnswerOutline(q.question, q.category, businessType),
      suggestedTitle: this.generateSuggestedTitle(q.question, q.category)
    }));

    const metadata = this.generateQuestionMetadata(questions, request);

    return {
      topic: request.topic,
      questions,
      metadata
    };
  }

  private getIndustrySpecificQuestions(
    industryId: string,
    businessType: string,
    locationText: string
  ): Array<{ question: string; category: CustomerQuestion['category'] }> {
    // Industry-specific question templates
    const industryQuestions: Record<string, Array<{ question: string; category: CustomerQuestion['category'] }>> = {
      'plumbing': [
        { question: `How do I fix a leaky faucet in my home${locationText}?`, category: 'how_to' },
        { question: `What is hydro-jetting and when do I need it for my drains?`, category: 'what_is' },
        { question: `Where can I find an emergency plumber near me right now?`, category: 'emergency' },
        { question: `Why does my water heater make strange noises in the morning?`, category: 'why_does' },
        { question: `How much does it cost to replace a main water line${locationText}?`, category: 'what_is' },
      ],
      'electrical': [
        { question: `How do I reset a circuit breaker that keeps tripping?`, category: 'how_to' },
        { question: `What is a GFCI outlet and why do I need them in my bathroom?`, category: 'what_is' },
        { question: `Where can I find a licensed electrician for emergency repairs${locationText}?`, category: 'where_can' },
        { question: `Why do my lights flicker when I turn on appliances?`, category: 'why_does' },
        { question: `Is it safe to do my own electrical work as a homeowner?`, category: 'what_is' },
      ],
      'hvac': [
        { question: `How do I troubleshoot my AC unit that won't turn on?`, category: 'how_to' },
        { question: `What is SEER rating and how does it affect my energy bills?`, category: 'what_is' },
        { question: `Where can I get same-day HVAC repair service${locationText}?`, category: 'emergency' },
        { question: `Why does my furnace make loud banging noises when starting up?`, category: 'why_does' },
        { question: `How often should I change my air filters for optimal performance?`, category: 'how_to' },
      ],
      'roofing': [
        { question: `How do I know if I need a new roof or just repairs?`, category: 'what_is' },
        { question: `What are the signs of roof storm damage that insurance covers?`, category: 'what_is' },
        { question: `Where can I find a reliable roofer for emergency leak repairs${locationText}?`, category: 'emergency' },
        { question: `Why do my shingles keep curling up and falling off?`, category: 'why_does' },
        { question: `How much does a new roof cost for a 2000 sq ft house${locationText}?`, category: 'what_is' },
      ],
      'landscaping': [
        { question: `How do I design a low-maintenance garden for my yard${locationText}?`, category: 'how_to' },
        { question: `What is xeriscaping and can it save me money on water bills?`, category: 'what_is' },
        { question: `Where can I find affordable landscape design services${locationText}?`, category: 'where_can' },
        { question: `Why does my grass turn brown in patches during summer?`, category: 'why_does' },
        { question: `How much should I budget for monthly lawn care service${locationText}?`, category: 'what_is' },
      ]
    };

    // Return industry-specific questions or generic ones
    return industryQuestions[industryId] || [
      { question: `How do I find the best ${businessType.toLowerCase()} service${locationText}?`, category: 'how_to' },
      { question: `What should I look for when hiring a ${businessType.toLowerCase()} professional?`, category: 'what_is' },
      { question: `Where can I get emergency ${businessType.toLowerCase()} help right now${locationText}?`, category: 'emergency' },
      { question: `Why does my ${businessType.toLowerCase()} service cost so much?`, category: 'why_does' },
      { question: `How much does ${businessType.toLowerCase()} service typically cost${locationText}?`, category: 'what_is' },
      { question: `What are common ${businessType.toLowerCase()} problems I should watch for?`, category: 'what_is' },
      { question: `How do I maintain my ${businessType.toLowerCase()} system properly?`, category: 'how_to' },
      { question: `Where can I find reliable ${businessType.toLowerCase()} reviews${locationText}?`, category: 'where_can' },
      { question: `Why is regular ${businessType.toLowerCase()} maintenance important?`, category: 'why_does' },
      { question: `What questions should I ask a ${businessType.toLowerCase()} contractor?`, category: 'how_to' },
    ];
  }
}

// Singleton instance
let questionGenerator: QuestionGenerator | null = null;

export function getQuestionGenerator(): QuestionGenerator {
  if (!questionGenerator) {
    questionGenerator = new QuestionGenerator();
  }
  return questionGenerator;
}

// Export helper functions for use in API routes
export async function generateCustomerQuestions(request: QuestionGenerationRequestType): Promise<QuestionGenerationResult> {
  const generator = getQuestionGenerator();
  return await generator.generateQuestions(request);
}