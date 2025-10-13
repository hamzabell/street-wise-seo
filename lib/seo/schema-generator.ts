/**
 * Local Business Schema Generator for SEO
 * Generates structured data (JSON-LD) for local businesses to help with Google search visibility
 */

import { z } from 'zod';

// Schema for business information input
export const BusinessInfoSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  telephone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.object({
    streetAddress: z.string().min(1, 'Street address is required'),
    addressLocality: z.string().min(1, 'City is required'),
    addressRegion: z.string().min(2, 'State/Region is required'),
    postalCode: z.string().min(5, 'Postal code is required'),
    addressCountry: z.string().min(2, 'Country is required').default('US'),
  }),
  geo: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  openingHours: z.array(z.string()).optional(),
  serviceArea: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  priceRange: z.string().max(4).optional(), // e.g., "$", "$$", "$$$", "$$$$"
  serviceCategories: z.array(z.string()).optional(),
  paymentAccepted: z.array(z.string()).optional(),
  languagesSpoken: z.array(z.string()).optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().min(1).optional(),
  ratingValue: z.number().min(1).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
});

export type BusinessInfo = z.infer<typeof BusinessInfoSchema>;

// Local Business Schema interface
export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': string;
  name: string;
  description: string;
  url?: string;
  telephone: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  areaServed?: {
    '@type': 'GeoCircle';
    geoMidpoint: {
      '@type': 'GeoCoordinates';
      latitude: number;
      longitude: number;
    };
    geoRadius: string;
  } | string;
  keywords?: string;
  priceRange?: string;
  serviceCategories?: string[];
  paymentAccepted?: string[];
  languagesSpoken?: string[];
  foundingDate?: string;
  numberOfEmployees?: number;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
  sameAs?: string[]; // Social media profiles
  logo?: string;
  image?: string;
}

// Service type mappings to schema.org types
const SERVICE_TYPE_MAPPINGS: Record<string, string> = {
  'plumbing': 'Plumber',
  'electrical': 'Electrician',
  'hvac': 'HVAContractor',
  'roofing': 'RoofingContractor',
  'landscaping': 'LandscapingSupplyStore',
  'landscaper': 'HomeAndConstructionBusiness',
  'cleaning': 'CleaningService',
  'painting': 'PaintingService',
  'moving': 'MovingCompany',
  'pest-control': 'PestControlService',
  'construction': 'HomeAndConstructionBusiness',
  'contractor': 'HomeAndConstructionBusiness',
  'restaurant': 'Restaurant',
  'cafe': 'CafeOrCoffeeShop',
  'bakery': 'Bakery',
  'fitness': 'HealthClub',
  'gym': 'HealthClub',
  'salon': 'HealthAndBeautyBusiness',
  'spa': 'HealthAndBeautyBusiness',
  'auto-repair': 'AutoRepair',
  'dentist': 'Dentist',
  'doctor': 'Physician',
  'veterinary': 'VeterinaryCare',
  'legal': 'LegalService',
  'accounting': 'AccountingService',
  'consulting': 'ProfessionalService',
  'real-estate': 'RealEstateAgent',
  'insurance': 'InsuranceAgency',
  'photography': 'ProfessionalService',
  'education': 'EducationalOrganization',
  'tutoring': 'EducationalOrganization',
  'childcare': 'ChildCare',
  'pet-grooming': 'HomeAndConstructionBusiness',
  'dry-cleaning': 'DryCleaningOrLaundryService',
  'storage': 'SelfStorage',
  'default': 'LocalBusiness',
};

// Default opening hours format (schema.org expects specific format)
const DEFAULT_OPENING_HOURS = [
  'Mo 09:00-17:00',
  'Tu 09:00-17:00',
  'We 09:00-17:00',
  'Th 09:00-17:00',
  'Fr 09:00-17:00',
  'Sa 09:00-15:00',
  'Su 00:00-00:00', // Closed
];

/**
 * Get the appropriate schema.org business type based on business type or industry
 */
