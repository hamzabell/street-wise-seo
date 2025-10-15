import { getLemonfoxClient } from './lemonfox-client';
import { analyzeBrandVoice, type BrandAnalysisInsights } from './brand-voice-analyzer';
import { type DetailedLocation } from './location-service';
import {
  synthesizeContext,
  generateEnhancedPrompts,
  type ContextSources,
  type SynthesizedContext,
  type ContextWeighting
} from './context-synthesis';

export interface ContentGenerationOptions {
  topic: string;
  contentType: 'blog_post' | 'social_media' | 'website_page' | 'email' | 'google_business_profile';
  variantNumber: number;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational' | 'humorous' | 'inspirational';
  additionalContext?: string;
  websiteAnalysisContext?: any;
  businessType?: string;
  targetAudience?: string;
  location?: string;
  detailedLocation?: DetailedLocation; // Enhanced location data
  targetWordCount: number;
  tags?: string[];
  brandVoiceAnalysis?: BrandAnalysisInsights;

  // Enhanced context sources for deeper integration
  businessOfferings?: any; // Service/offering analysis
  competitorIntelligence?: any; // Competitor analysis
  culturalContext?: any; // Cultural/language context
  marketPositioning?: any; // Market positioning analysis

  // Enhanced cultural context fields
  languagePreference?: 'english' | 'cultural_english' | 'native';
  formalityLevel?: 'formal' | 'professional' | 'casual' | 'slang_heavy';
  contentPurpose?: 'marketing' | 'educational' | 'conversational' | 'technical';
  contextWeights?: any; // Context weight analysis
  useEnhancedPrompts?: boolean; // Whether to use new context synthesis system
}

export interface GeneratedContent {
  title: string;
  content: string;
  htmlContent: string;
  wordCount: number;
  targetKeywords: string[];
  seoScore?: number;
  generationPrompt: string;
}

const CONTENT_TYPE_PROMPTS = {
  blog_post: {
    structure: `# [Title]

## Introduction
[Engaging opening that hooks the reader]

## [Main Section 1]
[Key point with examples]

## [Main Section 2]
[Supporting information]

## [Main Section 3]
[Practical application]

## Conclusion
[Summary and call-to-action]`,
    instructions: 'Write a comprehensive blog post with proper headings, subheadings, and a clear structure. Include practical examples and actionable advice.'
  },

  social_media: {
    structure: `[Engaging hook]

[Key message with bullet points]

[Call-to-action]

#[Relevant hashtags]`,
    instructions: 'Create engaging social media content with a clear hook, scannable bullet points, and relevant hashtags. Keep it conversational and shareable.'
  },

  website_page: {
    structure: `# [Page Title]

## [Main Service/Benefit]
[Clear description of what you offer]

## Why Choose Us
[Unique value propositions]

## [Key Feature 1]
[Detailed description]

## [Key Feature 2]
[Detailed description]

## Call to Action
[Clear next step for visitors]`,
    instructions: 'Write service page content that clearly explains your offerings, builds trust, and guides visitors to take action.'
  },

  email: {
    structure: `Subject: [Compelling subject line]

Hi [Name],

[Personalized greeting]

[Main message with value]

[Call-to-action]

Best regards,
[Your name]`,
    instructions: 'Create email content that feels personal, provides clear value, and encourages readers to take action.'
  },

  google_business_profile: {
    structure: `[Engaging opening]

[Key update or offer]

[Benefits for customers]

[Call-to-action with details]

📍 [Location information if relevant]`,
    instructions: 'Write Google Business Profile content that\'s local-focused, engaging, and includes clear calls-to-action with location context.'
  }
};

const TONE_GUIDELINES = {
  professional: {
    style: 'Use formal language, industry terminology, and authoritative statements. Avoid slang and overly casual expressions.',
    voice: 'Expert, knowledgeable, trustworthy'
  },
  casual: {
    style: 'Use conversational language, contractions, and a relaxed tone. Be approachable and easy to understand.',
    voice: 'Friendly, approachable, down-to-earth'
  },
  friendly: {
    style: 'Use warm, welcoming language with positive words. Show empathy and understanding.',
    voice: 'Warm, caring, supportive'
  },
  authoritative: {
    style: 'Use confident language, data-driven statements, and expert terminology. Be direct and decisive.',
    voice: 'Expert, confident, trustworthy'
  },
  conversational: {
    style: 'Use engaging questions, direct address ("you"), and interactive elements. Create a dialogue with the reader.',
    voice: 'Engaging, interactive, relatable'
  },
  humorous: {
    style: 'Use appropriate humor, relatable anecdotes, and light-hearted observations. Keep it professional but fun.',
    voice: 'Witty, entertaining, memorable'
  },
  inspirational: {
    style: 'Use motivating language, positive framing, and aspirational messaging. Focus on possibilities and transformation.',
    voice: 'Motivating, uplifting, empowering'
  }
};

