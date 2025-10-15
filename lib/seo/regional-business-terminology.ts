/**
 * Regional Business Terminology and Industry-Specific Language
 * Provides business-specific terms, professional expressions, and industry jargon for different regions
 */

export interface RegionalBusinessTerms {
  region: string;
  industryTerms: Record<string, IndustryTerminology>;
  businessPhrases: BusinessPhrase[];
  professionalTitles: ProfessionalTitle[];
  businessMetrics: BusinessMetric[];
  seasonalBusinessTerms: SeasonalBusinessTerm[];
}

export interface IndustryTerminology {
  commonTerms: string[];
  technicalTerms: string[];
  clientFacingTerms: string[];
  internalJargon: string[];
  regionalVariations: RegionalVariation[];
}

export interface RegionalVariation {
  term: string;
  localEquivalent: string;
  usageContext: string;
  example: string;
}

export interface BusinessPhrase {
  phrase: string;
  englishEquivalent: string;
  formalityLevel: 'formal' | 'professional' | 'casual';
  usageContext: string;
  example: string;
  industry?: string[];
}

export interface ProfessionalTitle {
  title: string;
  englishEquivalent: string;
  formalityLevel: 'formal' | 'professional' | 'casual';
  usageContext: string;
  industry?: string;
}

export interface BusinessMetric {
  metric: string;
  englishEquivalent: string;
  usageContext: string;
  calculation?: string;
  industry?: string;
}

export interface SeasonalBusinessTerm {
  term: string;
  season: string;
  businessContext: string;
  usageExample: string;
  regionalSpecificity: string;
}

