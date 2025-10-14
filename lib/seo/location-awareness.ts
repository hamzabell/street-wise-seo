/**
 * Location awareness system for improved topic generation
 * Provides cultural, seasonal, and regional context for different locations
 */

export interface LocationCharacteristics {
  country: string;
  region: string;
  climateZone: 'tropical' | 'temperate' | 'arid' | 'mediterranean' | 'continental';
  season: string; // Flexible to handle any season type
  culturalContext: string[];
  economicContext: string[];
  seasonalTopics: string[];
  commonPainPoints: string[];
}

export interface LocationSeasonalPattern {
  season: string;
  months: number[];
  topics: string[];
  characteristics: string[];
}

/**
 * Enhanced location detection with characteristics
 */
export function detectLocationCharacteristics(location?: string): LocationCharacteristics {
  if (!location) {
    return getDefaultCharacteristics();
  }

  const locationLower = location.toLowerCase();

  // Extract country/region information more intelligently
  const detectedInfo = extractLocationInfo(location);

  return generateCharacteristicsBasedOnContext(detectedInfo, location);
}

/**
 * Extract location information intelligently
 */
function extractLocationInfo(location: string): {
  country?: string;
  region?: string;
  city?: string;
  climateZone?: 'tropical' | 'temperate' | 'arid' | 'mediterranean' | 'continental';
  latitude?: number;
  longitude?: number;
} {
  const locationLower = location.toLowerCase();

  // Try to extract country, region, city patterns
  const parts = location.split(',').map(p => p.trim());

  const result: {
    country?: string;
    region?: string;
    city?: string;
    climateZone?: 'tropical' | 'temperate' | 'arid' | 'mediterranean' | 'continental';
    latitude?: number;
    longitude?: number;
  } = {};

  // Extract components
  if (parts.length >= 1) result.city = parts[0];
  if (parts.length >= 2) result.region = parts[1];
  if (parts.length >= 3) result.country = parts[2];

  // Fallback: Try to detect country from any part
  if (!result.country) {
    const countryIndicators = [
      // Countries with their common indicators
      { country: 'United States', indicators: ['usa', 'united states', 'america', 'us'], climate: 'temperate' as const },
      { country: 'United Kingdom', indicators: ['uk', 'united kingdom', 'england', 'britain', 'london'], climate: 'temperate' as const },
      { country: 'Canada', indicators: ['canada', 'toronto', 'vancouver', 'montreal'], climate: 'temperate' as const },
      { country: 'Australia', indicators: ['australia', 'sydney', 'melbourne', 'brisbane'], climate: 'temperate' as const },
      { country: 'India', indicators: ['india', 'mumbai', 'delhi', 'bangalore', 'chennai'], climate: 'tropical' as const },
      { country: 'Brazil', indicators: ['brazil', 'são paulo', 'rio', 'brasilia'], climate: 'tropical' as const },
      { country: 'Nigeria', indicators: ['nigeria', 'lagos', 'abuja', 'port harcourt'], climate: 'tropical' as const },
      { country: 'South Africa', indicators: ['south africa', 'johannesburg', 'cape town', 'pretoria'], climate: 'temperate' as const },
      { country: 'Kenya', indicators: ['kenya', 'nairobi', 'mombasa'], climate: 'tropical' as const },
      { country: 'UAE', indicators: ['uae', 'dubai', 'abu dhabi', 'sharjah'], climate: 'arid' as const },
      { country: 'Singapore', indicators: ['singapore'], climate: 'tropical' as const },
      { country: 'Malaysia', indicators: ['malaysia', 'kuala lumpur'], climate: 'tropical' as const },
      { country: 'Thailand', indicators: ['thailand', 'bangkok', 'phuket'], climate: 'tropical' as const },
      { country: 'Mexico', indicators: ['mexico', 'mexico city', 'guadalajara'], climate: 'tropical' as const },
      { country: 'Japan', indicators: ['japan', 'tokyo', 'osaka'], climate: 'temperate' as const },
      { country: 'Germany', indicators: ['germany', 'berlin', 'munich', 'hamburg'], climate: 'temperate' as const },
      { country: 'France', indicators: ['france', 'paris', 'lyon', 'marseille'], climate: 'temperate' as const },
      { country: 'Spain', indicators: ['spain', 'madrid', 'barcelona', 'valencia'], climate: 'mediterranean' as const },
      { country: 'Italy', indicators: ['italy', 'rome', 'milan', 'naples'], climate: 'mediterranean' as const },
      { country: 'Egypt', indicators: ['egypt', 'cairo', 'alexandria'], climate: 'arid' as const },
    ];

    for (const { country, indicators, climate } of countryIndicators) {
      if (indicators.some(indicator => locationLower.includes(indicator))) {
        result.country = country;
        result.climateZone = climate;
        break;
      }
    }
  }

  // Determine climate zone if not detected
  if (!result.climateZone) {
    // Heuristics based on geographical clues
    if (locationLower.includes('tropic') || locationLower.includes('equator') ||
        locationLower.includes('caribbean') || locationLower.includes('island')) {
      result.climateZone = 'tropical';
    } else if (locationLower.includes('desert') || locationLower.includes('sahara') ||
               locationLower.includes('arid')) {
      result.climateZone = 'arid';
    } else if (locationLower.includes('mediterranean') || locationLower.includes('europe south')) {
      result.climateZone = 'mediterranean';
    } else {
      result.climateZone = 'temperate'; // Default
    }
  }

  return result;
}