export async function generatePersonalizedContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
  const {
    topic,
    contentType,
    variantNumber,
    tone,
    additionalContext,
    websiteAnalysisContext,
    businessType,
    targetAudience,
    location,
    detailedLocation,
    targetWordCount,
    tags = [],
    brandVoiceAnalysis,
    businessOfferings,
    competitorIntelligence,
    culturalContext,
    marketPositioning,
    contextWeights,
    useEnhancedPrompts = true
  } = options;

  console.log('🚀 [CONTENT GENERATOR] Starting content generation:', {
    topic,
    contentType,
    variantNumber,
    businessType,
    targetAudience
  });

  let finalPrompt: string;
  let finalSystemPrompt: string;
  let synthesizedContext: SynthesizedContext | null = null;

  try {
    // Try enhanced generation first
    if (useEnhancedPrompts) {
      console.log('🧠 [CONTENT GENERATOR] Attempting enhanced prompt generation...');

      // Default context weights optimized for content generation
      const defaultWeights: Partial<ContextWeighting> = {
        businessOfferings: 0.25,
        brandVoice: 0.25,
        competitorIntelligence: 0.20,
        culturalContext: 0.15,
        location: 0.10,
        marketPositioning: 0.05
      };

      const finalContextWeights = { ...defaultWeights, ...contextWeights };

      // Build context sources for enhanced generation
      const contextSources: ContextSources = {
        businessOfferings: businessOfferings || {
          services: businessType ? [{ name: businessType, category: 'primary' }] : [],
          products: [],
          specializations: [],
          uniqueValueProps: [],
          serviceAreas: location ? [location] : []
        },
        brandAnalysis: brandVoiceAnalysis || websiteAnalysisContext,
        competitorIntelligence,
        culturalPrompt: undefined,
        culturalRequest: undefined,
        culturalAnalysis: undefined,
        location: detailedLocation?.fullDisplay || location,
        businessType: businessType,
        targetAudience: targetAudience,
        contentAnalysis: websiteAnalysisContext,
        tonePreference: tone,
        additionalContext,
        userTopic: topic,
      };

      // Try to synthesize context - wrap in try/catch to prevent failures
      try {
        synthesizedContext = synthesizeContext(contextSources, finalContextWeights);
        console.log('✅ [CONTENT GENERATOR] Context synthesis successful');
      } catch (contextError) {
        console.warn('⚠️ [CONTENT GENERATOR] Context synthesis failed, using fallback:', contextError);
        synthesizedContext = null;
      }

      // Generate enhanced prompts specifically for content generation
      if (synthesizedContext) {
        try {
          const enhancedPrompts = generateContentSpecificPrompts(
            topic,
            contentType,
            tone,
            variantNumber,
            synthesizedContext,
            targetWordCount,
            tags,
            additionalContext
          );

          finalPrompt = enhancedPrompts.userPrompt;
          finalSystemPrompt = enhancedPrompts.systemPrompt;
          console.log('✅ [CONTENT GENERATOR] Enhanced prompts generated successfully');
        } catch (promptError) {
          console.warn('⚠️ [CONTENT GENERATOR] Enhanced prompt generation failed, using fallback:', promptError);
          throw promptError; // This will be caught by outer try/catch
        }
      } else {
        throw new Error('Context synthesis failed');
      }
    } else {
      throw new Error('Enhanced prompts disabled');
    }
  } catch (enhancedError) {
    console.log('🔄 [CONTENT GENERATOR] Falling back to legacy prompt generation:', enhancedError);

    // Fallback to legacy prompt generation
    try {
      const legacyPrompt = generateLegacyPrompt(
        topic,
        contentType,
        tone,
        variantNumber,
        targetWordCount,
        {
          businessType,
          targetAudience,
          location,
          detailedLocation,
          tags,
          brandVoiceAnalysis,
          websiteAnalysisContext,
          additionalContext
        }
      );

      finalPrompt = legacyPrompt.prompt;
      finalSystemPrompt = 'You are an expert content generator. Generate high-quality, original content based on the user\'s requirements. Respond with valid JSON only when requested.';
      console.log('✅ [CONTENT GENERATOR] Legacy prompts generated successfully');
    } catch (legacyError) {
      console.error('❌ [CONTENT GENERATOR] Even legacy prompt generation failed:', legacyError);

      // Ultimate fallback - generate a simple prompt without any complex processing
      const simplePromptResult = generateSimplePrompt(topic, contentType, tone, variantNumber, targetWordCount, businessType, targetAudience);
      finalPrompt = simplePromptResult.prompt;
      finalSystemPrompt = 'You are a professional content writer. Generate high-quality content based on the requirements.';
      console.log('🔄 [CONTENT GENERATOR] Using ultimate simple fallback prompt');
    }
  }

  try {
    console.log('🤖 [CONTENT GENERATOR] Calling AI service...');
    const client = getLemonfoxClient();
    const response = await client.generateCompletion({
      model: 'lemonfox-70b',
      prompt: finalPrompt,
      system_prompt: finalSystemPrompt,
      max_tokens: 2500, // Increased for richer content
      temperature: 0.7,
    });

    // Extract the content from the response
    const content = response.choices[0]?.message?.content || '';
    console.log('✅ [CONTENT GENERATOR] AI response received:', {
      contentLength: content.length,
      hasContent: content.length > 0
    });

    if (!content || content.trim().length === 0) {
      throw new Error('Empty response from AI service');
    }

    // Parse the response
    let generatedData;
    try {
      // Try to parse as JSON first
      generatedData = JSON.parse(content);
      console.log('✅ [CONTENT GENERATOR] Response parsed as JSON successfully');
    } catch (parseError) {
      console.log('🔄 [CONTENT GENERATOR] JSON parse failed, parsing as text response:', parseError instanceof Error ? parseError.message : String(parseError));
      // If not JSON, try to extract content from text response
      generatedData = parseTextResponse(content, topic, contentType);
    }

    // Ensure we have the required fields
    const title = generatedData.title || generateTitle(topic, contentType, tone);
    const generatedContent = generatedData.content || content;
    const targetKeywords = generatedData.targetKeywords || extractKeywords(generatedContent, tags);
    const seoScore = generatedData.seoScore || calculateSeoScore(generatedContent, targetKeywords);

    // Convert to HTML for storage
    const htmlContent = convertMarkdownToHtml(generatedContent);

    // Calculate actual word count
    const wordCount = generatedContent.split(/\s+/).filter((word: string) => word.length > 0).length;

    console.log('✅ [CONTENT GENERATOR] Content generation completed successfully:', {
      title,
      wordCount,
      keywordsCount: targetKeywords.length,
      seoScore
    });

    return {
      title,
      content: generatedContent,
      htmlContent,
      wordCount,
      targetKeywords,
      seoScore,
      generationPrompt: finalPrompt
    };

  } catch (error) {
    console.error('❌ [CONTENT GENERATOR] Content generation error:', error);

    // Fallback content generation
    console.log('🔄 [CONTENT GENERATOR] Using fallback content generation');
    return generateFallbackContent(options, finalPrompt);
  }
}

