/**
 * Lemonfox.ai API client for AI-powered SEO topic generation
 */

import { cleanMarkdown, cleanTopicList, extractCleanJson, parseAndCleanStructuredResponse, cleanAIResponse, cleanTopicTitle } from './markdown-parser';

export interface LemonfoxGenerationRequest {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  system_prompt?: string;
}

export interface LemonfoxGenerationResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LemonfoxError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export class LemonfoxClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.lemonfox.ai/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateCompletion(request: LemonfoxGenerationRequest): Promise<LemonfoxGenerationResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: [
          ...(request.system_prompt ? [{ role: 'system', content: request.system_prompt }] : []),
          { role: 'user', content: request.prompt }
        ],
        max_tokens: request.max_tokens || 2000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorData: LemonfoxError = await response.json().catch(() => ({
        error: { message: 'Unknown error occurred', type: 'unknown' }
      }));
      throw new Error(`Lemonfox API error: ${errorData.error.message}`);
    }

    const data: LemonfoxGenerationResponse = await response.json();
    return data;
  }

  async generateSEOTopics(
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string,
    websiteAnalysis?: any,
    contentAnalysis?: any,
    industryId?: string,
    seasonalTopics?: string[]
  ): Promise<Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
  }>> {
    const systemPrompt = `You are an SEO topic generator for small local service businesses. Generate practical topics that customers actually search for.

CRITICAL RULES:
- Respond with ONLY a numbered list of topics and their reasoning
- NO introductions, explanations, or conclusions
- NO phrases like "Here are some topics..." or "Based on the context..."
- Start directly with "1. Topic Title | Specific Reasoning | Source"
- Each topic on its own line
- Generate exactly 10-15 topics
- Format: "Topic Title | Specific Reasoning | Source"
- Topics must be complete sentences ending with proper punctuation
- Focus on local search and practical customer problems
- Include seasonal topics when relevant
- Emphasize voice search and mobile-friendly topics
- Source must be one of: website_gap, competitor_advantage, content_opportunity, ai

IMPORTANT: Focus on small business needs:
- Generate topics that address real customer pain points
- Include local search variations ("plumber near me", "best electrician in [city]")
- Consider voice search queries ("How to fix...", "Where can I find...")
- Emphasize action-oriented and educational content
- Topics should help small businesses attract local customers

Sources:
- website_gap: Addresses missing content for local customers
- competitor_advantage: Helps compete with local competitors
- content_opportunity: Builds on existing local business content
- ai: General small business topic suggestion`;

    let prompt = `Business: ${businessType}
Audience: ${targetAudience}${location ? `\nLocation: ${location}` : ''}
Base topic: ${topic}${seasonalTopics && seasonalTopics.length > 0 ? `\nSeasonal Focus: ${seasonalTopics.slice(0, 3).join(', ')}` : ''}`;

    // Add website-specific context if available
    if (websiteAnalysis && contentAnalysis) {
      const gaps = contentAnalysis.contentGaps?.slice(0, 5).map((gap: any) =>
        `${gap.topic}: ${gap.reason} (priority: ${gap.priority})`
      ).join(', ') || '';

      const competitorGaps = contentAnalysis.competitorAnalysis?.missingTopics?.slice(0, 5).join(', ') || '';
      const opportunities = contentAnalysis.keywordOpportunities?.slice(0, 5).map((opp: any) =>
        `${opp.keyword} (current: ${opp.currentUsage}, potential: ${opp.potentialUsage})`
      ).join(', ') || '';

      // Add existing content strengths
      const existingTopics = websiteAnalysis.topics?.slice(0, 5).join(', ') || '';
      const highPriorityTopics = contentAnalysis.contentGaps?.filter((gap: any) => gap.priority === 'high')
        .map((gap: any) => gap.topic).slice(0, 3).join(', ') || '';

      prompt += `

WEBSITE ANALYSIS RESULTS:
**YOUR WEBSITE (${websiteAnalysis.domain}):**
- Pages crawled: ${websiteAnalysis.crawledPages?.length || 0}
- Current topics: ${existingTopics}
- Total words analyzed: ${websiteAnalysis.totalWordCount || 0}

**MISSING CONTENT (High Priority):**
${highPriorityTopics ? '- ' + contentAnalysis.contentGaps.filter((gap: any) => gap.priority === 'high')
        .map((gap: any) => `${gap.topic}: ${gap.reason}`).join('\n- ') : 'None identified'}

**ALL CONTENT GAPS:**
${gaps || 'None identified'}

**COMPETITOR ADVANTAGES:**
${competitorGaps || 'No competitor analysis available'}

**KEYWORD OPPORTUNITIES:**
${opportunities || 'No specific opportunities identified'}

**ACTIONABLE INSIGHTS:**
Generate topics that specifically address the gaps and opportunities above. Reference specific findings in your reasoning.`;
    }

    prompt += `

Generate 10-15 SEO topics with reasoning now. Start with "1."`;

    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      // Parse the new format: "Topic | Reasoning | Source"
      let topicsWithReasoning = this.parseTopicsWithReasoning(content);

      // If parsing fails, fallback to regular topics with specific reasoning based on content analysis
      if (topicsWithReasoning.length < 5) {
            const basicTopics = this.extractTopicsWithRegex(content);
        topicsWithReasoning = basicTopics.map(t => ({
          topic: t,
          reasoning: this.generateSpecificReasoning(t, businessType, targetAudience, contentAnalysis, websiteAnalysis),
          source: this.determineTopicSource(t, contentAnalysis, websiteAnalysis)
        }));
      }

      // Final fallback - generate basic topics ourselves if AI completely fails
      if (topicsWithReasoning.length === 0) {
              const fallbackTopics = this.generateFallbackTopics(topic, businessType, targetAudience, location);
        topicsWithReasoning = fallbackTopics.map(t => ({
          topic: t,
          reasoning: this.generateSpecificReasoning(t, businessType, targetAudience, contentAnalysis, websiteAnalysis),
          source: this.determineTopicSource(t, contentAnalysis, websiteAnalysis)
        }));
      }

      return topicsWithReasoning.slice(0, 15);
    } catch (error) {
      console.error('Error generating SEO topics:', error);
      throw new Error('Failed to generate SEO topics');
    }
  }

  private parseTopicsWithReasoning(content: string): Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
  }> {
    const topics: Array<{
      topic: string;
      reasoning: string;
      source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
      relatedContent?: string;
    }> = [];

    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and headers
      if (!trimmed ||
          trimmed.toLowerCase().includes('here are') ||
          trimmed.toLowerCase().includes('based on') ||
          !/^\d+\./.test(trimmed)) {
        continue;
      }

      // Try to parse the format: "1. Topic | Reasoning | Source"
      const match = trimmed.match(/^\d+\.\s*(.+)$/);
      if (!match) continue;

      const topicContent = match[1];

      // Try to split by pipe character
      const parts = topicContent.split('|').map(p => p.trim());

      if (parts.length >= 3) {
        // Extract the topic title (first part) - this should NOT include reasoning
        let topicText = parts[0].trim();
        const reasoning = parts[1].trim();
        const sourceText = parts[2].toLowerCase();

        // Additional cleaning: ensure the topic text doesn't contain reasoning-like content
        // Remove any trailing numbers or fragments that might be from the reasoning
        topicText = topicText.replace(/\s+\d+$/, ''); // Remove trailing numbers like " 9"
        topicText = topicText.replace(/\s+\|\s*.*$/, ''); // Remove any trailing pipe content

        // Apply cleanTopicTitle to remove any remaining source identifiers
        topicText = cleanTopicTitle(topicText);

        // Validate and clean the source
        let source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
        if (sourceText.includes('website_gap') || sourceText.includes('website gap')) {
          source = 'website_gap';
        } else if (sourceText.includes('competitor') || sourceText.includes('advantage')) {
          source = 'competitor_advantage';
        } else if (sourceText.includes('opportunity') || sourceText.includes('content')) {
          source = 'content_opportunity';
        } else {
          source = 'ai';
        }

        // Validate reasoning specificity - reject generic reasoning
        if (this.isGenericReasoning(reasoning) && source !== 'ai') {
          console.warn(`⚠️ Generic reasoning detected for non-AI topic: "${reasoning}" - marking as AI`);
          source = 'ai';
        }

        // Only add if the topic looks valid - more lenient validation
        const isTopicValid = topicText.length > 10 && topicText.length < 200 &&
          (!topicText.includes('reasoning') && !topicText.includes('advantage') && !topicText.includes('opportunity')) &&
          (topicText.endsWith('.') || topicText.endsWith('?') || topicText.endsWith('!') || topicText.length > 20);

        if (isTopicValid && reasoning.length > 10) {
          topics.push({
            topic: topicText,
            reasoning: reasoning,
            source: source,
            relatedContent: parts[3] || undefined
          });
        }
      } else if (parts.length === 1) {
        // Fallback: just the topic, add basic reasoning
        let topicText = parts[0].trim();

        // Clean the topic text to remove any trailing reasoning fragments
        topicText = topicText.replace(/\s+\d+$/, ''); // Remove trailing numbers
        topicText = topicText.replace(/\s+\|\s*.*$/, ''); // Remove any trailing pipe content

        // Apply cleanTopicTitle
        topicText = cleanTopicTitle(topicText);

        // More lenient validation for fallback
        const isTopicValid = topicText.length > 10 && topicText.length < 200 &&
          (!topicText.includes('reasoning') && !topicText.includes('advantage') && !topicText.includes('opportunity')) &&
          (topicText.endsWith('.') || topicText.endsWith('?') || topicText.endsWith('!') || topicText.length > 20);

        if (isTopicValid) {
          topics.push({
            topic: topicText,
            reasoning: 'AI-generated topic based on business context',
            source: 'ai'
          });
        }
      }
    }

    return topics;
  }

  private isGenericReasoning(reasoning: string): boolean {
    const genericPatterns = [
      /ai-generated topic based on.*business context/,
      /ai-generated topic based on.*audience/,
      /general topic for/,
      /topic suggestion for/,
      /business context/,
      /audience context/,
      /based on the provided/,
      /generated for/,
      /suggested topic/
    ];

    return genericPatterns.some(pattern => pattern.test(reasoning.toLowerCase()));
  }

  private extractTopicsWithRegex(content: string): string[] {
    const topics: string[] = [];

    // Try to match numbered list patterns
    const numberedMatches = content.match(/\d+\.\s+([^.!?]*[.!?]?)/g);
    if (numberedMatches) {
      for (const match of numberedMatches) {
        const topic = match.replace(/^\d+\.\s*/, '').trim();
        if (topic.length > 5 && topic.length < 200 &&
            !topic.toLowerCase().includes('generated') &&
            !topic.toLowerCase().includes('based on')) {
          topics.push(topic);
        }
      }
    }

    // Try to match bullet points
    const bulletMatches = content.match(/[-*+]\s+([^.!?]*[.!?]?)/g);
    if (bulletMatches) {
      for (const match of bulletMatches) {
        const topic = match.replace(/^[-*+]\s*/, '').trim();
        if (topic.length > 5 && topic.length < 200 && !topics.includes(topic)) {
          topics.push(topic);
        }
      }
    }

    return topics;
  }

  private generateFallbackTopics(topic: string, businessType: string, targetAudience: string, location?: string): string[] {
    const locationText = location ? ` in ${location}` : '';
    const baseTopics = [
      `How to ${topic.toLowerCase()} for ${targetAudience}${locationText}`,
      `${businessType} Guide to ${topic} for ${targetAudience}`,
      `Top ${topic} Strategies for ${targetAudience} ${businessType}s`,
      `${topic} Best Practices for ${targetAudience}`,
      `Complete ${topic} Guide for ${businessType} Owners`,
      `${targetAudience} ${topic} Solutions That Work`,
      `Affordable ${topic} Options for ${targetAudience}`,
      `${topic} Mistakes to Avoid for ${businessType}s`,
      `Professional ${topic} Services for ${targetAudience}`,
      `${topic} Trends Every ${targetAudience} Should Know`,
    ];

    return baseTopics.slice(0, 10);
  }

  private generateSpecificReasoning(
    topic: string,
    businessType: string,
    targetAudience: string,
    contentAnalysis?: any,
    websiteAnalysis?: any
  ): string {
    // If we have content analysis, generate specific reasoning
    if (contentAnalysis && websiteAnalysis) {
      const topicLower = topic.toLowerCase();
      const topicWords = topicLower.split(/\s+/).filter((w: string) => w.length > 2);

      // Enhanced content gap reasoning with semantic matching
      if (contentAnalysis.contentGaps?.length > 0) {
        const matchingGap = contentAnalysis.contentGaps.find((gap: any) => {
          const gapLower = gap.topic.toLowerCase();
          const gapWords = gapLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(gapLower) || gapLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => gapWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (matchingGap) {
          const priorityText = matchingGap.priority === 'high' ? 'critical' : 'important';
          return `Your website is missing "${matchingGap.topic}" content which ${matchingGap.reason.toLowerCase()}. This addresses a ${priorityText} content gap for ${targetAudience}.`;
        }
      }

      // Enhanced competitor advantage reasoning
      if (contentAnalysis.competitorAnalysis?.missingTopics?.length > 0) {
        const competitorTopic = contentAnalysis.competitorAnalysis.missingTopics.find((compTopic: string) => {
          const compLower = compTopic.toLowerCase();
          const compWords = compLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(compLower) || compLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => compWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (competitorTopic) {
          return `Competitors have content about "${competitorTopic}" that you're missing. This topic helps you compete effectively in the ${businessType} market.`;
        }
      }

      // Enhanced existing content reasoning
      if (websiteAnalysis.topics?.length > 0) {
        const existingTopic = websiteAnalysis.topics.find((existingTopic: string) => {
          const existingLower = existingTopic.toLowerCase();
          const existingWords = existingLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(existingLower) || existingLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => existingWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (existingTopic) {
          return `Build on your existing "${existingTopic}" content by expanding with this topic for ${targetAudience}. This strengthens your content cluster.`;
        }
      }

      // Enhanced keyword opportunity reasoning
      if (contentAnalysis.keywordOpportunities?.length > 0) {
        const keywordOpp = contentAnalysis.keywordOpportunities.find((opp: any) => {
          const keywordLower = opp.keyword.toLowerCase();
          const keywordWords = keywordLower.split(/\s+/).filter((w: string) => w.length > 2);

          // Direct keyword matching
          if (topicLower.includes(keywordLower) || keywordLower.includes(topicLower)) {
            return true;
          }

          // Semantic matching
          const sharedWords = topicWords.filter(word => keywordWords.includes(word));
          return sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3);
        });

        if (keywordOpp) {
          const potentialIncrease = keywordOpp.potentialUsage - keywordOpp.currentUsage;
          return `"${keywordOpp.keyword}" appears ${keywordOpp.currentUsage} times on your site but has potential for ${keywordOpp.potentialUsage} usages. This topic helps you capture ${potentialIncrease} more keyword opportunities.`;
        }
      }

      // Content cluster opportunity reasoning
      if (contentAnalysis.contentClusters?.length > 0) {
        const relevantCluster = contentAnalysis.contentClusters.find((cluster: any) => {
          const clusterLower = cluster.mainTopic.toLowerCase();
          const clusterWords = clusterLower.split(/\s+/).filter((w: string) => w.length > 2);

          const sharedWords = topicWords.filter(word => clusterWords.includes(word));
          return sharedWords.length >= 1;
        });

        if (relevantCluster) {
          return `This topic expands your "${relevantCluster.mainTopic}" content cluster, helping you build topical authority and improve internal linking for ${targetAudience}.`;
        }
      }

      // SEO insight-based reasoning
      if (contentAnalysis.seoInsights?.length > 0) {
        const relevantInsight = contentAnalysis.seoInsights.find((insight: any) =>
          insight.type === 'content_cluster' &&
          (topicLower.includes('guide') || topicLower.includes('complete') || topicLower.includes('comprehensive'))
        );

        if (relevantInsight) {
          return `This comprehensive topic addresses ${relevantInsight.description.toLowerCase()} It will help improve your content quality and SEO performance.`;
        }
      }

      // High-priority gap reasoning based on industry
      const highPriorityGaps = contentAnalysis.contentGaps?.filter((gap: any) => gap.priority === 'high');
      if (highPriorityGaps?.length > 0) {
        return `While you have some content, this topic addresses critical gaps identified in your website analysis, helping you better serve ${targetAudience} in the ${businessType} space.`;
      }
    }

    // Fallback to business-specific reasoning
    return `${businessType} business targeting ${targetAudience} needs this content to attract and convert customers.`;
  }

  private determineTopicSource(
    topic: string,
    contentAnalysis?: any,
    websiteAnalysis?: any
  ): 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity' {
    if (!contentAnalysis || !websiteAnalysis) {
      return 'ai';
    }

    const topicLower = topic.toLowerCase();
    const topicWords = topicLower.split(/\s+/).filter((w: string) => w.length > 2);

    // Enhanced content gap matching - semantic matching
    if (contentAnalysis.contentGaps?.length > 0) {
      const matchingGap = contentAnalysis.contentGaps.find((gap: any) => {
        const gapLower = gap.topic.toLowerCase();
        const gapWords = gapLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(gapLower) || gapLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching - check for shared meaningful words
        const sharedWords = topicWords.filter(word => gapWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (matchingGap) {
        return 'website_gap';
      }
    }

    // Enhanced competitor advantage matching
    if (contentAnalysis.competitorAnalysis?.missingTopics?.length > 0) {
      const competitorTopic = contentAnalysis.competitorAnalysis.missingTopics.find((compTopic: string) => {
        const compLower = compTopic.toLowerCase();
        const compWords = compLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(compLower) || compLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching
        const sharedWords = topicWords.filter(word => compWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (competitorTopic) {
        return 'competitor_advantage';
      }
    }

    // Enhanced existing content matching
    if (websiteAnalysis.topics?.length > 0) {
      const existingTopic = websiteAnalysis.topics.find((existingTopic: string) => {
        const existingLower = existingTopic.toLowerCase();
        const existingWords = existingLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(existingLower) || existingLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching
        const sharedWords = topicWords.filter(word => existingWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (existingTopic) {
        return 'content_opportunity';
      }
    }

    // Enhanced keyword opportunity matching
    if (contentAnalysis.keywordOpportunities?.length > 0) {
      const keywordOpp = contentAnalysis.keywordOpportunities.find((opp: any) => {
        const keywordLower = opp.keyword.toLowerCase();
        const keywordWords = keywordLower.split(/\s+/).filter((w: string) => w.length > 2);

        // Direct keyword matching
        if (topicLower.includes(keywordLower) || keywordLower.includes(topicLower)) {
          return true;
        }

        // Semantic matching
        const sharedWords = topicWords.filter(word => keywordWords.includes(word));
        if (sharedWords.length >= 1 && (sharedWords.length >= 2 || topicWords.length <= 3)) {
          return true;
        }

        return false;
      });

      if (keywordOpp) {
        return 'content_opportunity';
      }
    }

    // Business context matching for content opportunities
    if (contentAnalysis.seoInsights?.length > 0) {
      const hasContentClusterInsight = contentAnalysis.seoInsights.some((insight: any) =>
        insight.type === 'content_cluster' &&
        (topicLower.includes('content') || topicLower.includes('guide') || topicLower.includes('cluster'))
      );

      if (hasContentClusterInsight) {
        return 'content_opportunity';
      }
    }

    return 'ai';
  }

  async analyzeTopicMetadata(topicsWithReasoning: Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
  }>): Promise<Array<{
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    suggestedTags: string[];
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
  }>> {
    const systemPrompt = `You are an SEO expert. Analyze the provided topics and estimate their SEO metrics.

For each topic, provide:
- Difficulty: easy, medium, or hard (based on competition)
- Search Volume: estimated monthly searches (use ranges like 100-500, 500-1000, 1000-5000, 5000+)
- Competition: low, medium, or high
- Suggested Tags: 3-5 relevant keywords/tags

Respond with JSON only, no formatting or explanations. If you must format, use a JSON array without markdown formatting.`;

    const prompt = `Analyze these topics for SEO metrics:
${topicsWithReasoning.map((item, index) => `${index + 1}. ${item.topic}`).join('\n')}

IMPORTANT: Respond with VALID JSON only. All string values must be in double quotes. All numeric values must be actual numbers (not ranges).

Example format:
[
  {
    "difficulty": "medium",
    "searchVolume": 1000,
    "competition": "medium",
    "suggestedTags": ["seo", "marketing", "business"]
  }
]

For searchVolume, use the midpoint of ranges:
- 100-500 → 300
- 500-1000 → 750
- 1000-5000 → 3000
- 5000+ → 7500
- low → 300
- medium → 1000
- high → 3000`;

    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent analysis
      });

      const content = response.choices[0]?.message?.content || '';

      // Use the new markdown parser to extract clean JSON
      try {
        const jsonContent = extractCleanJson(content);
        const parsed = JSON.parse(jsonContent);

        if (Array.isArray(parsed)) {
          return parsed.map((item, index) => {
            const originalTopic = topicsWithReasoning[index] || topicsWithReasoning[0];
            return {
              ...originalTopic,
              difficulty: this.validateDifficulty(item.difficulty),
              searchVolume: this.parseSearchVolume(item.searchVolume),
              competition: this.validateCompetition(item.competition),
              suggestedTags: Array.isArray(item.suggestedTags) ? item.suggestedTags : this.extractTagsFromTopic(originalTopic.topic)
            };
          });
        }
      } catch (parseError) {
        console.error('Failed to parse SEO analysis response:', parseError);
        console.error('Raw content:', content);
      }

      // Enhanced fallback with regex parsing - use original topic structure
      return this.parseMarkdownAnalysisWithReasoning(content, topicsWithReasoning);
    } catch (error) {
      console.error('Error analyzing topic metadata:', error);
      throw new Error('Failed to analyze topic metadata');
    }
  }

  private parseMarkdownAnalysisWithReasoning(content: string, topicsWithReasoning: Array<{
    topic: string;
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
  }>): Array<{
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    searchVolume: number;
    competition: 'low' | 'medium' | 'high';
    suggestedTags: string[];
    reasoning: string;
    source: 'ai' | 'website_gap' | 'competitor_advantage' | 'content_opportunity';
    relatedContent?: string;
  }> {
    // Simple fallback that preserves the original topic structure
    return topicsWithReasoning.map(originalTopic => ({
      ...originalTopic,
      difficulty: 'medium',
      searchVolume: 500,
      competition: 'medium',
      suggestedTags: this.extractTagsFromTopic(originalTopic.topic)
    }));
  }

  private validateDifficulty(difficulty: any): 'easy' | 'medium' | 'hard' {
    const valid = ['easy', 'medium', 'hard'];
    return valid.includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() as 'easy' | 'medium' | 'hard' : 'medium';
  }

  private validateCompetition(competition: any): 'low' | 'medium' | 'high' {
    const valid = ['low', 'medium', 'high'];
    return valid.includes(competition?.toLowerCase()) ? competition.toLowerCase() as 'low' | 'medium' | 'high' : 'medium';
  }
  private parseSearchVolume(volumeString: string): number {
    if (typeof volumeString === 'number') return volumeString;

    const str = String(volumeString).toLowerCase();
    if (str.includes('5000+') || str.includes('5000+')) return 7500;
    if (str.includes('1000+')) return 3000;
    if (str.includes('100-500')) return 300;
    if (str.includes('500-1000')) return 750;
    if (str.includes('1000-5000')) return 3000;
    if (str.includes('high')) return 3000;
    if (str.includes('medium')) return 1000;
    if (str.includes('low')) return 300;

    // Extract numbers from string
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : 500;
  }

  private extractTagsFromTopic(topic: string): string[] {
    const words = topic.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);

    return [...new Set(words)]; // Remove duplicates
  }

  async generateDetailedTopicInfo(
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string
  ): Promise<{
    description: string;
    contentBrief: string;
    contentAngle: string;
    estimatedTimeToWrite: string;
    competitorAnalysis: string;
    keywordInsights: string[];
    relatedTopics: string[];
  }> {
    const systemPrompt = `You are an expert SEO content strategist with deep expertise in creating business-relevant, actionable content. Generate detailed, specific information that provides real value to businesses.

CRITICAL REQUIREMENTS:
- Be SPECIFIC and BUSINESS-FOCUSED, not generic
- Provide ACTIONABLE insights, not vague advice
- Ensure all content is relevant to the business type and target audience
- Related topics must be semantically connected to the main topic
- Content brief should include specific, measurable outcomes
- Competitor analysis must identify concrete opportunities

CONTENT QUALITY STANDARDS:
- Description: Engaging, specific, and benefit-oriented
- Content Brief: Detailed outline with 5-7 specific points to cover
- Content Angle: Unique perspective that addresses specific pain points
- Keywords: Mix of primary, secondary, and long-tail keywords with search intent
- Related Topics: Semantically relevant, not generic variations

BUSINESS CONTEXT FOCUS:
- Address specific challenges faced by ${businessType} businesses
- Provide practical solutions for ${targetAudience}
- Include measurable business outcomes and ROI considerations
- Focus on competitive advantages and market positioning

Respond with VALID JSON only, no markdown formatting or explanations.`;

    const prompt = `Generate comprehensive, business-focused topic information for:

TOPIC: ${topic}
BUSINESS TYPE: ${businessType}
TARGET AUDIENCE: ${targetAudience}
${location ? `LOCATION: ${location}` : ''}

REQUIREMENTS:
1. Create content that addresses specific business challenges and opportunities
2. Focus on actionable advice that delivers measurable results
3. Ensure all suggestions are relevant to the business context
4. Related topics must be semantically connected and business-relevant

SPECIFIC INSTRUCTIONS:
- Description: Write 2-3 compelling sentences that highlight specific business benefits
- Content Brief: Include 5-7 specific, actionable points with measurable outcomes
- Content Angle: Identify a unique perspective that addresses specific pain points
- Keywords: Provide 3-5 specific keywords with search intent (informational, commercial, etc.)
- Related Topics: Suggest 3-5 topics that are semantically related and business-relevant

IMPORTANT: Respond with VALID JSON only. All string values must be in double quotes.

Example format:
{
  "description": "A strategic guide to implementing [topic] that helps [business type] businesses achieve [specific outcome] by addressing [specific pain point].",
  "contentBrief": "This comprehensive topic covers: 1) [Specific point with measurable outcome], 2) [Another specific point], 3) [Practical implementation steps], 4) [Business metrics to track], 5) [Common mistakes to avoid].",
  "contentAngle": "Focus on [unique approach] that differentiates from generic content by addressing [specific challenge] faced by [target audience].",
  "estimatedTimeToWrite": "3-4 hours",
  "competitorAnalysis": "Most competitors cover [generic aspect]. This topic stands out by focusing on [specific differentiation] that addresses [business need].",
  "keywordInsights": ["Primary keyword with commercial intent", "Secondary informational keyword", "Long-tail problem-solving keyword", "Location-specific variation"],
  "relatedTopics": ["Semantically related topic 1", "Business-focused topic 2", "Advanced implementation topic 3"]
}`;

    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 1500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';

      // Try to parse JSON response
      try {
        const jsonContent = extractCleanJson(content);
        const parsed = JSON.parse(jsonContent);

        // Validate and enhance the response with business-specific content
        const enhancedDescription = this.validateAndEnhanceDescription(parsed.description, topic, businessType, targetAudience);
        const enhancedContentBrief = this.validateAndEnhanceContentBrief(parsed.contentBrief, topic, businessType, targetAudience);
        const enhancedContentAngle = this.validateAndEnhanceContentAngle(parsed.contentAngle, topic, businessType, targetAudience);
        const enhancedCompetitorAnalysis = this.validateAndEnhanceCompetitorAnalysis(parsed.competitorAnalysis, topic, businessType);
        const enhancedKeywordInsights = this.validateAndEnhanceKeywordInsights(parsed.keywordInsights, topic, businessType, targetAudience, location);
        const enhancedRelatedTopics = this.validateAndEnhanceRelatedTopics(parsed.relatedTopics, topic, businessType, targetAudience);

        return {
          description: enhancedDescription,
          contentBrief: enhancedContentBrief,
          contentAngle: enhancedContentAngle,
          estimatedTimeToWrite: parsed.estimatedTimeToWrite || '3-4 hours',
          competitorAnalysis: enhancedCompetitorAnalysis,
          keywordInsights: enhancedKeywordInsights,
          relatedTopics: enhancedRelatedTopics
        };
      } catch (parseError) {
        console.error('Failed to parse detailed topic info response:', parseError);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error generating detailed topic info:', error);
      throw new Error('Failed to generate detailed topic information');
    }
  }

  private validateAndEnhanceDescription(
    description: string,
    topic: string,
    businessType: string,
    targetAudience: string
  ): string {
    if (!description || description.length < 20 || this.isGenericContent(description)) {
      return `A strategic guide to ${topic} that helps ${businessType} businesses achieve measurable results by addressing specific challenges faced by ${targetAudience}. This comprehensive approach combines industry best practices with practical implementation strategies.`;
    }

    // Ensure description mentions specific business benefits
    if (!description.toLowerCase().includes(businessType.toLowerCase()) ||
        !description.toLowerCase().includes(targetAudience.toLowerCase())) {
      return `${description} This content is specifically designed for ${businessType} businesses targeting ${targetAudience}, providing actionable insights and measurable outcomes.`;
    }

    return description;
  }

  private validateAndEnhanceContentBrief(
    contentBrief: string,
    topic: string,
    businessType: string,
    targetAudience: string
  ): string {
    if (!contentBrief || contentBrief.length < 50 || this.isGenericContent(contentBrief)) {
      return `This comprehensive topic covers: 1) Key challenges and opportunities in ${topic} for ${businessType} businesses, 2) Step-by-step implementation strategies tailored for ${targetAudience}, 3) Measurable metrics and KPIs to track success, 4) Common pitfalls and how to avoid them, 5) Industry-specific examples and case studies, 6) Tools and resources for efficient execution, 7) Long-term maintenance and optimization strategies.`;
    }

    // Ensure content brief includes specific, actionable points
    if (!contentBrief.includes('1)') && !contentBrief.includes('•') && !contentBrief.includes('-')) {
      return `This comprehensive topic covers: ${contentBrief} Key areas include: specific implementation steps, measurable outcomes, industry examples, and practical tools for ${businessType} businesses serving ${targetAudience}.`;
    }

    return contentBrief;
  }

  private validateAndEnhanceContentAngle(
    contentAngle: string,
    topic: string,
    businessType: string,
    targetAudience: string
  ): string {
    if (!contentAngle || contentAngle.length < 20 || this.isGenericContent(contentAngle)) {
      return `Focus on a data-driven approach that combines ${businessType} industry expertise with practical ${targetAudience} insights, highlighting measurable ROI and competitive advantages that generic content often overlooks.`;
    }

    // Ensure content angle is specific and differentiated
    if (!contentAngle.toLowerCase().includes('different') &&
        !contentAngle.toLowerCase().includes('unique') &&
        !contentAngle.toLowerCase().includes('specific')) {
      return `${contentAngle} This unique approach addresses specific pain points that ${targetAudience} faces, providing differentiated value that sets ${businessType} businesses apart from competitors.`;
    }

    return contentAngle;
  }

  private validateAndEnhanceCompetitorAnalysis(
    competitorAnalysis: string,
    topic: string,
    businessType: string
  ): string {
    if (!competitorAnalysis || competitorAnalysis.length < 30 || this.isGenericContent(competitorAnalysis)) {
      return `Most competitors provide generic ${topic} advice that lacks industry specificity. This topic stands out by focusing on ${businessType}-specific challenges, providing actionable strategies with measurable outcomes that address real business needs rather than theoretical concepts.`;
    }

    // Ensure competitor analysis identifies specific opportunities
    if (!competitorAnalysis.toLowerCase().includes('opportunity') &&
        !competitorAnalysis.toLowerCase().includes('advantage')) {
      return `${competitorAnalysis} This creates a competitive advantage by addressing gaps in existing content and providing specific insights that resonate with ${businessType} business decision-makers.`;
    }

    return competitorAnalysis;
  }

  private validateAndEnhanceKeywordInsights(
    keywordInsights: string[],
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string
  ): string[] {
    if (!Array.isArray(keywordInsights) || keywordInsights.length === 0 ||
        keywordInsights.every(insight => this.isGenericContent(insight))) {
      const locationModifier = location ? ` ${location}` : '';
      return [
        `Primary: "${topic} for ${businessType}${locationModifier}" - high commercial intent targeting decision-makers`,
        `Secondary: "how to ${topic.toLowerCase()} ${targetAudience}" - informational intent addressing specific pain points`,
        `Long-tail: "${topic} strategies that improve [business outcome]" - problem-solving with measurable results`,
        location ? `Local: "${topic} near ${location} for ${businessType}" - geo-targeted commercial intent` : `Industry: "${businessType} ${topic} best practices" - industry-specific authority building`
      ];
    }

    // Enhance existing insights to be more specific
    return keywordInsights.map(insight => {
      if (this.isGenericContent(insight)) {
        return `Focus on ${topic}-specific keywords that combine ${businessType} context with ${targetAudience} pain points, emphasizing measurable outcomes and practical solutions.`;
      }
      return insight;
    });
  }

  private validateAndEnhanceRelatedTopics(
    relatedTopics: string[],
    topic: string,
    businessType: string,
    targetAudience: string
  ): string[] {
    if (!Array.isArray(relatedTopics) || relatedTopics.length === 0 ||
        relatedTopics.every(t => this.isGenericContent(t))) {
      return [
        `Advanced ${topic} strategies for ${businessType} growth`,
        `Measuring ROI from ${topic} initiatives for ${targetAudience}`,
        `${topic} automation and scaling techniques for ${businessType}`,
        `Common ${topic} mistakes that cost ${businessType} businesses money`,
        `Future trends in ${topic} for ${targetAudience} success`
      ];
    }

    // Filter and enhance related topics to ensure semantic relevance
    const enhancedTopics = relatedTopics
      .filter(t => !this.isGenericContent(t))
      .filter(t => this.isSemanticallyRelated(t, topic))
      .map(t => this.enhanceRelatedTopic(t, businessType, targetAudience))
      .slice(0, 5);

    // Ensure we have at least 3 good topics
    while (enhancedTopics.length < 3) {
      const fallbackTopics = [
        `Advanced ${topic} strategies for ${businessType} growth`,
        `Measuring ROI from ${topic} initiatives for ${targetAudience}`,
        `${topic} automation and scaling techniques for ${businessType}`,
        `Common ${topic} mistakes that cost ${businessType} businesses money`,
        `Integrating ${topic} with existing ${businessType} workflows`,
        `${topic} case studies for ${targetAudience} success stories`
      ];

      const newTopic = fallbackTopics.find(t => !enhancedTopics.includes(t));
      if (newTopic && !enhancedTopics.includes(newTopic)) {
        enhancedTopics.push(newTopic);
      } else {
        break;
      }
    }

    return enhancedTopics;
  }

  private isSemanticallyRelated(relatedTopic: string, mainTopic: string): boolean {
    const mainTopicLower = mainTopic.toLowerCase();
    const relatedTopicLower = relatedTopic.toLowerCase();

    // Extract key terms from main topic (words longer than 3 characters)
    const mainTopicWords = mainTopicLower.split(/\s+/).filter(word => word.length > 3);
    const relatedTopicWords = relatedTopicLower.split(/\s+/).filter(word => word.length > 3);

    // Check for direct topic inclusion
    if (relatedTopicLower.includes(mainTopicLower) || mainTopicLower.includes(relatedTopicLower)) {
      return true;
    }

    // Check for semantic overlap - at least 20% of words should match
    const sharedWords = mainTopicWords.filter(word => relatedTopicWords.includes(word));
    const overlapRatio = sharedWords.length / Math.max(mainTopicWords.length, relatedTopicWords.length);

    if (overlapRatio >= 0.2) {
      return true;
    }

    // Check for business-relevant semantic patterns
    const semanticPatterns = [
      /advanced.*strategies/,
      /best.*practices/,
      /common.*mistakes/,
      /how.*to/,
      /implementation/,
      /automation/,
      /scaling/,
      /optimization/,
      /measurement/,
      /roi/,
      /case.*study/,
      /integration/,
      /workflow/,
      /tools/,
      /resources/,
      /future.*trends/,
      /measuring.*success/,
      /practical.*guide/,
      /step.*by.*step/
    ];

    // If related topic contains semantic patterns AND shares at least one word with main topic
    const hasSemanticPattern = semanticPatterns.some(pattern => pattern.test(relatedTopicLower));
    const hasWordOverlap = sharedWords.length > 0;

    return hasSemanticPattern && hasWordOverlap;
  }

  private enhanceRelatedTopic(topic: string, businessType: string, targetAudience: string): string {
    // Enhance topic to be more business-specific
    if (!topic.toLowerCase().includes(businessType.toLowerCase()) &&
        !topic.toLowerCase().includes(targetAudience.toLowerCase())) {
      return `${topic} for ${businessType} businesses targeting ${targetAudience}`;
    }
    return topic;
  }

  private isGenericContent(content: string): boolean {
    const genericPatterns = [
      /comprehensive guide to/,
      /essential aspects of/,
      /valuable insights and/,
      /practical advice that/,
      /actionable advice that/,
      /benefits of/,
      /important for/,
      /crucial for/,
      /business context/,
      /audience context/,
      /based on the provided/,
      /generated for/,
      /suggested topic/
    ];

    const contentLower = content.toLowerCase();
    return genericPatterns.some(pattern => pattern.test(contentLower)) ||
           contentLower.length < 20;
  }

  async generateCustomerQuestions(
    topic: string,
    businessType: string,
    targetAudience: string,
    location?: string,
    industryId?: string,
    localServicePatterns: string[] = []
  ): Promise<Array<{
    question: string;
    category: string;
    reasoning: string;
  }>> {
    const systemPrompt = `You are an expert in creating customer questions that match how real people speak, especially when using voice search assistants like Siri, Alexa, or Google Assistant.

CRITICAL REQUIREMENTS:
- Generate questions that sound exactly like how customers actually speak
- Focus on conversational, natural language patterns
- Include local intent and location-specific queries
- Optimize for voice search (longer, more natural phrasing)
- Categorize each question by type: how_to, what_is, where_can, why_does, emergency
- Ensure questions address real customer pain points and needs

VOICE SEARCH OPTIMIZATION:
- Use natural, conversational language
- Include complete questions with proper grammar
- Add context that people would naturally include when speaking
- Use phrases like "help me", "I need", "can you", "what's the best"
- Avoid keyword stuffing or robotic language
- Make questions sound like someone is actually asking for help

QUESTION CATEGORIES:
- how_to: Step-by-step guidance questions ("How do I...", "Can you help me...")
- what_is: Definition and explanation questions ("What is...", "Can you explain...")
- where_can: Location-based search questions ("Where can I find...", "What's the best...")
- why_does: Problem explanation questions ("Why does my...", "What causes...")
- emergency: Urgent help questions ("I need emergency...", "Help! My...")

LOCAL INTENT:
- Include "near me", "in [city]", or local context when appropriate
- Consider what people would ask when looking for local services
- Add location modifiers naturally within questions

Respond with ONLY a numbered list of questions. Format: "Question | Category | Reasoning"`;

    let prompt = `Generate customer questions for:
TOPIC: ${topic}
BUSINESS TYPE: ${businessType}
TARGET AUDIENCE: ${targetAudience}${location ? `\nLOCATION: ${location}` : ''}

INDUSTRY CONTEXT: Focus on ${businessType} services that ${targetAudience} would search for.`;

    // Add local service patterns if available
    if (localServicePatterns.length > 0) {
      prompt += `

LOCAL SERVICE PATTERNS TO CONSIDER:
${localServicePatterns.slice(0, 3).join(', ')}`;
    }

    prompt += `

Generate 12-15 customer questions that sound exactly like how real people speak to voice assistants. Focus on practical problems, urgent needs, and genuine customer concerns.

REMEMBER: These questions should match how people actually talk, not how they type. Use conversational language and include natural context.

Start your response with "1."`;

    try {
      const response = await this.generateCompletion({
        model: 'lemonfox-70b',
        prompt,
        system_prompt: systemPrompt,
        max_tokens: 2000,
        temperature: 0.4, // Slightly higher for more creative, natural questions
      });

      const content = response.choices[0]?.message?.content || '';

      // Parse questions in the format: "Question | Category | Reasoning"
      const questions = this.parseCustomerQuestions(content);

  
      return questions.slice(0, 15); // Limit to 15 questions
    } catch (error) {
      console.error('❌ [LEMONFOX] Error generating customer questions:', error);
      throw new Error('Failed to generate customer questions');
    }
  }

  private parseCustomerQuestions(content: string): Array<{
    question: string;
    category: string;
    reasoning: string;
  }> {
    const questions: Array<{
      question: string;
      category: string;
      reasoning: string;
    }> = [];

    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and headers
      if (!trimmed ||
          trimmed.toLowerCase().includes('here are') ||
          trimmed.toLowerCase().includes('customer questions') ||
          !/^\d+\./.test(trimmed)) {
        continue;
      }

      // Try to parse the format: "1. Question | Category | Reasoning"
      const match = trimmed.match(/^\d+\.\s*(.+)$/);
      if (!match) continue;

      const questionContent = match[1];

      // Try to split by pipe character
      const parts = questionContent.split('|').map(p => p.trim());

      if (parts.length >= 3) {
        const question = parts[0].trim();
        const category = parts[1].trim().toLowerCase();
        const reasoning = parts[2].trim();

        // Validate the question looks natural and conversational
        if (this.isConversationalQuestion(question) && reasoning.length > 10) {
          questions.push({
            question: this.cleanCustomerQuestion(question),
            category: this.normalizeQuestionCategory(category),
            reasoning: reasoning
          });
        }
      } else if (parts.length === 1) {
        // Fallback: just the question, infer category and add basic reasoning
        const question = parts[0].trim();

        if (this.isConversationalQuestion(question)) {
          questions.push({
            question: this.cleanCustomerQuestion(question),
            category: this.inferQuestionCategory(question),
            reasoning: 'Customer question based on common search patterns and needs'
          });
        }
      }
    }

    return questions;
  }

  private isConversationalQuestion(question: string): boolean {
    const questionLower = question.toLowerCase();

    // Check for conversational patterns
    const conversationalStarts = [
      /^how do i/i,
      /^what is/i,
      /^where can/i,
      /^why does/i,
      /^when should/i,
      /^can you/i,
      /^help me/i,
      /^i need/i,
      /^what's the best/i,
      /^which/i,
      /^should i/i
    ];

    const hasConversationalStart = conversationalStarts.some(start => start.test(questionLower));

    // Check for natural language indicators
    const hasNaturalLanguage = questionLower.includes('for me') ||
                               questionLower.includes('my') ||
                               questionLower.includes('our') ||
                               questionLower.includes('help') ||
                               questionLower.includes('need') ||
                               questionLower.length > 20; // Longer questions tend to be more conversational

    // Avoid robotic or keyword-stuffed questions
    const notRobotic = !questionLower.includes(':') &&
                      !questionLower.includes('|') &&
                      !questionLower.includes(' vs ') &&
                      !questionLower.match(/^\w+\s+\w+\s*\w*$/); // Too short/simple

    return hasConversationalStart && hasNaturalLanguage && notRobotic;
  }

  private cleanCustomerQuestion(question: string): string {
    return question
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\?\s*$/, '?') // Ensure proper ending
      .trim();
  }

  private normalizeQuestionCategory(category: string): string {
    const normalized = category.toLowerCase().replace(/[^a-z_]/g, '_');

    const categoryMap: Record<string, string> = {
      'how_to': 'how_to',
      'how': 'how_to',
      'howto': 'how_to',
      'what_is': 'what_is',
      'what': 'what_is',
      'definition': 'what_is',
      'where_can': 'where_can',
      'where': 'where_can',
      'location': 'where_can',
      'why_does': 'why_does',
      'why': 'why_does',
      'emergency': 'emergency',
      'urgent': 'emergency',
      'immediate': 'emergency'
    };

    return categoryMap[normalized] || 'what_is'; // Default fallback
  }

  private inferQuestionCategory(question: string): string {
    const questionLower = question.toLowerCase();

    if (questionLower.startsWith('how do') || questionLower.startsWith('can you help') || questionLower.includes('steps')) {
      return 'how_to';
    }
    if (questionLower.startsWith('what is') || questionLower.startsWith('what does') || questionLower.startsWith('can you explain')) {
      return 'what_is';
    }
    if (questionLower.startsWith('where can') || questionLower.includes('near me') || questionLower.includes('in [city]')) {
      return 'where_can';
    }
    if (questionLower.startsWith('why does') || questionLower.startsWith('what causes') || questionLower.includes('reason')) {
      return 'why_does';
    }
    if (questionLower.includes('emergency') || questionLower.includes('urgent') || questionLower.includes('right now')) {
      return 'emergency';
    }

    return 'what_is'; // Default fallback
  }
}

// Singleton instance
let lemonfoxClient: LemonfoxClient | null = null;

export function getLemonfoxClient(): LemonfoxClient {
  if (!lemonfoxClient) {
    const apiKey = process.env.LEMONFOX_API_KEY;
    if (!apiKey) {
      throw new Error('LEMONFOX_API_KEY environment variable is not set');
    }
    lemonfoxClient = new LemonfoxClient(apiKey);
  }
  return lemonfoxClient;
}