/**
 * Generate characteristics based on detected location context
 */
function generateCharacteristicsBasedOnContext(detectedInfo: any, originalLocation: string): LocationCharacteristics {
  const currentMonth = new Date().getMonth() + 1;

  // Determine current season based on climate zone
  const currentSeason = determineCurrentSeason(detectedInfo.climateZone, currentMonth);

  // Generate context-aware characteristics
  const culturalContext = generateCulturalContext(detectedInfo);
  const economicContext = generateEconomicContext(detectedInfo);
  const seasonalTopics = generateSeasonalTopics(detectedInfo.climateZone, currentSeason, detectedInfo);
  const commonPainPoints = generateCommonPainPoints(detectedInfo);

  return {
    country: detectedInfo.country || 'Unknown',
    region: detectedInfo.region || detectedInfo.city || 'Unknown',
    climateZone: detectedInfo.climateZone || 'temperate',
    season: currentSeason,
    culturalContext,
    economicContext,
    seasonalTopics,
    commonPainPoints
  };
}

/**
 * Determine current season based on climate zone
 */
function determineCurrentSeason(climateZone: string, month: number): string {
  switch (climateZone) {
    case 'tropical':
      if (month >= 11 || month <= 2) return 'dry season';
      if (month >= 3 && month <= 5) return 'hot season';
      return 'rainy season';

    case 'arid':
      if (month >= 5 && month <= 9) return 'extreme heat';
      return 'moderate temperatures';

    case 'mediterranean':
      if (month >= 6 && month <= 8) return 'dry hot summer';
      if (month >= 12 || month <= 2) return 'mild wet winter';
      if (month >= 3 && month <= 5) return 'spring';
      return 'autumn';

    case 'continental':
      if (month >= 12 || month <= 2) return 'cold winter';
      if (month >= 3 && month <= 5) return 'spring';
      if (month >= 6 && month <= 8) return 'summer';
      return 'autumn';

    case 'temperate':
    default:
      if (month >= 12 || month <= 2) return 'winter';
      if (month >= 3 && month <= 5) return 'spring';
      if (month >= 6 && month <= 8) return 'summer';
      return 'autumn';
  }
}

/**
 * Generate cultural context based on location information
 */
