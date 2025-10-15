/**
 * Service and product extraction utilities for analyzing website business offerings
 */

import { WebsiteAnalysisResult, CrawledPage } from './website-crawler';

export interface BusinessService {
  name: string;
  category: string;
  description: string;
  priceIndicator?: 'budget' | 'mid-range' | 'premium' | 'enterprise';
  targetAudience: string[];
  features: string[];
  urgencyLevel: 'emergency' | 'urgent' | 'routine' | 'consultation';
  localService: boolean;
  specialization?: string;
  categories: string[];
  qualityIndicators?: string[];
  availability?: string;
}

export interface BusinessProduct {
  name: string;
  category: string;
  description: string;
  priceRange?: string;
  features: string[];
  targetAudience: string[];
  variants?: string[];
}

export interface BusinessOfferings {
  services: BusinessService[];
  products: BusinessProduct[];
  businessType: string;
  primaryCategories: string[];
  valuePropositions: string[];
  targetAudiences: string[];
  serviceAreas: string[];
  emergencyServices: BusinessService[];
  uniqueSellingPoints: string[];
}

export class ServiceExtractor {
  private serviceIndicators = [
    'service', 'services', 'solution', 'solutions', 'offering', 'offerings',
    'repair', 'install', 'installation', 'maintenance', 'support', 'consulting',
    'cleaning', 'delivery', 'training', 'coaching', 'advisory', 'assessment',
    'audit', 'inspection', 'testing', 'analysis', 'design', 'development',
    'management', 'optimization', 'implementation', 'configuration'
  ];

  private productIndicators = [
    'product', 'products', 'item', 'items', 'package', 'packages',
    'plan', 'plans', 'subscription', 'tool', 'tools', 'software',
    'hardware', 'equipment', 'device', 'system', 'platform'
  ];

  private emergencyIndicators = [
    'emergency', '24/7', '24 hour', 'urgent', 'immediate', 'same day',
    'asap', 'critical', 'priority', 'rush', 'express', 'after hours'
  ];

  private pricingIndicators = {
    budget: ['affordable', 'budget', 'cheap', 'low cost', 'economy', 'starter'],
    midRange: ['professional', 'standard', 'business', 'commercial'],
    premium: ['premium', 'luxury', 'high-end', 'elite', 'enterprise', 'advanced'],
    enterprise: ['enterprise', 'corporate', 'large scale', 'organization']
  };

  extractBusinessOfferings(websiteAnalysis: WebsiteAnalysisResult): BusinessOfferings {
    console.log('🔍 [SERVICE EXTRACTOR] Starting business offerings analysis');

    const services = this.extractServices(websiteAnalysis);
    const products = this.extractProducts(websiteAnalysis);
    const businessType = this.inferBusinessType(websiteAnalysis, services, products);
    const primaryCategories = this.extractPrimaryCategories(websiteAnalysis, services, products);
    const valuePropositions = this.extractValuePropositions(websiteAnalysis);
    const targetAudiences = this.extractTargetAudiences(websiteAnalysis);
    const serviceAreas = this.extractServiceAreas(websiteAnalysis);
    const emergencyServices = this.extractEmergencyServices(services);
    const uniqueSellingPoints = this.extractUniqueSellingPoints(websiteAnalysis);

    const offerings: BusinessOfferings = {
      services,
      products,
      businessType,
      primaryCategories,
      valuePropositions,
      targetAudiences,
      serviceAreas,
      emergencyServices,
      uniqueSellingPoints
    };

    console.log('✅ [SERVICE EXTRACTOR] Business offerings analysis completed', {
      servicesCount: services.length,
      productsCount: products.length,
      businessType,
      primaryCategories: primaryCategories.length,
      emergencyServices: emergencyServices.length
    });

    return offerings;
  }

