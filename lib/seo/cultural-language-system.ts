/**
 * Language detection and cultural adaptation system
 * Provides multi-language support with cultural context, slang, and regional expressions
 */

export interface LanguageConfig {
  code: string; // ISO 639-1 language code (en, hi, es, fr, etc.)
  name: string; // English name of the language
  nativeName: string; // Native name of the language
  isDefault: boolean;
  culturalContext: CulturalContext;
}

export interface CulturalContext {
  slangExpressions: SlangExpression[];
  regionalisms: Regionalism[];
  formalExpressions: FormalExpression[];
  culturalNuances: CulturalNuance[];
  businessEtiquette: BusinessEtiquette;
  seasonalReferences: SeasonalReference[];
  humorStyle: HumorStyle;
  communicationStyle: CommunicationStyle;
}

export interface SlangExpression {
  slang: string;
  englishEquivalent: string;
  usageContext: string;
  formality: 'casual' | 'very_casual' | 'slang';
  exampleUsage: string;
  region?: string;
}

export interface Regionalism {
  term: string;
  englishEquivalent: string;
  region: string;
  usageContext: string;
  exampleUsage: string;
}

export interface FormalExpression {
  expression: string;
  englishEquivalent: string;
  usageContext: 'business' | 'academic' | 'professional' | 'ceremonial';
  exampleUsage: string;
}

export interface CulturalNuance {
  description: string;
  impact: 'high' | 'medium' | 'low';
  examples: string[];
  avoids?: string[]; // Things to avoid in this culture
}

export interface BusinessEtiquette {
  greetingStyle: string;
  formalityLevel: 'formal' | 'semi-formal' | 'casual';
  directness: 'direct' | 'indirect' | 'contextual';
  relationshipBuilding: string;
  negotiationStyle: string;
}

export interface SeasonalReference {
  season: string;
  localTerms: string[];
  culturalSignificance: string;
  businessImpact: string;
}

export interface HumorStyle {
  acceptability: 'high' | 'medium' | 'low';
  types: string[];
  avoidTopics: string[];
  examples: string[];
}

export interface CommunicationStyle {
  directness: 'direct' | 'indirect' | 'contextual';
  emotionalExpression: 'high' | 'medium' | 'low';
  useOfMetaphors: 'high' | 'medium' | 'low';
  storytellingPreference: 'high' | 'medium' | 'low';
}

export interface CulturalAdaptationRequest {
  location: string;
  languagePreference: 'english' | 'native' | 'cultural_english';
  formalityLevel: 'formal' | 'professional' | 'casual' | 'slang_heavy';
  contentPurpose: 'marketing' | 'educational' | 'conversational' | 'technical';
  targetAudience: string;
  businessType?: string;
}

export interface CulturalPrompt {
  languageInstructions: string;
  culturalInstructions: string;
  slangGuidelines: string;
  formalityGuidelines: string;
  examples: string[];
  avoidances: string[];
}