function generateCulturalContext(detectedInfo: any): string[] {
  const context = [];

  if (detectedInfo.climateZone === 'tropical') {
    context.push(
      'Warm climate lifestyle',
      'Outdoor social activities',
      'Rainy season adaptations',
      'Heat management practices'
    );
  } else if (detectedInfo.climateZone === 'arid') {
    context.push(
      'Heat adaptation strategies',
      'Water conservation culture',
      'Early morning/evening activities',
      'Sun protection practices'
    );
  } else if (detectedInfo.climateZone === 'mediterranean') {
    context.push(
      'Outdoor dining culture',
      'Seasonal tourism patterns',
      'Beach and coastal lifestyle',
      'Agricultural traditions'
    );
  } else if (detectedInfo.climateZone === 'temperate') {
    context.push(
      'Four-season lifestyle',
      'Seasonal activities and celebrations',
      'Indoor heating/cooling adaptations',
      'Weather-dependent planning'
    );
  }

  // Add general urban/rural context
  if (detectedInfo.city) {
    context.push(
      'Urban service expectations',
      'Digital communication preferences',
      'Time-conscious service delivery',
      'Professional service standards'
    );
  }

  return context;
}

/**
 * Generate economic context based on location
 */
function generateEconomicContext(detectedInfo: any): string[] {
  const context = [];

  // Climate-based economic factors
  if (detectedInfo.climateZone === 'tropical') {
    context.push(
      'Tourism and hospitality sector',
      'Agricultural cycles and seasons',
      'Rainy season business adaptations',
      'Heat-related service considerations'
    );
  } else if (detectedInfo.climateZone === 'arid') {
    context.push(
      'Water-dependent business operations',
      'Cooling and ventilation costs',
      'Tourism in cooler seasons',
      'Desert-specific service needs'
    );
  } else if (detectedInfo.climateZone === 'mediterranean') {
    context.push(
      'Seasonal tourism economy',
      'Agricultural and food production',
      'Outdoor service operations',
      'Coastal business activities'
    );
  } else {
    context.push(
      'Seasonal business patterns',
      'Weather-dependent operations',
      'Indoor service infrastructure',
      'Heating/cooling cost management'
    );
  }

  // Urban vs rural considerations
  if (detectedInfo.city) {
    context.push(
      'Higher service density and competition',
      'Professional service expectations',
      'Digital payment systems',
      'Transportation and accessibility factors'
    );
  }

  return context;
}

/**
 * Generate seasonal topics based on climate
 */
function generateSeasonalTopics(climateZone: string, season: string, detectedInfo: any): string[] {
  const baseSeasons = {
    'tropical': {
      'dry season': ['Dry season business preparation', 'Outdoor service opportunities', 'Heat management solutions'],
      'hot season': ['Hot weather service adaptations', 'Cooling system maintenance', 'Sun protection services'],
      'rainy season': ['Rainy season business continuity', 'Flood prevention services', 'Indoor activity solutions']
    },
    'arid': {
      'extreme heat': ['Extreme heat business protection', 'Cooling system optimization', 'Heat-related service delivery'],
      'moderate temperatures': ['Mild weather business opportunities', 'Outdoor service expansion', 'Seasonal preparation']
    },
    'mediterranean': {
      'dry hot summer': ['Summer business optimization', 'Tourist season services', 'Heat-related customer needs'],
      'mild wet winter': ['Winter business preparation', 'Mild weather services', 'Off-season opportunities'],
      'spring': ['Spring business renewal', 'Outdoor service preparation', 'Seasonal transitions'],
      'autumn': ['Autumn business preparation', 'Off-season planning', 'Weather transition services']
    },
    'temperate': {
      'winter': ['Winter business preparation', 'Cold weather services', 'Indoor activity solutions'],
      'spring': ['Spring business renewal', 'Seasonal preparation', 'Outdoor service opportunities'],
      'summer': ['Summer business optimization', 'Heat-related services', 'Outdoor activity support'],
      'autumn': ['Autumn business preparation', 'Seasonal transitions', 'Weather adaptation services']
    }
  };

  const topics = (baseSeasons[climateZone as keyof typeof baseSeasons] as any)?.[season] || ['Seasonal business preparation', 'Weather adaptation services'];

  // Add location-specific topic
  if (detectedInfo.city) {
    topics.push(`${detectedInfo.city} seasonal service needs`);
  }

  return topics;
}

/**
 * Generate common pain points based on location characteristics
 */
