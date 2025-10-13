/**
 * Industry template system for small business SEO topic generation
 * Provides industry-specific prompts, seasonal suggestions, and local service patterns
 */

export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  seasonalSuggestions: SeasonalSuggestion[];
  localServicePatterns: string[];
  commonPainPoints: string[];
  targetAudiences: string[];
  sampleTopics: string[];
}

export interface SeasonalSuggestion {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  topics: string[];
  months: number[];
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'plumbing-hvac',
    name: 'Plumbing & HVAC',
    category: 'Home Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring plumbing maintenance checklist',
          'HVAC tune-up before summer heat',
          'Prevent AC breakdowns this summer',
          'Water heater maintenance after winter'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Emergency AC repair services',
          'Keep your home cool during heatwaves',
          'Summer plumbing tips for homeowners',
          'HVAC emergency preparedness'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall heating system inspection',
          'Prepare pipes for winter freeze',
          'HVAC efficiency before winter',
          'Furnace maintenance checklist'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Emergency heating repair services',
          'Frozen pipe prevention and thawing',
          'Winter HVAC safety tips',
          'Keep your home warm efficiently'
        ]
      }
    ],
    localServicePatterns: [
      'emergency {service} in {city}',
      '24 hour {service} near me',
      'best {service} {city}',
      '{service} repair {city}',
      'affordable {service} {city}',
      'licensed {service} {city}',
      '{service} company near me',
      'residential {service} {city}'
    ],
    commonPainPoints: [
      'emergency repairs',
      'high energy bills',
      'system breakdowns',
      'maintenance scheduling',
      'finding reliable service'
    ],
    targetAudiences: [
      'homeowners',
      'property managers',
      'business owners',
      'real estate agents'
    ],
    sampleTopics: [
      'Common plumbing problems every homeowner should know',
      'How to choose the best HVAC system for your home',
      'Emergency plumbing: What to do before the plumber arrives',
      'Energy-efficient HVAC solutions for small businesses'
    ]
  },
  {
    id: 'electrical-services',
    name: 'Electrical Services',
    category: 'Home Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring electrical safety inspection',
          'Outdoor lighting installation for summer',
          'Electrical panel maintenance',
          'Prepare your home for summer energy needs'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'AC electrical requirements and safety',
          'Outdoor electrical installations',
          'Summer electrical fire prevention',
          'Electrical upgrades for home cooling'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall electrical safety checklist',
          'Prepare electrical systems for winter',
          'Holiday lighting electrical safety',
          'Electrical panel inspection before winter'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Winter electrical safety tips',
          'Generator installation and maintenance',
          'Heating system electrical requirements',
          'Emergency electrical services in winter'
        ]
      }
    ],
    localServicePatterns: [
      'emergency electrician {city}',
      'licensed electrician near me',
      'electrical repair {city}',
      'electrician {city} 24/7',
      'residential electrician {city}',
      'commercial electrician {city}',
      'electrical contractor {city}',
      'best electrician {city}'
    ],
    commonPainPoints: [
      'power outages',
      'electrical safety concerns',
      'outdated wiring',
      'circuit breaker issues',
      'finding licensed electricians'
    ],
    targetAudiences: [
      'homeowners',
      'business owners',
      'property managers',
      'contractors'
    ],
    sampleTopics: [
      'Signs you need to upgrade your electrical panel',
      'Electrical safety tips for homeowners',
      'How to choose a reliable electrician',
      'Common electrical problems in older homes'
    ]
  },
  {
    id: 'cleaning-services',
    name: 'Cleaning Services',
    category: 'Home Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring deep cleaning checklist',
          'Post-winter home cleaning services',
          'Window cleaning for spring',
          'Allergy-friendly cleaning solutions'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer home maintenance cleaning',
          'Vacation rental cleaning services',
          'Deep cleaning for summer entertaining',
          'Outdoor area cleaning and maintenance'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall cleaning for holiday preparation',
          'Post-summer deep cleaning services',
          'Carpet cleaning before winter',
          'Gutter cleaning and maintenance'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Holiday cleaning services',
          'Post-holiday cleanup specialists',
          'Winter home cleaning tips',
          'Deep cleaning for New Year preparations'
        ]
      }
    ],
    localServicePatterns: [
      'cleaning service {city}',
      'maid service {city}',
      'house cleaning {city}',
      'deep cleaning {city}',
      'office cleaning {city}',
      'move in cleaning {city}',
      'cleaners near me',
      'professional cleaning {city}'
    ],
    commonPainPoints: [
      'lack of time for cleaning',
      'special occasion preparation',
      'deep cleaning needs',
      'finding reliable cleaners',
      'maintaining cleaning schedule'
    ],
    targetAudiences: [
      'busy professionals',
      'families',
      'business owners',
      'real estate agents',
      'property managers'
    ],
    sampleTopics: [
      'How often should you deep clean your home',
      'Benefits of professional cleaning services',
      'Cleaning checklist for busy professionals',
      'Eco-friendly cleaning solutions for homes'
    ]
  },
  {
    id: 'landscaping-lawn-care',
    name: 'Landscaping & Lawn Care',
    category: 'Outdoor Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring lawn care preparation guide',
          'Landscape design for summer beauty',
          'Garden preparation and planting',
          'Lawn treatment after winter damage'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer lawn maintenance tips',
          'Drought-resistant landscaping',
          'Pest control for summer gardens',
          'Irrigation system maintenance'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall lawn preparation for winter',
          'Leaf removal and lawn care',
          'Fall planting guide',
          'Winter garden preparation'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Winter lawn care tips',
          'Snow and ice removal services',
          'Protecting plants during winter',
          'Planning spring landscape projects'
        ]
      }
    ],
    localServicePatterns: [
      'landscaping {city}',
      'lawn care {city}',
      'lawn service near me',
      'landscape design {city}',
      'yard maintenance {city}',
      'garden service {city}',
      'landscape contractor {city}',
      'best lawn care {city}'
    ],
    commonPainPoints: [
      'lawn maintenance',
      'weed control',
      'seasonal yard changes',
      'landscape design',
      'time for yard work'
    ],
    targetAudiences: [
      'homeowners',
      'property managers',
      'business owners',
      'HOA communities'
    ],
    sampleTopics: [
      'Essential lawn care schedule for homeowners',
      'Low-maintenance landscaping ideas',
      'Sustainable gardening practices',
      'How to choose the right lawn care service'
    ]
  },
  {
    id: 'roofing',
    name: 'Roofing Services',
    category: 'Home Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring roof inspection checklist',
          'Winter damage roof repair',
          'Gutter cleaning and repair',
          'Prepare roof for spring rains'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer roof maintenance tips',
          'Heat protection for your roof',
          'Storm damage assessment',
          'Roof ventilation for summer comfort'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall roof preparation for winter',
          'Roof inspection before winter storms',
          'Gutter installation and repair',
          'Attic insulation and ventilation'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Winter roof damage prevention',
          'Ice dam removal services',
          'Emergency roof repair in snow',
          'Roof snow removal services'
        ]
      }
    ],
    localServicePatterns: [
      'roofing contractor {city}',
      'roof repair {city}',
      'roof inspection {city}',
      'emergency roofer {city}',
      'residential roofing {city}',
      'commercial roofing {city}',
      'roof replacement {city}',
      'best roofing company {city}'
    ],
    commonPainPoints: [
      'roof leaks',
      'storm damage',
      'aging roof concerns',
      'energy efficiency',
      'finding reliable roofers'
    ],
    targetAudiences: [
      'homeowners',
      'property managers',
      'business owners',
      'insurance adjusters'
    ],
    sampleTopics: [
      'Signs you need a new roof',
      'How to maintain your roof between inspections',
      'Choosing the right roofing material for your climate',
      'Emergency roof repair: What to do immediately'
    ]
  },
  {
    id: 'painting',
    name: 'Painting Services',
    category: 'Home Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring exterior painting guide',
          'Color trends for spring renovation',
          'Interior painting for spring refresh',
          'Surface preparation for painting'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer painting tips and tricks',
          'Exterior painting in hot weather',
          'Protecting surfaces during summer projects',
          'Quick home refresh painting ideas'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall interior painting projects',
          'Exterior painting before winter',
          'Warm color schemes for fall',
          'Painting for home staging'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Interior painting projects for winter',
          'Paint color trends for new year',
          'Small space painting solutions',
          'Painting in cold weather tips'
        ]
      }
    ],
    localServicePatterns: [
      'painting contractor {city}',
      'house painter {city}',
      'interior painter {city}',
      'exterior painter {city}',
      'commercial painting {city}',
      'painting company {city}',
      'professional painter {city}',
      'affordable painter {city}'
    ],
    commonPainPoints: [
      'color selection',
      'surface preparation',
      'finding reliable painters',
      'time constraints',
      'budget considerations'
    ],
    targetAudiences: [
      'homeowners',
      'business owners',
      'property managers',
      'real estate agents'
    ],
    sampleTopics: [
      'How to choose the perfect paint color',
      'Interior painting mistakes to avoid',
      'Exterior painting preparation checklist',
      'Cost-saving tips for home painting projects'
    ]
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    category: 'Home Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring pest prevention guide',
          'Common spring pests and control',
          'Garden pest management',
          'Home pest inspection checklist'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer mosquito control tips',
          'Ant prevention and treatment',
          'Summer pest proofing your home',
          'Organic pest control solutions'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall pest prevention tips',
          'Rodent control before winter',
          'Fall spider management',
          'Pest-proofing for winter'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Winter indoor pest control',
          'Rodent prevention in cold weather',
          'Bed bug inspection and treatment',
          'Winter pest proofing strategies'
        ]
      }
    ],
    localServicePatterns: [
      'pest control {city}',
      'exterminator {city}',
      'pest control near me',
      'termite treatment {city}',
      'bed bug exterminator {city}',
      'rodent control {city}',
      'pest control service {city}',
      'emergency exterminator {city}'
    ],
    commonPainPoints: [
      'pest identification',
      'health concerns',
      'property damage',
      'prevention methods',
      'finding effective treatments'
    ],
    targetAudiences: [
      'homeowners',
      'business owners',
      'property managers',
      'restaurants',
      'healthcare facilities'
    ],
    sampleTopics: [
      'Natural pest control methods for homes',
      'Signs you need professional pest control',
      'Seasonal pest prevention checklist',
      'Pet-safe pest control solutions'
    ]
  },
  {
    id: 'home-repair',
    name: 'Home Repair & Handyman',
    category: 'Home Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring home maintenance checklist',
          'Post-winter repair projects',
          'Exterior home repairs',
          'Deck and patio maintenance'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer home repair projects',
          'Outdoor structure maintenance',
          'Home improvement for summer living',
          'Quick fixes for summer entertaining'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall home preparation checklist',
          'Winter readiness repairs',
          'Home maintenance before cold weather',
          'Energy efficiency improvements'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Winter home repair emergencies',
          'Indoor project ideas for winter',
          'Cold weather home maintenance',
          'Preparing home for winter storms'
        ]
      }
    ],
    localServicePatterns: [
      'handyman {city}',
      'home repair {city}',
      'handyman services near me',
      'home maintenance {city}',
      'general contractor {city}',
      'home improvement {city}',
      'local handyman {city}',
      'handyman for hire {city}'
    ],
    commonPainPoints: [
      'multiple small repairs',
      'lack of time/skills',
      'finding reliable help',
      'maintenance planning',
      'emergency repairs'
    ],
    targetAudiences: [
      'homeowners',
      'senior citizens',
      'busy professionals',
      'property managers',
      'rental property owners'
    ],
    sampleTopics: [
      'Essential home maintenance schedule',
      'DIY vs professional: When to call a handyman',
      'Home repair projects that increase value',
      'Emergency home repair preparation guide'
    ]
  },
  {
    id: 'auto-repair',
    name: 'Auto Repair',
    category: 'Automotive Services',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring car maintenance checklist',
          'Post-winter vehicle inspection',
          'Tire changing and alignment',
          'Air conditioning system check'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer car care tips',
          'Overheating prevention and repair',
          'Road trip preparation checklist',
          'Air conditioning repair guide'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall vehicle maintenance guide',
          'Winter preparation for your car',
          'Tire rotation and replacement',
          'Heating system inspection'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Winter car safety checklist',
          'Cold weather car maintenance',
          'Emergency winter car kit',
          'Battery and electrical system care'
        ]
      }
    ],
    localServicePatterns: [
      'auto repair {city}',
      'car mechanic {city}',
      'auto shop {city}',
      'mechanic near me',
      'brake repair {city}',
      'oil change {city}',
      'transmission repair {city}',
      'auto service {city}'
    ],
    commonPainPoints: [
      'unexpected breakdowns',
      'finding trustworthy mechanics',
      'repair costs',
      'maintenance scheduling',
      'diagnosing problems'
    ],
    targetAudiences: [
      'car owners',
      'fleet managers',
      'small business owners',
      'commuters'
    ],
    sampleTopics: [
      'Car maintenance schedule for optimal performance',
      'How to choose a reliable auto repair shop',
      'Signs your car needs immediate attention',
      'DIY car maintenance vs professional service'
    ]
  },
  {
    id: 'other',
    name: 'Other Service Business',
    category: 'General',
    seasonalSuggestions: [
      {
        season: 'spring',
        months: [3, 4, 5],
        topics: [
          'Spring business preparation guide',
          'Seasonal service offerings',
          'Customer engagement strategies',
          'Business growth opportunities'
        ]
      },
      {
        season: 'summer',
        months: [6, 7, 8],
        topics: [
          'Summer business optimization',
          'Seasonal marketing strategies',
          'Customer retention tips',
          'Service expansion ideas'
        ]
      },
      {
        season: 'fall',
        months: [9, 10, 11],
        topics: [
          'Fall business planning',
          'Year-end preparation',
          'Customer appreciation strategies',
          'Service improvement ideas'
        ]
      },
      {
        season: 'winter',
        months: [12, 1, 2],
        topics: [
          'Winter business strategies',
          'Customer engagement during holidays',
          'Business planning for new year',
          'Service optimization tips'
        ]
      }
    ],
    localServicePatterns: [
      '{service} {city}',
      'best {service} near me',
      '{service} company {city}',
      'professional {service} {city}',
      'affordable {service} {city}',
      '{service} provider {city}',
      'local {service} {city}',
      '{service} experts {city}'
    ],
    commonPainPoints: [
      'customer acquisition',
      'service quality',
      'business growth',
      'competition',
      'operational efficiency'
    ],
    targetAudiences: [
      'local customers',
      'business clients',
      'residential clients',
      'commercial clients'
    ],
    sampleTopics: [
      'How to grow your service business',
      'Customer service excellence tips',
      'Marketing strategies for local businesses',
      'Building trust with your clients'
    ]
  }
];

