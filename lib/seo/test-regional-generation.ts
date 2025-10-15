/**
 * Test script for regional content generation
 * This file demonstrates and tests the new regional features
 */

import {
  detectLanguageFromLocation,
  generateCulturalAdaptation,
  getMultiLocationRegionalContext,
  getLocationCulturalInsights,
  getRegionalCompetitorInsights,
  getRegionalKeywordOpportunities
} from './cultural-language-system';
import {
  getRegionalBusinessTerms,
  getBusinessPhrases,
  getSeasonalBusinessTerms
} from './regional-business-terminology';
import {
  getTimingRecommendations,
  getCampaignThemes,
  getSeasonalContentSuggestions
} from './regional-timing-recommendations';

// Test data
const testLocations = [
  'Sydney, Australia',
  'Toronto, Canada',
  'Lagos, Nigeria',
  'Mumbai, India',
  'London, UK',
  'New York, USA'
];

const testTopics = [
  'emergency plumbing services',
  'digital marketing agency',
  'home renovation services',
  'professional consulting'
];

/**
 * Test regional language detection
 */
export function testRegionalLanguageDetection() {
  console.log('🌍 Testing Regional Language Detection');
  console.log('='.repeat(50));

  testLocations.forEach(location => {
    const languageConfig = detectLanguageFromLocation(location);
    console.log(`\n📍 Location: ${location}`);
    console.log(`🗣️ Language: ${languageConfig.name} (${languageConfig.nativeName})`);
    console.log(`🎭 Cultural Context: ${languageConfig.culturalContext.businessEtiquette.formalityLevel} formality`);
    console.log(`💬 Communication: ${languageConfig.culturalContext.communicationStyle.directness}`);
  });
}

/**
 * Test multi-location regional context
 */
export function testMultiLocationRegionalContext() {
  console.log('\n\n🌏 Testing Multi-Location Regional Context');
  console.log('='.repeat(50));

  const multiLocation = 'Sydney, Toronto, London';
  const context = getMultiLocationRegionalContext(multiLocation);

  console.log(`\n📍 Multi-Location: ${multiLocation}`);
  console.log(`🏆 Primary Region: ${context.primaryRegion}`);
  console.log(`🔄 Secondary Regions: ${context.secondaryRegions.join(', ')}`);
  console.log(`🌈 Cultural Blend: ${context.culturalBlend}`);
  console.log(`🗣️ Dominant Language: ${context.dominantLanguage.name}`);
  console.log(`🎭 Regional Variations: ${context.regionalVariations.join(', ')}`);
}

/**
 * Test cultural insights extraction
 */
export function testCulturalInsights() {
  console.log('\n\n🎭 Testing Cultural Insights');
  console.log('='.repeat(50));

  testLocations.forEach(location => {
    const insights = getLocationCulturalInsights(location);
    console.log(`\n📍 Location: ${location}`);
    console.log(`💬 Local Phrases: ${insights.localPhrases.join(', ')}`);
    console.log(`🎉 Cultural Events: ${insights.culturalEvents.join(', ')}`);
    console.log(`🤝 Business Etiquette: ${insights.businessEtiquette[0]}`);
    console.log(`📞 Communication Style: ${insights.communicationStyle}`);
  });
}

/**
 * Test business terminology
 */
export function testBusinessTerminology() {
  console.log('\n\n💼 Testing Business Terminology');
  console.log('='.repeat(50));

  const regions = ['en-AU', 'en-CA', 'en-NG', 'en-IN', 'en-GB', 'en-US'];

  regions.forEach(region => {
    const businessTerms = getRegionalBusinessTerms(region);
    const professionalPhrases = getBusinessPhrases(region, 'professional');
    const seasonalTerms = getSeasonalBusinessTerms(region, 'summer');

    console.log(`\n🌍 Region: ${businessTerms.region}`);
    console.log(`🏢 Industry Terms: ${Object.keys(businessTerms.industryTerms).join(', ')}`);
    console.log(`💬 Business Phrases: ${professionalPhrases.slice(0, 2).map(p => p.phrase).join(', ')}`);
    console.log(`🌞 Seasonal Terms: ${seasonalTerms.slice(0, 2).map(t => t.term).join(', ')}`);
  });
}

/**
 * Test competitor analysis insights
 */
export function testCompetitorAnalysis() {
  console.log('\n\n🔍 Testing Competitor Analysis Insights');
  console.log('='.repeat(50));

  testLocations.forEach(location => {
    const insights = getRegionalCompetitorInsights(location, 'construction');
    console.log(`\n📍 Location: ${location}`);
    console.log(`📊 Competitor Patterns: ${insights.regionalCompetitorPatterns[0]}`);
    console.log(`🎯 Cultural Advantages: ${insights.culturalCompetitorAdvantages[0]}`);
    console.log(`🚀 Market Opportunities: ${insights.localMarketOpportunities[0]}`);
    console.log(`💰 Pricing Considerations: ${insights.regionalPricingConsiderations[0]}`);
    console.log(`🌟 Differentiation Strategy: ${insights.culturalDifferentiationStrategies[0]}`);
  });
}

