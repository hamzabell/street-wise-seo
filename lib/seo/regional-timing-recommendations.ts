/**
 * Regional and Seasonal Timing Recommendations
 * Provides timing suggestions for content publication, marketing campaigns, and business activities
 */

export interface RegionalTimingRecommendation {
  region: string;
  season: string;
  months: number[];
  optimalPostingTimes: PostingTime[];
  campaignThemes: CampaignTheme[];
  businessActivityLevel: 'high' | 'medium' | 'low';
  culturalConsiderations: string[];
  localEvents: LocalEvent[];
  seoOpportunities: SEOOpportunity[];
  contentSuggestions: ContentSuggestion[];
}

export interface PostingTime {
  dayOfWeek: string;
  timeOfDay: string;
  reasoning: string;
  effectiveness: 'high' | 'medium' | 'low';
}

export interface CampaignTheme {
  theme: string;
  description: string;
  targetAudience: string;
  suggestedContent: string[];
  regionalRelevance: string;
}

export interface LocalEvent {
  eventName: string;
  date: string; // Could be specific month or "varies"
  businessImpact: 'positive' | 'negative' | 'neutral';
  marketingOpportunity: string;
  regionalSpecificity: string;
}

export interface SEOOpportunity {
  opportunity: string;
  searchTrend: 'rising' | 'stable' | 'declining';
  targetKeywords: string[];
  contentAngle: string;
  regionalSpecificity: string;
}

export interface ContentSuggestion {
  contentType: string;
  title: string;
  description: string;
  targetKeywords: string[];
  regionalAngle: string;
  optimalTiming: string;
}

export interface MultiRegionalTimingAnalysis {
  primaryRegion: RegionalTimingRecommendation;
  secondaryRegions: RegionalTimingRecommendation[];
  optimalSchedule: {
    globalBestTimes: PostingTime[];
    regionSpecificRecommendations: Array<{
      region: string;
      bestTimes: PostingTime[];
      culturalAdjustments: string[];
    }>;
  };
  conflictingGuidance: Array<{
    conflict: string;
    resolution: string;
  }>;
}

