/**
 * Mobile-First Content Validator
 *
 * Provides real-time mobile optimization validation for generated content
 * including readability scoring, voice search optimization, and mobile preview generation
 */

export interface MobileValidation {
  overallScore: number;
  readabilityScore: number;
  mobilePreview: {
    titleLength: 'good' | 'too long' | 'too short';
    metaDescription: 'good' | 'too long' | 'too short';
    contentStructure: 'good' | 'needs improvement';
    paragraphCount: number;
    sentenceLength: 'good' | 'too long';
    imageOptimization: boolean;
  };
  voiceSearchOptimization: {
    questionFormat: boolean;
    conversationalTone: boolean;
    quickAnswers: boolean;
    naturalLanguage: boolean;
  };
  recommendations: {
    category: 'critical' | 'important' | 'suggestion';
    issue: string;
    solution: string;
    impact: string;
  }[];
}

export interface ValidationInput {
  title: string;
  metaDescription?: string;
  content: string;
  targetKeywords?: string[];
  contentType?: 'blog' | 'landing' | 'product' | 'service' | 'general';
}

export interface MobilePreviewData {
  truncatedTitle: string;
  truncatedDescription: string;
  contentPreview: string;
  readingTime: number;
  mobileViewport: {
    charactersPerLine: number;
    estimatedLines: number;
    estimatedScrolls: number;
  };
}

export class MobileValidator {
  /**
   * Validate content for mobile optimization
   */
  static validateContent(input: ValidationInput): MobileValidation {
    const readabilityScore = this.calculateReadabilityScore(input.content);
    const mobilePreview = this.analyzeMobilePreview(input);
    const voiceSearchOptimization = this.analyzeVoiceSearchOptimization(input.content);
    const recommendations = this.generateRecommendations(input, readabilityScore, mobilePreview, voiceSearchOptimization);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (readabilityScore * 0.4) +
      (this.getMobilePreviewScore(mobilePreview) * 0.3) +
      (this.getVoiceSearchScore(voiceSearchOptimization) * 0.3)
    );