/**
 * Get current season based on month
 */
export function getCurrentSeason(): SeasonalSuggestion['season'] {
  const month = new Date().getMonth() + 1; // 1-12

  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

/**
 * Get seasonal suggestions for a specific industry
 */
export function getSeasonalSuggestions(industryId: string): string[] {
  const template = INDUSTRY_TEMPLATES.find(t => t.id === industryId);
  if (!template) return [];

  const currentSeason = getCurrentSeason();
  const seasonalData = template.seasonalSuggestions.find(s => s.season === currentSeason);

  return seasonalData?.topics || [];
}

/**
 * Get industry template by ID
 */
export function getIndustryTemplate(industryId: string): IndustryTemplate | null {
  return INDUSTRY_TEMPLATES.find(t => t.id === industryId) || null;
}

/**
 * Get local service patterns for an industry
 */
export function getLocalServicePatterns(industryId: string): string[] {
  const template = getIndustryTemplate(industryId);
  return template?.localServicePatterns || [];
}

/**
 * Generate industry-specific AI prompt enhancement
 */
export function generateIndustryPrompt(industryId: string, baseTopic: string, location?: string): string {
  const template = getIndustryTemplate(industryId);
  if (!template) return '';

  const seasonalTopics = getSeasonalSuggestions(industryId);
  const painPoints = template.commonPainPoints.join(', ');
  const audiences = template.targetAudiences.join(', ');

  let enhancement = `
Industry Context: ${template.name}
Target Audiences: ${audiences}
Common Pain Points: ${painPoints}
Seasonal Focus: ${seasonalTopics.slice(0, 3).join(', ')}`;

  if (location) {
    const patterns = getLocalServicePatterns(industryId).slice(0, 3);
    enhancement += `
Local Focus: ${location}
Local Service Patterns: ${patterns.join(', ')}`;
  }

  return enhancement;
}