// Regional Timing Database
export const REGIONAL_TIMING_RECOMMENDATIONS: Record<string, RegionalTimingRecommendation[]> = {
  'en-US': [
    // Winter (December-February)
    {
      region: 'United States',
      season: 'Winter',
      months: [12, 1, 2],
      optimalPostingTimes: [
        { dayOfWeek: 'Tuesday', timeOfDay: '10:00 AM EST', reasoning: 'Post-holiday work routine begins', effectiveness: 'high' },
        { dayOfWeek: 'Thursday', timeOfDay: '2:00 PM EST', reasoning: 'Weekend planning mindset', effectiveness: 'high' },
        { dayOfWeek: 'Saturday', timeOfDay: '11:00 AM EST', reasoning: 'Weekend research time', effectiveness: 'medium' }
      ],
      campaignThemes: [
        {
          theme: 'New Year Planning',
          description: 'Focus on annual planning and resolutions',
          targetAudience: 'Business owners and individuals',
          suggestedContent: ['2025 business planning guide', 'New Year service packages', 'Annual maintenance reminders'],
          regionalRelevance: 'National - resolution season'
        },
        {
          theme: 'Winter Preparation',
          description: 'Winter-related services and products',
          targetAudience: 'Homeowners and businesses',
          suggestedContent: ['Winter maintenance tips', 'Cold weather service packages', 'Emergency preparedness'],
          regionalRelevance: 'Northern states - winter weather'
        }
      ],
      businessActivityLevel: 'medium',
      culturalConsiderations: [
        'Holiday spending fatigue in early January',
        'Budget planning for new fiscal year',
        'Winter weather impacts service availability in northern regions'
      ],
      localEvents: [
        { eventName: 'Super Bowl Sunday', date: 'February (varies)', businessImpact: 'positive', marketingOpportunity: 'Game day promotions and event services', regionalSpecificity: 'National with regional team variations' },
        { eventName: 'President\'s Day', date: 'Third Monday in February', businessImpact: 'positive', marketingOpportunity: 'Sales events and service promotions', regionalSpecificity: 'National' }
      ],
      seoOpportunities: [
        { opportunity: 'Winter maintenance searches', searchTrend: 'rising', targetKeywords: ['winter maintenance', 'cold weather tips', 'emergency services'], contentAngle: 'Prepare your home/business for winter', regionalSpecificity: 'Northern states' },
        { opportunity: 'New Year planning', searchTrend: 'rising', targetKeywords: ['2025 planning', 'business goals', 'annual maintenance'], contentAngle: 'Plan for successful year ahead', regionalSpecificity: 'National' }
      ],
      contentSuggestions: [
        {
          contentType: 'Blog Post',
          title: '5 Essential Winter Maintenance Tasks for [Region] Homeowners',
          description: 'Comprehensive guide to winter preparation',
          targetKeywords: ['winter maintenance', 'home care', 'seasonal tips'],
          regionalAngle: 'Focus on regional weather patterns and local service areas',
          optimalTiming: 'Early December'
        },
        {
          contentType: 'Google Business Profile',
          title: 'New Year, New Home: Our 2025 Service Packages',
          description: 'Annual service package promotions',
          targetKeywords: ['annual maintenance', 'service packages', 'home care'],
          regionalAngle: 'Local availability and regional pricing',
          optimalTiming: 'First week of January'
        }
      ]
    },
    // Spring (March-May)
    {
      region: 'United States',
      season: 'Spring',
      months: [3, 4, 5],
      optimalPostingTimes: [
        { dayOfWeek: 'Wednesday', timeOfDay: '11:00 AM EST', reasoning: 'Mid-week planning and research', effectiveness: 'high' },
        { dayOfWeek: 'Friday', timeOfDay: '3:00 PM EST', reasoning: 'Weekend project planning', effectiveness: 'high' },
        { dayOfWeek: 'Sunday', timeOfDay: '7:00 PM EST', reasoning: 'Weekend preparation mindset', effectiveness: 'medium' }
      ],
      campaignThemes: [
        {
          theme: 'Spring Renewal',
          description: 'Spring cleaning and renewal projects',
          targetAudience: 'Homeowners and businesses',
          suggestedContent: ['Spring maintenance guides', 'Home improvement tips', 'Outdoor preparation'],
          regionalRelevance: 'National - seasonal renewal'
        },
        {
          theme: 'Tax Season Planning',
          description: 'Tax-related services and financial planning',
          targetAudience: 'Businesses and individuals',
          suggestedContent: ['Tax preparation services', 'Financial planning', 'Deduction optimization'],
          regionalRelevance: 'National - tax deadline April 15'
        }
      ],
      businessActivityLevel: 'high',
      culturalConsiderations: [
        'Spring cleaning mentality increases project inquiries',
        'Tax season affects business and consumer spending',
        'Weather improvement increases outdoor project demand'
      ],
      localEvents: [
        { eventName: 'Tax Deadline', date: 'April 15', businessImpact: 'negative', marketingOpportunity: 'Tax preparation services and financial planning', regionalSpecificity: 'National' },
        { eventName: 'Memorial Day', date: 'Last Monday in May', businessImpact: 'positive', marketingOpportunity: 'Summer kickoff promotions and outdoor services', regionalSpecificity: 'National' }
      ],
      seoOpportunities: [
        { opportunity: 'Spring cleaning searches', searchTrend: 'rising', targetKeywords: ['spring cleaning', 'home maintenance', 'outdoor preparation'], contentAngle: 'Prepare your home for spring', regionalSpecificity: 'National with regional weather variations' },
        { opportunity: 'Home improvement planning', searchTrend: 'rising', targetKeywords: ['home renovation', 'spring projects', 'outdoor living'], contentAngle: 'Plan your spring home improvements', regionalSpecificity: 'National' }
      ],
      contentSuggestions: [
        {
          contentType: 'Blog Post',
          title: 'Spring Home Maintenance Checklist for [Region] Homeowners',
          description: 'Complete guide to spring home preparation',
          targetKeywords: ['spring maintenance', 'home care', 'seasonal checklist'],
          regionalAngle: 'Regional weather patterns and local service availability',
          optimalTiming: 'Early March'
        },
        {
          contentType: 'Social Media',
          title: 'Spring Into Action: Limited Time Maintenance Special',
          description: 'Seasonal promotion with urgency',
          targetKeywords: ['spring special', 'maintenance package', 'limited time'],
          regionalAngle: 'Local service areas and regional pricing',
          optimalTiming: 'Mid-April'
        }
      ]
    },
    // Summer (June-August)
    {
      region: 'United States',
      season: 'Summer',
      months: [6, 7, 8],
      optimalPostingTimes: [
        { dayOfWeek: 'Monday', timeOfDay: '9:00 AM EST', reasoning: 'Week planning and project scheduling', effectiveness: 'high' },
        { dayOfWeek: 'Wednesday', timeOfDay: '4:00 PM EST', reasoning: 'After-work research time', effectiveness: 'medium' },
        { dayOfWeek: 'Saturday', timeOfDay: '9:00 AM EST', reasoning: 'Morning project planning', effectiveness: 'high' }
      ],
      campaignThemes: [
        {
          theme: 'Summer Outdoor Living',
          description: 'Outdoor spaces and entertainment areas',
          targetAudience: 'Homeowners and event planners',
          suggestedContent: ['Outdoor maintenance', 'Entertainment spaces', 'Summer events'],
          regionalRelevance: 'National - outdoor season'
        },
        {
          theme: 'Vacation Preparation',
          description: 'Pre-vacation home and business preparation',
          targetAudience: 'Travelers and business owners',
          suggestedContent: ['Vacation maintenance', 'Security preparation', 'Business continuity'],
          regionalRelevance: 'National - travel season'
        }
      ],
      businessActivityLevel: 'high',
      culturalConsiderations: [
        'Vacation season affects service scheduling',
        'Hot weather increases urgency of certain repairs',
        'Outdoor project demand peaks in most regions'
      ],
      localEvents: [
        { eventName: 'Fourth of July', date: 'July 4', businessImpact: 'positive', marketingOpportunity: 'Patriotic promotions and summer events', regionalSpecificity: 'National' },
        { eventName: 'Labor Day', date: 'First Monday in September', businessImpact: 'positive', marketingOpportunity: 'End-of-summer promotions and fall preparation', regionalSpecificity: 'National' }
      ],
      seoOpportunities: [
        { opportunity: 'Outdoor living searches', searchTrend: 'rising', targetKeywords: ['outdoor maintenance', 'patio care', 'summer preparation'], contentAngle: 'Prepare your outdoor spaces for summer', regionalSpecificity: 'National with climate variations' },
        { opportunity: 'Vacation preparation', searchTrend: 'stable', targetKeywords: ['vacation preparation', 'home security', 'travel planning'], contentAngle: 'Secure your home before vacation', regionalSpecificity: 'National' }
      ],
      contentSuggestions: [
        {
          contentType: 'Blog Post',
          title: 'Essential Summer Maintenance Tips for [Region] Properties',
          description: 'Summer-specific maintenance guide',
          targetKeywords: ['summer maintenance', 'outdoor care', 'seasonal tips'],
          regionalAngle: 'Regional climate considerations and local services',
          optimalTiming: 'Early June'
        },
        {
          contentType: 'Email Campaign',
          title: 'Beat the Heat: Summer Maintenance Special',
          description: 'Seasonal service promotion',
          targetKeywords: ['summer special', 'maintenance package', 'heat protection'],
          regionalAngle: 'Local climate challenges and solutions',
          optimalTiming: 'Late June'
        }
      ]
    },
    // Fall (September-November)
    {
      region: 'United States',
      season: 'Fall',
      months: [9, 10, 11],
      optimalPostingTimes: [
        { dayOfWeek: 'Tuesday', timeOfDay: '10:00 AM EST', reasoning: 'Post-Labor Day work routine', effectiveness: 'high' },
        { dayOfWeek: 'Thursday', timeOfDay: '1:00 PM EST', reasoning: 'Weekend and holiday planning', effectiveness: 'high' },
        { dayOfWeek: 'Saturday', timeOfDay: '10:00 AM EST', reasoning: 'Fall project planning', effectiveness: 'medium' }
      ],
      campaignThemes: [
        {
          theme: 'Fall Preparation',
          description: 'Pre-winter maintenance and preparation',
          targetAudience: 'Homeowners and businesses',
          suggestedContent: ['Fall maintenance', 'Winter preparation', 'Energy efficiency'],
          regionalRelevance: 'National - seasonal transition'
        },
        {
          theme: 'Back to School/Business',
          description: 'Return to routine and business focus',
          targetAudience: 'Families and businesses',
          suggestedContent: ['Business services', 'Home organization', 'Routine establishment'],
          regionalRelevance: 'National - return to routine'
        }
      ],
      businessActivityLevel: 'high',
      culturalConsiderations: [
        'Back-to-school/business routine increases service inquiries',
        'Winter preparation urgency increases through season',
        'Holiday planning begins in late fall'
      ],
      localEvents: [
        { eventName: 'Halloween', date: 'October 31', businessImpact: 'positive', marketingOpportunity: 'Fall promotions and seasonal services', regionalSpecificity: 'National' },
        { eventName: 'Thanksgiving', date: 'Fourth Thursday in November', businessImpact: 'positive', marketingOpportunity: 'Gratitude promotions and holiday preparation', regionalSpecificity: 'National' }
      ],
      seoOpportunities: [
        { opportunity: 'Fall maintenance searches', searchTrend: 'rising', targetKeywords: ['fall maintenance', 'winter preparation', 'seasonal cleanup'], contentAngle: 'Prepare your property for winter', regionalSpecificity: 'National with regional weather patterns' },
        { opportunity: 'Holiday preparation', searchTrend: 'rising', targetKeywords: ['holiday preparation', 'home maintenance', 'seasonal services'], contentAngle: 'Get your home ready for the holidays', regionalSpecificity: 'National' }
      ],
      contentSuggestions: [
        {
          contentType: 'Blog Post',
          title: 'Complete Fall Maintenance Guide for [Region] Homeowners',
          description: 'Comprehensive fall preparation checklist',
          targetKeywords: ['fall maintenance', 'winter preparation', 'seasonal checklist'],
          regionalAngle: 'Regional weather patterns and local timing',
          optimalTiming: 'Early September'
        },
        {
          contentType: 'Google Business Profile',
          title: 'Fall Into Savings: Seasonal Maintenance Special',
          description: 'Fall promotion with preparation focus',
          targetKeywords: ['fall special', 'maintenance package', 'winter preparation'],
          regionalAngle: 'Local service areas and regional needs',
          optimalTiming: 'Mid-October'
        }
      ]
    }
  ],

  'en-GB': [
    // UK-specific timing recommendations would go here
    {
      region: 'United Kingdom',
      season: 'Winter',
      months: [12, 1, 2],
      optimalPostingTimes: [
        { dayOfWeek: 'Tuesday', timeOfDay: '10:00 AM GMT', reasoning: 'Post-holiday work routine begins', effectiveness: 'high' },
        { dayOfWeek: 'Thursday', timeOfDay: '2:00 PM GMT', reasoning: 'Weekend planning mindset', effectiveness: 'high' },
        { dayOfWeek: 'Saturday', timeOfDay: '11:00 AM GMT', reasoning: 'Weekend research time', effectiveness: 'medium' }
      ],
      campaignThemes: [
        {
          theme: 'Winter Preparation',
          description: 'UK winter preparation and services',
          targetAudience: 'Homeowners and businesses',
          suggestedContent: ['Winter maintenance', 'Energy efficiency', 'Weather protection'],
          regionalRelevance: 'UK - winter weather challenges'
        }
      ],
      businessActivityLevel: 'medium',
      culturalConsiderations: [
        'Christmas and New Year periods affect business operations',
        'Cold weather increases service urgency',
        'Boxing Day shopping influences consumer behavior'
      ],
      localEvents: [
        { eventName: 'Boxing Day', date: 'December 26', businessImpact: 'positive', marketingOpportunity: 'Sales events and service promotions', regionalSpecificity: 'UK' },
        { eventName: 'New Year\'s Day', date: 'January 1', businessImpact: 'positive', marketingOpportunity: 'New Year service promotions', regionalSpecificity: 'UK' }
      ],
      seoOpportunities: [
        { opportunity: 'Winter preparation searches', searchTrend: 'rising', targetKeywords: ['winter preparation', 'energy efficiency', 'weather protection'], contentAngle: 'Prepare for UK winter', regionalSpecificity: 'UK' }
      ],
      contentSuggestions: [
        {
          contentType: 'Blog Post',
          title: 'UK Winter Maintenance Guide: Protect Your Property',
          description: 'Comprehensive UK winter preparation',
          targetKeywords: ['winter maintenance', 'UK weather', 'property protection'],
          regionalAngle: 'UK-specific weather challenges and solutions',
          optimalTiming: 'Late November'
        }
      ]
    }
    // Additional UK seasons would follow...
  ]
};