function getBusinessType(businessType: string, industryId?: string): string {
  const businessTypeLower = businessType.toLowerCase();
  const industryLower = industryId?.toLowerCase() || '';

  // Check business type first
  for (const [key, value] of Object.entries(SERVICE_TYPE_MAPPINGS)) {
    if (businessTypeLower.includes(key) || industryLower.includes(key)) {
      return value;
    }
  }

  return SERVICE_TYPE_MAPPINGS.default;
}

/**
 * Parse service area into structured format
 */
function parseServiceArea(serviceArea: string, geo?: { latitude: number; longitude: number }) {
  if (!serviceArea) return undefined;

  // If it's a numeric radius with coordinates, create GeoCircle
  const radiusMatch = serviceArea.match(/(\d+)\s*(miles?|kilometers?|km|mi)/i);
  if (radiusMatch && geo) {
    const radius = parseInt(radiusMatch[1]);
    const unit = radiusMatch[2].toLowerCase();
    const radiusInMeters = unit.includes('mile') || unit === 'mi' ? radius * 1609.34 : radius * 1000;

    return {
      '@type': 'GeoCircle' as const,
      geoMidpoint: {
        '@type': 'GeoCoordinates' as const,
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
      geoRadius: `${radiusInMeters}m`,
    };
  }

  // Otherwise, return as plain string
  return serviceArea;
}

/**
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema(businessInfo: BusinessInfo): LocalBusinessSchema {
  // Validate input
  const validatedInfo = BusinessInfoSchema.parse(businessInfo);

  const businessType = getBusinessType(validatedInfo.businessType);

  const schema: LocalBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': businessType,
    name: validatedInfo.businessName,
    description: validatedInfo.description,
    telephone: validatedInfo.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: validatedInfo.address.streetAddress,
      addressLocality: validatedInfo.address.addressLocality,
      addressRegion: validatedInfo.address.addressRegion,
      postalCode: validatedInfo.address.postalCode,
      addressCountry: validatedInfo.address.addressCountry,
    },
  };

  // Optional fields
  if (validatedInfo.websiteUrl) {
    schema.url = validatedInfo.websiteUrl;
  }

  if (validatedInfo.email) {
    schema.email = validatedInfo.email;
  }

  if (validatedInfo.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: validatedInfo.geo.latitude,
      longitude: validatedInfo.geo.longitude,
    };
  }

  if (validatedInfo.openingHours && validatedInfo.openingHours.length > 0) {
    schema.openingHours = validatedInfo.openingHours;
  } else {
    // Add default opening hours for local businesses
    schema.openingHours = DEFAULT_OPENING_HOURS;
  }

  if (validatedInfo.serviceArea) {
    schema.areaServed = parseServiceArea(validatedInfo.serviceArea, validatedInfo.geo);
  }

  if (validatedInfo.keywords && validatedInfo.keywords.length > 0) {
    schema.keywords = validatedInfo.keywords.join(', ');
  }

  if (validatedInfo.priceRange) {
    schema.priceRange = validatedInfo.priceRange;
  }

  if (validatedInfo.serviceCategories && validatedInfo.serviceCategories.length > 0) {
    schema.serviceCategories = validatedInfo.serviceCategories;
  }

  if (validatedInfo.paymentAccepted && validatedInfo.paymentAccepted.length > 0) {
    schema.paymentAccepted = validatedInfo.paymentAccepted;
  }

  if (validatedInfo.languagesSpoken && validatedInfo.languagesSpoken.length > 0) {
    schema.languagesSpoken = validatedInfo.languagesSpoken;
  }

  if (validatedInfo.foundedYear) {
    schema.foundingDate = `${validatedInfo.foundedYear}-01-01`;
  }

  if (validatedInfo.employeeCount) {
    schema.numberOfEmployees = validatedInfo.employeeCount;
  }

  if (validatedInfo.ratingValue && validatedInfo.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: validatedInfo.ratingValue,
      reviewCount: validatedInfo.reviewCount,
    };
  }

  return schema;
}

/**
 * Generate JSON-LD script for website embedding
 */
export function generateJsonLdScript(schema: LocalBusinessSchema): string {
  const jsonLd = JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">
${jsonLd}
</script>`;
}

/**
 * Validate schema.org compliance
 */
export function validateSchema(schema: LocalBusinessSchema): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!schema.name || schema.name.trim().length === 0) {
    errors.push('Business name is required');
  }

  if (!schema.description || schema.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!schema.telephone || schema.telephone.length < 10) {
    errors.push('Valid phone number is required');
  }

  if (!schema.address || !schema.address.streetAddress || !schema.address.addressLocality ||
      !schema.address.addressRegion || !schema.address.postalCode) {
    errors.push('Complete address information is required');
  }

  // Validate opening hours format if present
  if (schema.openingHours) {
    const openingHoursRegex = /^(Mo|Tu|We|Th|Fr|Sa|Su) \d{2}:\d{2}-\d{2}:\d{2}$/;
    const invalidHours = schema.openingHours.filter(hours => !openingHoursRegex.test(hours));
    if (invalidHours.length > 0) {
      errors.push(`Invalid opening hours format: ${invalidHours.join(', ')}. Expected format: "Mo 09:00-17:00"`);
    }
  }

  // Validate geo coordinates if present
  if (schema.geo) {
    if (schema.geo.latitude < -90 || schema.geo.latitude > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
    if (schema.geo.longitude < -180 || schema.geo.longitude > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Extract business information from topic generation metadata
 */
export function extractBusinessInfoFromMetadata(metadata: any): Partial<BusinessInfo> {
  return {
    businessType: metadata.businessType,
    serviceArea: metadata.location,
    keywords: metadata.location ? [`${metadata.businessType} in ${metadata.location}`] : [],
  };
}

/**
 * Common industry-specific keyword suggestions
 */
export function getIndustryKeywords(industryId: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'plumbing': ['plumbing services', 'emergency plumbing', 'pipe repair', 'drain cleaning', 'water heater repair'],
    'electrical': ['electrical services', 'electrical repair', 'electrical installation', 'emergency electrician', 'panel upgrade'],
    'hvac': ['hvac services', 'air conditioning repair', 'heating repair', 'hvac installation', 'furnace maintenance'],
    'roofing': ['roofing services', 'roof repair', 'roof replacement', 'gutter installation', 'roof inspection'],
    'landscaping': ['landscaping services', 'lawn care', 'garden design', 'landscape maintenance', 'outdoor living'],
    'cleaning': ['cleaning services', 'maid service', 'office cleaning', 'deep cleaning', 'post-construction cleaning'],
    'painting': ['painting services', 'interior painting', 'exterior painting', 'commercial painting', 'painting contractor'],
    'restaurant': ['restaurant', 'dining', 'cuisine', 'local food', 'family restaurant'],
    'fitness': ['fitness center', 'gym', 'personal training', 'group fitness', 'wellness'],
    'auto-repair': ['auto repair', 'car maintenance', 'mechanic', 'auto service', 'car repair'],
    'legal': ['legal services', 'lawyer', 'attorney', 'legal advice', 'legal representation'],
    'accounting': ['accounting services', 'tax preparation', 'bookkeeping', 'financial advice', 'accountant'],
  };

  return keywordMap[industryId] || [];
}

/**
 * Generate enhanced schema with industry-specific optimizations
 */
export function generateEnhancedBusinessSchema(businessInfo: BusinessInfo, industryId?: string): LocalBusinessSchema {
  const schema = generateLocalBusinessSchema(businessInfo);

  // Add industry-specific keywords if not provided
  if (!schema.keywords && industryId) {
    const industryKeywords = getIndustryKeywords(industryId);
    if (industryKeywords.length > 0) {
      schema.keywords = industryKeywords.join(', ');
    }
  }

  // Add service categories based on industry
  if (!schema.serviceCategories && industryId) {
    schema.serviceCategories = getIndustryKeywords(industryId);
  }

  return schema;
}