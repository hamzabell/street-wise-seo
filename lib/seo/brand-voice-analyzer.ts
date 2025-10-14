/**
 * Brand Voice Analysis System
 * Extracts and analyzes brand voice, tone, and terminology from website content
 * to personalize both topic generation and content creation
 */

import { WebsiteAnalysisResult } from './website-crawler';

export interface BrandVoiceProfile {
  // Tone characteristics
  primaryTone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational' | 'inspirational' | 'humorous';
  secondaryTones: string[];
  toneScore: Record<string, number>; // Confidence scores for each tone

  // Language patterns
  formalityLevel: 'formal' | 'semi-formal' | 'casual' | 'very-casual';
  complexityLevel: 'simple' | 'moderate' | 'complex' | 'very-complex';
  sentenceStructure: 'short' | 'mixed' | 'long' | 'complex';

  // Brand terminology
  keyPhrases: string[];
    uniqueTerminology: string[];
  industryJargon: string[];
  brandedTerms: string[];

  // Communication style
  perspective: 'first-person' | 'second-person' | 'third-person' | 'mixed';
  voiceCharacteristics: {
    usesQuestions: boolean;
    usesEmojis: boolean;
    usesExclamation: boolean;
    usesStatistics: boolean;
    usesTestimonials: boolean;
    usesStorytelling: boolean;
  };

  // Value propositions
  coreValues: string[];
  uniqueValueProps: string[];
  customerFocus: string[];

  // Content patterns
  contentStructure: {
    usesLists: boolean;
    usesHeadings: boolean;
    usesBold: boolean;
    usesQuotes: boolean;
    usesStatistics: boolean;
  };

  // SEO patterns
  keywordPatterns: string[];
  topicClusters: string[];
  contentCategories: string[];
}

export interface BrandAnalysisInsights {
  brandVoiceProfile: BrandVoiceProfile;
  personalizationRecommendations: {
    topicGeneration: string[];
    contentCreation: string[];
    brandConsistency: string[];
  };
  competitiveDifferentiators: string[];
  targetLanguageStyle: string;
}