/**
 * Get timing recommendations for a specific region and current season
 */
export function getTimingRecommendations(region: string, month?: number): RegionalTimingRecommendation | null {
  const recommendations = REGIONAL_TIMING_RECOMMENDATIONS[region];
  if (!recommendations) return null;

  const currentMonth = month || new Date().getMonth() + 1; // Convert to 1-12 format

  return recommendations.find(rec => rec.months.includes(currentMonth)) || null;
}

/**
 * Get optimal posting times for content publication
 */
export function getOptimalPostingTimes(region: string, month?: number): PostingTime[] {
  const recommendations = getTimingRecommendations(region, month);
  return recommendations?.optimalPostingTimes || [];
}

/**
 * Get campaign themes for current season
 */
export function getCampaignThemes(region: string, month?: number): CampaignTheme[] {
  const recommendations = getTimingRecommendations(region, month);
  return recommendations?.campaignThemes || [];
}

/**
 * Get SEO opportunities for current season
 */
export function getSEOOpportunities(region: string, month?: number): SEOOpportunity[] {
  const recommendations = getTimingRecommendations(region, month);
  return recommendations?.seoOpportunities || [];
}

/**
 * Analyze timing for multiple regions
 */
export function analyzeMultiRegionalTiming(regions: string[], month?: number): MultiRegionalTimingAnalysis {
  const analyses = regions.map(region => ({
    region,
    recommendation: getTimingRecommendations(region, month)
  })).filter(analysis => analysis.recommendation !== null);

  if (analyses.length === 0) {
    throw new Error('No timing recommendations found for specified regions');
  }

  const primaryAnalysis = analyses[0];
  const secondaryAnalyses = analyses.slice(1);

  // Find common optimal times
  const commonTimes = findCommonOptimalTimes(analyses.map(a => a.recommendation!.optimalPostingTimes));

  // Identify conflicting guidance
  const conflicts = identifyTimingConflicts(analyses.map(a => a.recommendation!));

  return {
    primaryRegion: primaryAnalysis.recommendation!,
    secondaryRegions: secondaryAnalyses.map(a => a.recommendation!),
    optimalSchedule: {
      globalBestTimes: commonTimes,
      regionSpecificRecommendations: analyses.map(a => ({
        region: a.region,
        bestTimes: a.recommendation!.optimalPostingTimes,
        culturalAdjustments: a.recommendation!.culturalConsiderations
      }))
    },
    conflictingGuidance: conflicts
  };
}