function generateSimplePrompt(
  topic: string,
  contentType: string,
  tone: string,
  variantNumber: number,
  targetWordCount: number,
  businessType?: string,
  targetAudience?: string
): { prompt: string } {
  const contentTypeConfig = CONTENT_TYPE_PROMPTS[contentType as keyof typeof CONTENT_TYPE_PROMPTS];

  let prompt = `Generate a ${contentType.replace('_', ' ')} about "${topic}".

Content Type: ${contentType.replace('_', ' ').toUpperCase()}
Target Word Count: ${targetWordCount} words
Tone: ${tone}
Variant: ${variantNumber} of 3
${businessType ? `Business Type: ${businessType}` : ''}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}

Content Structure:
${contentTypeConfig.structure}

Requirements:
- Create original, engaging content
- Match the specified tone exactly
- Include practical value for the reader
- End with a clear call-to-action
- Word count should be approximately ${targetWordCount} words

Please respond in this JSON format:
{
  "title": "Compelling title for the content",
  "content": "Full content in markdown format",
  "targetKeywords": ["keyword1", "keyword2", "keyword3"],
  "seoScore": 85
}`;

  return { prompt };
}

function generateTitle(topic: string, contentType: string, tone: string): string {
  const tonePrefixes = {
    professional: ['Ultimate Guide to', 'Complete Guide to', 'Professional'],
    casual: ['How to', 'Simple Guide to', 'Easy Ways to'],
    friendly: ['Your Guide to', 'Everything You Need to Know About', 'Welcome to'],
    authoritative: ['Expert Guide to', 'Master', 'Comprehensive'],
    conversational: ['Let\'s Talk About', 'What You Need to Know About', 'The Real Deal on'],
    humorous: ['The Funny Thing About', 'Seriously, Here\'s How to', 'No-Nonsense Guide to'],
    inspirational: ['Transform Your', 'Unlock the Power of', 'Discover the Secret to']
  };

  const prefixes = tonePrefixes[tone as keyof typeof tonePrefixes] || tonePrefixes.professional;
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  const contentTypeSuffix = {
    blog_post: 'Blog Post',
    social_media: 'Social Media Content',
    website_page: 'Web Page',
    email: 'Email',
    google_business_profile: 'Google Business Post'
  };

  return `${prefix} ${topic}`;
}