// Comprehensive language and cultural database
export const LANGUAGE_DATABASE: Record<string, LanguageConfig> = {
  'en-US': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isDefault: true,
    culturalContext: {
      slangExpressions: [
        { slang: "hit me up", englishEquivalent: "contact me", usageContext: "casual invitation", formality: "casual", exampleUsage: "Hit me up when you're ready to discuss your project" },
        { slang: "on point", englishEquivalent: "perfect/excellent", usageContext: "describing quality", formality: "casual", exampleUsage: "Your service delivery is always on point" },
        { slang: "no cap", englishEquivalent: "no lie/for real", usageContext: "emphasis", formality: "slang", exampleUsage: "This is the best deal, no cap" },
        { slang: "ghost me", englishEquivalent: "ignore/disappear", usageContext: "communication", formality: "slang", exampleUsage: "Don't ghost me after the consultation" },
        { slang: "flex", englishEquivalent: "show off", usageContext: "highlighting achievements", formality: "casual", exampleUsage: "Let me flex my portfolio for you" }
      ],
      regionalisms: [
        { term: "y'all", englishEquivalent: "you all", region: "Southern US", usageContext: "group address", exampleUsage: "Y'all are going to love these results" },
        { term: "wicked", englishEquivalent: "very/extremely", region: "New England", usageContext: "intensifier", exampleUsage: "That's a wicked good deal" },
        { term: "hella", englishEquivalent: "very/lot of", region: "California", usageContext: "intensifier", exampleUsage: "We have hella experience in this area" }
      ],
      formalExpressions: [
        { expression: "pursuant to", englishEquivalent: "according to", usageContext: "business", exampleUsage: "Pursuant to our discussion, I'm sending the proposal" },
        { expression: "heretofore", englishEquivalent: "until now", usageContext: "academic", exampleUsage: "Heretofore unaddressed challenges" },
        { expression: "forthwith", englishEquivalent: "immediately", usageContext: "professional", exampleUsage: "We will address this issue forthwith" }
      ],
      culturalNuances: [
        { description: "Direct communication preferred in business", impact: "high", examples: ["Get straight to the point", "Clear agenda items"] },
        { description: "Time consciousness is important", impact: "high", examples: ["Punctuality matters", "Quick response times expected"] },
        { description: "Individual achievement valued", impact: "medium", examples: ["Personal success stories", "Individual recognition"] }
      ],
      businessEtiquette: {
        greetingStyle: "Firm handshake, direct eye contact",
        formalityLevel: "semi-formal",
        directness: "direct",
        relationshipBuilding: "Quick professional rapport",
        negotiationStyle: "Win-win focused, data-driven"
      },
      seasonalReferences: [
        { season: "Q4", localTerms: ["holiday season", "Black Friday", "Cyber Monday"], culturalSignificance: "Major shopping period", businessImpact: "High sales volume" },
        { season: "summer", localTerms: ["vacation season", "summer slowdown"], culturalSignificance: "Recreation time", businessImpact: "May experience slower response times" }
      ],
      humorStyle: {
        acceptability: "medium",
        types: ["sarcastic", "self-deprecating", "observational"],
        avoidTopics: ["politics", "religion", "personal appearance"],
        examples: ["Why did the marketer get fired? He couldn't close the deal!"]
      },
      communicationStyle: {
        directness: "direct",
        emotionalExpression: "medium",
        useOfMetaphors: "medium",
        storytellingPreference: "high"
      }
    }
  },

  'en-NG': {
    code: 'en',
    name: 'Nigerian English',
    nativeName: 'Nigerian English',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "abeg", englishEquivalent: "please", usageContext: "request/petition", formality: "casual", exampleUsage: "Abeg, let's schedule the meeting for next week", region: "General" },
        { slang: "wahala", englishEquivalent: "trouble/problem", usageContext: "describing difficulties", formality: "casual", exampleUsage: "No wahala, we can handle this project", region: "General" },
        { slang: "na wa", englishEquivalent: "wow/unbelievable", usageContext: "expression of surprise", formality: "casual", exampleUsage: "Na wa! Your prices are really competitive", region: "General" },
        { slang: "gbedu", englishEquivalent: "music/vibe", usageContext: "describing atmosphere", formality: "slang", exampleUsage: "Let's bring some gbedu to this campaign", region: "Urban" },
        { slang: "japa", englishEquivalent: "escape/run away", usageContext: "leaving difficult situation", formality: "slang", exampleUsage: "Don't japa when challenges come", region: "Urban" }
      ],
      regionalisms: [
        { term: "how far?", englishEquivalent: "how are you?", region: "General", usageContext: "greeting", exampleUsage: "How far? Hope you're doing well with the project" },
        { term: "no vex", englishEquivalent: "don't be angry", region: "General", usageContext: "appeasement", exampleUsage: "No vex, I'll get back to you ASAP" },
        { term: "shine your eyes", englishEquivalent: "be alert/careful", region: "General", usageContext: "advice", exampleUsage: "Shine your eyes on this deal" }
      ],
      formalExpressions: [
        { expression: "in due course", englishEquivalent: "soon/appropriately", usageContext: "business", exampleUsage: "We shall respond in due course" },
        { expression: "kindly revert", englishEquivalent: "please respond", usageContext: "professional", exampleUsage: "Kindly revert with your feedback" }
      ],
      culturalNuances: [
        { description: "Relationship-building essential before business", impact: "high", examples: ["Take time to know clients", "Personal connections matter"] },
        { description: "Respect for age and hierarchy", impact: "high", examples: ["Use proper titles", "Elder deference"] },
        { description: "Community and family orientation", impact: "medium", examples: ["Family business referrals", "Community trust"] },
        { description: "Religious references common", impact: "medium", examples: ["God willing", "Blessings", "Prayers"] }
      ],
      businessEtiquette: {
        greetingStyle: "Warm, personal inquiries about family",
        formalityLevel: "semi-formal",
        directness: "indirect",
        relationshipBuilding: "Essential first step",
        negotiationStyle: "Relationship-focused, flexible"
      },
      seasonalReferences: [
        { season: "harmattan", localTerms: ["harmattan", "dry season", "dust"], culturalSignificance: "Cool dry season", businessImpact: "High business activity" },
        { season: "rainy season", localTerms: ["rainy season", "wet season"], culturalSignificance: "Heavy rains", businessImpact: "Possible delays" },
        { season: "festive season", localTerms: ["Christmas", "New Year", "Easter", "Sallah"], culturalSignificance: "Major celebrations", businessImpact: "Peak sales period" }
      ],
      humorStyle: {
        acceptability: "high",
        types: ["satirical", "situational", "wordplay"],
        avoidTopics: ["ethnicity", "religion (sensitive)", "poverty"],
        examples: ["Why did the Lagos driver cross the road? To avoid traffic!"]
      },
      communicationStyle: {
        directness: "indirect",
        emotionalExpression: "high",
        useOfMetaphors: "high",
        storytellingPreference: "high"
      }
    }
  },

  'en-IN': {
    code: 'en',
    name: 'Indian English',
    nativeName: 'Indian English',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "jugaad", englishEquivalent: "innovative fix/hack", usageContext: "problem-solving", formality: "casual", exampleUsage: "We'll use some jugaad to meet the deadline", region: "General" },
        { slang: "timepass", englishEquivalent: "leisure activity", usageContext: "free time", formality: "casual", exampleUsage: "What do you do for timepass?", region: "General" },
        { slang: "chillax", englishEquivalent: "relax/calm down", usageContext: "reassurance", formality: "casual", exampleUsage: "Chillax, we'll handle the project", region: "Urban" }
      ],
      regionalisms: [
        { term: "prepone", englishEquivalent: "move earlier", region: "General", usageContext: "scheduling", exampleUsage: "Can we prepone the meeting to Monday?" },
        { term: "revert back", englishEquivalent: "respond", region: "General", usageContext: "communication", exampleUsage: "Will revert back soon" },
        { term: "cousin-brother", englishEquivalent: "male cousin", region: "General", usageContext: "family", exampleUsage: "My cousin-brother recommended your services" }
      ],
      formalExpressions: [
        { expression: "Request your kind indulgence", englishEquivalent: "please help/consider", usageContext: "business", exampleUsage: "Request your kind indulgence on this matter" },
        { expression: "Do the needful", englishEquivalent: "take necessary action", usageContext: "professional", exampleUsage: "Please do the needful at the earliest" }
      ],
      culturalNuances: [
        { description: "Strong family business culture", impact: "high", examples: ["Family referrals", "Trust networks"] },
        { description: "Respect for elders and authority", impact: "high", examples: ["Formal address", "Deferential language"] },
        { description: "Bargaining and negotiation expected", impact: "medium", examples: ["Price negotiation", "Deal making"] },
        { description: "Festival and auspicious timing importance", impact: "medium", examples: ["Festival season sales", "Auspicious dates"] }
      ],
      businessEtiquette: {
        greetingStyle: "Namaste or firm handshake with respect",
        formalityLevel: "formal",
        directness: "indirect",
        relationshipBuilding: "Crucial for trust",
        negotiationStyle: "Relationship-driven, patient"
      },
      seasonalReferences: [
        { season: "monsoon", localTerms: ["barish", "monsoon", "rainy season"], culturalSignificance: "Rainy season", businessImpact: "Varied by region" },
        { season: "festive", localTerms: ["Diwali", "Dussehra", "Eid"], culturalSignificance: "Major festivals", businessImpact: "Peak shopping" },
        { season: "wedding season", localTerms: ["shaadi season"], culturalSignificance: "Wedding period", businessImpact: "High spending" }
      ],
      humorStyle: {
        acceptability: "medium",
        types: ["wordplay", "situational", "family-based"],
        avoidTopics: ["religion", "caste", "politics"],
        examples: ["Why did the Indian tea vendor succeed? He had chai-ttle!"]
      },
      communicationStyle: {
        directness: "indirect",
        emotionalExpression: "medium",
        useOfMetaphors: "high",
        storytellingPreference: "high"
      }
    }
  },

  'en-GB': {
    code: 'en',
    name: 'British English',
    nativeName: 'British English',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "chuffed", englishEquivalent: "pleased/happy", usageContext: "expressing satisfaction", formality: "casual", exampleUsage: "We're chuffed with these results", region: "General" },
        { slang: "brilliant", englishEquivalent: "excellent", usageContext: "praise", formality: "casual", exampleUsage: "That's a brilliant idea", region: "General" },
        { slang: "cheeky", englishEquivalent: "playfully impudent", usageContext: "describing behavior", formality: "casual", exampleUsage: "A cheeky discount for our loyal customers", region: "General" },
        { slang: "gobsmacked", englishEquivalent: "astonished", usageContext: "surprise", formality: "casual", exampleUsage: "Gobsmacked by the ROI we achieved", region: "General" }
      ],
      regionalisms: [
        { term: "fortnight", englishEquivalent: "two weeks", region: "General", usageContext: "time period", exampleUsage: "We'll deliver in a fortnight" },
        { term: "booking", englishEquivalent: "appointment", region: "General", usageContext: "scheduling", exampleUsage: "Make a booking for consultation" },
        { term: "queue", englishEquivalent: "line", region: "General", usageContext: "waiting", exampleUsage: "Join the queue for premium service" }
      ],
      formalExpressions: [
        { expression: "hereby", englishEquivalent: "by this means", usageContext: "business", exampleUsage: "We hereby confirm our agreement" },
        { expression: "hitherto", englishEquivalent: "until now", usageContext: "academic", exampleUsage: "Hitherto unexplored opportunities" },
        { expression: "henceforth", englishEquivalent: "from now on", usageContext: "professional", exampleUsage: "Henceforth, all communications will be digital" }
      ],
      culturalNuances: [
        { description: "Understated communication preferred", impact: "high", examples: ["Modesty in achievements", "Indirect praise"] },
        { description: "Class consciousness present", impact: "medium", examples: ["Professional boundaries", "Title usage"] },
        { description: "Weather as social lubricant", impact: "low", examples: ["Weather talk", "Seasonal references"] }
      ],
      businessEtiquette: {
        greetingStyle: "Firm handshake, reserved demeanor",
        formalityLevel: "formal",
        directness: "indirect",
        relationshipBuilding: "Gradual professional trust",
        negotiationStyle: "Polite but firm, relationship-based"
      },
      seasonalReferences: [
        { season: "summer", localTerms: ["summer holidays", "bank holiday"], culturalSignificance: "Vacation time", businessImpact: "Slower business" },
        { season: "Christmas", localTerms: ["Christmas", "Xmas", "festive"], culturalSignificance: "Major holiday", businessImpact: "Peak retail" }
      ],
      humorStyle: {
        acceptability: "high",
        types: ["dry wit", "irony", "self-deprecating"],
        avoidTopics: ["royalty", "class", "politics"],
        examples: ["Why don't Brits play hide and seek? Because good luck hiding that reserve!"]
      },
      communicationStyle: {
        directness: "indirect",
        emotionalExpression: "low",
        useOfMetaphors: "high",
        storytellingPreference: "medium"
      }
    }
  },

  'es-MX': {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español Mexicano',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "qué onda", englishEquivalent: "what's up", usageContext: "casual greeting", formality: "casual", exampleUsage: "¿Qué onda? Let's discuss your project", region: "Mexico" },
        { slang: "chévere", englishEquivalent: "cool/awesome", usageContext: "approval", formality: "casual", exampleUsage: "Chévere! That's exactly what we need", region: "Mexico" },
        { slang: "padrísimo", englishEquivalent: "excellent/fantastic", usageContext: "praise", formality: "casual", exampleUsage: "Los resultados son padrísimos", region: "Mexico" }
      ],
      regionalisms: [
        { term: "cuate", englishEquivalent: "buddy/friend", region: "Mexico", usageContext: "friendly address", exampleUsage: "¿Cómo estás, cuate?" },
        { term: "chingón", englishEquivalent: "awesome/badass", region: "Mexico", usageContext: "strong praise", exampleUsage: "Eres chingón en tu trabajo" },
        { term: "órale", englishEquivalent: "come on/let's go", region: "Mexico", usageContext: "encouragement", exampleUsage: "¡Órale, we can do this!" }
      ],
      formalExpressions: [
        { expression: "a su disposición", englishEquivalent: "at your service", usageContext: "business", exampleUsage: "Estoy a su disposición" },
        { expression: "quedo a su orden", englishEquivalent: "ready to help", usageContext: "professional", exampleUsage: "Quedo a su orden para lo que necesite" }
      ],
      culturalNuances: [
        { description: "Family and personal relationships vital", impact: "high", examples: ["Family referrals", "Personal connections"] },
        { description: "Time flexibility", impact: "high", examples: ["Flexible deadlines", "Personal emergencies"] },
        { description: "Respect and formal address", impact: "medium", examples: ["Formal titles", "Respectful language"] }
      ],
      businessEtiquette: {
        greetingStyle: "Warm handshake, personal connection",
        formalityLevel: "semi-formal",
        directness: "contextual",
        relationshipBuilding: "Essential foundation",
        negotiationStyle: "Relationship-focused, flexible timing"
      },
      seasonalReferences: [
        { season: "Navidad", localTerms: ["Posadas", "Nochebuena", "Reyes"], culturalSignificance: "Christmas season", businessImpact: "High sales" },
        { season: "Día de Muertos", localTerms: ["Cempasúchil", "ofrendas"], culturalSignificance: "Day of Dead", businessImpact: "Cultural marketing" }
      ],
      humorStyle: {
        acceptability: "high",
        types: ["wordplay", "family", "situational"],
        avoidTopics: ["politics", "religion", "mother jokes"],
        examples: ["¿Qué le dijo un file a otro? File-te!"]
      },
      communicationStyle: {
        directness: "contextual",
        emotionalExpression: "high",
        useOfMetaphors: "high",
        storytellingPreference: "high"
      }
    }
  },

  'hi-IN': {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "जुगाड़", englishEquivalent: "innovative fix", usageContext: "problem-solving", formality: "casual", exampleUsage: "कुछ जुगाड़ से हल करेंगे", region: "General" },
        { slang: "बकैत", englishEquivalent: "enough/stop", usageContext: "ending discussion", formality: "casual", exampleUsage: "अब बकैत करो", region: "General" },
        { slang: "झक्कास", englishEquivalent: "excellent/brilliant", usageContext: "praise", formality: "casual", exampleUsage: "झक्कास काम है", region: "Urban" }
      ],
      regionalisms: [
        { term: "भाईसाहब", englishEquivalent: "brother/sir", region: "General", usageContext: "respectful address", exampleUsage: "भाईसाहब, आपका स्वागत है" },
        { term: "अरे बाप", englishEquivalent: "oh my god", region: "General", usageContext: "surprise", exampleUsage: "अरे बाप! यह क्या है?" },
        { term: "चलो भाई", englishEquivalent: "come on brother", region: "General", usageContext: "encouragement", exampleUsage: "चलो भाई, काम पर लग जाओ" }
      ],
      formalExpressions: [
        { expression: "आपकी सेवा में", englishEquivalent: "at your service", usageContext: "business", exampleUsage: "मैं आपकी सेवा में तैयार हूं" },
        { expression: "कृपया स्वीकार करें", englishEquivalent: "please accept", usageContext: "professional", exampleUsage: "कृपया हमारा प्रस्ताव स्वीकार करें" }
      ],
      culturalNuances: [
        { description: "Respect for elders and hierarchy", impact: "high", examples: ["Touch feet", "Use respectful titles"] },
        { description: "Family and community orientation", impact: "high", examples: ["Joint family", "Community decisions"] },
        { description: "Religious and spiritual elements", impact: "medium", examples: ["Temple visits", "Auspicious times"] }
      ],
      businessEtiquette: {
        greetingStyle: "Namaste with folded hands",
        formalityLevel: "formal",
        directness: "indirect",
        relationshipBuilding: "Crucial for business",
        negotiationStyle: "Relationship-based, patient"
      },
      seasonalReferences: [
        { season: "मानसून", localTerms: ["बारिश", "वर्षा"], culturalSignificance: "Monsoon", businessImpact: "Seasonal business" },
        { season: "त्योहार", localTerms: ["दिवाली", "होली"], culturalSignificance: "Festivals", businessImpact: "Peak sales" }
      ],
      humorStyle: {
        acceptability: "medium",
        types: ["wordplay", "family", "situational"],
        avoidTopics: ["religion", "caste", "elders"],
        examples: ["चाय वाले से पूछा - चाय अच्छी है? बोला - मुझे नहीं पता, मैं तो पानी उबालता हूं!"]
      },
      communicationStyle: {
        directness: "indirect",
        emotionalExpression: "high",
        useOfMetaphors: "high",
        storytellingPreference: "high"
      }
    }
  }
};