function generateCommonPainPoints(detectedInfo: any): string[] {
  const painPoints = [];

  // Climate-based pain points
  if (detectedInfo.climateZone === 'tropical') {
    painPoints.push(
      'Rainy season business disruptions',
      'Heat-related service challenges',
      'Humidity and moisture issues',
      'Seasonal customer behavior changes'
    );
  } else if (detectedInfo.climateZone === 'arid') {
    painPoints.push(
      'Extreme heat operational challenges',
      'Water scarcity impacts',
      'Dust and sand maintenance',
      'Cooling system reliability'
    );
  } else if (detectedInfo.climateZone === 'mediterranean') {
    painPoints.push(
      'Seasonal demand fluctuations',
      'Tourism market volatility',
      'Coastal weather disruptions',
      'Seasonal staffing challenges'
    );
  } else {
    painPoints.push(
      'Seasonal weather disruptions',
      'Heating/cooling cost management',
      'Weather-dependent customer behavior',
      'Seasonal maintenance requirements'
    );
  }

  // Urban-specific pain points
  if (detectedInfo.city) {
    painPoints.push(
      'Urban transportation challenges',
      'Higher operational costs',
      'Competitive service market',
      'Infrastructure and maintenance issues'
    );
  }

  return painPoints;
}


/**
 * Generate location-aware AI prompt enhancement
 */
export function generateLocationAwarePrompt(
  location: string,
  characteristics: LocationCharacteristics,
  industryContext?: string
): string {
  let locationPrompt = `
LOCATION CONTEXT: ${characteristics.country} (${characteristics.region})
CLIMATE: ${characteristics.climateZone} - Current Season: ${characteristics.season.toUpperCase()}

CULTURAL CONTEXT:
- ${characteristics.culturalContext.slice(0, 4).join('\n- ')}

ECONOMIC ENVIRONMENT:
- ${characteristics.economicContext.slice(0, 3).join('\n- ')}

LOCAL PAIN POINTS:
- ${characteristics.commonPainPoints.slice(0, 4).join('\n- ')}

SEASONAL RELEVANCE:
- Current seasonal topics: ${characteristics.seasonalTopics.slice(0, 3).join(', ')}

CRITICAL INSTRUCTIONS:
1. Generate topics that reflect ${characteristics.country}'s cultural and economic reality
2. Use local terminology and references naturally based on the cultural context provided
3. Consider current ${characteristics.season} season and its impact
4. Address local pain points and challenges
5. NO generic content about seasons that don't exist (no winter/fall topics for tropical locations)
6. Focus on practical solutions for ${characteristics.country}'s infrastructure and lifestyle
7. Consider mobile-first audience and connectivity issues
8. Reference local business practices and customer expectations
9. Use authentic local language that would naturally appear in customer conversations
10. Avoid generic terms - use specific, culturally relevant language`;

  if (industryContext) {
    locationPrompt += `
11. Adapt topics specifically for ${industryContext} in ${characteristics.country}
12. Consider how ${industryContext} services operate in ${characteristics.climateZone} climate`;
  }

  return locationPrompt;
}

/**
 * Enhance seasonal suggestions based on location characteristics
 */
export function getLocationAwareSeasonalTopics(
  industryId: string,
  characteristics: LocationCharacteristics
): string[] {
  const baseIndustry = getBaseIndustrySeasonalTopics(industryId);
  const locationSpecific = characteristics.seasonalTopics;

  // Combine and prioritize location-specific topics
  const combined = [...locationSpecific, ...baseIndustry.slice(0, 3)];
  return combined.slice(0, 6);
}

/**
 * Get base industry seasonal topics (fallback)
 */
function getBaseIndustrySeasonalTopics(industryId: string): string[] {
  // Import from industry-templates or define fallback
  return [
    'Professional service maintenance',
    'Business growth strategies',
    'Customer service excellence',
    'Operational efficiency tips'
  ];
}

function getDefaultCharacteristics(): LocationCharacteristics {
  return {
    country: 'Unknown',
    region: 'General',
    climateZone: 'temperate',
    season: 'summer',
    culturalContext: [
      'Standard business practices',
      'General service expectations',
      'Customer service standards'
    ],
    economicContext: [
      'Standard market conditions',
      'Regular business operations',
      'Typical customer behavior'
    ],
    seasonalTopics: ['General business topics'],
    commonPainPoints: ['General business challenges']
  };
}