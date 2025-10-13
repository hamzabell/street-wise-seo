/**
 * Markdown parsing utilities for cleaning AI-generated content
 */

/**
 * Cleans topic titles by removing source identifiers and trailing pipes
 * Specifically handles AI-generated topics that include technical identifiers
 */
export function cleanTopicTitle(topicTitle: string): string {
  if (!topicTitle || typeof topicTitle !== 'string') {
    return '';
  }

  let cleaned = topicTitle.trim();

  // Remove trailing source identifiers that appear after the last pipe
  // This handles cases like "Topic content | source_identifier"
  const lastPipeIndex = cleaned.lastIndexOf('|');
  if (lastPipeIndex > 0) {
    const afterPipe = cleaned.substring(lastPipeIndex + 1).trim().toLowerCase();

    // Check if what's after the last pipe looks like a source identifier
    const sourceIdentifiers = [
      'ai', 'website_gap', 'competitor_advantage', 'content_opportunity',
      'website gap', 'competitor advantage', 'content opportunity',
      'gap', 'opportunity', 'advantage', 'content', 'competitor', 'website'
    ];

    const isSourceIdentifier = sourceIdentifiers.some(identifier =>
      afterPipe === identifier ||
      afterPipe.includes(identifier) ||
      identifier.includes(afterPipe)
    );

    if (isSourceIdentifier) {
      // Remove the trailing source identifier and the preceding pipe
      cleaned = cleaned.substring(0, lastPipeIndex).trim();
    }
  }

  // Remove any remaining pipes and content after them (in case there are multiple pipes)
  const pipeMatches = cleaned.match(/\|[^|]*$/);
  if (pipeMatches) {
    cleaned = cleaned.replace(/\|[^|]*$/, '').trim();
  }

  // Remove trailing pipes with whitespace
  cleaned = cleaned.replace(/\s*\|\s*$/, '').trim();

  // NEW: Remove reasoning-like content that might be mixed in
  // Look for patterns that suggest reasoning content is mixed with the topic
  const reasoningPatterns = [
    /\s+\|\s*reasoning[:\s]*.*$/i,
    /\s+\|\s*advantage[:\s]*.*$/i,
    /\s+\|\s*opportunity[:\s]*.*$/i,
    /\s+\|\s*gap[:\s]*.*$/i,
    /\s+\|\s*content[:\s]*.*$/i,
    /\s+\|\s*competitor[:\s]*.*$/i,
    /\s+\|\s*website[:\s]*.*$/i,
    // More aggressive patterns for any content that looks like reasoning
    /\s+\|\s*[a-z]+\s+(is|are|can|will|should|help|provide|address|showcase|highlight).*$/i,
    /\s+\|\s*that\s+can\s+.*$/i,
    /\s+\|\s*which\s+.*$/i,
    /\s+\|\s*this\s+.*$/i
  ];

  for (const pattern of reasoningPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, '').trim();
      break; // Only apply the first matching pattern to avoid over-cleaning
    }
  }

  // Remove trailing numbers (like " 9" at the end)
  cleaned = cleaned.replace(/\s+\d+$/, '');

  // Remove any remaining fragments that look like reasoning
  const reasoningFragments = [
    // More comprehensive patterns for reasoning fragments
    /\s+(is|are)\s+(a\s+)?(competitor\s+)?(competitive\s+)?advantage\s+that\s+can\s+be\s+(showcased|highlighted|used|leveraged).*$/i,
    /\s+(that|which)\s+can\s+be\s+(showcased|highlighted|used|leveraged)\s+to\s+(showcase|highlight|demonstrate).*$/i,
    /\s+(to\s+)?(showcase|highlight|demonstrate)\s+your\s+(commitment|dedication|focus)\s+to\s+[a-z]+\s+[a-z]+.*$/i,
    /\s+(that|which)\s+(can|will|should)\s+(help|provide|offer|enable|allow|support).*$/i,
    /\s+(is|are|can|will|should|help|provide|address|showcase|highlight)\s+[a-z]+\s+(advantage|opportunity|benefit|feature)\s+.*$/i,
    /\s+(that|which|this)\s+(can|will|should|helps?|provides?|addresses?).*$/i,
    // Specific patterns for the issue examples
    /\s+that\s+can\s+be\s+highlighted\s+to\s+showcase\s+your\s+commitment\s+to\s+quality.*$/i,
    /\s+that\s+showcase\s+your\s+commitment\s+to\s+customer\s+satisfaction.*$/i,
    /\s+that\s+provide\s+competitive\s+advantage\s+and\s+highlight\s+operational\s+excellence.*$/i,
    // More general reasoning patterns
    /\s+(showcasing|highlighting|demonstrating|providing|offering)\s+[a-z]+\s+[a-z]+.*$/i,
    /\s+for\s+(improved|enhanced|better|optimal|superior)\s+[a-z]+\s+[a-z]+.*$/i
  ];

  for (const fragment of reasoningFragments) {
    if (fragment.test(cleaned)) {
      cleaned = cleaned.replace(fragment, '').trim();
      break; // Only apply the first matching pattern to avoid over-cleaning
    }
  }

  // Additional aggressive cleaning: If the topic still contains reasoning words and is quite long,
  // try to find a good cutoff point
  const reasoningWords = ['advantage', 'opportunity', 'showcase', 'highlight', 'commitment', 'provide', 'help', 'increase', 'reduce', 'improve', 'enhance', 'leverage', 'utilize'];
  const words = cleaned.split(/\s+/);

  if (words.length > 8) { // If topic is quite long, it might contain reasoning
    for (let i = 5; i < words.length - 2; i++) {
      const currentWord = words[i].toLowerCase();
      const nextWord = words[i + 1].toLowerCase();

      // Look for reasoning word patterns
      if (reasoningWords.includes(currentWord) &&
          (['that', 'which', 'to', 'for', 'and', 'can', 'will', 'should'].includes(nextWord) ||
           reasoningWords.includes(nextWord))) {
        // Cut off at this point
        cleaned = words.slice(0, i).join(' ');
        break;
      }
    }
  }

  // Apply basic markdown cleaning to handle any formatting
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove italic
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Remove inline code
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1'); // Remove strikethrough

  // Ensure the title ends with proper punctuation if it's a sentence
  if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
    // If it looks like a sentence but lacks punctuation, add a period
    if (cleaned.length > 20 && /^[A-Z]/.test(cleaned)) {
      cleaned += '.';
    }
  }

  // Clean up any extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Removes markdown formatting indicators from text
 */
