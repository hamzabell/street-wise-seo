import { getLemonfoxClient } from './lemonfox-client';
import { analyzeBrandVoice, type BrandAnalysisInsights } from './brand-voice-analyzer';
import { type DetailedLocation } from './location-service';

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
    brandVoiceAnalysis
  } = options;

  const contentTypeConfig = CONTENT_TYPE_PROMPTS[contentType];
  const toneGuidelines = TONE_GUIDELINES[tone];

  // Build comprehensive prompt
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
- Target Keywords: ${tags.join(', ')}

TONE GUIDELINES:
Style: ${toneGuidelines.style}
Voice: ${toneGuidelines.voice}

CONTENT STRUCTURE:
${contentTypeConfig.structure}`;

  // Add enhanced brand voice context if available
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
**Content Preferences:** ${brandVoiceProfile.contentStructure.usesLists ? 'Uses lists and structured content' : 'Prefers narrative content'}

**CONTENT CREATION REQUIREMENTS:**
${personalizationRecommendations.contentCreation.map(rec => `- ${rec}`).join('\n')}

**BRAND CONSISTENCY REQUIREMENTS:**
${personalizationRecommendations.brandConsistency.map(rec => `- ${rec}`).join('\n')}

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

  try {
    const client = getLemonfoxClient();
    const response = await client.generateCompletion({
      model: 'lemonfox-70b',
      prompt,
      system_prompt: 'You are an expert content generator. Generate high-quality, original content based on the user\'s requirements. Respond with valid JSON only when requested.',
      max_tokens: 2000,
      temperature: 0.7,
    });

    // Extract the content from the response
    const content = response.choices[0]?.message?.content || '';

    // Parse the response
    let generatedData;
    try {
      // Try to parse as JSON first
      generatedData = JSON.parse(content);
    } catch (parseError) {
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

    return {
      title,
      content: generatedContent,
      htmlContent,
      wordCount,
      targetKeywords,
      seoScore,
      generationPrompt: prompt
    };

  } catch (error) {
    console.error('Content generation error:', error);

    // Fallback content generation
    return generateFallbackContent(options, prompt);
  }
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