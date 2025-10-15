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
  formalityLevel: 'formal' | 'semi-formal' | 'casual' | 'professional';
  directness: 'direct' | 'indirect' | 'contextual' | 'polite direct';
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
  directness: 'direct' | 'indirect' | 'contextual' | 'polite direct';
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
  },

  'en-AU': {
    code: 'en',
    name: 'Australian English',
    nativeName: 'Australian English',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "no worries", englishEquivalent: "no problem/you're welcome", usageContext: "casual reassurance", formality: "casual", exampleUsage: "No worries mate, we'll fix it right away", region: "General" },
        { slang: "fair dinkum", englishEquivalent: "true/genuine", usageContext: "authenticity", formality: "casual", exampleUsage: "This service is fair dinkum top quality", region: "General" },
        { slang: "arvo", englishEquivalent: "afternoon", usageContext: "time reference", formality: "casual", exampleUsage: "We can schedule the job for this arvo", region: "General" },
        { slang: "brekky", englishEquivalent: "breakfast", usageContext: "meal time", formality: "casual", exampleUsage: "Let's catch up over brekky to discuss the project", region: "General" },
        { slang: "chockers", englishEquivalent: "very busy/full", usageContext: "business capacity", formality: "casual", exampleUsage: "We're chockers this week, but can fit you in next week", region: "General" }
      ],
      regionalisms: [
        { term: "barbie", englishEquivalent: "barbecue", region: "General", usageContext: "social gathering", exampleUsage: "Let's have a barbie to celebrate the project completion" },
        { term: "servo", englishEquivalent: "service station", region: "General", usageContext: "gas station", exampleUsage: "The servo is just around the corner from the job site" },
        { term: "ute", englishEquivalent: "utility vehicle/pickup", region: "General", usageContext: "work vehicle", exampleUsage: "We'll bring the ute with all the equipment" },
        { term: "thongs", englishEquivalent: "flip-flops", region: "General", usageContext: "footwear", exampleUsage: "Casual dress code includes thongs in summer" }
      ],
      formalExpressions: [
        { expression: "pursuant to", englishEquivalent: "according to", usageContext: "business", exampleUsage: "Pursuant to our discussion, I'm forwarding the proposal" },
        { expression: "hitherto", englishEquivalent: "until now", usageContext: "professional", exampleUsage: "Hitherto unaddressed maintenance issues" },
        { expression: "forthwith", englishEquivalent: "immediately", usageContext: "ceremonial", exampleUsage: "We will address this matter forthwith" }
      ],
      culturalNuances: [
        { description: "Laid-back attitude with high standards", impact: "high", examples: ["Easy-going manner", "Quality expectations"] },
        { description: "Outdoor lifestyle and climate awareness", impact: "high", examples: ["Weather considerations", "Outdoor work patterns"] },
        { description: "Mateship and community spirit", impact: "medium", examples: ["Local community support", "Friendly neighbor relations"] },
        { description: "Sports culture integration", impact: "medium", examples: ["Weekend sports", "Sporting event scheduling"] }
      ],
      businessEtiquette: {
        greetingStyle: "Firm handshake, direct eye contact, casual address",
        formalityLevel: "semi-formal",
        directness: "direct",
        relationshipBuilding: "Quick rapport through shared interests",
        negotiationStyle: "Direct but fair, relationship-focused"
      },
      seasonalReferences: [
        { season: "summer", localTerms: ["Christmas in summer", "beach season", "barbie season"], culturalSignificance: "Major holiday period", businessImpact: "Summer slowdown" },
        { season: "footy season", localTerms: ["AFL", "NRL", "grand final"], culturalSignificance: "Major sporting period", businessImpact: "Weekend planning" },
        { season: "spring racing", localTerms: ["Melbourne Cup", "race season"], culturalSignificance: "Major social event", businessImpact: "Formal business events" }
      ],
      humorStyle: {
        acceptability: "high",
        types: ["sarcastic", "self-deprecating", "dry wit"],
        avoidTopics: ["sensitive personal topics", "recent tragedies"],
        examples: ["Why don't Australian businesses play hide and seek? Because good luck hiding when everyone says 'Fair dinkum!'"]
      },
      communicationStyle: {
        directness: "direct",
        emotionalExpression: "medium",
        useOfMetaphors: "high",
        storytellingPreference: "medium"
      }
    }
  },

  'en-CA': {
    code: 'en',
    name: 'Canadian English',
    nativeName: 'Canadian English',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "eh", englishEquivalent: "isn't it/right?", usageContext: "confirmation", formality: "casual", exampleUsage: "This solution will work perfectly, eh?", region: "General" },
        { slang: "give'r", englishEquivalent: "give it your all", usageContext: "encouragement", formality: "casual", exampleUsage: "Let's give'r and get this project done ahead of schedule", region: "General" },
        { slang: "double-double", englishEquivalent: "coffee with two creams and two sugars", usageContext: "coffee order", formality: "casual", exampleUsage: "Let's grab a double-double before we start the meeting", region: "General" },
        { slang: "hoser", englishEquivalent: "fool/loser", usageContext: "mild insult", formality: "very_casual", exampleUsage: "Don't be a hoser, read the instructions first", region: "General" }
      ],
      regionalisms: [
        { term: "loonie", englishEquivalent: "one dollar coin", region: "General", usageContext: "currency", exampleUsage: "The consultation fee is just fifty loonies" },
        { term: "toonie", englishEquivalent: "two dollar coin", region: "General", usageContext: "currency", exampleUsage: "Special offer available for just one toonie" },
        { term: "hydro", englishEquivalent: "electricity", region: "Ontario", usageContext: "utilities", exampleUsage: "Hydro costs are included in the maintenance fee" },
        { term: "keener", englishEquivalent: "eager beaver", region: "General", usageContext: "enthusiastic person", exampleUsage: "Our keener staff always go the extra mile" }
      ],
      formalExpressions: [
        { expression: "herewith", englishEquivalent: "with this", usageContext: "business", exampleUsage: "Please find herewith the requested documentation" },
        { expression: "henceforth", englishEquivalent: "from now on", usageContext: "professional", exampleUsage: "Henceforth, all communications will be digital" },
        { expression: "pursuant to", englishEquivalent: "in accordance with", usageContext: "business", exampleUsage: "Pursuant to our agreement" }
      ],
      culturalNuances: [
        { description: "Politeness and apology culture", impact: "high", examples: ["Frequent 'sorry'", "Thank you emphasis"] },
        { description: "Multicultural mosaic approach", impact: "high", examples: ["Cultural diversity", "Inclusive language"] },
        { description: "Seasonal and weather adaptation", impact: "medium", examples: ["Winter preparation", "Summer appreciation"] },
        { description: "Community and social responsibility", impact: "medium", examples: ["Local support", "Environmental consciousness"] }
      ],
      businessEtiquette: {
        greetingStyle: "Firm handshake with polite greeting",
        formalityLevel: "professional",
        directness: "polite direct",
        relationshipBuilding: "Gradual trust building through reliability",
        negotiationStyle: "Collaborative, respectful, consensus-seeking"
      },
      seasonalReferences: [
        { season: "winter", localTerms: ["snow season", " toque weather", "ice roads"], culturalSignificance: "Major climate period", businessImpact: "Winter services demand" },
        { season: "summer", localTerms: ["cottage season", "patio weather", "long weekends"], culturalSignificance: "Recreation time", businessImpact: "Vacation scheduling" },
        { season: "hockey season", localTerms: ["Leafs", "Habs", "Canucks"], culturalSignificance: "National sport", businessImpact: "Social scheduling" }
      ],
      humorStyle: {
        acceptability: "high",
        types: ["self-deprecating", "sarcastic", "observational"],
        avoidTopics: ["sensitive cultural topics", "regional tensions"],
        examples: ["Why do Canadian businesses succeed? Because they're always sorry to see customers leave satisfied!"]
      },
      communicationStyle: {
        directness: "polite direct",
        emotionalExpression: "medium",
        useOfMetaphors: "medium",
        storytellingPreference: "medium"
      }
    }
  },

  'en-SG': {
    code: 'en',
    name: 'Singaporean English',
    nativeName: 'Singlish',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "kiasu", englishEquivalent: "afraid to lose", usageContext: "competitive behavior", formality: "casual", exampleUsage: "Don't be so kiasu, we can work together on this", region: "General" },
        { slang: "shiok", englishEquivalent: "very satisfying/enjoyable", usageContext: "pleasure", formality: "casual", exampleUsage: "The service we provide is really shiok", region: "General" },
        { slang: "can lah", englishEquivalent: "yes, of course", usageContext: "confirmation", formality: "casual", exampleUsage: "This project can be done on time, can lah", region: "General" },
        { slang: "kena", englishEquivalent: "to be affected by something negative", usageContext: "misfortune", formality: "casual", exampleUsage: "If you don't maintain properly, kena breakdown", region: "General" }
      ],
      regionalisms: [
        { term: "makan", englishEquivalent: "eat/food", region: "General", usageContext: "dining", exampleUsage: "Let's have makan session after the meeting" },
        { term: "chope", englishEquivalent: "reserve a seat", region: "General", usageContext: "reservation", exampleUsage: "We'll chope the best table for your presentation" },
        { term: "ang pow", englishEquivalent: "red envelope with money", region: "General", usageContext: "gift giving", exampleUsage: "Chinese New Year ang pow for staff bonus" },
        { term: "teh tarik", englishEquivalent: "pulled tea", region: "General", usageContext: "beverage", exampleUsage: "Teh tarik while we discuss the proposal?" }
      ],
      formalExpressions: [
        { expression: "with due respect", englishEquivalent: "respectfully", usageContext: "business", exampleUsage: "With due respect, we propose an alternative approach" },
        { expression: "herewith", englishEquivalent: "with this", usageContext: "professional", exampleUsage: "Please find herewith the requested documents" },
        { expression: "henceforth", englishEquivalent: "from now on", usageContext: "professional", exampleUsage: "Henceforth, all procedures will be digitized" }
      ],
      culturalNuances: [
        { description: "Efficiency and time consciousness", impact: "high", examples: ["Quick responses", "Punctuality valued"] },
        { description: "Multi-cultural harmony", impact: "high", examples: ["Cultural sensitivity", "Festival awareness"] },
        { description: "Food and dining culture", impact: "medium", examples: ["Meal discussions", "Food references"] },
        { description: "Hierarchy and respect", impact: "medium", examples: ["Title usage", "Age respect"] }
      ],
      businessEtiquette: {
        greetingStyle: "Polite nod or light handshake with respectful address",
        formalityLevel: "formal",
        directness: "indirect",
        relationshipBuilding: "Gradual through consistent reliability",
        negotiationStyle: "Efficient, data-driven, respectful"
      },
      seasonalReferences: [
        { season: "Chinese New Year", localTerms: ["CNY", "lion dance", "reunion dinner"], culturalSignificance: "Major festival", businessImpact: "Business closures, bonuses" },
        { season: "Great Singapore Sale", localTerms: ["GSS", "shopping festival"], culturalSignificance: "Major retail event", businessImpact: "High consumer spending" },
        { season: "haze season", localTerms: ["PSI", "haze", "air quality"], culturalSignificance: "Environmental concern", businessImpact: "Indoor activities preference" }
      ],
      humorStyle: {
        acceptability: "medium",
        types: ["wordplay", "situational", "food-related"],
        avoidTopics: ["race", "religion", "politics"],
        examples: ["Why do Singaporean businesses succeed? Because they're always 'kiasu' about customer satisfaction!"]
      },
      communicationStyle: {
        directness: "indirect",
        emotionalExpression: "low",
        useOfMetaphors: "medium",
        storytellingPreference: "low"
      }
    }
  },

  'en-IL': {
    code: 'en',
    name: 'Israeli English',
    nativeName: 'Israeli English',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "sababa", englishEquivalent: "cool/alright", usageContext: "approval/agreement", formality: "casual", exampleUsage: "Sababa! Let's schedule the meeting for next week", region: "General" },
        { slang: "yalla", englishEquivalent: "come on/let's go", usageContext: "encouragement", formality: "casual", exampleUsage: "Yalla, we can finish this project today", region: "General" },
        { slang: "davka", englishEquivalent: "specifically/on purpose", usageContext: "emphasis", formality: "casual", exampleUsage: "We need davka this solution for our clients", region: "General" },
        { slang: "balagan", englishEquivalent: "mess/chaos", usageContext: "describing situation", formality: "casual", exampleUsage: "Don't worry, we'll fix this balagan quickly", region: "General" },
        { slang: "nu", englishEquivalent: "so/well", usageContext: "prompting", formality: "casual", exampleUsage: "Nu? Are you ready to discuss the proposal?", region: "General" },
        { slang: "hakol beseder", englishEquivalent: "everything is okay", usageContext: "reassurance", formality: "casual", exampleUsage: "Hakol beseder, we'll handle the project", region: "General" },
        { slang: "stam", englishEquivalent: "just because/no reason", usageContext: "casual explanation", formality: "casual", exampleUsage: "Let's meet stam for coffee to discuss ideas", region: "General" }
      ],
      regionalisms: [
        { term: "achla", englishEquivalent: "great/excellent", region: "General", usageContext: "praise", exampleUsage: "Achla work on the electrical installation!" },
        { term: "beseder", englishEquivalent: "okay/alright", region: "General", usageContext: "agreement", exampleUsage: "Beseder, I'll send the proposal by tomorrow" },
        { term: "bara cheshbon", englishEquivalent: "let's settle the bill", region: "General", usageContext: "payment", exampleUsage: "Let's bara cheshbon for the completed work" },
        { term: "yofi", englishEquivalent: "beautiful/great", region: "General", usageContext: "approval", exampleUsage: "Yofi! The service was exactly what we needed" }
      ],
      formalExpressions: [
        { expression: "b'seder hashlama", englishEquivalent: "with completion", usageContext: "business", exampleUsage: "We'll deliver the project b'seder hashlama" },
        { expression: "im harchava", englishEquivalent: "with expansion", usageContext: "professional", exampleUsage: "We can offer im harchava services" },
        { expression: "le'omanutan", englishEquivalent: "to the best of", usageContext: "professional", exampleUsage: "Le'omanutan professional service" }
      ],
      culturalNuances: [
        { description: "Direct communication with relationship focus", impact: "high", examples: ["Straight to business but personal connection matters", "Immediate problem-solving preferred"] },
        { description: "Family and community orientation", impact: "high", examples: ["Family business referrals", "Community trust networks", "Word-of-mouth important"] },
        { description: "Innovation and startup culture", impact: "high", examples: ["Tech-savvy customers", "Appreciate cutting-edge solutions", "Quick adoption"] },
        { description: "Religious and cultural considerations", impact: "medium", examples: ["Shabbat timing", "Holiday schedules", "Kosher considerations"] },
        { description: "Security consciousness", impact: "medium", examples: ["Safety emphasis important", "Reliability and trust crucial", "Long-term relationships valued"] }
      ],
      businessEtiquette: {
        greetingStyle: "Firm handshake with direct eye contact, warm but professional",
        formalityLevel: "professional",
        directness: "direct",
        relationshipBuilding: "Quick professional rapport with personal connection",
        negotiationStyle: "Direct but relationship-focused, value-driven"
      },
      seasonalReferences: [
        { season: "summer", localTerms: ["chomesh", "beach season", "vacation"], culturalSignificance: "Peak vacation time", businessImpact: "May experience slower response times" },
        { season: "high holidays", localTerms: ["Rosh Hashanah", "Yom Kippur", "Tishrei"], culturalSignificance: "Major religious period", businessImpact: "Business closures, planning essential" },
        { season: "Passover", localTerms: ["Pesach", "spring cleaning", "holiday"], culturalSignificance: "Major family holiday", businessImpact: "Family focus, advance scheduling" },
        { season: "Hanukkah", localTerms: ["Hanukkah", "festival of lights", "winter"], culturalSignificance: "Cultural celebration", businessImpact: "Gift-giving season" }
      ],
      humorStyle: {
        acceptability: "medium",
        types: ["situational", "self-deprecating", "family-based"],
        avoidTopics: ["religion (sensitive)", "politics (divisive)", "security situations"],
        examples: ["Why did the Israeli electrician succeed? He knew how to connect with his clients!"]
      },
      communicationStyle: {
        directness: "direct",
        emotionalExpression: "medium",
        useOfMetaphors: "high",
        storytellingPreference: "high"
      }
    }
  },

  'en-ZA': {
    code: 'en',
    name: 'South African English',
    nativeName: 'South African English',
    isDefault: false,
    culturalContext: {
      slangExpressions: [
        { slang: "lekker", englishEquivalent: "nice/great", usageContext: "approval", formality: "casual", exampleUsage: "This is a lekker solution for your business", region: "General" },
        { slang: "howzit", englishEquivalent: "how is it going?", usageContext: "greeting", formality: "casual", exampleUsage: "Howzit? Ready to discuss your project?", region: "General" },
        { slang: "boet", englishEquivalent: "brother/mate", usageContext: "friendly address", formality: "casual", exampleUsage: "Thanks boet, really appreciate the business", region: "General" },
        { slang: "ag man", englishEquivalent: "oh man/come on", usageContext: "expression of frustration", formality: "casual", exampleUsage: "Ag man, let's fix this problem quickly", region: "General" }
      ],
      regionalisms: [
        { term: "braai", englishEquivalent: "barbecue", region: "General", usageContext: "social gathering", exampleUsage: "Let's celebrate the project completion with a braai" },
        { term: "bakkie", englishEquivalent: "pickup truck", region: "General", usageContext: "work vehicle", exampleUsage: "We'll bring the bakkie with all equipment" },
        { term: "robot", englishEquivalent: "traffic light", region: "General", usageContext: "traffic", exampleUsage: "Turn right at the next robot" },
        { term: "samoosa", englishEquivalent: "samosa", region: "General", usageContext: "food", exampleUsage: "Coffee and samoosas during the meeting?" }
      ],
      formalExpressions: [
        { expression: "herewith", englishEquivalent: "with this", usageContext: "business", exampleUsage: "Herewith please find our proposal" },
        { expression: "kindly revert", englishEquivalent: "please respond", usageContext: "professional", exampleUsage: "Kindly revert with your feedback" },
        { expression: "pursuant to", englishEquivalent: "in accordance with", usageContext: "business", exampleUsage: "Pursuant to our discussion" }
      ],
      culturalNuances: [
        { description: "Rainbow nation diversity", impact: "high", examples: ["Cultural integration", "Multiple languages"] },
        { description: "Resourcefulness and innovation", impact: "high", examples: ["Creative solutions", "Adaptability"] },
        { description: "Outdoor and lifestyle focus", impact: "medium", examples: ["Weather considerations", "Activities"] },
        { description: "Community and relationship focus", impact: "medium", examples: ["Local networks", "Trust building"] }
      ],
      businessEtiquette: {
        greetingStyle: "Firm handshake with direct eye contact",
        formalityLevel: "professional",
        directness: "direct",
        relationshipBuilding: "Personal connection and trust",
        negotiationStyle: "Direct but respectful, relationship-focused"
      },
      seasonalReferences: [
        { season: "summer", localTerms: ["December holidays", "festive season", "beach time"], culturalSignificance: "Major holiday period", businessImpact: "Summer slowdown" },
        { season: "winter", localTerms: ["load shedding", "power cuts", "winter schedule"], culturalSignificance: "Environmental challenge", businessImpact: "Schedule adjustments required" },
        { season: "braai season", localTerms: ["heritage day", "spring braai"], culturalSignificance: "Cultural celebration", businessImpact: "Social events" }
      ],
      humorStyle: {
        acceptability: "high",
        types: ["self-deprecating", "situational", "observational"],
        avoidTopics: ["race", "politics", "sensitive history"],
        examples: ["Why are South African businesses so successful? Because they know how to make a plan lekker!"]
      },
      communicationStyle: {
        directness: "direct",
        emotionalExpression: "medium",
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
  'canada': 'en-CA',
  'mexico': 'es-MX',
  'australia': 'en-AU',
  'new zealand': 'en-AU',

  // Europe
  'united kingdom': 'en-GB',
  'uk': 'en-GB',
  'england': 'en-GB',
  'london': 'en-GB',
  'scotland': 'en-GB',
  'ireland': 'en-GB',

  // Middle East - Israel
  'israel': 'en-IL',
  'tel aviv': 'en-IL',
  'tel-aviv': 'en-IL',
  'jerusalem': 'en-IL',
  'haifa': 'en-IL',
  'ramat gan': 'en-IL',
  'ramat-gan': 'en-IL',
  'petah tikva': 'en-IL',
  'petah-tikva': 'en-IL',
  'ashdod': 'en-IL',
  'netanya': 'en-IL',
  'beer sheva': 'en-IL',
  'beer-sheva': 'en-IL',
  'herzliya': 'en-IL',
  'rishon lezion': 'en-IL',
  'rishon-lezion': 'en-IL',
  'kfar saba': 'en-IL',
  'kfar-saba': 'en-IL',
  'raanana': 'en-IL',
  'modiin': 'en-IL',
  'modi\'in': 'en-IL',
  'holon': 'en-IL',
  'bat yam': 'en-IL',
  'bat-yam': 'en-IL',
  'bnei brak': 'en-IL',
  'bnei-brak': 'en-IL',

  // Africa
  'nigeria': 'en-NG',
  'lagos': 'en-NG',
  'abuja': 'en-NG',
  'port harcourt': 'en-NG',
  'kenya': 'en-GB',
  'nairobi': 'en-GB',
  'south africa': 'en-ZA',
  'johannesburg': 'en-ZA',
  'cape town': 'en-ZA',
  'durban': 'en-ZA',

  // Asia
  'india': 'en-IN',
  'mumbai': 'en-IN',
  'delhi': 'en-IN',
  'bangalore': 'en-IN',
  'chennai': 'en-IN',
  'hyderabad': 'en-IN',
  'pakistan': 'en-GB',
  'bangladesh': 'en-GB',
  'singapore': 'en-SG',
  'malaysia': 'en-GB',
  'philippines': 'en-US',
  'hong kong': 'en-GB',

  // Australia/Pacific specific cities
  'sydney': 'en-AU',
  'melbourne': 'en-AU',
  'brisbane': 'en-AU',
  'perth': 'en-AU',
  'adelaide': 'en-AU',
  'auckland': 'en-AU',
  'wellington': 'en-AU',

  // Canada specific cities
  'toronto': 'en-CA',
  'vancouver': 'en-CA',
  'montreal': 'en-CA',
  'calgary': 'en-CA',
  'ottawa': 'en-CA',
  'edmonton': 'en-CA',

  // Default fallback
  'default': 'en-US'
};

/**
 * Enhanced location detection with multi-city and regional targeting
 */
export function detectLanguageFromLocation(location: string): LanguageConfig {
  const locationLower = location.toLowerCase();

  // Handle multi-location inputs (e.g., "New York, London, Sydney")
  const locations = locationLower.split(/[,;]| and /).map(loc => loc.trim()).filter(loc => loc.length > 0);

  // If multiple locations, try to find the most specific match
  for (const loc of locations) {
    // Try exact matches first
    for (const [locationKey, languageKey] of Object.entries(LOCATION_LANGUAGE_MAP)) {
      if (loc.includes(locationKey)) {
        return LANGUAGE_DATABASE[languageKey] || LANGUAGE_DATABASE['en-US'];
      }
    }

    // Try partial matches
    for (const [locationKey, languageKey] of Object.entries(LOCATION_LANGUAGE_MAP)) {
      if (locationKey.includes(loc) || loc.includes(locationKey)) {
        return LANGUAGE_DATABASE[languageKey] || LANGUAGE_DATABASE['en-US'];
      }
    }
  }

  // Default to US English
  return LANGUAGE_DATABASE['en-US'];
}

/**
 * Extract multiple locations from input string
 */
export function extractMultipleLocations(location: string): string[] {
  if (!location) return [];

  const locations = location
    .split(/[,;]| and /)
    .map(loc => loc.trim())
    .filter(loc => loc.length > 2)
    .map(loc => {
      // Clean up location names
      return loc
        .replace(/\b(usa|uk|us|united kingdom|united states)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter(loc => loc.length > 2);

  // Remove duplicates while preserving order
  return [...new Set(locations)];
}

/**
 * Detect multiple languages for multi-location targeting
 */
export function detectLanguagesForMultipleLocations(location: string): Array<{location: string, language: LanguageConfig, confidence: number}> {
  const locations = extractMultipleLocations(location);
  const results: Array<{location: string, language: LanguageConfig, confidence: number}> = [];

  locations.forEach(loc => {
    let confidence = 0;
    let detectedLanguage = LANGUAGE_DATABASE['en-US']; // default

    // Exact match gets highest confidence
    for (const [locationKey, languageKey] of Object.entries(LOCATION_LANGUAGE_MAP)) {
      if (loc.toLowerCase() === locationKey) {
        detectedLanguage = LANGUAGE_DATABASE[languageKey] || LANGUAGE_DATABASE['en-US'];
        confidence = 100;
        break;
      }
    }

    // Partial match gets medium confidence
    if (confidence === 0) {
      for (const [locationKey, languageKey] of Object.entries(LOCATION_LANGUAGE_MAP)) {
        if (loc.toLowerCase().includes(locationKey) || locationKey.includes(loc.toLowerCase())) {
          detectedLanguage = LANGUAGE_DATABASE[languageKey] || LANGUAGE_DATABASE['en-US'];
          confidence = 70;
          break;
        }
      }
    }

    // Country-level match gets lower confidence
    if (confidence === 0) {
      for (const [locationKey, languageKey] of Object.entries(LOCATION_LANGUAGE_MAP)) {
        const [country] = locationKey.split('-');
        if (loc.toLowerCase().includes(country) || country.includes(loc.toLowerCase())) {
          detectedLanguage = LANGUAGE_DATABASE[languageKey] || LANGUAGE_DATABASE['en-US'];
          confidence = 40;
          break;
        }
      }
    }

    results.push({
      location: loc,
      language: detectedLanguage,
      confidence
    });
  });

  // Sort by confidence and location specificity
  return results.sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    return b.location.length - a.location.length; // Prefer more specific locations
  });
}

/**
 * Get regional context for multiple locations
 */
export function getMultiLocationRegionalContext(location: string): {
  primaryRegion: string;
  secondaryRegions: string[];
  culturalBlend: boolean;
  dominantLanguage: LanguageConfig;
  regionalVariations: string[];
} {
  const languageResults = detectLanguagesForMultipleLocations(location);

  if (languageResults.length === 0) {
    return {
      primaryRegion: 'Global',
      secondaryRegions: [],
      culturalBlend: false,
      dominantLanguage: LANGUAGE_DATABASE['en-US'],
      regionalVariations: []
    };
  }

  if (languageResults.length === 1) {
    const result = languageResults[0];
    return {
      primaryRegion: result.location,
      secondaryRegions: [],
      culturalBlend: false,
      dominantLanguage: result.language,
      regionalVariations: []
    };
  }

  // Multiple locations detected
  const primaryResult = languageResults[0];
  const secondaryResults = languageResults.slice(1);

  // Check if there's a cultural blend (different language regions)
  const uniqueLanguages = new Set(languageResults.map(r => r.language.code));
  const culturalBlend = uniqueLanguages.size > 1;

  return {
    primaryRegion: primaryResult.location,
    secondaryRegions: secondaryResults.map(r => r.location),
    culturalBlend,
    dominantLanguage: primaryResult.language,
    regionalVariations: secondaryResults.map(r => r.language.name).filter((v, i, a) => a.indexOf(v) === i)
  };
}

/**
 * Get location-specific cultural insights
 */
export function getLocationCulturalInsights(location: string): {
  localPhrases: string[];
  culturalEvents: string[];
  seasonalConsiderations: string[];
  businessEtiquette: string[];
  communicationStyle: string;
} {
  const regionalContext = getMultiLocationRegionalContext(location);
  const languageConfig = regionalContext.dominantLanguage;
  const culturalContext = languageConfig.culturalContext;

  return {
    localPhrases: culturalContext.slangExpressions.slice(0, 3).map(s => s.slang),
    culturalEvents: culturalContext.seasonalReferences.slice(0, 2).map(s => s.localTerms.join(', ')),
    seasonalConsiderations: culturalContext.seasonalReferences.map(s => s.businessImpact),
    businessEtiquette: [
      culturalContext.businessEtiquette.greetingStyle,
      `${culturalContext.businessEtiquette.formalityLevel} formality level`,
      culturalContext.businessEtiquette.relationshipBuilding
    ],
    communicationStyle: `${culturalContext.communicationStyle.directness} communication with ${culturalContext.communicationStyle.emotionalExpression} emotional expression`
  };
}

/**
 * Get regional competitor analysis insights
 */
export function getRegionalCompetitorInsights(location: string, industry?: string): {
  regionalCompetitorPatterns: string[];
  culturalCompetitorAdvantages: string[];
  localMarketOpportunities: string[];
  regionalPricingConsiderations: string[];
  culturalDifferentiationStrategies: string[];
  localSEOAdvantages: string[];
} {
  const regionalContext = getMultiLocationRegionalContext(location);
  const languageConfig = regionalContext.dominantLanguage;
  const culturalContext = languageConfig.culturalContext;

  const insights: {
    regionalCompetitorPatterns: string[];
    culturalCompetitorAdvantages: string[];
    localMarketOpportunities: string[];
    regionalPricingConsiderations: string[];
    culturalDifferentiationStrategies: string[];
    localSEOAdvantages: string[];
  } = {
    regionalCompetitorPatterns: [],
    culturalCompetitorAdvantages: [],
    localMarketOpportunities: [],
    regionalPricingConsiderations: [],
    culturalDifferentiationStrategies: [],
    localSEOAdvantages: []
  };

  // Region-specific competitor patterns
  switch (languageConfig.code) {
    case 'en-AU':
      insights.regionalCompetitorPatterns = [
        'Laid-back communication style in marketing',
        'Emphasis on outdoor lifestyle benefits',
        'Local sports and community event sponsorships',
        'Casual yet professional customer service'
      ];
      insights.culturalCompetitorAdvantages = [
        'Authentic Aussie slang in casual marketing',
        'Community-focused business approaches',
        'Local knowledge and geographic expertise',
        'Relatable "mate-to-mate" customer relationships'
      ];
      insights.localMarketOpportunities = [
        'Seasonal services for extreme weather',
        'Suburban and regional market expansion',
        'Sporting event partnerships',
        'Outdoor lifestyle service integration'
      ];
      insights.regionalPricingConsiderations = [
        'Premium pricing for quality perception',
        'Bundle deals for regional customers',
        'Seasonal pricing adjustments',
        'Local competitor price matching'
      ];
      break;

    case 'en-CA':
      insights.regionalCompetitorPatterns = [
        'Polite and apologetic customer service',
        'Multicultural marketing approaches',
        'Seasonal service adaptations',
        'Community involvement and social responsibility'
      ];
      insights.culturalCompetitorAdvantages = [
        'Bilingual service capabilities',
        'Understanding of regional cultural diversity',
        'Politeness and customer-first approach',
        'Adaptation to seasonal business cycles'
      ];
      insights.localMarketOpportunities = [
        'Multilingual service offerings',
        'Regional expansion to smaller communities',
        'Partnership with local cultural organizations',
        'Seasonal preparation services'
      ];
      insights.regionalPricingConsiderations = [
        'Competitive pricing for smaller markets',
        'Premium pricing for specialized services',
        'Government contract opportunities',
        'Regional pricing variations'
      ];
      break;

    case 'en-NG':
      insights.regionalCompetitorPatterns = [
        'Relationship-based business development',
        'Personalized customer service',
        'Community and family business networks',
        'Mobile and flexible service delivery'
      ];
      insights.culturalCompetitorAdvantages = [
        'Understanding of local business etiquette',
        'Ability to navigate bureaucratic processes',
        'Strong local network relationships',
        'Cultural adaptation in service delivery'
      ];
      insights.localMarketOpportunities = [
        'Rapid urban development services',
        'Mobile technology integration',
        'Informal sector partnerships',
        'Regional expansion beyond major cities'
      ];
      insights.regionalPricingConsiderations = [
        'Negotiated pricing structures',
        'Package deals for extended families',
        'Flexible payment options',
        'Regional economic condition sensitivity'
      ];
      break;

    case 'en-IN':
      insights.regionalCompetitorPatterns = [
        'Family-oriented business approaches',
        'Value-based marketing messages',
        'Digital-first customer acquisition',
        'Tiered service offerings'
      ];
      insights.culturalCompetitorAdvantages = [
        'Understanding of family decision-making',
        'Cultural festival integration',
        'Regional language capabilities',
        'Local market knowledge'
      ];
      insights.localMarketOpportunities = [
        'Festival season service packages',
        'Regional language service expansion',
        'Digital payment integration',
        'Tier 2 and Tier 3 city expansion'
      ];
      insights.regionalPricingConsiderations = [
        'Value-based pricing models',
        'Package deals for families',
        'Regional pricing variations',
        'Competitive pricing for mass market'
      ];
      break;

    case 'en-GB':
      insights.regionalCompetitorPatterns = [
        'Understated marketing approaches',
        'Professional and formal communication',
        'Quality and tradition emphasis',
        'Local community integration'
      ];
      insights.culturalCompetitorAdvantages = [
        'Understanding of British understatement',
        'Professional service delivery',
        'Local knowledge and expertise',
        'Traditional business values'
      ];
      insights.localMarketOpportunities = [
        'Regional expansion beyond London',
        'Traditional service modernization',
        'Local community partnerships',
        'Heritage and modern service blending'
      ];
      insights.regionalPricingConsiderations = [
        'Premium pricing for traditional services',
        'Competitive pricing in regional markets',
        'Transparent pricing structures',
        'Value-based pricing justifications'
      ];
      break;

    default:
      insights.regionalCompetitorPatterns = [
        'Standard professional communication',
        'Quality-focused marketing',
        'Customer service emphasis',
        'Local community involvement'
      ];
      insights.culturalCompetitorAdvantages = [
        'Cultural awareness in service delivery',
        'Local market understanding',
        'Adaptability to regional preferences',
        'Professional service standards'
      ];
      insights.localMarketOpportunities = [
        'Regional market expansion',
        'Cultural customization of services',
        'Local partnership opportunities',
        'Community engagement initiatives'
      ];
      insights.regionalPricingConsiderations = [
        'Competitive market pricing',
        'Value-based service bundles',
        'Regional cost adjustments',
        'Premium service pricing'
      ];
  }

  // Add cultural differentiation strategies based on cultural context
  insights.culturalDifferentiationStrategies = [
    `Leverage ${culturalContext.businessEtiquette.relationshipBuilding} in customer acquisition`,
    `Use ${culturalContext.communicationStyle.directness} communication to build trust`,
    `Incorporate ${culturalContext.humorStyle.acceptability === 'high' ? 'appropriate humor' : 'professional tone'} in marketing`,
    `Emphasize ${culturalContext.culturalNuances[0]?.description || 'local cultural values'} in brand messaging`
  ];

  // Add local SEO advantages
  insights.localSEOAdvantages = [
    `Location-specific keyword optimization for ${regionalContext.primaryRegion}`,
    `Regional slang and terminology integration`,
    `Local cultural references and landmarks`,
    `${culturalContext.seasonalReferences[0]?.season || 'Seasonal'} content timing optimization`,
    'Multi-region content strategy for broader reach'
  ];

  // If multiple locations, add multi-regional insights
  if (regionalContext.culturalBlend) {
    insights.localSEOAdvantages.push(
      'Multi-cultural content approach',
      'Cross-regional keyword targeting',
      'Cultural adaptation for diverse audiences',
      'Regional language variations optimization'
    );
  }

  return insights;
}

/**
 * Get region-specific keyword opportunities
 */
export function getRegionalKeywordOpportunities(location: string, baseKeywords: string[]): {
  primaryKeywords: string[];
  regionalKeywords: string[];
  longTailKeywords: string[];
  seasonalKeywords: string[];
  culturalKeywords: string[];
} {
  const regionalContext = getMultiLocationRegionalContext(location);
  const languageConfig = regionalContext.dominantLanguage;
  const culturalContext = languageConfig.culturalContext;

  const keywordOpportunities: {
    primaryKeywords: string[];
    regionalKeywords: string[];
    longTailKeywords: string[];
    seasonalKeywords: string[];
    culturalKeywords: string[];
  } = {
    primaryKeywords: baseKeywords,
    regionalKeywords: [],
    longTailKeywords: [],
    seasonalKeywords: [],
    culturalKeywords: []
  };

  // Add regional variations
  keywordOpportunities.regionalKeywords = baseKeywords.map(keyword => {
    const locationTerms = [regionalContext.primaryRegion, ...regionalContext.secondaryRegions];
    return locationTerms.map(loc => `${keyword} ${loc}`);
  }).flat();

  // Add long-tail variations with regional context
  keywordOpportunities.longTailKeywords = baseKeywords.map(keyword => [
    `${keyword} near ${regionalContext.primaryRegion}`,
    `${keyword} for ${regionalContext.primaryRegion} residents`,
    `best ${keyword} in ${regionalContext.primaryRegion}`,
    `affordable ${keyword} ${regionalContext.primaryRegion}`
  ]).flat();

  // Add seasonal keywords based on regional context
  keywordOpportunities.seasonalKeywords = culturalContext.seasonalReferences.map(season =>
    baseKeywords.map(keyword => `${keyword} ${season.season.toLowerCase()}`)
  ).flat();

  // Add cultural keywords based on local expressions
  keywordOpportunities.culturalKeywords = culturalContext.slangExpressions.slice(0, 5).map(slang =>
    baseKeywords.map(keyword => `${keyword} ${slang.slang}`)
  ).flat();

  // Add regional variations for multi-location
  if (regionalContext.culturalBlend) {
    regionalContext.secondaryRegions.forEach(region => {
      keywordOpportunities.regionalKeywords.push(...baseKeywords.map(keyword => `${keyword} ${region}`));
    });
  }

  return keywordOpportunities;
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

/**
 * Enhanced cultural analysis for content generation
 * Analyzes cultural context and provides sophisticated adaptation recommendations
 */
export interface CulturalAnalysisResult {
  primaryCulture: LanguageConfig;
  culturalDepth: number; // 1-5 scale of cultural adaptation
  adaptationStrategy: 'minimal' | 'moderate' | 'deep' | 'immersive';
  linguisticFeatures: LinguisticFeatures;
  businessCultureAdaptation: BusinessCultureAdaptation;
  contentLocalization: ContentLocalization;
  culturalSensitivity: CulturalSensitivity;
  performancePrediction: PerformancePrediction;
}

export interface LinguisticFeatures {
  formalityMapping: FormalityMapping;
  slangIntegration: SlangIntegration;
  regionalExpressionUsage: RegionalExpressionUsage;
  metaphorStyle: MetaphorStyle;
  storytellingElements: StorytellingElements;
}

export interface FormalityMapping {
  businessFormal: string[];
  professionalCasual: string[];
  friendlyInformal: string[];
  slangHeavy: string[];
}

export interface SlangIntegration {
  highImpact: SlangExpression[];
  moderateUse: SlangExpression[];
  situational: SlangExpression[];
  avoidance: SlangExpression[];
}

export interface RegionalExpressionUsage {
  recommended: Regionalism[];
  contextual: Regionalism[];
  avoidInBusiness: Regionalism[];
}

export interface MetaphorStyle {
  preferredTypes: string[];
  culturalSpecifics: string[];
  avoidedConcepts: string[];
  examples: string[];
}

export interface StorytellingElements {
  narrativeStructure: string;
  culturalArchetypes: string[];
  valuedThemes: string[];
  emotionalAppeals: string[];
}

export interface BusinessCultureAdaptation {
  communicationApproach: CommunicationApproach;
  relationshipBuilding: RelationshipBuilding;
  negotiationStrategy: NegotiationStrategy;
  trustBuilding: TrustBuilding;
  decisionMaking: DecisionMaking;
}

export interface CommunicationApproach {
  directnessLevel: number; // 1-10 scale
  emotionalRange: number; // 1-10 scale
  contextDependency: number; // 1-10 scale
  hierarchyRespect: number; // 1-10 scale
}

export interface RelationshipBuilding {
  timeInvestment: 'minimal' | 'moderate' | 'significant' | 'essential';
  personalConnection: 'low' | 'medium' | 'high' | 'essential';
  trustBasis: string[];
  rapportBuilding: string[];
}

export interface NegotiationStrategy {
  primaryFocus: string[];
  timingConsiderations: string[];
  concessionPatterns: string[];
  agreementFormalities: string[];
}

export interface TrustBuilding {
  keyFactors: string[];
  credibilitySignals: string[];
  consistencyRequirements: string[];
  longTermIndicators: string[];
}

export interface DecisionMaking {
  speed: 'rapid' | 'moderate' | 'deliberate' | 'consensus';
  influencingFactors: string[];
  stakeholderConsiderations: string[];
  riskTolerance: string[];
}

export interface ContentLocalization {
  seasonalTiming: SeasonalTiming;
  localReferences: LocalReferences;
  culturalEvents: CulturalEvents;
  geographicSpecificity: GeographicSpecificity;
}

export interface SeasonalTiming {
  businessCycles: string[];
  holidayConsiderations: string[];
  weatherImpact: string[];
  optimalTiming: string[];
}

export interface LocalReferences {
  geographicFeatures: string[];
  culturalLandmarks: string[];
  localPridePoints: string[];
  communityValues: string[];
}

export interface CulturalEvents {
  majorCelebrations: string[];
  businessImplications: string[];
  marketingOpportunities: string[];
  sensitivityPeriods: string[];
}

export interface GeographicSpecificity {
  localTerminology: string[];
  regionalIdentity: string[];
  locationBasedPride: string[];
  neighborReferences: string[];
}

export interface CulturalSensitivity {
  highRiskTopics: string[];
  moderateConcerns: string[];
  culturalTaboos: string[];
  preferredFocus: string[];
  adaptationRequired: string[];
}

export interface PerformancePrediction {
  engagementPotential: number; // 1-10 scale
  conversionProbability: number; // 1-10 scale
  shareability: number; // 1-10 scale
  brandAlignment: number; // 1-10 scale
  culturalResonance: number; // 1-10 scale
  recommendations: string[];
}

/**
 * Perform deep cultural analysis for content generation
 */
export function performCulturalAnalysis(
  location: string,
  contentPurpose: string = 'marketing',
  targetAudience: string = 'general customers',
  businessType: string = 'general'
): CulturalAnalysisResult {
  const primaryCulture = detectLanguageFromLocation(location);
  const { culturalContext } = primaryCulture;

  // Calculate cultural depth based on content purpose and audience
  const culturalDepth = calculateCulturalDepth(contentPurpose, targetAudience, culturalContext);

  // Determine adaptation strategy
  const adaptationStrategy = determineAdaptationStrategy(culturalDepth, contentPurpose);

  // Analyze linguistic features
  const linguisticFeatures = analyzeLinguisticFeatures(culturalContext, adaptationStrategy);

  // Analyze business culture adaptation
  const businessCultureAdaptation = analyzeBusinessCulture(culturalContext, businessType);

  // Analyze content localization needs
  const contentLocalization = analyzeContentLocalization(culturalContext, location);

  // Analyze cultural sensitivity requirements
  const culturalSensitivity = analyzeCulturalSensitivity(culturalContext, contentPurpose);

  // Predict performance
  const performancePrediction = predictContentPerformance(
    culturalDepth,
    adaptationStrategy,
    contentPurpose,
    culturalContext
  );

  return {
    primaryCulture,
    culturalDepth,
    adaptationStrategy,
    linguisticFeatures,
    businessCultureAdaptation,
    contentLocalization,
    culturalSensitivity,
    performancePrediction
  };
}

function calculateCulturalDepth(
  contentPurpose: string,
  targetAudience: string,
  culturalContext: CulturalContext
): number {
  let depth = 2; // Base level

  // Content purpose adjustments
  switch (contentPurpose) {
    case 'marketing':
      depth += culturalContext.humorStyle.acceptability === 'high' ? 1 : 0;
      depth += culturalContext.communicationStyle.storytellingPreference === 'high' ? 1 : 0;
      break;
    case 'conversational':
      depth += 2; // High cultural adaptation for conversational content
      break;
    case 'educational':
      depth += culturalContext.businessEtiquette.formalityLevel === 'formal' ? 1 : 0;
      break;
    case 'technical':
      depth += 0; // Lower cultural adaptation for technical content
      break;
  }

  // Audience adjustments
  if (targetAudience.includes('local') || targetAudience.includes('community')) {
    depth += 2;
  }
  if (targetAudience.includes('international') || targetAudience.includes('global')) {
    depth -= 1;
  }

  // Cultural context adjustments
  if (culturalContext.communicationStyle.directness === 'indirect') {
    depth += 1;
  }
  if (culturalContext.communicationStyle.emotionalExpression === 'high') {
    depth += 1;
  }

  return Math.max(1, Math.min(5, depth));
}

function determineAdaptationStrategy(
  culturalDepth: number,
  contentPurpose: string
): 'minimal' | 'moderate' | 'deep' | 'immersive' {
  if (culturalDepth <= 2) return 'minimal';
  if (culturalDepth <= 3) return 'moderate';
  if (culturalDepth <= 4) return 'deep';
  return 'immersive';
}

function analyzeLinguisticFeatures(
  culturalContext: CulturalContext,
  adaptationStrategy: 'minimal' | 'moderate' | 'deep' | 'immersive'
): LinguisticFeatures {
  const formalityMapping: FormalityMapping = {
    businessFormal: culturalContext.formalExpressions.slice(0, 3).map(e => e.expression),
    professionalCasual: culturalContext.formalExpressions.slice(2, 4).map(e => e.expression),
    friendlyInformal: culturalContext.slangExpressions.slice(0, 3).map(s => s.slang),
    slangHeavy: culturalContext.slangExpressions.slice(0, 5).map(s => s.slang)
  };

  const slangIntegration: SlangIntegration = {
    highImpact: culturalContext.slangExpressions.filter(s => s.formality === 'casual').slice(0, 2),
    moderateUse: culturalContext.slangExpressions.slice(2, 5),
    situational: culturalContext.slangExpressions.filter(s => s.region).slice(0, 3),
    avoidance: culturalContext.slangExpressions.filter(s => s.formality === 'slang').slice(0, 2)
  };

  const regionalExpressionUsage: RegionalExpressionUsage = {
    recommended: culturalContext.regionalisms.slice(0, 3),
    contextual: culturalContext.regionalisms.slice(3, 5),
    avoidInBusiness: culturalContext.regionalisms.filter(r => r.usageContext.includes('very informal'))
  };

  const metaphorStyle: MetaphorStyle = {
    preferredTypes: culturalContext.communicationStyle.useOfMetaphors === 'high'
      ? ['business metaphors', 'cultural references', 'nature-based']
      : ['direct comparisons', 'simple analogies'],
    culturalSpecifics: extractCulturalMetaphors(culturalContext),
    avoidedConcepts: ['sensitive religious topics', 'political controversies'],
    examples: generateMetaphorExamples(culturalContext)
  };

  const storytellingElements: StorytellingElements = {
    narrativeStructure: culturalContext.communicationStyle.storytellingPreference === 'high'
      ? 'hero\'s journey with cultural elements'
      : 'problem-solution-benefit structure',
    culturalArchetypes: extractCulturalArchetypes(culturalContext),
    valuedThemes: extractValuedThemes(culturalContext),
    emotionalAppeals: culturalContext.communicationStyle.emotionalExpression === 'high'
      ? ['inspiration', 'community', 'success', 'family']
      : ['logic', 'efficiency', 'results', 'credibility']
  };

  return {
    formalityMapping,
    slangIntegration,
    regionalExpressionUsage,
    metaphorStyle,
    storytellingElements
  };
}

function analyzeBusinessCulture(
  culturalContext: CulturalContext,
  businessType: string
): BusinessCultureAdaptation {
  const communicationApproach: CommunicationApproach = {
    directnessLevel: culturalContext.businessEtiquette.directness === 'direct' ? 8 : 4,
    emotionalRange: culturalContext.businessEtiquette.directness === 'indirect' ? 7 : 5,
    contextDependency: culturalContext.businessEtiquette.directness === 'contextual' ? 9 : 3,
    hierarchyRespect: culturalContext.businessEtiquette.formalityLevel === 'formal' ? 8 : 5
  };

  const relationshipBuilding: RelationshipBuilding = {
    timeInvestment: culturalContext.businessEtiquette.relationshipBuilding.includes('Essential')
      ? 'essential'
      : culturalContext.businessEtiquette.relationshipBuilding.includes('Crucial')
        ? 'significant'
        : 'moderate',
    personalConnection: culturalContext.communicationStyle.emotionalExpression === 'high' ? 'high' : 'medium',
    trustBasis: extractTrustBasis(culturalContext),
    rapportBuilding: extractRapportBuilding(culturalContext)
  };

  const negotiationStrategy: NegotiationStrategy = {
    primaryFocus: culturalContext.businessEtiquette.negotiationStyle.split(',').slice(0, 2),
    timingConsiderations: extractTimingConsiderations(culturalContext),
    concessionPatterns: ['relationship-focused', 'mutual benefit'],
    agreementFormalities: culturalContext.businessEtiquette.formalityLevel === 'formal'
      ? ['written contracts', 'formal signatures']
      : ['verbal agreement', 'email confirmation']
  };

  const trustBuilding: TrustBuilding = {
    keyFactors: extractTrustFactors(culturalContext),
    credibilitySignals: extractCredibilitySignals(culturalContext),
    consistencyRequirements: extractConsistencyRequirements(culturalContext),
    longTermIndicators: extractLongTermIndicators(culturalContext)
  };

  const decisionMaking: DecisionMaking = {
    speed: culturalContext.businessEtiquette.directness === 'direct' ? 'moderate' : 'deliberate',
    influencingFactors: extractInfluencingFactors(culturalContext),
    stakeholderConsiderations: extractStakeholderConsiderations(culturalContext),
    riskTolerance: [culturalContext.businessEtiquette.directness === 'direct' ? 'moderate' : 'conservative']
  };

  return {
    communicationApproach,
    relationshipBuilding,
    negotiationStrategy,
    trustBuilding,
    decisionMaking
  };
}

function analyzeContentLocalization(
  culturalContext: CulturalContext,
  location: string
): ContentLocalization {
  const seasonalTiming: SeasonalTiming = {
    businessCycles: extractBusinessCycles(culturalContext),
    holidayConsiderations: culturalContext.seasonalReferences.map(sr => sr.season),
    weatherImpact: extractWeatherImpact(culturalContext),
    optimalTiming: extractOptimalTiming(culturalContext)
  };

  const localReferences: LocalReferences = {
    geographicFeatures: [location, ...extractGeographicFeatures(culturalContext)],
    culturalLandmarks: extractCulturalLandmarks(culturalContext),
    localPridePoints: extractLocalPridePoints(culturalContext),
    communityValues: extractCommunityValues(culturalContext)
  };

  const culturalEvents: CulturalEvents = {
    majorCelebrations: culturalContext.seasonalReferences.map(sr => sr.localTerms).flat(),
    businessImplications: culturalContext.seasonalReferences.map(sr => sr.businessImpact),
    marketingOpportunities: extractMarketingOpportunities(culturalContext),
    sensitivityPeriods: extractSensitivityPeriods(culturalContext)
  };

  const geographicSpecificity: GeographicSpecificity = {
    localTerminology: culturalContext.regionalisms.map(r => r.term),
    regionalIdentity: [location],
    locationBasedPride: extractLocationBasedPride(culturalContext),
    neighborReferences: extractNeighborReferences(culturalContext)
  };

  return {
    seasonalTiming,
    localReferences,
    culturalEvents,
    geographicSpecificity
  };
}

function analyzeCulturalSensitivity(
  culturalContext: CulturalContext,
  contentPurpose: string
): CulturalSensitivity {
  const highRiskTopics = [
    ...culturalContext.humorStyle.avoidTopics,
    ...culturalContext.culturalNuances.flatMap(nuance => nuance.avoids || [])
  ];

  const moderateConcerns = extractModerateConcerns(culturalContext);

  const culturalTaboos = extractCulturalTaboos(culturalContext);

  const preferredFocus = extractPreferredFocus(culturalContext);

  const adaptationRequired = extractAdaptationRequired(culturalContext, contentPurpose);

  return {
    highRiskTopics,
    moderateConcerns,
    culturalTaboos,
    preferredFocus,
    adaptationRequired
  };
}

function predictContentPerformance(
  culturalDepth: number,
  adaptationStrategy: string,
  contentPurpose: string,
  culturalContext: CulturalContext
): PerformancePrediction {
  const baseScore = 5;

  // Cultural depth impact
  const depthBonus = culturalDepth * 0.8;

  // Adaptation strategy impact
  const strategyBonus = adaptationStrategy === 'immersive' ? 2 :
                       adaptationStrategy === 'deep' ? 1.5 :
                       adaptationStrategy === 'moderate' ? 1 : 0.5;

  // Content purpose alignment
  const purposeAlignment = culturalContext.humorStyle.acceptability === 'high' &&
                           contentPurpose === 'marketing' ? 1.5 : 0.8;

  // Communication style alignment
  const communicationBonus = culturalContext.communicationStyle.storytellingPreference === 'high' ? 1 : 0.5;

  const engagementPotential = Math.min(10, baseScore + depthBonus + strategyBonus + purposeAlignment);
  const conversionProbability = Math.min(10, engagementPotential * 0.9);
  const shareability = Math.min(10, culturalContext.communicationStyle.emotionalExpression === 'high' ?
    engagementPotential * 1.1 : engagementPotential * 0.8);
  const brandAlignment = Math.min(10, baseScore + strategyBonus + communicationBonus);
  const culturalResonance = Math.min(10, baseScore + depthBonus + communicationBonus);

  const recommendations = generatePerformanceRecommendations(
    culturalDepth,
    adaptationStrategy,
    culturalContext
  );

  return {
    engagementPotential,
    conversionProbability,
    shareability,
    brandAlignment,
    culturalResonance,
    recommendations
  };
}

// Helper functions for cultural analysis
function extractCulturalMetaphors(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .filter(nuance => nuance.impact === 'high')
    .map(nuance => nuance.description)
    .slice(0, 3);
}

function generateMetaphorExamples(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .slice(0, 2)
    .flatMap(nuance => nuance.examples)
    .slice(0, 3);
}

function extractCulturalArchetypes(culturalContext: CulturalContext): string[] {
  return ['community leader', 'wise elder', 'successful entrepreneur', 'trusted advisor'];
}

function extractValuedThemes(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .filter(nuance => nuance.impact === 'high')
    .map(nuance => nuance.description)
    .slice(0, 3);
}

function extractTrustBasis(culturalContext: CulturalContext): string[] {
  return [culturalContext.businessEtiquette.relationshipBuilding, 'professional credentials', 'local reputation'];
}

function extractRapportBuilding(culturalContext: CulturalContext): string[] {
  return culturalContext.businessEtiquette.greetingStyle.split(',').map(s => s.trim());
}

function extractTimingConsiderations(culturalContext: CulturalContext): string[] {
  return culturalContext.seasonalReferences.map(sr => sr.culturalSignificance);
}

function extractTrustFactors(culturalContext: CulturalContext): string[] {
  return culturalContext.businessEtiquette.negotiationStyle.split(',').map(s => s.trim());
}

function extractCredibilitySignals(culturalContext: CulturalContext): string[] {
  return ['professional titles', 'formal communication', 'consistent quality'];
}

function extractConsistencyRequirements(culturalContext: CulturalContext): string[] {
  return culturalContext.businessEtiquette.formalityLevel === 'formal' ?
    ['formal communication', 'proper etiquette', 'respectful address'] :
    ['friendly communication', 'relatable style', 'authentic approach'];
}

function extractLongTermIndicators(culturalContext: CulturalContext): string[] {
  return ['ongoing relationship', 'regular communication', 'community involvement'];
}

function extractInfluencingFactors(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .filter(nuance => nuance.impact === 'high')
    .map(nuance => nuance.description);
}

function extractStakeholderConsiderations(culturalContext: CulturalContext): string[] {
  return ['family impact', 'community opinion', 'business reputation'];
}

function extractBusinessCycles(culturalContext: CulturalContext): string[] {
  return culturalContext.seasonalReferences.map(sr => sr.season);
}

function extractWeatherImpact(culturalContext: CulturalContext): string[] {
  return culturalContext.seasonalReferences
    .filter(sr => sr.season.includes('summer') || sr.season.includes('rainy'))
    .map(sr => sr.culturalSignificance);
}

function extractOptimalTiming(culturalContext: CulturalContext): string[] {
  return culturalContext.seasonalReferences
    .filter(sr => sr.businessImpact.includes('High'))
    .map(sr => sr.season);
}

function extractGeographicFeatures(culturalContext: CulturalContext): string[] {
  return culturalContext.regionalisms
    .filter(r => r.region.includes('General'))
    .map(r => r.region);
}

function extractCulturalLandmarks(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .map(nuance => nuance.description)
    .slice(0, 2);
}

function extractLocalPridePoints(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .filter(nuance => nuance.impact === 'high')
    .map(nuance => nuance.description);
}

function extractCommunityValues(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .flatMap(nuance => nuance.examples)
    .slice(0, 3);
}

function extractMarketingOpportunities(culturalContext: CulturalContext): string[] {
  return culturalContext.seasonalReferences
    .filter(sr => sr.businessImpact.includes('High'))
    .map(sr => sr.season);
}

function extractSensitivityPeriods(culturalContext: CulturalContext): string[] {
  return culturalContext.humorStyle.avoidTopics.map(topic => `avoid ${topic} references`);
}

function extractLocationBasedPride(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .filter(nuance => nuance.impact === 'high')
    .map(nuance => nuance.description);
}

function extractNeighborReferences(culturalContext: CulturalContext): string[] {
  return culturalContext.regionalisms.map(r => r.region).filter(r => r !== 'General');
}

function extractModerateConcerns(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .filter(nuance => nuance.impact === 'medium')
    .map(nuance => nuance.description);
}

function extractCulturalTaboos(culturalContext: CulturalContext): string[] {
  return culturalContext.humorStyle.avoidTopics;
}

function extractPreferredFocus(culturalContext: CulturalContext): string[] {
  return culturalContext.culturalNuances
    .filter(nuance => nuance.impact === 'high')
    .flatMap(nuance => nuance.examples);
}

function extractAdaptationRequired(culturalContext: CulturalContext, contentPurpose: string): string[] {
  const adaptations = [];

  if (culturalContext.businessEtiquette.formalityLevel === 'formal') {
    adaptations.push('formal address and respectful language');
  }

  if (culturalContext.communicationStyle.directness === 'indirect') {
    adaptations.push('nuanced and suggestive communication');
  }

  if (culturalContext.humorStyle.acceptability === 'low' && contentPurpose === 'marketing') {
    adaptations.push('conservative humor approach');
  }

  return adaptations;
}

function generatePerformanceRecommendations(
  culturalDepth: number,
  adaptationStrategy: string,
  culturalContext: CulturalContext
): string[] {
  const recommendations = [];

  if (culturalDepth >= 4) {
    recommendations.push('Deep cultural integration will significantly boost engagement');
  }

  if (culturalContext.communicationStyle.storytellingPreference === 'high') {
    recommendations.push('Use narrative structures and cultural storytelling');
  }

  if (culturalContext.humorStyle.acceptability === 'high') {
    recommendations.push('Include culturally appropriate humor for higher shareability');
  }

  if (adaptationStrategy === 'immersive') {
    recommendations.push('Full cultural immersion approach will maximize authenticity');
  }

  recommendations.push('Monitor cultural response and adjust approach accordingly');

  return recommendations;
}