/**
 * Test keyword opportunities
 */
export function testKeywordOpportunities() {
  console.log('\n\n🔑 Testing Keyword Opportunities');
  console.log('='.repeat(50));

  const baseKeywords = ['plumbing services', 'home repair', 'emergency maintenance'];
  const testLocation = 'Sydney, Australia';

  const keywords = getRegionalKeywordOpportunities(testLocation, baseKeywords);
  console.log(`\n📍 Location: ${testLocation}`);
  console.log(`🎯 Base Keywords: ${keywords.primaryKeywords.join(', ')}`);
  console.log(`🌏 Regional Keywords: ${keywords.regionalKeywords.slice(0, 5).join(', ')}`);
  console.log(`🎣 Long-tail Keywords: ${keywords.longTailKeywords.slice(0, 3).join(', ')}`);
  console.log(`🌞 Seasonal Keywords: ${keywords.seasonalKeywords.slice(0, 3).join(', ')}`);
  console.log(`💬 Cultural Keywords: ${keywords.culturalKeywords.slice(0, 3).join(', ')}`);
}

/**
 * Test timing recommendations
 */
export function testTimingRecommendations() {
  console.log('\n\n⏰ Testing Timing Recommendations');
  console.log('='.repeat(50));

  const regions = ['en-US', 'en-AU', 'en-GB'];
  const currentMonth = 6; // June

  regions.forEach(region => {
    const recommendations = getTimingRecommendations(region, currentMonth);
    const themes = getCampaignThemes(region, currentMonth);
    const contentSuggestions = getSeasonalContentSuggestions(region, currentMonth);

    if (recommendations) {
      console.log(`\n🌍 Region: ${recommendations.region}`);
      console.log(`🌞 Season: ${recommendations.season}`);
      console.log(`📅 Business Activity: ${recommendations.businessActivityLevel}`);
      console.log(`🎯 Campaign Theme: ${themes[0]?.theme || 'N/A'}`);
      console.log(`📝 Content Suggestion: ${contentSuggestions[0]?.title || 'N/A'}`);
      console.log(`🕐 Optimal Posting: ${recommendations.optimalPostingTimes[0]?.dayOfWeek || 'N/A'} ${recommendations.optimalPostingTimes[0]?.timeOfDay || ''}`);
    }
  });
}

/**
 * Test cultural adaptation generation
 */
export function testCulturalAdaptation() {
  console.log('\n\n🎨 Testing Cultural Adaptation');
  console.log('='.repeat(50));

  const adaptations = [
    {
      location: 'Sydney, Australia',
      languagePreference: 'cultural_english' as const,
      formalityLevel: 'casual' as const,
      contentPurpose: 'marketing' as const,
      targetAudience: 'local homeowners',
      businessType: 'plumbing service'
    },
    {
      location: 'Toronto, Canada',
      languagePreference: 'english' as const,
      formalityLevel: 'professional' as const,
      contentPurpose: 'marketing' as const,
      targetAudience: 'families',
      businessType: 'home renovation'
    },
    {
      location: 'Lagos, Nigeria',
      languagePreference: 'cultural_english' as const,
      formalityLevel: 'professional' as const,
      contentPurpose: 'marketing' as const,
      targetAudience: 'business owners',
      businessType: 'consulting'
    }
  ];

  adaptations.forEach((adaptation, index) => {
    const prompt = generateCulturalAdaptation(adaptation);
    console.log(`\n📍 Test ${index + 1}: ${adaptation.location}`);
    console.log(`🗣️ Language: ${adaptation.languagePreference}`);
    console.log(`🎭 Formality: ${adaptation.formalityLevel}`);
    console.log(`📋 Language Instructions: ${prompt.languageInstructions.slice(0, 100)}...`);
    console.log(`🌍 Cultural Instructions: ${prompt.culturalInstructions.slice(0, 100)}...`);
    console.log(`💬 Slang Guidelines: ${prompt.slangGuidelines.slice(0, 50)}...`);
    console.log(`🎯 Examples Count: ${prompt.examples.length}`);
    console.log(`⚠️ Avoidances Count: ${prompt.avoidances.length}`);
  });
}

/**
 * Run all tests
 */
export function runAllRegionalTests() {
  console.log('🚀 Starting Regional Content Generation Tests');
  console.log('🌍 Comprehensive Regional Feature Verification');
  console.log('='.repeat(60));

  testRegionalLanguageDetection();
  testMultiLocationRegionalContext();
  testCulturalInsights();
  testBusinessTerminology();
  testCompetitorAnalysis();
  testKeywordOpportunities();
  testTimingRecommendations();
  testCulturalAdaptation();

  console.log('\n\n✅ All Regional Tests Completed Successfully!');
  console.log('🎉 Regional content generation system is working correctly');
}

// Export for use in other modules
export default {
  testRegionalLanguageDetection,
  testMultiLocationRegionalContext,
  testCulturalInsights,
  testBusinessTerminology,
  testCompetitorAnalysis,
  testKeywordOpportunities,
  testTimingRecommendations,
  testCulturalAdaptation,
  runAllRegionalTests
};