  private extractServices(websiteAnalysis: WebsiteAnalysisResult): BusinessService[] {
    const services: BusinessService[] = [];
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ').toLowerCase();
    const titlesAndHeadings = [
      ...websiteAnalysis.crawledPages.map(p => p.title),
      ...websiteAnalysis.crawledPages.flatMap(p => [...p.headings.h1, ...p.headings.h2, ...p.headings.h3])
    ].join(' ').toLowerCase();

    // Service pattern matching
    const servicePatterns = [
      // Pattern: "We offer [service] for [audience]"
      /(?:we offer|our services include|we provide|specializing in)\s+([^,.!?]+)(?:\s+for|\s+to|\s+in)?\s*([^,.!?]+)/gi,
      // Pattern: "[Service] services"
      /(\w+(?:\s+\w+)?)\s+(?:service|services|solution|solutions)/gi,
      // Pattern: "Professional [service]"
      /(?:professional|expert|certified)\s+(\w+(?:\s+\w+)?)(?:\s+service)?/gi,
      // Pattern: Action-based services
      /(\w+(?:\s+\w+)?)\s+(?:repair|install|installation|maintenance|cleaning|support|consulting)/gi
    ];

    servicePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const serviceName = this.cleanServiceName(match[1]);
        if (this.isValidService(serviceName)) {
          const service = this.buildServiceDetails(serviceName, websiteAnalysis);
          if (!services.some(s => s.name.toLowerCase() === service.name.toLowerCase())) {
            services.push(service);
          }
        }
      }
    });

    // Extract services from navigation and page structure
    websiteAnalysis.crawledPages.forEach(page => {
      const pageText = (page.title + ' ' + page.headings.h1.join(' ') + ' ' + page.headings.h2.join(' ')).toLowerCase();

      // Look for service pages
      if (this.serviceIndicators.some(indicator => pageText.includes(indicator))) {
        const potentialServices = this.extractServicesFromPage(page);
        potentialServices.forEach(service => {
          if (!services.some(s => s.name.toLowerCase() === service.name.toLowerCase())) {
            services.push(service);
          }
        });
      }
    });

    return services.slice(0, 15); // Limit to top 15 services
  }

  private extractProducts(websiteAnalysis: WebsiteAnalysisResult): BusinessProduct[] {
    const products: BusinessProduct[] = [];
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ').toLowerCase();

    // Product pattern matching
    const productPatterns = [
      // Pattern: "Product: [name]"
      /(?:product|item):\s*([^,.!?]+)/gi,
      // Pattern: "[Name] software/tool/platform"
      /(\w+(?:\s+\w+)?)\s+(?:software|tool|platform|system|device)/gi,
      // Pattern: "Our [products]"
      /our\s+(\w+(?:\s+\w+)?)\s+(?:product|products|package|packages)/gi
    ];

    productPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const productName = this.cleanProductName(match[1]);
        if (this.isValidProduct(productName)) {
          const product = this.buildProductDetails(productName, websiteAnalysis);
          if (!products.some(p => p.name.toLowerCase() === product.name.toLowerCase())) {
            products.push(product);
          }
        }
      }
    });

    return products.slice(0, 10); // Limit to top 10 products
  }

  private extractServicesFromPage(page: CrawledPage): BusinessService[] {
    const services: BusinessService[] = [];
    const pageText = (page.title + ' ' + page.content).toLowerCase();

    // Extract service name from title
    const titleService = this.extractServiceFromText(page.title);
    if (titleService) {
      services.push(this.buildServiceDetails(titleService, { crawledPages: [page] } as WebsiteAnalysisResult));
    }

    // Extract services from headings
    [...page.headings.h1, ...page.headings.h2].forEach(heading => {
      const service = this.extractServiceFromText(heading);
      if (service) {
        const serviceDetails = this.buildServiceDetails(service, { crawledPages: [page] } as WebsiteAnalysisResult);
        if (!services.some(s => s.name.toLowerCase() === serviceDetails.name.toLowerCase())) {
          services.push(serviceDetails);
        }
      }
    });

    return services;
  }

  private extractServiceFromText(text: string): string | null {
    const cleanText = text.toLowerCase().trim();

    // Check for service indicators
    if (this.serviceIndicators.some(indicator => cleanText.includes(indicator))) {
      // Extract the main service name
      const patterns = [
        /^(.+) (?:service|services|solution|solutions)$/,
        /^(?:professional|expert|certified) (.+)$/,
        /^(.+) (?:repair|install|installation|maintenance|cleaning)$/
      ];

      for (const pattern of patterns) {
        const match = cleanText.match(pattern);
        if (match) {
          return this.cleanServiceName(match[1]);
        }
      }

      // If no pattern matches, use the whole text if it seems like a service
      if (cleanText.length > 5 && cleanText.length < 50) {
        return this.cleanServiceName(cleanText);
      }
    }

    return null;
  }

  private buildServiceDetails(serviceName: string, websiteAnalysis: WebsiteAnalysisResult): BusinessService {
    const serviceText = serviceName.toLowerCase();
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ').toLowerCase();

    // Determine category
    const category = this.determineServiceCategory(serviceText);

    // Extract description from surrounding text
    const description = this.extractServiceDescription(serviceName, allText);

    // Determine price indicator
    const priceIndicator = this.determinePriceIndicator(serviceText + ' ' + description);

    // Extract target audience
    const targetAudience = this.extractServiceTargetAudience(serviceName, allText);

    // Extract features
    const features = this.extractServiceFeatures(serviceName, allText);

    // Determine urgency level
    const urgencyLevel = this.determineUrgencyLevel(serviceText + ' ' + description);

    // Check if it's a local service
    const localService = this.isLocalService(serviceText, allText);

    return {
      name: this.capitalizeWords(serviceName),
      category,
      description,
      priceIndicator,
      targetAudience,
      features,
      urgencyLevel,
      localService,
      specialization: this.determineSpecialization(serviceText, allText),
      categories: [category, 'general'], // Include category and default
      qualityIndicators: this.extractQualityIndicators(serviceText + ' ' + description),
      availability: this.extractAvailability(serviceText + ' ' + description)
    };
  }

  private buildProductDetails(productName: string, websiteAnalysis: WebsiteAnalysisResult): BusinessProduct {
    const productText = productName.toLowerCase();
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ').toLowerCase();

    // Determine category
    const category = this.determineProductCategory(productText);

    // Extract description
    const description = this.extractProductDescription(productName, allText);

    // Extract price range
    const priceRange = this.extractPriceRange(productName, allText);

    // Extract target audience
    const targetAudience = this.extractProductTargetAudience(productName, allText);

    // Extract features
    const features = this.extractProductFeatures(productName, allText);

    return {
      name: this.capitalizeWords(productName),
      category,
      description,
      priceRange,
      targetAudience,
      features
    };
  }

  private determineServiceCategory(serviceText: string): string {
    const categories = {
      'maintenance': ['maintenance', 'repair', 'fix', 'service', 'upkeep'],
      'installation': ['install', 'installation', 'setup', 'configure', 'implement'],
      'consulting': ['consulting', 'advisory', 'coaching', 'guidance', 'expert advice'],
      'cleaning': ['cleaning', 'janitorial', 'maid', 'housekeeping', 'pressure wash'],
      'design': ['design', 'creative', 'branding', 'graphic', 'web design'],
      'technology': ['it', 'tech', 'software', 'hardware', 'network', 'security'],
      'marketing': ['marketing', 'seo', 'advertising', 'promotion', 'social media'],
      'financial': ['accounting', 'bookkeeping', 'tax', 'financial', 'payroll'],
      'legal': ['legal', 'law', 'attorney', 'compliance', 'contract'],
      'education': ['training', 'education', 'tutoring', 'courses', 'learning']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => serviceText.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private determineProductCategory(productText: string): string {
    const categories = {
      'software': ['software', 'app', 'application', 'program'],
      'hardware': ['hardware', 'device', 'equipment', 'machine'],
      'subscription': ['subscription', 'membership', 'plan', 'package'],
      'digital': ['digital', 'online', 'virtual', 'download'],
      'physical': ['physical', 'tangible', 'product', 'item']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => productText.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private extractServiceDescription(serviceName: string, allText: string): string {
    // Look for sentences that mention the service
    const sentences = allText.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence =>
      sentence.toLowerCase().includes(serviceName.toLowerCase()) &&
      sentence.length > 20 &&
      sentence.length < 200
    );

    if (relevantSentences.length > 0) {
      return this.capitalizeWords(relevantSentences[0].trim());
    }

    return `Professional ${serviceName} solutions for your business needs.`;
  }

  private extractProductDescription(productName: string, allText: string): string {
    const sentences = allText.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence =>
      sentence.toLowerCase().includes(productName.toLowerCase()) &&
      sentence.length > 20 &&
      sentence.length < 200
    );

    if (relevantSentences.length > 0) {
      return this.capitalizeWords(relevantSentences[0].trim());
    }

    return `High-quality ${productName} designed to meet your needs.`;
  }

  private determinePriceIndicator(text: string): 'budget' | 'mid-range' | 'premium' | 'enterprise' {
    const lowerText = text.toLowerCase();

    for (const [level, keywords] of Object.entries(this.pricingIndicators)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return level as 'budget' | 'mid-range' | 'premium' | 'enterprise';
      }
    }

    return 'mid-range';
  }

  private extractServiceTargetAudience(serviceName: string, allText: string): string[] {
    const audiences = [
      'small businesses', 'large enterprises', 'homeowners', 'renters',
      'startups', 'established businesses', 'individuals', 'families',
      'professionals', 'students', 'seniors', 'business owners'
    ];

    const serviceContext = allText.toLowerCase().split('.').find(sentence =>
      sentence.includes(serviceName.toLowerCase())
    ) || '';

    return audiences.filter(audience => serviceContext.includes(audience)).slice(0, 3);
  }

  private extractProductTargetAudience(productName: string, allText: string): string[] {
    const audiences = [
      'businesses', 'consumers', 'professionals', 'students',
      'home users', 'enterprise', 'small business', 'individuals'
    ];

    const productContext = allText.toLowerCase().split('.').find(sentence =>
      sentence.includes(productName.toLowerCase())
    ) || '';

    return audiences.filter(audience => productContext.includes(audience)).slice(0, 3);
  }

  private extractServiceFeatures(serviceName: string, allText: string): string[] {
    const features: string[] = [];
    const serviceContext = allText.toLowerCase().split('.').filter(sentence =>
      sentence.includes(serviceName.toLowerCase())
    );

    // Look for feature indicators
    const featurePatterns = [
      'includes', 'features', 'offers', 'provides', 'comes with',
      'benefits', 'advantages', 'highlights', 'specifications'
    ];

    serviceContext.forEach(sentence => {
      if (featurePatterns.some(pattern => sentence.includes(pattern))) {
        // Extract potential features from the sentence
        const words = sentence.split(' ');
        for (let i = 0; i < words.length - 2; i++) {
          const phrase = words.slice(i, i + 3).join(' ');
          if (phrase.length > 10 && phrase.length < 50 && !phrase.includes(serviceName.toLowerCase())) {
            features.push(this.capitalizeWords(phrase.trim()));
          }
        }
      }
    });

    return [...new Set(features)].slice(0, 5);
  }

  private extractProductFeatures(productName: string, allText: string): string[] {
    const features: string[] = [];
    const productContext = allText.toLowerCase().split('.').filter(sentence =>
      sentence.includes(productName.toLowerCase())
    );

    const featurePatterns = [
      'includes', 'features', 'specifications', 'comes with', 'has'
    ];

    productContext.forEach(sentence => {
      if (featurePatterns.some(pattern => sentence.includes(pattern))) {
        const words = sentence.split(' ');
        for (let i = 0; i < words.length - 2; i++) {
          const phrase = words.slice(i, i + 3).join(' ');
          if (phrase.length > 10 && phrase.length < 50 && !phrase.includes(productName.toLowerCase())) {
            features.push(this.capitalizeWords(phrase.trim()));
          }
        }
      }
    });

    return [...new Set(features)].slice(0, 5);
  }

  private determineUrgencyLevel(text: string): 'emergency' | 'urgent' | 'routine' | 'consultation' {
    const lowerText = text.toLowerCase();

    if (this.emergencyIndicators.some(indicator => lowerText.includes(indicator))) {
      return 'emergency';
    }

    if (lowerText.includes('urgent') || lowerText.includes('priority')) {
      return 'urgent';
    }

    if (lowerText.includes('consultation') || lowerText.includes('advisory')) {
      return 'consultation';
    }

    return 'routine';
  }

  private isLocalService(serviceText: string, allText: string): boolean {
    const localIndicators = [
      'local', 'near me', 'in [city]', 'service area', 'your area',
      'on-site', 'in-home', 'at your location', 'we come to you'
    ];

    const combinedText = (serviceText + ' ' + allText).toLowerCase();
    return localIndicators.some(indicator => combinedText.includes(indicator));
  }

  private extractPriceRange(productName: string, allText: string): string | undefined {
    const pricePatterns = [
      /\$(\d+(?:,\d+)*(?:\.\d+)?)/g,  // $XX, $XXX, $X,XXX
      /(\d+(?:,\d+)*(?:\.\d+)?)\s*dollars?/gi,  // XX dollars
      /(\d+(?:,\d+)*)\s*-\s*(\d+(?:,\d+)*)/g  // XX - XX
    ];

    const productContext = allText.toLowerCase().split('.').find(sentence =>
      sentence.includes(productName.toLowerCase())
    ) || '';

    for (const pattern of pricePatterns) {
      const match = productContext.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  private inferBusinessType(
    websiteAnalysis: WebsiteAnalysisResult,
    services: BusinessService[],
    products: BusinessProduct[]
  ): string {
    const domain = websiteAnalysis.domain.toLowerCase();
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ').toLowerCase();

    if (services.length > products.length) {
      // Service-based business
      if (domain.includes('consulting') || allText.includes('consulting')) return 'consulting';
      if (domain.includes('repair') || allText.includes('repair')) return 'repair services';
      if (domain.includes('cleaning') || allText.includes('cleaning')) return 'cleaning services';
      if (domain.includes('design') || allText.includes('design')) return 'design agency';
      if (domain.includes('marketing') || allText.includes('marketing')) return 'marketing agency';
      return 'service business';
    } else if (products.length > 0) {
      // Product-based business
      if (allText.includes('software') || allText.includes('app')) return 'software company';
      if (allText.includes('ecommerce') || allText.includes('shop')) return 'ecommerce';
      return 'product business';
    }

    return 'general business';
  }

  private extractPrimaryCategories(
    websiteAnalysis: WebsiteAnalysisResult,
    services: BusinessService[],
    products: BusinessProduct[]
  ): string[] {
    const categories = new Set<string>();

    services.forEach(service => categories.add(service.category));
    products.forEach(product => categories.add(product.category));

    // Also extract from topics
    websiteAnalysis.topics.slice(0, 10).forEach(topic => {
      const category = this.determineServiceCategory(topic.toLowerCase());
      if (category !== 'general') {
        categories.add(category);
      }
    });

    return Array.from(categories).slice(0, 5);
  }

  private extractValuePropositions(websiteAnalysis: WebsiteAnalysisResult): string[] {
    const propositions: string[] = [];
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ');

    const valuePatterns = [
      /(?:we offer|we provide|our) ([^.!?]+)/gi,
      /(?:specialize in|expert in|focused on) ([^.!?]+)/gi,
      /(?:committed to|dedicated to) ([^.!?]+)/gi
    ];

    valuePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const proposition = match[1].trim();
        if (proposition.length > 10 && proposition.length < 100) {
          propositions.push(this.capitalizeWords(proposition));
        }
      }
    });

    return [...new Set(propositions)].slice(0, 3);
  }

  private extractTargetAudiences(websiteAnalysis: WebsiteAnalysisResult): string[] {
    const audiences = new Set<string>();
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ').toLowerCase();

    const audienceKeywords = [
      'small businesses', 'large enterprises', 'homeowners', 'business owners',
      'professionals', 'individuals', 'families', 'students', 'seniors',
      'startups', 'established businesses', 'consumers', 'enterprise'
    ];

    audienceKeywords.forEach(audience => {
      if (allText.includes(audience)) {
        audiences.add(audience);
      }
    });

    return Array.from(audiences).slice(0, 5);
  }

  private extractServiceAreas(websiteAnalysis: WebsiteAnalysisResult): string[] {
    const areas = new Set<string>();
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ');

    // Look for location indicators
    const locationPatterns = [
      /(?:serving|service area|locations?) ([^.!?]+)/gi,
      /(?:located in|based in) ([^.!?]+)/gi,
      /(?:we serve|covering) ([^.!?]+)/gi
    ];

    locationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const area = match[1].trim();
        if (area.length > 3 && area.length < 50) {
          areas.add(area);
        }
      }
    });

    return Array.from(areas).slice(0, 5);
  }

  private extractEmergencyServices(services: BusinessService[]): BusinessService[] {
    return services
      .filter(service => service.urgencyLevel === 'emergency');
  }

  private extractUniqueSellingPoints(websiteAnalysis: WebsiteAnalysisResult): string[] {
    const points: string[] = [];
    const allText = websiteAnalysis.crawledPages.map(page => page.content).join(' ');

    const uspPatterns = [
      /(?:what makes us different|why choose us|our advantage) ([^.!?]+)/gi,
      /(?:unlike|different from|better than) ([^.!?]+)/gi,
      /(?:unique|special|exclusive) ([^.!?]+)/gi
    ];

    uspPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const point = match[1].trim();
        if (point.length > 10 && point.length < 100) {
          points.push(this.capitalizeWords(point));
        }
      }
    });

    return [...new Set(points)].slice(0, 3);
  }

  // Helper methods
  private cleanServiceName(name: string): string {
    return name
      .replace(/^(the |a |an )/i, '')
      .replace(/\s+(service|services|solution|solutions)$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private cleanProductName(name: string): string {
    return name
      .replace(/^(the |a |an )/i, '')
      .replace(/\s+(product|products|item|items)$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isValidService(name: string): boolean {
    return name.length > 3 &&
           name.length < 50 &&
           !/^(click|here|more|info|contact|about|home)$/i.test(name) &&
           !name.match(/^\d+$/);
  }

  private isValidProduct(name: string): boolean {
    return name.length > 3 &&
           name.length < 50 &&
           !/^(click|here|more|info|contact|about|home)$/i.test(name) &&
           !name.match(/^\d+$/);
  }

  private determineSpecialization(serviceText: string, allText: string): string | undefined {
    const specializationIndicators = [
      'specialized', 'specialist', 'expert', 'certified', 'licensed',
      'professional', 'master', 'advanced', 'expertise', 'niche'
    ];

    const combinedText = (serviceText + ' ' + allText).toLowerCase();

    if (specializationIndicators.some(indicator => combinedText.includes(indicator))) {
      return 'specialized';
    }

    return undefined;
  }

  private extractQualityIndicators(text: string): string[] {
    const qualityTerms = [
      'certified', 'licensed', 'insured', 'guaranteed', 'warranty',
      'quality', 'professional', 'expert', 'trained', 'experienced',
      'award winning', 'best rated', 'top rated', '5 star', 'five star',
      'approved', 'accredited', 'verified', 'trusted'
    ];

    const lowerText = text.toLowerCase();
    const foundIndicators = qualityTerms.filter(term => lowerText.includes(term));

    return [...new Set(foundIndicators)];
  }

  private extractAvailability(text: string): string | undefined {
    const availabilityPatterns = [
      '24/7', '24 hours', '24 hour', 'around the clock',
      'same day', 'next day', 'emergency', 'after hours',
      'weekends', 'holidays', 'on call'
    ];

    const lowerText = text.toLowerCase();

    for (const pattern of availabilityPatterns) {
      if (lowerText.includes(pattern)) {
        return pattern;
      }
    }

    return undefined;
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Singleton instance
let serviceExtractor: ServiceExtractor | null = null;

export function getServiceExtractor(): ServiceExtractor {
  if (!serviceExtractor) {
    serviceExtractor = new ServiceExtractor();
  }
  return serviceExtractor;
}

// Export helper function
export function extractBusinessOfferings(websiteAnalysis: WebsiteAnalysisResult): BusinessOfferings {
  const extractor = getServiceExtractor();
  return extractor.extractBusinessOfferings(websiteAnalysis);
}