/**
 * SEO utility functions for validation, processing, and data manipulation
 */

import { z } from 'zod';
import type { GeneratedTopic, TopicGenerationResult } from './topic-generator';

// Validation schemas
export const TopicValidationSchema = z.object({
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters long')
    .max(100, 'Topic must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Topic contains invalid characters'),
  businessType: z.string()
    .min(2, 'Business type must be at least 2 characters long')
    .max(50, 'Business type must be less than 50 characters'),
  targetAudience: z.string()
    .min(2, 'Target audience must be at least 2 characters long')
    .max(100, 'Target audience must be less than 100 characters'),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
});

export const SavedTopicValidationSchema = z.object({
  topic: z.string().min(3).max(200),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  searchVolume: z.number().min(0).max(1000000),
  competition: z.enum(['low', 'medium', 'high']),
  suggestedTags: z.array(z.string()).optional(),
});

// Usage limits for freemium model
export const USAGE_LIMITS = {
  FREE: {
    dailyGenerations: 3,
    monthlyGenerations: 10,
    savedTopics: 25,
    maxTopicsPerGeneration: 8,
    dailyCrawls: 1,
    monthlyCrawls: 5,
    maxPagesPerCrawl: 10,
  },
  PRO: {
    dailyGenerations: 50,
    monthlyGenerations: 1000,
    savedTopics: 1000,
    maxTopicsPerGeneration: 25,
    dailyCrawls: 10,
    monthlyCrawls: 100,
    maxPagesPerCrawl: 50,
  },
  ENTERPRISE: {
    dailyGenerations: -1, // unlimited
    monthlyGenerations: -1, // unlimited
    savedTopics: -1, // unlimited
    maxTopicsPerGeneration: 50,
    dailyCrawls: -1, // unlimited
    monthlyCrawls: -1, // unlimited
    maxPagesPerCrawl: 100,
  },
} as const;

export type PlanType = keyof typeof USAGE_LIMITS;

// Topic difficulty and competition scoring
export const DIFFICULTY_SCORES = {
  easy: 1,
  medium: 2,
  hard: 3,
} as const;

export const COMPETITION_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
} as const;

// Utility functions
export class SEOUtils {
  /**
   * Validates topic generation request
   */
  static validateTopicRequest(data: unknown): {
    success: true;
    data: {
      topic: string;
      businessType: string;
      targetAudience: string;
      location?: string;
    };
  } | { success: false; errors: string[] } {
    try {
      const validated = TopicValidationSchema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Invalid request data'] };
    }
  }

  /**
   * Validates saved topic data
   */
  static validateSavedTopic(data: unknown): {
    success: true;
    data: GeneratedTopic;
  } | { success: false; errors: string[] } {
    try {
      const validated = SavedTopicValidationSchema.parse(data);
      return { success: true, data: validated as GeneratedTopic };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Invalid topic data'] };
    }
  }