// Location to language mapping
export const LOCATION_LANGUAGE_MAP: Record<string, string> = {
  // North America
  'united states': 'en-US',
  'usa': 'en-US',
  'canada': 'en-US',
  'mexico': 'es-MX',

  // Europe
  'united kingdom': 'en-GB',
  'uk': 'en-GB',
  'england': 'en-GB',
  'london': 'en-GB',

  // Africa
  'nigeria': 'en-NG',
  'lagos': 'en-NG',
  'abuja': 'en-NG',
  'port harcourt': 'en-NG',
  'kenya': 'en-GB',
  'nairobi': 'en-GB',
  'south africa': 'en-GB',

  // Asia
  'india': 'en-IN',
  'mumbai': 'en-IN',
  'delhi': 'en-IN',
  'bangalore': 'en-IN',
  'chennai': 'en-IN',
  'hyderabad': 'en-IN',
  'pakistan': 'en-GB',
  'bangladesh': 'en-GB',
  'singapore': 'en-GB',
  'malaysia': 'en-GB',
  'philippines': 'en-US',

  // Default fallback
  'default': 'en-US'
};

/**
 * Detect language based on location
 */
export function detectLanguageFromLocation(location: string): LanguageConfig {
  const locationLower = location.toLowerCase();

  // Try exact matches first
  for (const [locationKey, languageKey] of Object.entries(LOCATION_LANGUAGE_MAP)) {
    if (locationLower.includes(locationKey)) {
      return LANGUAGE_DATABASE[languageKey] || LANGUAGE_DATABASE['en-US'];
    }
  }

  // Try partial matches
  for (const [locationKey, languageKey] of Object.entries(LOCATION_LANGUAGE_MAP)) {
    if (locationKey.includes(locationLower) || locationLower.includes(locationKey)) {
      return LANGUAGE_DATABASE[languageKey] || LANGUAGE_DATABASE['en-US'];
    }
  }

  // Default to US English
  return LANGUAGE_DATABASE['en-US'];
}