export function cleanMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text;

  // Remove markdown code blocks (```language ... ```)
  cleaned = cleaned.replace(/```[\w]*\n?[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // Remove inline code formatting (`code`)
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove bold formatting (**text** or __text__)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

  // Remove italic formatting (*text* or _text_)
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

  // Remove strikethrough formatting (~~text~~)
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1');

  // Remove headers (# ## ### etc.)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/^(#{1,6})\s+(.+)$/gm, '$2');

  // Remove bullet points and numbered lists
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

  // Remove blockquote formatting (> text)
  cleaned = cleaned.replace(/^>\s+/gm, '');

  // Remove links but keep the text [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images ![alt](url) -> alt
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove horizontal rules (--- or ***)
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');

  // Handle pipe-separated content by removing technical identifiers
  // This cleans content like "Topic | Reasoning | source_identifier"
  const lines = cleaned.split('\n');
  const cleanedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.includes('|')) {
      const parts = trimmedLine.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        // Check if the last part looks like a source identifier
        const lastPart = parts[parts.length - 1].toLowerCase();
        const sourceIdentifiers = [
          'ai', 'website_gap', 'competitor_advantage', 'content_opportunity',
          'website gap', 'competitor advantage', 'content opportunity',
          'gap', 'opportunity', 'advantage', 'content', 'competitor', 'website'
        ];

        const isSourceIdentifier = sourceIdentifiers.some(identifier =>
          lastPart === identifier ||
          lastPart.includes(identifier) ||
          identifier.includes(lastPart)
        );

        if (isSourceIdentifier) {
          // Return only the topic and reasoning parts, exclude the source
          return parts.slice(0, -1).join(' | ');
        }
      }
    }
    return line;
  });
  cleaned = cleanedLines.join('\n');

  // Remove extra whitespace
  cleaned = cleaned.replace(/\n\s*\n/g, '\n'); // Remove empty lines
  cleaned = cleaned.replace(/^\s+|\s+$/g, ''); // Trim start and end
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize spaces

  return cleaned.trim();
}

/**
 * Extracts clean content from JSON responses that may contain markdown
 */
export function extractCleanJson(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let jsonContent = content.trim();

  // Remove markdown code blocks if present
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```\s*/, '').replace(/```\s*$/, '');
  }

  // Try to find JSON array or object in the content
  // Use greedy matching to capture the complete JSON structure
  const arrayMatch = jsonContent.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    jsonContent = arrayMatch[0];
  } else {
    const objectMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonContent = objectMatch[0];
    }
  }

  return jsonContent.trim();
}

/**
 * Cleans AI-generated topic lists by removing markdown numbering and formatting
 */
export function cleanTopicList(content: string): string[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Split by lines and filter out empty ones
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Extract topics from numbered or bulleted lists
  const topics: string[] = [];

  for (const line of lines) {
    // Skip lines that are clearly fluff or meta-discussion
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('here are') ||
        lowerLine.includes('below are') ||
        lowerLine.includes('following are') ||
        lowerLine.includes('based on') ||
        lowerLine.includes('according to') ||
        lowerLine.includes('generated') ||
        lowerLine.includes('created') ||
        lowerLine.includes('provided') ||
        lowerLine.includes('context') ||
        lowerLine.includes('guidelines') ||
        lowerLine.includes('topics:') ||
        lowerLine.includes('ideas:') ||
        lowerLine.includes('suggestions:') ||
        lowerLine.includes('seo topics') ||
        lowerLine.includes('topic ideas') ||
        lowerLine.includes('content ideas') ||
        lowerLine.includes('please note') ||
        lowerLine.includes('keep in mind') ||
        lowerLine.includes('remember') ||
        lowerLine.includes('consider') ||
        lowerLine.startsWith('#') || // Skip headers
        lowerLine.startsWith('```') || // Skip code blocks
        lowerLine.match(/^(i've|i have|we've|we have|here's)/) // Skip AI self-references
        ) {
      continue;
    }

    // Skip code block endings
    if (line.endsWith('```')) {
      continue;
    }

    // Clean the line and add as a topic
    let topic = line
      .replace(/^\d+\.\s*/, '') // Remove numbers at start
      .replace(/^[-*+]\s*/, '') // Remove bullet points
      .replace(/^:\s*/, '') // Remove colons at start
      .replace(/\.$/, '') // Remove trailing period
      .trim();

    // Remove inline markdown formatting
    topic = topic.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold
    topic = topic.replace(/\*([^*]+)\*/g, '$1'); // Remove italic
    topic = topic.replace(/`([^`]+)`/g, '$1'); // Remove inline code
    topic = topic.replace(/~~([^~]+)~~/g, '$1'); // Remove strikethrough
    topic = topic.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links

    // Additional quality checks
    if (topic.length > 5 && // Only include meaningful topics
        topic.length < 200 && // Not too long
        !topic.toLowerCase().includes('generated') &&
        !topic.toLowerCase().includes('based on') &&
        !topic.toLowerCase().includes('according to') &&
        !topic.match(/^(the|a|an)\s+.*\s+(list|collection|array)/)) {
      topics.push(topic);
    }
  }

  // If we don't have enough topics, try a more lenient extraction
  if (topics.length < 5) {
    // Try to find topic-like sentences in the content
    const sentences = content.match(/[^.!?]*[.!?]/g) || [];
    for (const sentence of sentences) {
      const cleaned = sentence.trim()
        .replace(/^\d+\.\s*/, '')
        .replace(/^[-*+]\s*/, '')
        .replace(/\.$/, '')
        .trim();

      if (cleaned.length > 10 &&
          cleaned.length < 200 &&
          topics.length < 15 &&
          !topics.includes(cleaned)) {
        topics.push(cleaned);
      }
    }
  }

  return topics.slice(0, 15); // Limit to 15 topics as per requirements
}

/**
 * Cleans and formats detailed topic information
 */
export function cleanDetailedTopicInfo(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Apply general markdown cleaning first
  let cleaned = cleanMarkdown(content);

  // Preserve section structure but remove markdown formatting
  cleaned = cleaned.replace(/^(#{1,2})\s+(.+)$/gm, '$2:');

  // Clean up any double colons or spacing issues
  cleaned = cleaned.replace(/:+\s*:/g, ':');
  cleaned = cleaned.replace(/\s*:\s*/g, ': ');

  // Ensure proper line breaks between sections
  cleaned = cleaned.replace(/([a-zA-Z]):([a-zA-Z])/g, '$1:\n$2');

  return cleaned.trim();
}

/**
 * Parses structured AI responses and cleans markdown from each section
 */
export function parseAndCleanStructuredResponse(content: string): Record<string, string> {
  const sections: Record<string, string> = {};

  if (!content || typeof content !== 'string') {
    return sections;
  }

  const cleaned = cleanMarkdown(content);
  const lines = cleaned.split('\n');

  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this line looks like a section header
    if (trimmed.includes(':') && trimmed.length < 100) {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = currentContent.join(' ').trim();
      }

      // Start new section
      currentSection = trimmed.replace(':', '').trim();
      currentContent = [];
      continue;
    }

    // Add content to current section
    if (currentSection && trimmed) {
      currentContent.push(trimmed);
    }
  }

  // Don't forget the last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = currentContent.join(' ').trim();
  }

  return sections;
}

/**
 * Main function to clean any AI-generated response based on expected format
 */
export function cleanAIResponse(content: string, format: 'topics' | 'json' | 'structured' | 'plain' = 'plain'): string | string[] | Record<string, string> {
  switch (format) {
    case 'topics':
      return cleanTopicList(content);
    case 'json':
      return extractCleanJson(content);
    case 'structured':
      return parseAndCleanStructuredResponse(content);
    case 'plain':
    default:
      return cleanMarkdown(content);
  }
}