function extractKeywords(content: string, existingTags: string[]): string[] {
  // Simple keyword extraction - in a real implementation, this would be more sophisticated
  const words = content.toLowerCase().split(/\W+/);
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);

  const keywords = words
    .filter(word => word.length > 3 && !commonWords.has(word))
    .filter(word => content.toLowerCase().split(word).length > 2) // appears at least twice
    .slice(0, 10);

  // Include existing tags if they exist
  const uniqueKeywords = [...new Set([...keywords, ...existingTags])];
  return uniqueKeywords.slice(0, 8);
}

function calculateSeoScore(content: string, keywords: string[]): number {
  let score = 50; // Base score

  // Length score
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300) score += 10;
  if (wordCount >= 600) score += 10;
  if (wordCount >= 1000) score += 10;

  // Keyword density
  const totalWords = content.toLowerCase().split(/\s+/).length;
  const keywordCount = keywords.reduce((count, keyword) => {
    return count + (content.toLowerCase().split(keyword.toLowerCase()).length - 1);
  }, 0);

  const density = (keywordCount / totalWords) * 100;
  if (density >= 1 && density <= 3) score += 15;
  else if (density >= 0.5 && density <= 4) score += 10;

  // Structure score (headings, lists, etc.)
  if (content.includes('#')) score += 10; // Has headings
  if (content.includes('-') || content.includes('*')) score += 5; // Has lists
  if (content.includes('[') && content.includes(']')) score += 5; // Has links

  return Math.min(100, Math.max(0, score));
}

function convertMarkdownToHtml(markdown: string): string {
  // Simple markdown to HTML conversion
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/(<h[1-6]>.*<\/h[1-6]>)/g, '$1')
    .replace(/^(?!<[hul]).*$/gm, '<p>$&</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<\/p>/g, '$1');
}