export class BrandVoiceAnalyzer {
  private toneIndicators = {
    professional: {
      keywords: ['expert', 'professional', 'specialized', 'certified', 'quality', 'solutions', 'comprehensive', 'strategic'],
      patterns: [/\b(professional|expert|specialized|certified)\b/gi, /\b(solutions|comprehensive|strategic)\b/gi],
      formality: 'formal'
    },
    casual: {
      keywords: ['hey', 'guys', 'folks', 'awesome', 'cool', 'great', 'simple', 'easy'],
      patterns: [/\b(hey|guys|folks|awesome|cool)\b/gi, /\b(simple|easy|straightforward)\b/gi],
      formality: 'casual'
    },
    friendly: {
      keywords: ['welcome', 'hello', 'friend', 'help', 'support', 'care', 'happy', 'glad'],
      patterns: [/\b(welcome|hello|friend|help)\b/gi, /\b(support|care|happy|glad)\b/gi],
      formality: 'semi-formal'
    },
    authoritative: {
      keywords: ['leading', 'premier', 'trusted', 'proven', 'guaranteed', 'results', 'evidence', 'data'],
      patterns: [/\b(leading|premier|trusted|proven)\b/gi, /\b(guaranteed|results|evidence|data)\b/gi],
      formality: 'formal'
    },
    conversational: {
      keywords: ['let\'s', 'we\'re', 'you\'ll', 'think about', 'imagine', 'consider', 'what if'],
      patterns: [/\b(let's|we're|you'll|imagine)\b/gi, /\b(think about|consider|what if)\b/gi],
      formality: 'casual'
    },
    inspirational: {
      keywords: ['transform', 'elevate', 'empower', 'unlock', 'discover', 'achieve', 'success', 'potential'],
      patterns: [/\b(transform|elevate|empower|unlock)\b/gi, /\b(discover|achieve|success|potential)\b/gi],
      formality: 'semi-formal'
    },
    humorous: {
      keywords: ['fun', 'funny', 'laugh', 'joke', 'hilarious', 'amusing', 'entertaining'],
      patterns: [/\b(fun|funny|laugh|joke)\b/gi, /\b(hilarious|amusing|entertaining)\b/gi],
      formality: 'casual'
    }
  };

  private formalityIndicators = {
    formal: ['additionally', 'furthermore', 'moreover', 'consequently', 'therefore', 'thus', 'hence'],
    semiFormal: ['also', 'because', 'so', 'but', 'however', 'while', 'since'],
    casual: ['yeah', 'nah', 'cool', 'awesome', 'great', 'stuff', 'things', 'got'],
    veryCasual: ['lol', 'haha', 'omg', 'btw', 'tbh', 'ngl', 'fr']
  };

  analyzeBrandVoice(websiteAnalysis: WebsiteAnalysisResult): BrandAnalysisInsights {
    console.log('🎯 [BRAND VOICE] Starting brand voice analysis');

    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ');
    const allHeadings = websiteAnalysis.crawledPages.flatMap(page => [...page.headings.h1, ...page.headings.h2, ...page.headings.h3]);
    const allTitles = websiteAnalysis.crawledPages.map(page => page.title);

    const brandVoiceProfile: BrandVoiceProfile = {
      primaryTone: this.detectPrimaryTone(allText),
      secondaryTones: this.detectSecondaryTones(allText),
      toneScore: this.calculateToneScores(allText),
      formalityLevel: this.determineFormalityLevel(allText),
      complexityLevel: this.determineComplexityLevel(allText),
      sentenceStructure: this.analyzeSentenceStructure(allText),
      keyPhrases: this.extractKeyPhrases(allText, allHeadings),
      uniqueTerminology: this.extractUniqueTerminology(allText, websiteAnalysis.topics),
      industryJargon: this.extractIndustryJargon(allText),
      brandedTerms: this.extractBrandedTerms(allText, allTitles),
      perspective: this.determinePerspective(allText),
      voiceCharacteristics: this.analyzeVoiceCharacteristics(allText),
      coreValues: this.extractCoreValues(allText),
      uniqueValueProps: this.extractUniqueValueProps(allText),
      customerFocus: this.extractCustomerFocus(allText),
      contentStructure: this.analyzeContentStructure(websiteAnalysis),
      keywordPatterns: this.analyzeKeywordPatterns(allText),
      topicClusters: this.identifyTopicClusters(websiteAnalysis.topics),
      contentCategories: this.identifyContentCategories(allHeadings)
    };

    const personalizationRecommendations = this.generatePersonalizationRecommendations(brandVoiceProfile);
    const competitiveDifferentiators = this.identifyCompetitiveDifferentiators(brandVoiceProfile, allText);
    const targetLanguageStyle = this.generateTargetLanguageStyle(brandVoiceProfile);

    console.log('✅ [BRAND VOICE] Brand voice analysis completed', {
      primaryTone: brandVoiceProfile.primaryTone,
      formalityLevel: brandVoiceProfile.formalityLevel,
      keyPhrasesCount: brandVoiceProfile.keyPhrases.length,
      uniqueTermsCount: brandVoiceProfile.uniqueTerminology.length
    });

    return {
      brandVoiceProfile,
      personalizationRecommendations,
      competitiveDifferentiators,
      targetLanguageStyle
    };
  }

  private detectPrimaryTone(text: string): BrandVoiceProfile['primaryTone'] {
    const toneScores = this.calculateToneScores(text);
    const highestScore = Object.entries(toneScores).reduce((a, b) => a[1] > b[1] ? a : b);
    return highestScore[0] as BrandVoiceProfile['primaryTone'];
  }

  private detectSecondaryTones(text: string): string[] {
    const toneScores = this.calculateToneScores(text);
    return Object.entries(toneScores)
      .sort(([, a], [, b]) => b - a)
      .slice(1, 4)
      .map(([tone]) => tone);
  }

  private calculateToneScores(text: string): Record<string, number> {
    const scores: Record<string, number> = {};
    const textLower = text.toLowerCase();

    Object.entries(this.toneIndicators).forEach(([tone, indicators]) => {
      let score = 0;

      // Count keyword matches
      indicators.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches) score += matches.length;
      });

      // Count pattern matches
      indicators.patterns.forEach(pattern => {
        const matches = textLower.match(pattern);
        if (matches) score += matches.length * 2; // Patterns weigh more
      });

      scores[tone] = score;
    });