// Regional Business Terminology Database
export const REGIONAL_BUSINESS_TERMINALOGY: Record<string, RegionalBusinessTerms> = {
  'en-US': {
    region: 'United States',
    industryTerms: {
      'real-estate': {
        commonTerms: ['closing costs', 'escrow', 'appraisal', 'MLS', 'REO', 'short sale', 'HOA'],
        technicalTerms: ['comparative market analysis', 'price per square foot', 'capitalization rate', 'NOI'],
        clientFacingTerms: ['dream home', 'starter home', 'fixer-upper', 'move-in ready'],
        internalJargon: ['CMA', 'BPO', 'REO', 'MLS', 'HOA'],
        regionalVariations: [
          { term: 'real estate agent', localEquivalent: 'realtor', usageContext: 'professional title', example: 'I work with a licensed realtor' },
          { term: 'apartment', localEquivalent: 'condo', usageContext: 'property type', example: 'Looking for a condo downtown' }
        ]
      },
      'construction': {
        commonTerms: ['general contractor', 'subcontractor', 'permit', 'inspection', 'zoning', 'building code'],
        technicalTerms: ['load-bearing wall', 'footings', 'HVAC', 'electrical panel', 'plumbing rough-in'],
        clientFacingTerms: ['renovation', 'remodel', 'addition', 'gut job', 'flip'],
        internalJargon: ['GC', 'sub', 'permit pull', 'final inspection', 'punch list'],
        regionalVariations: [
          { term: 'renovation', localEquivalent: 'remodel', usageContext: 'project type', example: 'Planning a kitchen remodel' },
          { term: 'bathroom', localEquivalent: 'restroom', usageContext: 'room type', example: 'Need to update the restroom' }
        ]
      },
      'technology': {
        commonTerms: ['startup', 'MVP', 'pivot', 'scalable', 'agile', 'sprint', 'backlog'],
        technicalTerms: ['API', 'cloud computing', 'SaaS', 'DevOps', 'CI/CD', 'microservices'],
        clientFacingTerms: ['user experience', 'customer journey', 'digital transformation', 'innovation'],
        internalJargon: ['tech debt', 'scope creep', 'standup', 'retro', 'sprint planning'],
        regionalVariations: [
          { term: 'cell phone', localEquivalent: 'mobile', usageContext: 'device', example: 'Optimizing for mobile users' },
          { term: 'software', localEquivalent: 'app', usageContext: 'product', example: 'Download our mobile app' }
        ]
      }
    },
    businessPhrases: [
      { phrase: 'lets circle back', englishEquivalent: 'lets discuss this again later', formalityLevel: 'professional', usageContext: 'meeting follow-up', example: 'Lets circle back on this topic next week' },
      { phrase: 'low-hanging fruit', englishEquivalent: 'easy opportunities', formalityLevel: 'casual', usageContext: 'strategy', example: 'Lets focus on the low-hanging fruit first' },
      { phrase: 'touch base', englishEquivalent: 'make contact', formalityLevel: 'professional', usageContext: 'communication', example: 'Ill touch base with you tomorrow' },
      { phrase: 'deep dive', englishEquivalent: 'detailed analysis', formalityLevel: 'professional', usageContext: 'research', example: 'Lets do a deep dive into the market data' }
    ],
    professionalTitles: [
      { title: 'CEO', englishEquivalent: 'Chief Executive Officer', formalityLevel: 'formal', usageContext: 'corporate' },
      { title: 'VP', englishEquivalent: 'Vice President', formalityLevel: 'formal', usageContext: 'corporate' },
      { title: 'Sr. Manager', englishEquivalent: 'Senior Manager', formalityLevel: 'professional', usageContext: 'corporate' }
    ],
    businessMetrics: [
      { metric: 'ROI', englishEquivalent: 'Return on Investment', usageContext: 'performance measurement', calculation: '(Gain - Cost) / Cost' },
      { metric: 'KPI', englishEquivalent: 'Key Performance Indicator', usageContext: 'performance tracking' },
      { metric: 'EBITDA', englishEquivalent: 'Earnings Before Interest, Taxes, Depreciation, and Amortization', usageContext: 'financial analysis' }
    ],
    seasonalBusinessTerms: [
      { term: 'Q4 rush', season: 'winter', businessContext: 'holiday shopping period', usageExample: 'Expecting a Q4 rush in December', regionalSpecificity: 'national' },
      { term: 'summer slowdown', season: 'summer', businessContext: 'reduced business activity', usageExample: 'We typically see a summer slowdown in July', regionalSpecificity: 'national' },
      { term: 'back to school', season: 'fall', businessContext: 'retail shopping period', usageExample: 'Running back-to-school promotions', regionalSpecificity: 'national' }
    ]
  },

  'en-GB': {
    region: 'United Kingdom',
    industryTerms: {
      'real-estate': {
        commonTerms: ['completion', 'exchange', 'leasehold', 'freehold', 'conveyancing', 'stamp duty'],
        technicalTerms: ['RICS valuation', 'EPC rating', 'searches', 'chain', 'gazumping'],
        clientFacingTerms: ['dream home', 'first-time buyer', 'property ladder', 'buy-to-let'],
        internalJargon: ['EPC', 'RICS', 'SDLT', 'FTB', 'BTL'],
        regionalVariations: [
          { term: 'real estate agent', localEquivalent: 'estate agent', usageContext: 'professional title', example: 'I work with a qualified estate agent' },
          { term: 'apartment', localEquivalent: 'flat', usageContext: 'property type', example: 'Looking for a flat in London' },
          { term: 'rent', localEquivalent: 'let', usageContext: 'rental agreement', example: 'Planning to let the property' }
        ]
      },
      'construction': {
        commonTerms: ['builder', 'tradesperson', 'building regulations', 'planning permission', 'structural engineer'],
        technicalTerms: ['load-bearing wall', 'foundations', 'Part P', 'Building Control', 'NHBC'],
        clientFacingTerms: ['extension', 'conversion', 'refurbishment', 'renovation'],
        internalJargon: ['BR', 'PP', 'SE', 'BC', 'NHBC'],
        regionalVariations: [
          { term: 'construction', localEquivalent: 'building work', usageContext: 'project type', example: 'Starting building work next month' },
          { term: 'renovation', localEquivalent: 'refurbishment', usageContext: 'project type', example: 'Complete house refurbishment planned' },
          { term: 'bathroom', localEquivalent: 'loo', usageContext: 'room type', example: 'Need to update the downstairs loo' }
        ]
      },
      'technology': {
        commonTerms: ['tech startup', 'MVP', 'scale-up', 'agile', 'scrum', 'sprint planning'],
        technicalTerms: ['API', 'cloud services', 'SaaS', 'DevOps', 'CI/CD pipeline', 'microservices architecture'],
        clientFacingTerms: ['user experience', 'customer journey', 'digital transformation', 'innovation hub'],
        internalJargon: ['tech debt', 'scope creep', 'daily standup', 'sprint retrospective', 'backlog grooming'],
        regionalVariations: [
          { term: 'cell phone', localEquivalent: 'mobile', usageContext: 'device', example: 'Optimizing for mobile devices' },
          { term: 'elevator pitch', localEquivalent: 'lift pitch', usageContext: 'business presentation', example: 'Prepare your lift pitch for investors' }
        ]
      }
    },
    businessPhrases: [
      { phrase: 'lets touch base', englishEquivalent: 'lets make contact', formalityLevel: 'professional', usageContext: 'communication', example: 'Shall we touch base next week?' },
      { phrase: 'at the end of the day', englishEquivalent: 'ultimately', formalityLevel: 'professional', usageContext: 'conclusion', example: 'At the end of the day, quality matters most' },
      { phrase: 'its not rocket science', englishEquivalent: 'its not complicated', formalityLevel: 'casual', usageContext: 'simplicity', example: 'The solution is straightforward, its not rocket science' },
      { phrase: 'blue-sky thinking', englishEquivalent: 'creative brainstorming', formalityLevel: 'professional', usageContext: 'innovation', example: 'We need some blue-sky thinking for this project' }
    ],
    professionalTitles: [
      { title: 'Managing Director', englishEquivalent: 'CEO', formalityLevel: 'formal', usageContext: 'corporate' },
      { title: 'Partner', englishEquivalent: 'Senior Partner/Principal', formalityLevel: 'formal', usageContext: 'professional services' },
      { title: 'Consultant', englishEquivalent: 'Senior Consultant', formalityLevel: 'professional', usageContext: 'consulting' }
    ],
    businessMetrics: [
      { metric: 'ROI', englishEquivalent: 'Return on Investment', usageContext: 'performance measurement', calculation: '(Return - Investment) / Investment' },
      { metric: 'EBITDA', englishEquivalent: 'Earnings Before Interest, Taxes, Depreciation, and Amortization', usageContext: 'financial analysis' },
      { metric: 'P&L', englishEquivalent: 'Profit and Loss', usageContext: 'financial reporting' }
    ],
    seasonalBusinessTerms: [
      { term: 'Christmas rush', season: 'winter', businessContext: 'holiday shopping period', usageExample: 'Expecting the Christmas rush in December', regionalSpecificity: 'national' },
      { term: 'summer holidays', season: 'summer', businessContext: 'vacation period', usageExample: 'Reduced staff during summer holidays', regionalSpecificity: 'national' },
      { term: 'back to school', season: 'autumn', businessContext: 'retail shopping period', usageExample: 'Back to school promotions starting in August', regionalSpecificity: 'national' }
    ]
  },

  'en-AU': {
    region: 'Australia',
    industryTerms: {
      'real-estate': {
        commonTerms: ['settlement', 'exchange', 'strata title', 'body corporate', 'stamp duty', 'auction'],
        technicalTerms: ['valuation', 'council rates', 'building inspection', 'pest inspection', 'capital gains tax'],
        clientFacingTerms: ['dream home', 'first home buyer', 'investment property', 'reno', 'fixer-upper'],
        internalJargon: ['FHB', 'CGT', 'ST', 'BC', 'reno'],
        regionalVariations: [
          { term: 'real estate agent', localEquivalent: 'real estate agent', usageContext: 'professional title', example: 'Working with a licensed real estate agent' },
          { term: 'apartment', localEquivalent: 'unit', usageContext: 'property type', example: 'Looking for a unit in the city' },
          { term: 'rent', localEquivalent: 'lease', usageContext: 'rental agreement', example: 'Planning to lease the property' },
          { term: 'renovation', localEquivalent: 'reno', usageContext: 'project type', example: 'Planning a home reno' }
        ]
      },
      'construction': {
        commonTerms: ['builder', 'tradie', 'council approval', 'building permit', 'certifier', 'timber frame'],
        technicalTerms: ['load-bearing wall', 'footings', 'Termimesh', 'Building Code of Australia', 'NCC'],
        clientFacingTerms: ['extension', 'renovation', 'knock-down rebuild', 'granny flat', 'deck'],
        internalJargon: ['tradie', 'DA', 'CDC', 'BCA', 'NCC'],
        regionalVariations: [
          { term: 'contractor', localEquivalent: 'tradie', usageContext: 'skilled worker', example: 'Hiring a qualified tradie' },
          { term: 'renovation', localEquivalent: 'reno', usageContext: 'project type', example: 'Starting a major reno next month' },
          { term: 'bathroom', localEquivalent: 'dunny', usageContext: 'room type', example: 'Need to renovate the dunny' }
        ]
      },
      'technology': {
        commonTerms: ['tech startup', 'MVP', 'scale-up', 'agile', 'scrum', 'sprint'],
        technicalTerms: ['API', 'cloud services', 'SaaS', 'DevOps', 'CI/CD', 'microservices'],
        clientFacingTerms: ['user experience', 'customer journey', 'digital transformation', 'innovation'],
        internalJargon: ['tech debt', 'scope creep', 'standup', 'retro', 'sprint planning'],
        regionalVariations: [
          { term: 'cell phone', localEquivalent: 'mobile', usageContext: 'device', example: 'Optimizing for mobile users' },
          { term: 'office', localEquivalent: 'work', usageContext: 'workplace', example: 'Heading to the work site' }
        ]
      }
    },
    businessPhrases: [
      { phrase: 'no worries', englishEquivalent: 'no problem', formalityLevel: 'casual', usageContext: 'reassurance', example: 'No worries, well take care of it' },
      { phrase: 'fair dinkum', englishEquivalent: 'genuine/true', formalityLevel: 'casual', usageContext: 'authenticity', example: 'This is fair dinkum quality work' },
      { phrase: 'give it a go', englishEquivalent: 'try it', formalityLevel: 'casual', usageContext: 'encouragement', example: 'Lets give it a go and see what happens' },
      { phrase: 'have a crack', englishEquivalent: 'make an attempt', formalityLevel: 'casual', usageContext: 'effort', example: 'Well have a crack at solving this' }
    ],
    professionalTitles: [
      { title: 'Managing Director', englishEquivalent: 'CEO', formalityLevel: 'formal', usageContext: 'corporate' },
      { title: 'Tradie', englishEquivalent: 'Skilled Tradesperson', formalityLevel: 'casual', usageContext: 'construction' },
      { title: 'Lead Developer', englishEquivalent: 'Senior Developer', formalityLevel: 'professional', usageContext: 'technology' }
    ],
    businessMetrics: [
      { metric: 'ROI', englishEquivalent: 'Return on Investment', usageContext: 'performance measurement', calculation: '(Return - Investment) / Investment' },
      { metric: 'GP', englishEquivalent: 'Gross Profit', usageContext: 'financial analysis' },
      { metric: 'NP', englishEquivalent: 'Net Profit', usageContext: 'financial analysis' }
    ],
    seasonalBusinessTerms: [
      { term: 'Christmas break', season: 'summer', businessContext: 'holiday period', usageExample: 'Most businesses close for Christmas break', regionalSpecificity: 'national' },
      { term: 'footy season', season: 'winter/spring', businessContext: 'sports period', usageExample: 'Business slows down during footy season finals', regionalSpecificity: 'national' },
      { term: 'tourist season', season: 'summer', businessContext: 'peak tourism period', usageExample: 'High demand during tourist season', regionalSpecificity: 'coastal' }
    ]
  },

  'en-CA': {
    region: 'Canada',
    industryTerms: {
      'real-estate': {
        commonTerms: ['closing', 'offer', 'MLS', 'realtor', 'condo fees', 'property tax', 'mortgage'],
        technicalTerms: ['appraisal', 'home inspection', 'title insurance', 'land transfer tax', 'CMHC'],
        clientFacingTerms: ['dream home', 'starter home', 'fixer-upper', 'move-in ready', 'semi-detached'],
        internalJargon: ['MLS', 'CMHC', 'LTT', 'HOA', 'strata'],
        regionalVariations: [
          { term: 'real estate agent', localEquivalent: 'realtor', usageContext: 'professional title', example: 'Working with a licensed realtor' },
          { term: 'apartment', localEquivalent: 'condo', usageContext: 'property type', example: 'Looking for a condo downtown' },
          { term: 'utilities', localEquivalent: 'hydro', usageContext: 'electricity', example: 'Monthly hydro bills included' }
        ]
      },
      'construction': {
        commonTerms: ['general contractor', 'subcontractor', 'permit', 'inspection', 'building code', 'foundation'],
        technicalTerms: ['load-bearing wall', 'HVAC', 'electrical panel', 'plumbing rough-in', 'insulation'],
        clientFacingTerms: ['renovation', 'remodel', 'addition', 'gut job', 'flip'],
        internalJargon: ['GC', 'sub', 'permit pull', 'final inspection', 'punch list'],
        regionalVariations: [
          { term: 'construction', localEquivalent: 'building', usageContext: 'project type', example: 'Starting new building construction' },
          { term: 'winter preparation', localEquivalent: 'winterizing', usageContext: 'seasonal work', example: 'Winterizing the cottage property' }
        ]
      },
      'technology': {
        commonTerms: ['startup', 'MVP', 'scale-up', 'agile', 'scrum', 'sprint'],
        technicalTerms: ['API', 'cloud computing', 'SaaS', 'DevOps', 'CI/CD', 'microservices'],
        clientFacingTerms: ['user experience', 'customer journey', 'digital transformation', 'innovation'],
        internalJargon: ['tech debt', 'scope creep', 'standup', 'retro', 'sprint planning'],
        regionalVariations: [
          { term: 'cell phone', localEquivalent: 'mobile', usageContext: 'device', example: 'Optimizing for mobile users' },
          { term: 'office', localEquivalent: 'workplace', usageContext: 'work location', example: 'Return to workplace policies' }
        ]
      }
    },
    businessPhrases: [
      { phrase: 'sorry about that', englishEquivalent: 'apology for inconvenience', formalityLevel: 'professional', usageContext: 'service recovery', example: 'Sorry about that, well fix it right away' },
      { phrase: 'no worries', englishEquivalent: 'no problem', formalityLevel: 'casual', usageContext: 'reassurance', example: 'No worries, we can handle that' },
      { phrase: 'give it a shot', englishEquivalent: 'try it', formalityLevel: 'casual', usageContext: 'encouragement', example: 'Lets give it a shot and see what happens' },
      { phrase: 'keep it real', englishEquivalent: 'be authentic', formalityLevel: 'casual', usageContext: 'authenticity', example: 'We keep it real with our customers' }
    ],
    professionalTitles: [
      { title: 'President', englishEquivalent: 'CEO', formalityLevel: 'formal', usageContext: 'corporate' },
      { title: 'Partner', englishEquivalent: 'Senior Partner', formalityLevel: 'formal', usageContext: 'professional services' },
      { title: 'Team Lead', englishEquivalent: 'Team Leader', formalityLevel: 'professional', usageContext: 'technology' }
    ],
    businessMetrics: [
      { metric: 'ROI', englishEquivalent: 'Return on Investment', usageContext: 'performance measurement', calculation: '(Return - Investment) / Investment' },
      { metric: 'EBITDA', englishEquivalent: 'Earnings Before Interest, Taxes, Depreciation, and Amortization', usageContext: 'financial analysis' },
      { metric: 'GP', englishEquivalent: 'Gross Profit', usageContext: 'financial analysis' }
    ],
    seasonalBusinessTerms: [
      { term: 'winter slowdown', season: 'winter', businessContext: 'reduced activity', usageExample: 'Expecting winter slowdown in January', regionalSpecificity: 'national' },
      { term: 'summer construction', season: 'summer', businessContext: 'peak building season', usageExample: 'Summer construction season is busy', regionalSpecificity: 'national' },
      { term: 'hockey season', season: 'winter', businessContext: 'sports period', usageExample: 'Business promotions during hockey season', regionalSpecificity: 'national' }
    ]
  },

  'en-NG': {
    region: 'Nigeria',
    industryTerms: {
      'real-estate': {
        commonTerms: ['agent', 'landlord', 'tenant', 'rent', 'lease', 'agreement', 'survey'],
        technicalTerms: ['C of O', 'Governors consent', 'survey plan', 'valuation', 'title search'],
        clientFacingTerms: ['dream home', 'face-me-I-face-you', 'self-contain', 'duplex', 'mansion'],
        internalJargon: ['C of O', 'FMI', 'Omo-onile', 'agent fee', 'commission'],
        regionalVariations: [
          { term: 'apartment building', localEquivalent: 'face-me-I-face-you', usageContext: 'housing type', example: 'Looking for a face-me-I-face-you apartment' },
          { term: 'one bedroom', localEquivalent: 'self-contain', usageContext: 'apartment type', example: 'Need a self-contain apartment' },
          { term: 'land owner', localEquivalent: 'Omo-onile', usageContext: 'property ownership', example: 'Negotiating with Omo-onile' }
        ]
      },
      'construction': {
        commonTerms: ['builder', 'architect', 'engineer', 'foreman', 'laborer', 'cement', 'blocks'],
        technicalTerms: ['foundation', 'lintel', 'roofing', 'plastering', 'tilling', 'wiring'],
        clientFacingTerms: ['building', 'renovation', 'fencing', 'gating', 'painting'],
        internalJargon: ['site', 'casting', 'setting', 'dpc', 'ring beam'],
        regionalVariations: [
          { term: 'construction blocks', localEquivalent: 'sandcrete blocks', usageContext: 'building material', example: 'Ordering sandcrete blocks for foundation' },
          { term: 'concrete', localEquivalent: 'casting', usageContext: 'construction process', example: 'Casting the foundation tomorrow' }
        ]
      },
      'technology': {
        commonTerms: ['tech startup', 'app', 'website', 'developer', 'programmer', 'IT'],
        technicalTerms: ['coding', 'programming', 'database', 'server', 'cloud', 'API'],
        clientFacingTerms: ['digital', 'online', 'website', 'app', 'software'],
        internalJargon: ['coding', 'debugging', 'deployment', 'backend', 'frontend'],
        regionalVariations: [
          { term: 'internet connection', localEquivalent: 'data subscription', usageContext: 'connectivity', example: 'Need to renew data subscription' },
          { term: 'phone credit', localEquivalent: 'airtime', usageContext: 'mobile service', example: 'Buy airtime for making calls' }
        ]
      }
    },
    businessPhrases: [
      { phrase: 'no wahala', englishEquivalent: 'no problem', formalityLevel: 'casual', usageContext: 'reassurance', example: 'No wahala, well handle it' },
      { phrase: 'abeg', englishEquivalent: 'please', formalityLevel: 'casual', usageContext: 'request', example: 'Abeg, can you help me with this?' },
      { phrase: 'na wa', englishEquivalent: 'wow/unbelievable', formalityLevel: 'casual', usageContext: 'surprise', example: 'Na wa! This project is amazing' },
      { phrase: 'how far?', englishEquivalent: 'how are you?', formalityLevel: 'casual', usageContext: 'greeting', example: 'How far? Hope youre doing well' }
    ],
    professionalTitles: [
      { title: 'MD', englishEquivalent: 'Managing Director', formalityLevel: 'formal', usageContext: 'corporate' },
      { title: 'Oga', englishEquivalent: 'Boss/Sir', formalityLevel: 'casual', usageContext: 'respectful address' },
      { title: 'Senior Developer', englishEquivalent: 'Lead Developer', formalityLevel: 'professional', usageContext: 'technology' }
    ],
    businessMetrics: [
      { metric: 'profit', englishEquivalent: 'profit margin', usageContext: 'financial analysis' },
      { metric: 'turnover', englishEquivalent: 'revenue', usageContext: 'financial analysis' },
      { metric: 'ROI', englishEquivalent: 'Return on Investment', usageContext: 'performance measurement' }
    ],
    seasonalBusinessTerms: [
      { term: 'festive season', season: 'december', businessContext: 'holiday period', usageExample: 'High sales during festive season', regionalSpecificity: 'national' },
      { term: 'harmattan', season: 'dry season', businessContext: 'weather period', usageExample: 'Business picks up during harmattan', regionalSpecificity: 'national' },
      { term: 'rainy season', season: 'wet season', businessContext: 'weather period', usageExample: 'Construction slows during rainy season', regionalSpecificity: 'national' }
    ]
  },

  'en-IN': {
    region: 'India',
    industryTerms: {
      'real-estate': {
        commonTerms: ['broker', 'owner', 'tenant', 'rent', 'lease', 'agreement', 'society'],
        technicalTerms: ['registration', 'stamp duty', 'NOE', 'possession', 'completion certificate'],
        clientFacingTerms: ['dream home', '1BHK', '2BHK', 'bunglow', 'apartment', 'villa'],
        internalJargon: ['OC', 'CC', 'NA', 'society maintenance', 'super area'],
        regionalVariations: [
          { term: 'one bedroom apartment', localEquivalent: '1BHK', usageContext: 'apartment type', example: 'Looking for a 1BHK in Mumbai' },
          { term: 'real estate agent', localEquivalent: 'broker', usageContext: 'professional title', example: 'Working with a local broker' },
          { term: 'apartment complex', localEquivalent: 'society', usageContext: 'housing complex', example: 'Moving to a new society' }
        ]
      },
      'construction': {
        commonTerms: ['contractor', 'engineer', 'architect', 'mason', 'labor', 'cement', 'bricks'],
        technicalTerms: ['foundation', 'lintel', 'slab', 'plaster', 'painting', 'electrical'],
        clientFacingTerms: ['construction', 'renovation', 'interior', 'finishing'],
        internalJargon: ['centering', 'shuttering', 'casting', 'curing', 'finishing'],
        regionalVariations: [
          { term: 'construction worker', localEquivalent: 'mason', usageContext: 'skilled worker', example: 'Hiring experienced masons' },
          { term: 'supervisor', localEquivalent: 'mistri', usageContext: 'site supervisor', example: 'Mistri will oversee the work' }
        ]
      },
      'technology': {
        commonTerms: ['startup', 'app', 'website', 'developer', 'programmer', 'IT services'],
        technicalTerms: ['coding', 'programming', 'database', 'server', 'cloud', 'API'],
        clientFacingTerms: ['software', 'application', 'website', 'digital', 'online'],
        internalJargon: ['coding', 'testing', 'deployment', 'backend', 'frontend'],
        regionalVariations: [
          { term: 'internet', localEquivalent: 'data pack', usageContext: 'connectivity', example: 'Need to recharge data pack' },
          { term: 'mobile phone', localEquivalent: 'mobile', usageContext: 'device', example: 'Optimizing for mobile users' }
        ]
      }
    },
    businessPhrases: [
      { phrase: 'jugaad', englishEquivalent: 'innovative fix', formalityLevel: 'casual', usageContext: 'problem-solving', example: 'Well find a jugaad for this problem' },
      { phrase: 'timepass', englishEquivalent: 'leisure activity', formalityLevel: 'casual', usageContext: 'recreation', example: 'What do you do for timepass?' },
      { phrase: 'chillax', englishEquivalent: 'relax', formalityLevel: 'casual', usageContext: 'reassurance', example: 'Chillax, well handle this' },
      { phrase: 'package deal', englishEquivalent: 'combo offer', formalityLevel: 'casual', usageContext: 'business offer', example: 'We offer a package deal for clients' }
    ],
    professionalTitles: [
      { title: 'Sir', englishEquivalent: 'Mister', formalityLevel: 'formal', usageContext: 'respectful address' },
      { title: 'Manager', englishEquivalent: 'Team Lead', formalityLevel: 'professional', usageContext: 'corporate' },
      { title: 'Senior Developer', englishEquivalent: 'Tech Lead', formalityLevel: 'professional', usageContext: 'technology' }
    ],
    businessMetrics: [
      { metric: 'profit', englishEquivalent: 'profit margin', usageContext: 'financial analysis' },
      { metric: 'turnover', englishEquivalent: 'revenue', usageContext: 'financial analysis' },
      { metric: 'ROI', englishEquivalent: 'Return on Investment', usageContext: 'performance measurement' }
    ],
    seasonalBusinessTerms: [
      { term: 'festive season', season: 'october-november', businessContext: 'holiday period', usageExample: 'Peak sales during festive season', regionalSpecificity: 'national' },
      { term: 'monsoon', season: 'june-september', businessContext: 'rainy season', usageExample: 'Construction slows during monsoon', regionalSpecificity: 'national' },
      { term: 'wedding season', season: 'november-february', businessContext: 'marriage period', usageExample: 'High demand during wedding season', regionalSpecificity: 'national' }
    ]
  }
};