function parseTextResponse(response: string, topic: string, contentType: string): any {
  // Try to extract title from response
  const titleMatch = response.match(/(?:Title:|title:|#)\s*(.+?)(?:\n|$)/i);
  const title = titleMatch ? titleMatch[1].trim() : generateTitle(topic, contentType, 'professional');

  // Extract content (everything that's not the title line)
  const content = response.replace(/(?:Title:|title:|#)\s*(.+?)(?:\n|$)/i, '').trim();

  return {
    title,
    content,
    targetKeywords: extractKeywords(content, []),
    seoScore: calculateSeoScore(content, [])
  };
}

// Enhanced content generation helper functions

function competitiveDifferentiator(competitorIntelligence: any): string {
  if (!competitorIntelligence?.competitors) {
    return 'Quality service and customer satisfaction';
  }

  const competitorWeaknesses = competitorIntelligence.competitors.flatMap((comp: any) =>
    comp.weaknesses || []
  );

  if (competitorWeaknesses.length > 0) {
    return `Addressing common industry gaps: ${competitorWeaknesses.slice(0, 2).join(', ')}`;
  }

  return 'Superior quality and customer-focused approach';
}

function generateContentSpecificPrompts(
  topic: string,
  contentType: string,
  tone: string,
  variantNumber: number,
  synthesizedContext: SynthesizedContext,
  targetWordCount: number,
  tags: string[],
  additionalContext?: string
): { systemPrompt: string; userPrompt: string } {
  const contentTypeConfig = CONTENT_TYPE_PROMPTS[contentType as keyof typeof CONTENT_TYPE_PROMPTS];
  const toneGuidelines = TONE_GUIDELINES[tone as keyof typeof TONE_GUIDELINES];
  const { businessIdentity, competitiveStrategy, culturalContext, contentStrategy, userPreferences } = synthesizedContext;

  const primaryLocation = businessIdentity.location || 'Global market';
  const localReferenceSnippet = culturalContext.localReferences.length > 0
    ? culturalContext.localReferences.slice(0, 3).join(', ')
    : 'Reference recognizable neighborhoods, landmarks, or regional concerns for the audience';

  const competitorAdvantages = competitiveStrategy.competitiveAdvantages.length > 0
    ? competitiveStrategy.competitiveAdvantages.slice(0, 3).join(', ')
    : 'Superior service quality, faster response, and trusted expertise';

  const competitorThreats = competitiveStrategy.competitorThreats.length > 0
    ? competitiveStrategy.competitorThreats.slice(0, 3).join(', ')
    : 'Low-cost competitors and national chains';

  const counterPositioning = competitiveStrategy.counterPositioning.length > 0
    ? competitiveStrategy.counterPositioning.slice(0, 3).join(', ')
    : 'Elevated customer experience, specialization, and bundled value';

  const differentiationFocus = competitiveStrategy.strategicDifferentiation.length > 0
    ? competitiveStrategy.strategicDifferentiation.slice(0, 3).join(', ')
    : 'Premium craftsmanship, transparent pricing, and community involvement';

  const userPreferenceSummary = `**USER PREFERENCE ALIGNMENT:**
- Requested Tone: ${userPreferences.desiredTone}
- Language Preference: ${userPreferences.languagePreference}
- Formality Preference: ${userPreferences.formalityPreference}
- Content Purpose: ${userPreferences.contentPurpose}
${userPreferences.additionalContext ? `- Campaign Notes: ${userPreferences.additionalContext}` : '- Campaign Notes: Not provided; derive from context insights'}
${userPreferences.competitorUrls.length > 0 ? `- Competitors to reference or counter: ${userPreferences.competitorUrls.join(', ')}` : '- Competitors to reference or counter: Use inferred intelligence'}`;

  // Enhanced system prompt with deep context integration
  const systemPrompt = `You are an elite content strategist and copywriter with expertise in creating highly personalized, contextually-aware content that drives engagement and conversions.

**CORE COMPETENCIES:**
- Deep brand voice integration and personality matching
- Cultural and linguistic adaptation for global markets
- SEO-optimized content creation with natural keyword integration
- Competitive positioning and unique value proposition articulation
- Audience-specific content personalization and value delivery

**CONTEXT SYNTHESIS MASTERY:**
You excel at weaving together multiple context sources into cohesive, compelling narratives:
- Brand personality and communication style adaptation
- Cultural nuance integration and localization
- Competitive positioning and differentiation
- Business offering expertise and service knowledge
- Location-specific targeting and community connection

**CONTENT EXCELLENCE STANDARDS:**
- Create content that feels authentically from the specified brand
- Integrate cultural context naturally without stereotyping
- Position offerings strategically against competitive landscape
- Match exact tone, personality, and communication preferences
- Provide genuine value to the target audience
- Optimize for search engines while maintaining readability

${userPreferenceSummary}

**REGIONAL & COMPETITOR INTELLIGENCE:**
- Primary market focus: ${primaryLocation}
- Local touchpoints to weave in: ${localReferenceSnippet}
- Competitive advantages to amplify: ${competitorAdvantages}
- Competitor threats to neutralize: ${competitorThreats}
- Counter-positioning themes: ${counterPositioning}
- Differentiation pillars: ${differentiationFocus}

**GLOBAL & SCALABILITY DIRECTIVES:**
- When location-specific, include insights that scale to broader regional or global audiences
- Highlight how recommendations adapt for multi-location presence when relevant
- Make reasoning explicit about whether guidance is local, regional, or global in scope

**ADDITIONAL CONTEXT COMPLIANCE:**
- Honor any extra campaign instructions exactly as provided
- Avoid contradicting supplied competitive or localization insights

**TECHNICAL REQUIREMENTS:**
- Follow specified content structure precisely
- Meet target word count within ±10%
- Include SEO elements naturally (headings, keywords, meta elements)
- Ensure content is original and plagiarism-free
- Respond in valid JSON format when requested

Generate content that demonstrates deep understanding of all context sources and creates authentic brand experiences.`;

  // Enhanced user prompt with comprehensive context integration
  let userPrompt = `**CONTENT GENERATION REQUEST**

**TOPIC:** ${topic}
**CONTENT TYPE:** ${contentType.replace('_', ' ').toUpperCase()}
**TONE:** ${tone.toUpperCase()} (${toneGuidelines.voice})
**TARGET WORD COUNT:** ${targetWordCount} words
**VARIANT:** ${variantNumber} of 3

---

**🎯 SYNTHESIZED BRAND STRATEGY:**

**Brand Identity & Voice:**
**Primary Tone:** ${synthesizedContext.brandVoice.primaryTone}
**Formality Level:** ${synthesizedContext.brandVoice.formalityLevel}
**Language Style:** ${synthesizedContext.brandVoice.languageStyle}
**Key Phrases:** ${synthesizedContext.brandVoice.keyPhrases.slice(0, 3).join(' • ')}
**Core Values:** ${synthesizedContext.brandVoice.coreValues.slice(0, 3).join(' • ')}

**Business Expertise:**
**Business Type:** ${synthesizedContext.businessIdentity.type}
**Primary Offerings:** ${synthesizedContext.businessIdentity.primaryOfferings.join(', ')}
**Unique Value Props:** ${synthesizedContext.businessIdentity.uniqueValueProps.slice(0, 2).join('. ')}
**Target Audience:** ${synthesizedContext.businessIdentity.targetAudience}

**Strategic Positioning:**
**Market Positioning:** ${synthesizedContext.competitiveStrategy.marketPositioning.slice(0, 2).join(' • ')}
**Competitive Advantages:** ${synthesizedContext.competitiveStrategy.competitiveAdvantages.slice(0, 3).join(' • ')}
**Strategic Differentiation:** ${synthesizedContext.competitiveStrategy.strategicDifferentiation.slice(0, 2).join(' • ')}

---

**🌍 CULTURAL & LOCALIZATION CONTEXT:**

**Communication Style:** ${synthesizedContext.culturalContext.communicationStyle}
**Cultural Nuances:** ${synthesizedContext.culturalContext.culturalNuances.slice(0, 3).join('; ')}
**Language Guidelines:** ${synthesizedContext.culturalContext.languageGuidelines}
**Formality Requirements:** ${synthesizedContext.culturalContext.formalityRequirements}
**Local References:** ${synthesizedContext.culturalContext.localReferences.slice(0, 2).join(', ')}

${synthesizedContext.businessIdentity.location ? `
**Location Targeting:**
**Primary Location:** ${synthesizedContext.businessIdentity.location}
**Local Elements:** ${synthesizedContext.culturalContext.localReferences.slice(0, 2).join(' • ')}
` : ''}

---

**📍 REGIONAL EXECUTION:**
- Primary market focus: ${primaryLocation}
- Integrate local cues like ${localReferenceSnippet}
- Reference seasonal or regional priorities: ${contentStrategy.locationSpecificTopics.slice(0, 3).join(', ') || 'Tie messaging to recognizable local needs'}
- Include hyperlocal variations (neighborhoods, ZIP codes, landmarks) alongside broader city coverage
- Clearly label when guidance is local vs. regional vs. global

**🌐 GLOBAL ALIGNMENT:**
- Bridge ${primaryLocation === 'Global market' ? 'multi-region audiences' : `${primaryLocation} insights`} to wider audiences
- Include at least one section or CTA that works for broader markets while respecting local nuance
- If no explicit location, demonstrate how content adapts to different geographies in reasoning

---

**⚔️ COMPETITIVE INTELLIGENCE:**

**Market Positioning:** ${synthesizedContext.competitiveStrategy.marketPositioning.slice(0, 2).join(', ')}
**Content Gaps to Target:** ${synthesizedContext.competitiveStrategy.contentGapsToTarget.slice(0, 3).join(', ')}
**Market Opportunities:** ${synthesizedContext.competitiveStrategy.marketOpportunities.slice(0, 2).join(' • ')}
**Advantages to Amplify:** ${competitorAdvantages}
**Threats to Counter:** ${competitorThreats}
**Counter-Positioning Themes:** ${counterPositioning}

---

**👤 USER INPUT ALIGNMENT:**
- Requested Tone: ${userPreferences.desiredTone}
- Language Preference: ${userPreferences.languagePreference}
- Formality Preference: ${userPreferences.formalityPreference}
- Content Purpose: ${userPreferences.contentPurpose}
${userPreferences.additionalContext ? `- Campaign Notes: ${userPreferences.additionalContext}` : '- Campaign Notes: Use context insights to infer messaging priorities'}
${userPreferences.competitorUrls.length > 0 ? `- Competitors to reference/counter: ${userPreferences.competitorUrls.join(', ')}` : '- Competitors to reference/counter: Draw from competitive intelligence' }

---

**📝 CONTENT REQUIREMENTS:**

**Content Structure:**
${contentTypeConfig.structure}

**Tone Implementation:**
**Style Guidelines:** ${toneGuidelines.style}
**Voice Characteristics:** ${toneGuidelines.voice}

**SEO Integration:**
**Target Keywords:** ${tags.join(', ')}
**Strategic Keywords:** ${synthesizedContext.contentStrategy.strategicKeywords.slice(0, 5).join(', ')}
**Service-Specific Topics:** ${synthesizedContext.contentStrategy.serviceSpecificTopics.slice(0, 3).join(', ')}

**Variant Strategy:**
This is VARIANT ${variantNumber}. Approach:
${variantNumber === 1 ? '📚 **EDUCATIONAL FOCUS**: Emphasize expertise, share insights, and provide valuable knowledge that positions the brand as a thought leader.' : ''}
${variantNumber === 2 ? '🎯 **PRACTICAL APPLICATION**: Focus on real-world benefits, specific use cases, and tangible outcomes that demonstrate value.' : ''}
${variantNumber === 3 ? '🚀 **INSPIRATIONAL ANGLE**: Create emotional connection, showcase transformation possibilities, and motivate audience action.' : ''}

---

**🎨 CONTENT DIRECTIVES:**

**Brand Voice Execution:**
- Write exactly as this brand would communicate
- Use their specific terminology and phrases naturally
- Reflect their core values throughout the content
- Match their preferred content structure and formatting

**Cultural Integration:**
- Apply cultural nuances authentically
- Use appropriate formality and communication style
- Incorporate localization elements naturally
- Avoid cultural stereotypes or inappropriate references

**Competitive Positioning:**
- Highlight unique advantages over competitors
- Address competitive gaps identified in the analysis
- Emphasize differentiation opportunities
- Position offerings as superior solutions

**Location Targeting:**
- Reference local context and community elements
- Use geographic keywords naturally
- Connect with local audience values and needs
- Demonstrate understanding of local market
- Mention local proof points (reviews, case studies, certifications) and community involvement when relevant
- Incorporate "near me" or voice-search friendly phrasing without sounding forced
- Call out opportunities to strengthen Google Business Profile, local citations, or map pack visibility

**📣 LOCAL SEO IMPACT:**
- Highlight how this content supports service-area expansion, neighborhood dominance, or regional authority
- Suggest calls-to-action that drive in-market conversions (e.g., visit showroom, schedule local inspection, request neighborhood-specific quote)
- Note any compliance or local regulation considerations that build trust

---

${additionalContext ? `**📌 CAMPAIGN CONTEXT:**
${additionalContext}

---

` : ''}

---

**📋 QUALITY REQUIREMENTS:**
- Original, plagiarism-free content
- SEO-optimized with natural keyword integration
- Compelling, value-driven content
- Clear call-to-action appropriate for content type
- Word count: ${targetWordCount} ±10%
- Proper formatting with markdown structure

**RESPONSE FORMAT:**
Return in this JSON format:
{
  "title": "Compelling, brand-aligned title",
  "content": "Full content in markdown format",
  "targetKeywords": ["primary", "secondary", "tertiary"],
  "seoScore": 85
}`;

  return { systemPrompt, userPrompt };
}

function generateLegacyPrompt(
  topic: string,
  contentType: string,
  tone: string,
  variantNumber: number,
  targetWordCount: number,
  legacyOptions: any
): { prompt: string } {
  const { businessType, targetAudience, location, detailedLocation, tags, brandVoiceAnalysis, websiteAnalysisContext, additionalContext } = legacyOptions;
  const contentTypeConfig = CONTENT_TYPE_PROMPTS[contentType as keyof typeof CONTENT_TYPE_PROMPTS];
  const toneGuidelines = TONE_GUIDELINES[tone as keyof typeof TONE_GUIDELINES];

  let prompt = `Generate ${contentTypeConfig.instructions} for the following topic:

TOPIC: ${topic}
CONTENT TYPE: ${contentType.replace('_', ' ').toUpperCase()}
TONE: ${tone.toUpperCase()} (${toneGuidelines.voice})
TARGET WORD COUNT: ${targetWordCount} words
VARIANT NUMBER: ${variantNumber} of 3

BUSINESS CONTEXT:
- Business Type: ${businessType || 'General business'}
- Target Audience: ${targetAudience || 'General audience'}
${detailedLocation ? `- Location: ${detailedLocation.fullDisplay}
${detailedLocation.searchContext ? `- Location Context: ${detailedLocation.searchContext}` : ''}
${detailedLocation.geographicContext ? `- Cultural Context: ${detailedLocation.geographicContext}` : ''}
${detailedLocation.localizedDescription ? `- Local Description: ${detailedLocation.localizedDescription}` : ''}` : location ? `- Location: ${location}` : ''}
- Target Keywords: ${tags?.join(', ') || ''}

TONE GUIDELINES:
Style: ${toneGuidelines.style}
Voice: ${toneGuidelines.voice}

CONTENT STRUCTURE:
${contentTypeConfig.structure}`;

  // Add brand voice context if available
  if (brandVoiceAnalysis) {
    const { brandVoiceProfile, personalizationRecommendations, targetLanguageStyle } = brandVoiceAnalysis;
    prompt += `

ENHANCED BRAND VOICE CONTEXT:
**Brand Profile:** ${targetLanguageStyle}
**Key Brand Phrases:** ${brandVoiceProfile.keyPhrases.slice(0, 8).join(', ')}
**Unique Terminology:** ${brandVoiceProfile.uniqueTerminology.slice(0, 5).join(', ')}
**Branded Terms:** ${brandVoiceProfile.brandedTerms.join(', ')}
**Core Values:** ${brandVoiceProfile.coreValues.join(', ')}
**Communication Style:** ${brandVoiceProfile.perspective} perspective, ${brandVoiceProfile.formalityLevel} formality

**CONTENT CREATION REQUIREMENTS:**
${personalizationRecommendations.contentCreation.map((rec: string) => `- ${rec}`).join('\n')}

**BRAND CONSISTENCY REQUIREMENTS:**
${personalizationRecommendations.brandConsistency.map((rec: string) => `- ${rec}`).join('\n')}

IMPORTANT: Write content that sounds exactly like it comes from this business. Use their terminology, match their communication style, and reflect their core values naturally throughout the content.`;
  }

  // Add legacy website analysis context for backwards compatibility
  if (websiteAnalysisContext && !brandVoiceAnalysis) {
    prompt += `

WEBSITE CONTEXT FOR BRAND CONSISTENCY:
- Brand Voice: ${websiteAnalysisContext.brandVoice || 'Professional and trustworthy'}
- Key Phrases: ${websiteAnalysisContext.keyPhrases?.join(', ') || 'N/A'}
- Services: ${websiteAnalysisContext.services?.join(', ') || 'N/A'}
- About Company: ${websiteAnalysisContext.aboutInfo || 'N/A'}

IMPORTANT: Match the established brand voice and incorporate relevant key phrases naturally.`;
  }

  // Add additional context if provided
  if (additionalContext) {
    prompt += `

ADDITIONAL INSTRUCTIONS:
${additionalContext}`;
  }

  // Add variant-specific instructions
  prompt += `

VARIANT INSTRUCTIONS:
This is variant ${variantNumber} of 3. Make this version unique while maintaining the core message and quality.
${variantNumber === 1 ? 'Focus on the educational/informative angle.' : ''}
${variantNumber === 2 ? 'Focus on the practical application/benefits angle.' : ''}
${variantNumber === 3 ? 'Focus on the inspirational/motivational angle.' : ''}

REQUIREMENTS:
- Content must be original and plagiarism-free
- Include SEO-friendly headings and structure
- Provide real value to the target audience
- Match the specified tone exactly
- Use clear, compelling language
- End with a clear call-to-action
- Word count should be approximately ${targetWordCount} words

FORMAT RESPONSE:
Return the content in the following JSON format:
{
  "title": "Compelling title for the content",
  "content": "Full content in markdown format",
  "targetKeywords": ["keyword1", "keyword2", "keyword3"],
  "seoScore": 85
}`;

  return { prompt };
}

function generateFallbackContent(options: ContentGenerationOptions, prompt: string): GeneratedContent {
  const { topic, contentType, tone, targetWordCount } = options;

  const fallbackContent = `# ${generateTitle(topic, contentType, tone)}

This is placeholder content for "${topic}" written in a ${tone} tone.

The AI content generation service is temporarily unavailable, but you can use this as a starting point for your ${contentType.replace('_', ' ')}.

## Next Steps

1. Customize this content to match your brand voice
2. Add specific examples and case studies
3. Include relevant statistics and data
4. Optimize for your target keywords
5. Add a clear call-to-action

This content should be approximately ${targetWordCount} words when fully developed.`;

  const wordCount = fallbackContent.split(/\s+/).length;
  const htmlContent = convertMarkdownToHtml(fallbackContent);

  return {
    title: generateTitle(topic, contentType, tone),
    content: fallbackContent,
    htmlContent,
    wordCount,
    targetKeywords: [topic],
    seoScore: 50,
    generationPrompt: prompt
  };
}