    return scores;
  }

  private determineFormalityLevel(text: string): BrandVoiceProfile['formalityLevel'] {
    const textLower = text.toLowerCase();
    const formalityScores: Record<string, number> = {};

    Object.entries(this.formalityIndicators).forEach(([level, indicators]) => {
      formalityScores[level] = indicators.reduce((score, indicator) => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = textLower.match(regex);
        return score + (matches ? matches.length : 0);
      }, 0);
    });

    const highestScore = Object.entries(formalityScores).reduce((a, b) => a[1] > b[1] ? a : b);
    return highestScore[0] as BrandVoiceProfile['formalityLevel'];
  }

  private determineComplexityLevel(text: string): BrandVoiceProfile['complexityLevel'] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = sentences.reduce((sum, sentence) => {
      return sum + sentence.trim().split(/\s+/).length;
    }, 0) / sentences.length;

    const avgCharsPerWord = text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length;

    if (avgWordsPerSentence < 10 && avgCharsPerWord < 5) return 'simple';
    if (avgWordsPerSentence < 15 && avgCharsPerWord < 6) return 'moderate';
    if (avgWordsPerSentence < 20 && avgCharsPerWord < 7) return 'complex';
    return 'very-complex';
  }

  private analyzeSentenceStructure(text: string): BrandVoiceProfile['sentenceStructure'] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;

    // Check for variety in sentence length
    const hasShortSentences = sentenceLengths.some(len => len <= 8);
    const hasLongSentences = sentenceLengths.some(len => len >= 20);

    if (hasShortSentences && hasLongSentences) return 'mixed';
    if (avgLength <= 12) return 'short';
    if (avgLength >= 18) return 'long';
    return 'complex';
  }

  private extractKeyPhrases(text: string, headings: string[]): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);

    const phraseFreq: Record<string, number> = {};

    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
      phraseFreq[twoWordPhrase] = (phraseFreq[twoWordPhrase] || 0) + 1;
    }

    for (let i = 0; i < words.length - 2; i++) {
      const threeWordPhrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phraseFreq[threeWordPhrase] = (phraseFreq[threeWordPhrase] || 0) + 1;
    }

    // Filter and sort by frequency
    return Object.entries(phraseFreq)
      .filter(([phrase, count]) => count >= 2 && phrase.length > 10)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([phrase]) => this.capitalizeWords(phrase));
  }

  private extractUniqueTerminology(text: string, topics: string[]): string[] {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 6 && !commonWords.has(word));

    // Count word frequency
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Find words that appear more than average but aren't extremely common
    const avgFreq = Object.values(wordFreq).reduce((sum, freq) => sum + freq, 0) / Object.keys(wordFreq).length;

    return Object.entries(wordFreq)
      .filter(([word, freq]) => freq > avgFreq && freq >= 2 && freq <= 10)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => this.capitalizeWords(word));
  }

  private extractIndustryJargon(text: string): string[] {
    // Industry-specific jargon patterns
    const jargonPatterns = [
      /\b\w+(?:ification|tion|ment|ness|ism|ist)\b/gi, // Common suffixes
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\w+(?:ware|soft|tech|system|platform|solution)\b/gi, // Tech terms
      /\b\w+(?:ance|ence|ency|ancy)\b/gi // Professional terms
    ];

    const jargon = new Set<string>();

    jargonPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 6) jargon.add(match.toLowerCase());
        });
      }
    });

    return Array.from(jargon).slice(0, 10).map(term => this.capitalizeWords(term));
  }

  private extractBrandedTerms(text: string, titles: string[]): string[] {
    // Look for potential branded terms in titles and repeated throughout text
    const capitalizedTerms = new Set<string>();

    // Extract capitalized terms from titles
    titles.forEach(title => {
      const words = title.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
      if (words) {
        words.forEach(word => {
          if (word.length > 6) capitalizedTerms.add(word);
        });
      }
    });

    // Check if these terms appear frequently in text
    const textLower = text.toLowerCase();
    const brandedTerms: string[] = [];

    capitalizedTerms.forEach(term => {
      const termLower = term.toLowerCase();
      const occurrences = (textLower.match(new RegExp(termLower, 'gi')) || []).length;
      if (occurrences >= 2) {
        brandedTerms.push(term);
      }
    });

    return brandedTerms.slice(0, 8);
  }

  private determinePerspective(text: string): BrandVoiceProfile['perspective'] {
    const firstPerson = (text.match(/\b(we|our|us|i|my|me)\b/gi) || []).length;
    const secondPerson = (text.match(/\b(you|your|yours)\b/gi) || []).length;
    const thirdPerson = (text.match(/\b(they|their|them|he|she|it|its)\b/gi) || []).length;

    const total = firstPerson + secondPerson + thirdPerson;
    if (total === 0) return 'mixed';

    const firstPersonRatio = firstPerson / total;
    const secondPersonRatio = secondPerson / total;

    if (firstPersonRatio > 0.5) return 'first-person';
    if (secondPersonRatio > 0.5) return 'second-person';
    if (firstPersonRatio > 0.3 && secondPersonRatio > 0.3) return 'mixed';
    return 'third-person';
  }

  private analyzeVoiceCharacteristics(text: string): BrandVoiceProfile['voiceCharacteristics'] {
    return {
      usesQuestions: (text.match(/\?/g) || []).length > 0,
      usesEmojis: (text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length > 0,
      usesExclamation: (text.match(/!/g) || []).length > 2,
      usesStatistics: (text.match(/\d+%|\d+\s*(percent|million|billion|thousand)|\$\d+/gi) || []).length > 0,
      usesTestimonials: (text.match(/\b(testimonial|review|rating|customer says|what our clients say)\b/gi) || []).length > 0,
      usesStorytelling: (text.match(/\b(story|journey|experience|case study|example)\b/gi) || []).length > 0
    };
  }

  private extractCoreValues(text: string): string[] {
    const valueIndicators = [
      'quality', 'integrity', 'excellence', 'innovation', 'customer focus', 'teamwork',
      'reliability', 'professionalism', 'trust', 'commitment', 'passion', 'respect',
      'accountability', 'sustainability', 'community', 'leadership', 'growth'
    ];

    const textLower = text.toLowerCase();
    const foundValues: string[] = [];

    valueIndicators.forEach(value => {
      if (textLower.includes(value)) {
        foundValues.push(this.capitalizeWords(value));
      }
    });

    return foundValues.slice(0, 6);
  }

  private extractUniqueValueProps(text: string): string[] {
    const uvpPatterns = [
      /(?:we offer|we provide|we deliver|we guarantee)\s+([^,.!?]+)/gi,
      /(?:unique|special|exclusive|only we)\s+([^,.!?]+)/gi,
      /(?:what makes us different|why choose us|our advantage)\s+is\s+([^,.!?]+)/gi
    ];

    const uvps: string[] = [];

    uvpPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.replace(/^(?:we offer|we provide|we deliver|we guarantee|unique|special|exclusive|only we|what makes us different|why choose us|our advantage)\s+is\s+/i, '').trim();
          if (cleanMatch.length > 10 && cleanMatch.length < 100) {
            uvps.push(cleanMatch);
          }
        });
      }
    });

    return [...new Set(uvps)].slice(0, 5);
  }

  private extractCustomerFocus(text: string): string[] {
    const customerIndicators = [
      'customer satisfaction', 'client success', 'customer service', 'client support',
      'customer experience', 'client relationships', 'customer needs', 'client goals'
    ];

    const textLower = text.toLowerCase();
    const foundFocus: string[] = [];

    customerIndicators.forEach(indicator => {
      if (textLower.includes(indicator)) {
        foundFocus.push(this.capitalizeWords(indicator));
      }
    });

    return foundFocus.slice(0, 4);
  }

  private analyzeContentStructure(websiteAnalysis: WebsiteAnalysisResult): BrandVoiceProfile['contentStructure'] {
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ');

    return {
      usesLists: (allText.match(/^\s*[-*+]\s+/gm) || []).length > 5,
      usesHeadings: websiteAnalysis.crawledPages.some(page => page.headings.h1.length > 0),
      usesBold: (allText.match(/\*\*|__|<b>|<strong>/gi) || []).length > 3,
      usesQuotes: (allText.match(/["']/g) || []).length > 10,
      usesStatistics: (allText.match(/\d+%|\d+\s*(percent|million|billion)/gi) || []).length > 0
    };
  }

  private analyzeKeywordPatterns(text: string): string[] {
    // Extract keyword patterns based on frequency and importance
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const keywordFreq: Record<string, number> = {};
    words.forEach(word => {
      keywordFreq[word] = (keywordFreq[word] || 0) + 1;
    });

    return Object.entries(keywordFreq)
      .filter(([word, freq]) => freq >= 3 && word.length >= 4)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  }

  private identifyTopicClusters(topics: string[]): string[] {
    // Simple topic clustering based on common words
    const clusters: Record<string, string[]> = {};

    topics.forEach(topic => {
      const words = topic.toLowerCase().split(/\s+/);
      const mainWords = words.filter(word => word.length > 4);

      mainWords.forEach(word => {
        if (!clusters[word]) clusters[word] = [];
        clusters[word].push(topic);
      });
    });

    return Object.entries(clusters)
      .filter(([, cluster]) => cluster.length >= 2)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 8)
      .map(([cluster]) => this.capitalizeWords(cluster));
  }

  private identifyContentCategories(headings: string[]): string[] {
    const categories: Record<string, number> = {};

    headings.forEach(heading => {
      const headingLower = heading.toLowerCase();

      // Common content category indicators
      if (headingLower.includes('service') || headingLower.includes('offer')) categories['Services'] = (categories['Services'] || 0) + 1;
      if (headingLower.includes('about') || headingLower.includes('who')) categories['About'] = (categories['About'] || 0) + 1;
      if (headingLower.includes('contact') || headingLower.includes('reach')) categories['Contact'] = (categories['Contact'] || 0) + 1;
      if (headingLower.includes('price') || headingLower.includes('cost')) categories['Pricing'] = (categories['Pricing'] || 0) + 1;
      if (headingLower.includes('blog') || headingLower.includes('article')) categories['Blog'] = (categories['Blog'] || 0) + 1;
      if (headingLower.includes('review') || headingLower.includes('testimonial')) categories['Reviews'] = (categories['Reviews'] || 0) + 1;
    });

    return Object.keys(categories).sort((a, b) => categories[b] - categories[a]);
  }

  private generatePersonalizationRecommendations(brandVoiceProfile: BrandVoiceProfile) {
    return {
      topicGeneration: [
        `Use ${brandVoiceProfile.primaryTone} tone when generating topics`,
        `Incorporate key phrases: ${brandVoiceProfile.keyPhrases.slice(0, 3).join(', ')}`,
        `Focus on ${brandVoiceProfile.perspective} perspective`,
        `Emphasize ${brandVoiceProfile.coreValues.slice(0, 2).join(' and ')} values`
      ],
      contentCreation: [
        `Match ${brandVoiceProfile.formalityLevel} formality level`,
        `Use ${brandVoiceProfile.complexityLevel} language complexity`,
        `Include ${brandVoiceProfile.uniqueTerminology.slice(0, 2).join(' and ')} terminology`,
        `Structure content with ${brandVoiceProfile.contentStructure.usesLists ? 'lists' : 'paragraphs'}`
      ],
      brandConsistency: [
        `Maintain ${brandVoiceProfile.primaryTone} voice throughout`,
        `Use branded terms: ${brandVoiceProfile.brandedTerms.slice(0, 3).join(', ')}`,
        `Focus on ${brandVoiceProfile.customerFocus.slice(0, 2).join(' and ')} customer needs`,
        `Highlight ${brandVoiceProfile.uniqueValueProps.slice(0, 2).join(' and ')} value props`
      ]
    };
  }

  private identifyCompetitiveDifferentiators(brandVoiceProfile: BrandVoiceProfile, text: string): string[] {
    const differentiators: string[] = [];

    if (brandVoiceProfile.uniqueValueProps.length > 0) {
      differentiators.push(...brandVoiceProfile.uniqueValueProps);
    }

    if (brandVoiceProfile.brandedTerms.length > 0) {
      differentiators.push(`Unique branding: ${brandVoiceProfile.brandedTerms.join(', ')}`);
    }

    if (brandVoiceProfile.voiceCharacteristics.usesTestimonials) {
      differentiators.push('Customer testimonial integration');
    }

    if (brandVoiceProfile.voiceCharacteristics.usesStatistics) {
      differentiators.push('Data-driven approach');
    }

    return differentiators.slice(0, 5);
  }

  private generateTargetLanguageStyle(brandVoiceProfile: BrandVoiceProfile): string {
    return `Adopt a ${brandVoiceProfile.primaryTone} tone with ${brandVoiceProfile.formalityLevel} formality. Use ${brandVoiceProfile.complexityLevel} language with ${brandVoiceProfile.sentenceStructure} sentence structures. Write from a ${brandVoiceProfile.perspective} perspective, incorporating key brand terminology and maintaining consistency with established communication patterns.`;
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Singleton instance
export const brandVoiceAnalyzer = new BrandVoiceAnalyzer();

// Export helper functions
export function analyzeBrandVoice(websiteAnalysis: WebsiteAnalysisResult): BrandAnalysisInsights {
  return brandVoiceAnalyzer.analyzeBrandVoice(websiteAnalysis);
}