/**
 * Get regional business terminology for a specific region
 */
export function getRegionalBusinessTerms(region: string): RegionalBusinessTerms {
  return REGIONAL_BUSINESS_TERMINALOGY[region] || REGIONAL_BUSINESS_TERMINALOGY['en-US'];
}

/**
 * Get industry-specific terminology for a region and industry
 */
export function getIndustryTerminology(region: string, industry: string): IndustryTerminology {
  const regionalTerms = getRegionalBusinessTerms(region);
  return regionalTerms.industryTerms[industry] || {
    commonTerms: [],
    technicalTerms: [],
    clientFacingTerms: [],
    internalJargon: [],
    regionalVariations: []
  };
}

/**
 * Get business phrases appropriate for a specific formality level
 */
export function getBusinessPhrases(region: string, formalityLevel: 'formal' | 'professional' | 'casual'): BusinessPhrase[] {
  const regionalTerms = getRegionalBusinessTerms(region);
  return regionalTerms.businessPhrases.filter(phrase => phrase.formalityLevel === formalityLevel);
}

/**
 * Get seasonal business terms for a specific season and region
 */
export function getSeasonalBusinessTerms(region: string, season: string): SeasonalBusinessTerm[] {
  const regionalTerms = getRegionalBusinessTerms(region);
  return regionalTerms.seasonalBusinessTerms.filter(term => term.season.toLowerCase().includes(season.toLowerCase()));
}

/**
 * Search for regional variations of business terms
 */
export function findRegionalVariations(region: string, term: string): RegionalVariation[] {
  const regionalTerms = getRegionalBusinessTerms(region);
  const variations: RegionalVariation[] = [];

  Object.values(regionalTerms.industryTerms).forEach(industry => {
    industry.regionalVariations.forEach(variation => {
      if (variation.term.toLowerCase().includes(term.toLowerCase()) ||
          variation.localEquivalent.toLowerCase().includes(term.toLowerCase())) {
        variations.push(variation);
      }
    });
  });

  return variations;
}

/**
 * Get professional titles for a specific region and formality level
 */
export function getProfessionalTitles(region: string, formalityLevel: 'formal' | 'professional' | 'casual'): ProfessionalTitle[] {
  const regionalTerms = getRegionalBusinessTerms(region);
  return regionalTerms.professionalTitles.filter(title => title.formalityLevel === formalityLevel);
}