    return {
      overallScore,
      readabilityScore,
      mobilePreview,
      voiceSearchOptimization,
      recommendations
    };
  }

  /**
   * Calculate readability score based on multiple factors
   */
  private static calculateReadabilityScore(content: string): number {
    let score = 100;
    const sentences = this.splitIntoSentences(content);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);

    // Penalty for very long sentences (over 20 words)
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 20);
    score -= Math.min(longSentences.length * 10, 30);

    // Penalty for very long paragraphs (over 5 sentences)
    const longParagraphs = paragraphs.filter(p => this.splitIntoSentences(p).length > 5);
    score -= Math.min(longParagraphs.length * 8, 20);

    // Penalty for very short sentences (under 5 words)
    const shortSentences = sentences.filter(s => s.split(/\s+/).length < 5);
    if (shortSentences.length / sentences.length > 0.3) {
      score -= 10;
    }

    // Bonus for good paragraph structure (2-4 sentences each)
    const goodParagraphs = paragraphs.filter(p => {
      const sentCount = this.splitIntoSentences(p).length;
      return sentCount >= 2 && sentCount <= 4;
    });
    if (goodParagraphs.length / paragraphs.length > 0.5) {
      score += 10;
    }

    // Vocabulary complexity check (simple scoring based on average word length)
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    if (avgWordLength > 6) {
      score -= 15; // Complex vocabulary
    } else if (avgWordLength < 4) {
      score -= 5; // Too simple
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyze content for mobile preview optimization
   */
  private static analyzeMobilePreview(input: ValidationInput): MobileValidation['mobilePreview'] {
    const { title, metaDescription, content } = input;

    // Title length analysis
    let titleLength: 'good' | 'too long' | 'too short';
    if (title.length < 30) {
      titleLength = 'too short';
    } else if (title.length > 60) {
      titleLength = 'too long';
    } else {
      titleLength = 'good';
    }

    // Meta description analysis
    let metaDescriptionStatus: 'good' | 'too long' | 'too short';
    if (!metaDescription) {
      metaDescriptionStatus = 'too short';
    } else if (metaDescription.length < 120) {
      metaDescriptionStatus = 'too short';
    } else if (metaDescription.length > 160) {
      metaDescriptionStatus = 'too long';
    } else {
      metaDescriptionStatus = 'good';
    }

    // Content structure analysis
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sentences = this.splitIntoSentences(content);
    const avgParagraphLength = sentences.length / paragraphs.length;

    let contentStructure: 'good' | 'needs improvement';
    let sentenceLength: 'good' | 'too long';

    if (avgParagraphLength > 5 || paragraphs.length < 2) {
      contentStructure = 'needs improvement';
    } else {
      contentStructure = 'good';
    }

    const avgSentenceLength = content.split(/\s+/).length / sentences.length;
    sentenceLength = avgSentenceLength > 15 ? 'too long' : 'good';

    // Image optimization check (basic heuristic)
    const imageOptimization = this.checkImageOptimization(content);

    return {
      titleLength,
      metaDescription: metaDescriptionStatus,
      contentStructure,
      paragraphCount: paragraphs.length,
      sentenceLength,
      imageOptimization
    };
  }

  /**
   * Analyze content for voice search optimization
   */
  private static analyzeVoiceSearchOptimization(content: string): MobileValidation['voiceSearchOptimization'] {
    // Question format detection
    const questions = content.match(/[?]/g) || [];
    const questionWords = content.match(/\b(what|when|where|who|why|how|which|can|could|should|would|will|do|does|did|are|is|am|was|were)\b/gi);
    const questionFormat = (questions.length > 0 || (questionWords?.length || 0) > 2);

    // Conversational tone detection
    const conversationalWords = content.match(/\b(you|your|we|our|us|let's|here's|that's|it's|what's)\b/gi);
    const contractions = content.match(/\b(can't|won't|don't|doesn't|didn't|couldn't|shouldn't|wouldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|I'm|you're|he's|she's|it's|we're|they're|I've|you've|we've|they've|I'd|you'd|he'd|she'd|we'd|they'd)\b/g);
    const conversationalTone = ((conversationalWords?.length || 0) > 3 || (contractions?.length || 0) > 2);

    // Quick answers detection (numbered lists, bullet points)
    const listItems = content.match(/^\s*[-*+]\s+/gm) || content.match(/^\s*\d+\.\s+/gm);
    const quickAnswers = (listItems?.length || 0) > 3;

    // Natural language detection (sentence length variation, readability)
    const sentences = this.splitIntoSentences(content);
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const naturalLanguage = avgSentenceLength >= 8 && avgSentenceLength <= 18;

    return {
      questionFormat,
      conversationalTone,
      quickAnswers,
      naturalLanguage
    };
  }

  /**
   * Generate specific recommendations based on validation results
   */
  private static generateRecommendations(
    input: ValidationInput,
    readabilityScore: number,
    mobilePreview: MobileValidation['mobilePreview'],
    voiceSearchOptimization: MobileValidation['voiceSearchOptimization']
  ): MobileValidation['recommendations'] {
    const recommendations: MobileValidation['recommendations'] = [];

    // Title recommendations
    if (mobilePreview.titleLength === 'too short') {
      recommendations.push({
        category: 'critical',
        issue: 'Title is too short for mobile SEO',
        solution: 'Expand title to 30-60 characters for better mobile search visibility',
        impact: 'Higher click-through rates and better search ranking'
      });
    } else if (mobilePreview.titleLength === 'too long') {
      recommendations.push({
        category: 'critical',
        issue: 'Title is too long for mobile display',
        solution: 'Shorten title to under 60 characters to avoid truncation in mobile search results',
        impact: 'Prevents title cutoff and improves user experience'
      });
    }

    // Meta description recommendations
    if (mobilePreview.metaDescription === 'too short') {
      recommendations.push({
        category: 'important',
        issue: 'Meta description is missing or too short',
        solution: 'Add a compelling meta description of 120-160 characters',
        impact: 'Improves click-through rates from search results'
      });
    } else if (mobilePreview.metaDescription === 'too long') {
      recommendations.push({
        category: 'important',
        issue: 'Meta description is too long',
        solution: 'Shorten meta description to 120-160 characters to avoid truncation',
        impact: 'Ensures full message is visible in search results'
      });
    }

    // Readability recommendations
    if (readabilityScore < 60) {
      recommendations.push({
        category: 'critical',
        issue: 'Content readability is poor for mobile users',
        solution: 'Use shorter sentences, break up long paragraphs, and simplify vocabulary',
        impact: 'Significantly improves user engagement and time on page'
      });
    } else if (readabilityScore < 80) {
      recommendations.push({
        category: 'important',
        issue: 'Content readability could be improved',
        solution: 'Consider using shorter paragraphs and more conversational language',
        impact: 'Enhances user experience and comprehension'
      });
    }

    // Content structure recommendations
    if (mobilePreview.contentStructure === 'needs improvement') {
      recommendations.push({
        category: 'important',
        issue: 'Content structure is not optimized for mobile',
        solution: 'Break content into smaller paragraphs (2-4 sentences each) and use more subheadings',
        impact: 'Makes content easier to scan on mobile devices'
      });
    }

    // Sentence length recommendations
    if (mobilePreview.sentenceLength === 'too long') {
      recommendations.push({
        category: 'important',
        issue: 'Sentences are too long for mobile reading',
        solution: 'Break long sentences into shorter, more digestible ones',
        impact: 'Improves readability and user comprehension'
      });
    }

    // Image optimization recommendations
    if (!mobilePreview.imageOptimization) {
      recommendations.push({
        category: 'suggestion',
        issue: 'Images may not be optimized for mobile',
        solution: 'Add descriptive alt text and ensure images are responsive and compressed',
        impact: 'Better SEO performance and faster loading times'
      });
    }

    // Voice search recommendations
    if (!voiceSearchOptimization.questionFormat) {
      recommendations.push({
        category: 'suggestion',
        issue: 'Content lacks question format for voice search',
        solution: 'Add question-based headings and include natural language queries',
        impact: 'Increases chances of appearing in voice search results'
      });
    }

    if (!voiceSearchOptimization.conversationalTone) {
      recommendations.push({
        category: 'suggestion',
        issue: 'Content tone may be too formal for voice search',
        solution: 'Use more conversational language and address the reader directly',
        impact: 'Better alignment with how people speak voice queries'
      });
    }

    if (!voiceSearchOptimization.quickAnswers) {
      recommendations.push({
        category: 'important',
        issue: 'Content lacks quick-answer format for voice assistants',
        solution: 'Include clear, concise answers and use bullet points or numbered lists',
        impact: 'Increases likelihood of being used for direct voice answers'
      });
    }

    return recommendations;
  }

  /**
   * Generate mobile preview data
   */
  static generateMobilePreview(input: ValidationInput): MobilePreviewData {
    const { title, metaDescription, content } = input;

    // Truncate title for mobile display
    const truncatedTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;

    // Truncate description for mobile display
    const truncatedDescription = metaDescription
      ? metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription
      : '';

    // Content preview (first paragraph)
    const firstParagraph = content.split(/\n\n+/)[0] || '';
    const contentPreview = firstParagraph.length > 200 ? firstParagraph.substring(0, 197) + '...' : firstParagraph;

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Mobile viewport calculations
    const charactersPerLine = 40; // Typical mobile line
    const estimatedLines = Math.ceil(content.length / charactersPerLine);
    const estimatedScrolls = Math.ceil(estimatedLines / 20); // Assuming 20 lines per screen

    return {
      truncatedTitle,
      truncatedDescription,
      contentPreview,
      readingTime,
      mobileViewport: {
        charactersPerLine,
        estimatedLines,
        estimatedScrolls
      }
    };
  }

  /**
   * Helper methods
   */
  private static splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  private static checkImageOptimization(content: string): boolean {
    // Basic heuristic - check for image-related keywords
    const imageKeywords = content.match(/\b(image|img|picture|photo|graphic|visual|alt text|responsive|compressed)\b/gi);
    return (imageKeywords?.length || 0) > 0;
  }

  private static getMobilePreviewScore(preview: MobileValidation['mobilePreview']): number {
    let score = 100;

    if (preview.titleLength !== 'good') score -= 25;
    if (preview.metaDescription !== 'good') score -= 20;
    if (preview.contentStructure !== 'good') score -= 20;
    if (preview.sentenceLength !== 'good') score -= 15;
    if (!preview.imageOptimization) score -= 10;

    return Math.max(0, score);
  }

  private static getVoiceSearchScore(voiceSearch: MobileValidation['voiceSearchOptimization']): number {
    let score = 100;

    if (!voiceSearch.questionFormat) score -= 25;
    if (!voiceSearch.conversationalTone) score -= 25;
    if (!voiceSearch.quickAnswers) score -= 30;
    if (!voiceSearch.naturalLanguage) score -= 20;

    return Math.max(0, score);
  }

  /**
   * Get mobile optimization score color
   */
  static getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get mobile optimization score label
   */
  static getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  }

  /**
   * Validate content brief for mobile optimization
   */
  static validateContentBrief(
    title: string,
    briefContent: string,
    suggestedHeadings: string[],
    targetKeywords: string[]
  ): MobileValidation {
    // Convert content brief to format expected by validator
    const content = `
${title}

${briefContent}

${suggestedHeadings.map(h => `## ${h}`).join('\n')}

Keywords: ${targetKeywords.join(', ')}
    `.trim();

    return this.validateContent({
      title,
      content,
      targetKeywords,
      contentType: 'blog'
    });
  }
}