/**
 * Find common optimal posting times across multiple regions
 */
function findCommonOptimalTimes(allTimes: PostingTime[][]): PostingTime[] {
  if (allTimes.length === 0) return [];

  const timeFrequency = new Map<string, {time: PostingTime, count: number}>();

  allTimes.forEach(times => {
    times.forEach(time => {
      const key = `${time.dayOfWeek}-${time.timeOfDay}`;
      const existing = timeFrequency.get(key);
      if (existing) {
        existing.count++;
      } else {
        timeFrequency.set(key, {time, count: 1});
      }
    });
  });

  // Return times that appear in at least half of the regions
  const threshold = Math.ceil(allTimes.length / 2);
  return Array.from(timeFrequency.values())
    .filter(item => item.count >= threshold)
    .map(item => item.time)
    .sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const aDayIndex = dayOrder.indexOf(a.dayOfWeek);
      const bDayIndex = dayOrder.indexOf(b.dayOfWeek);

      if (aDayIndex !== bDayIndex) {
        return aDayIndex - bDayIndex;
      }

      return a.timeOfDay.localeCompare(b.timeOfDay);
    });
}

/**
 * Identify conflicting guidance across regions
 */
function identifyTimingConflicts(recommendations: RegionalTimingRecommendation[]): Array<{conflict: string, resolution: string}> {
  const conflicts: Array<{conflict: string, resolution: string}> = [];

  // Check for different business activity levels
  const activityLevels = new Set(recommendations.map(r => r.businessActivityLevel));
  if (activityLevels.size > 1) {
    conflicts.push({
      conflict: 'Different business activity levels across regions',
      resolution: 'Tailor content intensity to regional activity levels'
    });
  }

  // Check for conflicting optimal times
  const allOptimalTimes = recommendations.flatMap(r => r.optimalPostingTimes);
  const timeGroups = new Map<string, PostingTime[]>();

  allOptimalTimes.forEach(time => {
    const key = time.timeOfDay;
    if (!timeGroups.has(key)) {
      timeGroups.set(key, []);
    }
    timeGroups.get(key)!.push(time);
  });

  timeGroups.forEach((times, timeKey) => {
    if (times.length > 1) {
      const differentDays = new Set(times.map(t => t.dayOfWeek));
      if (differentDays.size > 1) {
        conflicts.push({
          conflict: `Different optimal days for ${timeKey}`,
          resolution: 'Schedule content for multiple days or use global scheduling tools'
        });
      }
    }
  });

  return conflicts;
}

/**
 * Get content suggestions based on current season and region
 */
export function getSeasonalContentSuggestions(region: string, month?: number): ContentSuggestion[] {
  const recommendations = getTimingRecommendations(region, month);
  return recommendations?.contentSuggestions || [];
}

/**
 * Get local events for marketing opportunities
 */
export function getLocalEvents(region: string, month?: number): LocalEvent[] {
  const recommendations = getTimingRecommendations(region, month);
  return recommendations?.localEvents || [];
}