/**
 * Get language config by code
 */
export function getLanguageConfig(languageCode: string): LanguageConfig {
  return LANGUAGE_DATABASE[languageCode] || LANGUAGE_DATABASE['en-US'];
}

/**
 * Generate cultural adaptation instructions
 */
export function generateCulturalAdaptation(request: CulturalAdaptationRequest): CulturalPrompt {
  const languageConfig = detectLanguageFromLocation(request.location);
  const { culturalContext } = languageConfig;

  let languageInstructions = '';
  let culturalInstructions = '';
  let slangGuidelines = '';
  let formalityGuidelines = '';
  const examples: string[] = [];
  const avoidances: string[] = [];

  // Language preference instructions
  switch (request.languagePreference) {
    case 'native':
      languageInstructions = `Write content in ${languageConfig.nativeName} (${languageConfig.code}). Use authentic local expressions and natural language patterns that native speakers would use.`;
      break;
    case 'cultural_english':
      languageInstructions = `Write in English but incorporate ${languageConfig.name} cultural expressions, slang, and communication patterns. Make it sound natural for ${languageConfig.name} speakers who are comfortable with English.`;
      break;
    case 'english':
    default:
      languageInstructions = `Write in standard English but with cultural awareness for ${languageConfig.name} context. Consider local references and appropriate communication styles.`;
      break;
  }

  // Cultural instructions
  culturalInstructions = `
CULTURAL CONTEXT FOR ${request.location.toUpperCase()}:
- Communication Style: ${culturalContext.communicationStyle.directness} with ${culturalContext.communicationStyle.emotionalExpression} emotional expression
- Business Etiquette: ${culturalContext.businessEtiquette.formalityLevel} formality, ${culturalContext.businessEtiquette.directness} communication
- Relationship Building: ${culturalContext.businessEtiquette.relationshipBuilding}
- Humor Acceptability: ${culturalContext.humorStyle.acceptability} (${culturalContext.humorStyle.types.join(', ')})
- Storytelling Preference: ${culturalContext.communicationStyle.storytellingPreference}`;

  // Formality guidelines
  switch (request.formalityLevel) {
    case 'formal':
      formalityGuidelines = `Use professional, formal language. Incorporate these formal expressions: ${culturalContext.formalExpressions.slice(0, 3).map(e => `"${e.expression}"`).join(', ')}. Maintain respectful distance and professional tone.`;
      break;
    case 'professional':
      formalityGuidelines = `Use business-appropriate language. Mix formal and professional expressions naturally. Maintain credibility while being approachable.`;
      break;
    case 'casual':
      formalityGuidelines = `Use relaxed, friendly language. Incorporate common slang and regionalisms naturally. Build rapport through conversational tone.`;
      break;
    case 'slang_heavy':
      formalityGuidelines = `Use authentic local slang and casual expressions heavily. Sound like a native local speaker. Use these popular expressions: ${culturalContext.slangExpressions.slice(0, 5).map(s => `"${s.slang}"`).join(', ')}.`;
      break;
  }

  // Slang guidelines
  if (request.formalityLevel === 'casual' || request.formalityLevel === 'slang_heavy') {
    slangGuidelines = `
INCLUDE LOCAL SLANG EXPRESSIONS:
${culturalContext.slangExpressions.slice(0, 5).map(slang => `- "${slang.slang}" (${slang.englishEquivalent}): Use ${slang.usageContext}`).join('\n')}

REGIONAL TERMS TO INCLUDE:
${culturalContext.regionalisms.slice(0, 3).map(reg => `- "${reg.term}" (${reg.englishEquivalent}): Use ${reg.usageContext}`).join('\n')}`;
  }

  // Generate examples
  examples.push(...culturalContext.slangExpressions.slice(0, 2).map(slang => slang.exampleUsage));
  examples.push(...culturalContext.regionalisms.slice(0, 1).map(reg => reg.exampleUsage));

  // Generate avoidances
  avoidances.push(...(culturalContext.culturalNuances.flatMap(nuance => nuance.avoids || [])));
  avoidances.push(...culturalContext.humorStyle.avoidTopics);

  return {
    languageInstructions,
    culturalInstructions,
    slangGuidelines,
    formalityGuidelines,
    examples,
    avoidances
  };
}

/**
 * Get available languages for UI
 */
export function getAvailableLanguages(): Array<{code: string, name: string, nativeName: string}> {
  return Object.values(LANGUAGE_DATABASE).map(lang => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName
  }));
}

/**
 * Validate and normalize cultural adaptation request
 */
export function validateCulturalRequest(request: Partial<CulturalAdaptationRequest>): CulturalAdaptationRequest {
  return {
    location: request.location || 'United States',
    languagePreference: request.languagePreference || 'english',
    formalityLevel: request.formalityLevel || 'professional',
    contentPurpose: request.contentPurpose || 'marketing',
    targetAudience: request.targetAudience || 'general customers',
    businessType: request.businessType
  };
}