  /**
   * Calculates SEO score for a topic
   */
  static calculateSEOScore(topic: GeneratedTopic): number {
    let score = 100;

    // Deduct points based on difficulty
    score -= (DIFFICULTY_SCORES[topic.difficulty] - 1) * 15;

    // Deduct points based on competition
    score -= (COMPETITION_SCORES[topic.competition] - 1) * 20;

    // Add points for search volume
    if (topic.searchVolume > 5000) score += 20;
    else if (topic.searchVolume > 1000) score += 15;
    else if (topic.searchVolume > 500) score += 10;
    else if (topic.searchVolume > 100) score += 5;

    // Add points for tag quality
    if (topic.suggestedTags.length >= 5) score += 10;
    else if (topic.suggestedTags.length >= 3) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Categorizes topics by difficulty
   */
  static categorizeTopicsByDifficulty(topics: GeneratedTopic[]): {
    easy: GeneratedTopic[];
    medium: GeneratedTopic[];
    hard: GeneratedTopic[];
  } {
    return topics.reduce(
      (acc, topic) => {
        acc[topic.difficulty].push(topic);
        return acc;
      },
      { easy: [] as GeneratedTopic[], medium: [] as GeneratedTopic[], hard: [] as GeneratedTopic[] }
    );
  }

  /**
   * Sorts topics by estimated traffic potential
   */
  static sortByTrafficPotential(topics: GeneratedTopic[]): GeneratedTopic[] {
    return [...topics].sort((a, b) => {
      const scoreA = this.calculateSEOScore(a) + (a.searchVolume / 100);
      const scoreB = this.calculateSEOScore(b) + (b.searchVolume / 100);
      return scoreB - scoreA;
    });
  }

  /**
   * Filters topics based on criteria
   */
  static filterTopics(
    topics: GeneratedTopic[],
    filters: {
      difficulty?: ('easy' | 'medium' | 'hard')[];
      competition?: ('low' | 'medium' | 'high')[];
      minSearchVolume?: number;
      maxSearchVolume?: number;
      tags?: string[];
    }
  ): GeneratedTopic[] {
    return topics.filter(topic => {
      // Difficulty filter
      if (filters.difficulty && !filters.difficulty.includes(topic.difficulty)) {
        return false;
      }

      // Competition filter
      if (filters.competition && !filters.competition.includes(topic.competition)) {
        return false;
      }

      // Search volume filter
      if (filters.minSearchVolume && topic.searchVolume < filters.minSearchVolume) {
        return false;
      }
      if (filters.maxSearchVolume && topic.searchVolume > filters.maxSearchVolume) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag =>
          topic.suggestedTags.some(topicTag =>
            topicTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }

  /**
   * Generates topic suggestions based on saved topics
   */
  static generateRelatedTopics(savedTopics: GeneratedTopic[], limit = 5): string[] {
    if (savedTopics.length === 0) return [];

    // Extract keywords from existing topics
    const allTags = savedTopics.flatMap(topic => topic.suggestedTags);
    const tagFrequency = allTags.reduce((acc, tag) => {
      const lowerTag = tag.toLowerCase();
      acc[lowerTag] = (acc[lowerTag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get most common tags
    const commonTags = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);

    // Generate suggestions based on common tags
    const suggestions = [
      `Ultimate guide to ${commonTags[0]}`,
      `${commonTags[1]}: Best practices and tips`,
      `How to improve ${commonTags[2]} for better results`,
      `${commonTags[3]} strategies that actually work`,
      `Top ${commonTags[4]} mistakes to avoid`,
    ].slice(0, limit);

    return suggestions;
  }

  /**
   * Formats search volume for display
   */
  static formatSearchVolume(volume: number): string {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M+`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K+`;
    if (volume >= 100) return `${Math.floor(volume / 100) * 100}-${Math.floor(volume / 100) * 100 + 99}`;
    return `${Math.floor(volume / 10) * 10}-${Math.floor(volume / 10) * 10 + 9}`;
  }

  /**
   * Gets difficulty color for UI
   */
  static getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Gets competition color for UI
   */
  static getCompetitionColor(competition: 'low' | 'medium' | 'high'): string {
    switch (competition) {
      case 'low':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-purple-600 bg-purple-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Validates if user can perform action based on usage limits
   */
  static canPerformAction(
    currentUsage: {
      dailyGenerations: number;
      monthlyGenerations: number;
      savedTopics: number;
      dailyCrawls?: number;
      monthlyCrawls?: number;
    },
    action: 'generate' | 'save' | 'crawl',
    plan: PlanType
  ): { allowed: boolean; reason?: string } {
    const limits = USAGE_LIMITS[plan];

    if (action === 'generate') {
      if (limits.dailyGenerations > 0 && currentUsage.dailyGenerations >= limits.dailyGenerations) {
        return { allowed: false, reason: 'Daily generation limit reached' };
      }
      if (limits.monthlyGenerations > 0 && currentUsage.monthlyGenerations >= limits.monthlyGenerations) {
        return { allowed: false, reason: 'Monthly generation limit reached' };
      }
    }

    if (action === 'save') {
      if (limits.savedTopics > 0 && currentUsage.savedTopics >= limits.savedTopics) {
        return { allowed: false, reason: 'Saved topics limit reached' };
      }
    }

    if (action === 'crawl') {
      if (limits.dailyCrawls > 0 && (currentUsage.dailyCrawls || 0) >= limits.dailyCrawls) {
        return { allowed: false, reason: 'Daily crawl limit reached' };
      }
      if (limits.monthlyCrawls > 0 && (currentUsage.monthlyCrawls || 0) >= limits.monthlyCrawls) {
        return { allowed: false, reason: 'Monthly crawl limit reached' };
      }
    }

    return { allowed: true };
  }

  /**
   * Sanitizes topic text for storage
   */
  static sanitizeTopicText(text: string): string {
    return text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 200); // Limit length
  }

  /**
   * Extracts keywords from text
   */
  static extractKeywords(text: string, limit = 5): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Remove duplicates and limit
    return [...new Set(words)].slice(0, limit);
  }

  /**
   * Checks if a word is a stop word
   */
  private static isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'under', 'along', 'following', 'behind', 'beyond', 'plus', 'except',
      'but', 'yet', 'so', 'nor', 'not', 'no', 'never', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 'just', 'now', 'also', 'here', 'there', 'then', 'how', 'when', 'where',
      'why', 'what', 'who', 'which', 'whom', 'this', 'that', 'these', 'those', 'am', 'is',
      'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do',
      'does', 'did', 'doing', 'will', 'would', 'shall', 'should', 'can', 'could', 'may',
      'might', 'must', 'ought', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
      'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
    ]);

    return stopWords.has(word);
  }
}

// Export convenience functions
export const {
  validateTopicRequest,
  validateSavedTopic,
  calculateSEOScore,
  categorizeTopicsByDifficulty,
  sortByTrafficPotential,
  filterTopics,
  generateRelatedTopics,
  formatSearchVolume,
  getDifficultyColor,
  getCompetitionColor,
  canPerformAction,
  sanitizeTopicText,
  extractKeywords,
} = SEOUtils;