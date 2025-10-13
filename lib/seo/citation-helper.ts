export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  categories: string[];
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface CitationOpportunity {
  id: string;
  directory: string;
  url: string;
  description: string;
  category: 'major' | 'industry' | 'local' | 'niche';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  businessInfo: BusinessInfo;
  status: 'claimed' | 'unclaimed' | 'needs_update' | 'not_applicable';
  priority: 'high' | 'medium' | 'low';
  instructions?: string;
  features: string[];
  domainAuthority: number;
  isFree: boolean;
}

export interface CitationReport {
  totalCitations: number;
  claimedCitations: number;
  consistencyScore: number;
  opportunities: CitationOpportunity[];
  recommendations: string[];
  napConsistency: {
    name: boolean;
    address: boolean;
    phone: boolean;
    website: boolean;
  };
}

export interface CitationDirectory {
  name: string;
  url: string;
  category: 'major' | 'industry' | 'local' | 'niche';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  description: string;
  instructions?: string;
  features: string[];
  domainAuthority: number;
  isFree: boolean;
  industries?: string[];
  countries?: string[];
}

// Comprehensive database of local business directories
const CITATION_DIRECTORIES: CitationDirectory[] = [
  // Major Directories
  {
    name: "Google Business Profile",
    url: "https://business.google.com",
    category: "major",
    difficulty: "easy",
    estimatedTime: "15 minutes",
    description: "Most important local citation - essential for local SEO",
    instructions: "Claim or create your business listing, verify via postcard or phone",
    features: ["Reviews", "Photos", "Posts", "Q&A", "Messaging", "Insights"],
    domainAuthority: 100,
    isFree: true
  },
  {
    name: "Yelp",
    url: "https://biz.yelp.com",
    category: "major",
    difficulty: "easy",
    estimatedTime: "10 minutes",
    description: "Popular review site, especially important for restaurants and local services",
    instructions: "Claim your existing listing or create a new one, verify business details",
    features: ["Reviews", "Photos", "Check-ins", "Messaging", "Advertising"],
    domainAuthority: 94,
    isFree: true
  },
  {
    name: "Apple Maps",
    url: "https://mapsconnect.apple.com",
    category: "major",
    difficulty: "medium",
    estimatedTime: "20 minutes",
    description: "Essential for iOS users, appears in Apple Maps and Siri searches",
    instructions: "Submit through Apple Maps Connect, requires Apple ID",
    features: ["Maps Integration", "Siri Integration", "Business Info", "Photos"],
    domainAuthority: 100,
    isFree: true
  },
  {
    name: "Facebook Business",
    url: "https://facebook.com/business",
    category: "major",
    difficulty: "easy",
    estimatedTime: "15 minutes",
    description: "Social media platform with business directory features",
    instructions: "Create a Facebook Page for your business",
    features: ["Reviews", "Posts", "Events", "Messaging", "Ads"],
    domainAuthority: 96,
    isFree: true
  },
  {
    name: "LinkedIn Company",
    url: "https://linkedin.com/company",
    category: "major",
    difficulty: "easy",
    estimatedTime: "20 minutes",
    description: "Professional network - important for B2B businesses",
    instructions: "Create a company page, add business details and employees",
    features: ["Company Info", "Employee Profiles", "Posts", "Analytics"],
    domainAuthority: 98,
    isFree: true
  },

  // Industry-Specific Directories
  {
    name: "HomeAdvisor",
    url: "https://homeadvisor.com",
    category: "industry",
    difficulty: "medium",
    estimatedTime: "30 minutes",
    description: "Home service professionals directory",
    instructions: "Complete contractor verification process, requires background check",
    features: ["Lead Generation", "Reviews", "Background Check Badge"],
    domainAuthority: 81,
    isFree: false,
    industries: ["Home Services", "Contracting", "Landscaping", "Plumbing", "Electrical"]
  },
  {
    name: "Angi (formerly Angie's List)",
    url: "https://angi.com",
    category: "industry",
    difficulty: "medium",
    estimatedTime: "25 minutes",
    description: "Home services review and booking platform",
    instructions: "Create professional profile, requires license verification for many trades",
    features: ["Reviews", "Booking", "Advertising", "Lead Generation"],
    domainAuthority: 82,
    isFree: false,
    industries: ["Home Services", "Contracting", "Cleaning", "Landscaping"]
  },
  {
    name: "Thumbtack",
    url: "https://thumbtack.com",
    category: "industry",
    difficulty: "easy",
    estimatedTime: "20 minutes",
    description: "Local service professionals marketplace",
    instructions: "Create professional profile, upload portfolio and certifications",
    features: ["Lead Generation", "Direct Messaging", "Reviews", "Payments"],
    domainAuthority: 84,
    isFree: true,
    industries: ["Home Services", "Events", "Wellness", "Tutoring", "Photography"]
  },
  {
    name: "Zillow",
    url: "https://zillow.com",
    category: "industry",
    difficulty: "medium",
    estimatedTime: "25 minutes",
    description: "Real estate directory for agents and brokers",
    instructions: "Create agent profile, requires real estate license verification",
    features: ["Property Listings", "Agent Profiles", "Reviews", "Market Reports"],
    domainAuthority: 91,
    isFree: true,
    industries: ["Real Estate", "Property Management"]
  },
  {
    name: "Healthgrades",
    url: "https://healthgrades.com",
    category: "industry",
    difficulty: "hard",
    estimatedTime: "45 minutes",
    description: "Healthcare provider directory",
    instructions: "Requires professional license verification and detailed credentials",
    features: ["Patient Reviews", "Appointment Booking", "Provider Profiles"],
    domainAuthority: 85,
    isFree: true,
    industries: ["Healthcare", "Medical", "Dental", "Therapy"]
  },

  // Local Directories
  {
    name: "Chamber of Commerce",
    url: "https://chamberofcommerce.com",
    category: "local",
    difficulty: "medium",
    estimatedTime: "30 minutes",
    description: "Local business association directory",
    instructions: "Join your local chamber of commerce for directory listing",
    features: ["Networking", "Events", "Business Resources", "Advocacy"],
    domainAuthority: 78,
    isFree: false
  },
  {
    name: "Better Business Bureau",
    url: "https://bbb.org",
    category: "local",
    difficulty: "medium",
    estimatedTime: "40 minutes",
    description: "Business accreditation and review organization",
    instructions: "Apply for BBB accreditation, meet standards and pay fees",
    features: ["Accreditation", "Reviews", "Complaint Resolution", "Trust Building"],
    domainAuthority: 93,
    isFree: false
  },
  {
    name: "Yellow Pages",
    url: "https://yellowpages.com",
    category: "local",
    difficulty: "easy",
    estimatedTime: "15 minutes",
    description: "Traditional online business directory",
    instructions: "Create or claim your business listing",
    features: ["Business Listing", "Reviews", "Ads", "Analytics"],
    domainAuthority: 91,
    isFree: true
  },
  {
    name: "Manta",
    url: "https://manta.com",
    category: "local",
    difficulty: "easy",
    estimatedTime: "20 minutes",
    description: "Small business directory and resource center",
    instructions: "Create free business profile with detailed information",
    features: ["Business Profile", "Marketing Tips", "Small Business Resources"],
    domainAuthority: 77,
    isFree: true
  },
  {
    name: "Citysearch",
    url: "https://citysearch.com",
    category: "local",
    difficulty: "easy",
    estimatedTime: "15 minutes",
    description: "Local business directory with reviews",
    instructions: "Claim or create your business listing",
    features: ["Business Listings", "Reviews", "Event Listings"],
    domainAuthority: 76,
    isFree: true
  },

  // Niche Directories
  {
    name: "TripAdvisor",
    url: "https://tripadvisor.com",
    category: "niche",
    difficulty: "medium",
    estimatedTime: "25 minutes",
    description: "Travel and restaurant review site",
    instructions: "Claim your business listing, add photos and respond to reviews",
    features: ["Reviews", "Photos", "Booking", "Management Tools"],
    domainAuthority: 93,
    isFree: true,
    industries: ["Hospitality", "Restaurants", "Tourism", "Attractions"]
  },
  {
    name: "OpenTable",
    url: "https://restaurant.opentable.com",
    category: "niche",
    difficulty: "medium",
    estimatedTime: "30 minutes",
    description: "Restaurant reservation platform",
    instructions: "Create restaurant profile, manage reservations and reviews",
    features: ["Reservations", "Reviews", "Waitlist", "Dining Programs"],
    domainAuthority: 87,
    isFree: false,
    industries: ["Restaurants", "Hospitality"]
  },
  {
    name: "Groupon",
    url: "https://grouponmerchant.com",
    category: "niche",
    difficulty: "medium",
    estimatedTime: "35 minutes",
    description: "Daily deals and coupons platform",
    instructions: "Create merchant account, set up deals and promotions",
    features: ["Deal Creation", "Customer Analytics", "Marketing Tools"],
    domainAuthority: 93,
    isFree: false,
    industries: ["Restaurants", "Services", "Entertainment", "Retail"]
  },
  {
    name: "Houzz",
    url: "https://houzz.com",
    category: "niche",
    difficulty: "medium",
    estimatedTime: "30 minutes",
    description: "Home design and renovation platform",
    instructions: "Create professional profile with portfolio and projects",
    features: ["Portfolio", "Project Photos", "Reviews", "Lead Generation"],
    domainAuthority: 88,
    isFree: true,
    industries: ["Home Design", "Construction", "Interior Design", "Architecture"]
  },
  {
    name: "Care.com",
    url: "https://care.com",
    category: "niche",
    difficulty: "medium",
    estimatedTime: "25 minutes",
    description: "Care services directory for families",
    instructions: "Create caregiver or care service profile",
    features: ["Background Checks", "Reviews", "Scheduling", "Payments"],
    domainAuthority: 81,
    isFree: false,
    industries: ["Childcare", "Elder Care", "Pet Care", "Tutoring"]
  }
];

export class CitationHelper {
  private directories: CitationDirectory[];

  constructor() {
    this.directories = CITATION_DIRECTORIES;
  }

  /**
   * Generate business description optimized for different directory types
   */
  generateBusinessDescription(businessInfo: BusinessInfo, directoryType: string): string {
    const baseDescription = businessInfo.description;
    const keywords = businessInfo.categories.join(", ");

    // Tailor description based on directory category
    switch (directoryType) {
      case 'major':
        return `${businessInfo.name} is a premier ${keywords} provider in ${businessInfo.city || 'the area'}. ${baseDescription} We serve customers throughout ${businessInfo.city || 'the region'} and surrounding areas with professional ${keywords} services. Call us at ${businessInfo.phone} or visit ${businessInfo.website} for more information.`;

      case 'industry':
        return `Professional ${keywords} services - ${baseDescription} Licensed and insured, serving ${businessInfo.city || 'local businesses'} and surrounding areas. Specializing in ${keywords} with over 10 years of experience. Contact ${businessInfo.phone} for a free consultation.`;

      case 'local':
        return `${businessInfo.name} - Your trusted local ${keywords} provider in ${businessInfo.city || 'our community'}. ${baseDescription} We're proud to serve our neighbors in ${businessInfo.city || 'the local area'} with honest, reliable service. Call ${businessInfo.phone} today!`;

      case 'niche':
        return `Specialized ${keywords} services with exceptional results. ${baseDescription} We understand the unique needs of ${keywords} customers and deliver personalized solutions. Located in ${businessInfo.city || 'your area'}, serving nationwide. Visit ${businessInfo.website} to learn more.`;

      default:
        return baseDescription;
    }
  }

  /**
   * Check NAP (Name, Address, Phone) consistency
   */
  checkNapConsistency(businessInfo: BusinessInfo): {
    name: boolean;
    address: boolean;
    phone: boolean;
    website: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // Check business name format
    const nameIssues = this.validateBusinessName(businessInfo.name);
    if (nameIssues.length > 0) {
      issues.push(...nameIssues);
      score -= 25;
    }

    // Check address format
    const addressIssues = this.validateAddress(businessInfo.address);
    if (addressIssues.length > 0) {
      issues.push(...addressIssues);
      score -= 25;
    }

    // Check phone format
    const phoneIssues = this.validatePhone(businessInfo.phone);
    if (phoneIssues.length > 0) {
      issues.push(...phoneIssues);
      score -= 25;
    }

    // Check website format
    const websiteIssues = this.validateWebsite(businessInfo.website);
    if (websiteIssues.length > 0) {
      issues.push(...websiteIssues);
      score -= 25;
    }

    return {
      name: nameIssues.length === 0,
      address: addressIssues.length === 0,
      phone: phoneIssues.length === 0,
      website: websiteIssues.length === 0,
      score: Math.max(0, score),
      issues
    };
  }

  private validateBusinessName(name: string): string[] {
    const issues: string[] = [];

    if (name.length < 3) {
      issues.push("Business name is too short");
    }

    if (name.length > 100) {
      issues.push("Business name is too long for some directories");
    }

    if (!/^[a-zA-Z0-9\s&\-.,']+$/.test(name)) {
      issues.push("Business name contains special characters that may cause issues");
    }

    return issues;
  }

  private validateAddress(address: string): string[] {
    const issues: string[] = [];

    if (address.length < 10) {
      issues.push("Address appears incomplete");
    }

    if (!/\d+/.test(address)) {
      issues.push("Address should include a street number");
    }

    if (!/[a-zA-Z]/.test(address)) {
      issues.push("Address should include street name");
    }

    return issues;
  }

  private validatePhone(phone: string): string[] {
    const issues: string[] = [];

    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      issues.push("Phone number should have 10 or 11 digits");
    }

    if (!/^[\d\-\s\(\)+]+$/.test(phone)) {
      issues.push("Phone format contains invalid characters");
    }

    return issues;
  }

  private validateWebsite(website: string): string[] {
    const issues: string[] = [];

    try {
      const url = new URL(website);
      if (!url.protocol.startsWith('http')) {
        issues.push("Website should start with http:// or https://");
      }
    } catch {
      issues.push("Website URL is not valid");
    }

    return issues;
  }

  /**
   * Find citation opportunities based on business information
   */
  findCitationOpportunities(
    businessInfo: BusinessInfo,
    options: {
      categories?: string[];
      difficulty?: string[];
      includePaid?: boolean;
      location?: string;
    } = {}
  ): CitationOpportunity[] {
    let filteredDirectories = [...this.directories];

    // Filter by categories
    if (options.categories && options.categories.length > 0) {
      filteredDirectories = filteredDirectories.filter(dir =>
        options.categories!.includes(dir.category)
      );
    }

    // Filter by difficulty
    if (options.difficulty && options.difficulty.length > 0) {
      filteredDirectories = filteredDirectories.filter(dir =>
        options.difficulty!.includes(dir.difficulty)
      );
    }

    // Filter paid/free
    if (options.includePaid === false) {
      filteredDirectories = filteredDirectories.filter(dir => dir.isFree);
    }

    // Filter by industry relevance
    if (businessInfo.categories.length > 0) {
      filteredDirectories = filteredDirectories.filter(dir => {
        if (!dir.industries) return true;
        return dir.industries.some(industry =>
          businessInfo.categories.some(category =>
            category.toLowerCase().includes(industry.toLowerCase()) ||
            industry.toLowerCase().includes(category.toLowerCase())
          )
        );
      });
    }

    // Convert to citation opportunities
    return filteredDirectories.map((directory, index) => {
      const priority = this.calculatePriority(directory, businessInfo);
      const optimizedDescription = this.generateBusinessDescription(businessInfo, directory.category);

      return {
        id: `citation_${index + 1}`,
        directory: directory.name,
        url: directory.url,
        description: directory.description,
        category: directory.category,
        difficulty: directory.difficulty,
        estimatedTime: directory.estimatedTime,
        businessInfo: {
          ...businessInfo,
          description: optimizedDescription
        },
        status: 'unclaimed',
        priority,
        instructions: directory.instructions,
        features: directory.features,
        domainAuthority: directory.domainAuthority,
        isFree: directory.isFree
      };
    });
  }

  /**
   * Calculate priority score for citation opportunities
   */
  private calculatePriority(directory: CitationDirectory, businessInfo: BusinessInfo): 'high' | 'medium' | 'low' {
    let score = 0;

    // Base score by category
    switch (directory.category) {
      case 'major': score += 30; break;
      case 'industry': score += 25; break;
      case 'local': score += 20; break;
      case 'niche': score += 15; break;
    }

    // Domain authority impact
    score += Math.min(directory.domainAuthority / 5, 20);

    // Industry relevance
    if (directory.industries && businessInfo.categories.length > 0) {
      const relevanceScore = directory.industries.filter(industry =>
        businessInfo.categories.some(category =>
          category.toLowerCase().includes(industry.toLowerCase())
        )
      ).length * 5;
      score += Math.min(relevanceScore, 15);
    }

    // Free vs paid consideration
    if (directory.isFree) {
      score += 10;
    }

    // Difficulty impact (easier gets higher priority for quick wins)
    switch (directory.difficulty) {
      case 'easy': score += 10; break;
      case 'medium': score += 5; break;
      case 'hard': score += 0; break;
    }

    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Generate comprehensive citation report
   */
  generateCitationReport(
    businessInfo: BusinessInfo,
    existingCitations: CitationOpportunity[] = [],
    options: any = {}
  ): CitationReport {
    // Find new opportunities
    const opportunities = this.findCitationOpportunities(businessInfo, options);

    // Check NAP consistency
    const napCheck = this.checkNapConsistency(businessInfo);

    // Merge with existing citations
    const allCitations = opportunities.map(opportunity => {
      const existing = existingCitations.find(c => c.directory === opportunity.directory);
      return existing || opportunity;
    });

    // Calculate statistics
    const totalCitations = allCitations.length;
    const claimedCitations = allCitations.filter(c => c.status === 'claimed').length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(allCitations, napCheck, businessInfo);

    return {
      totalCitations,
      claimedCitations,
      consistencyScore: napCheck.score,
      opportunities: allCitations,
      recommendations,
      napConsistency: {
        name: napCheck.name,
        address: napCheck.address,
        phone: napCheck.phone,
        website: napCheck.website
      }
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    citations: CitationOpportunity[],
    napCheck: any,
    businessInfo: BusinessInfo
  ): string[] {
    const recommendations: string[] = [];

    // NAP consistency recommendations
    if (napCheck.score < 100) {
      recommendations.push("Fix NAP consistency issues before building new citations");
      if (napCheck.issues.length > 0) {
        recommendations.push(`Address these issues: ${napCheck.issues.join(", ")}`);
      }
    }

    // Priority recommendations
    const highPriority = citations.filter(c => c.priority === 'high' && c.status === 'unclaimed');
    if (highPriority.length > 0) {
      recommendations.push(`Focus on these high-priority citations first: ${highPriority.map(c => c.directory).join(", ")}`);
    }

    // Easy wins recommendations
    const easyUnclaimed = citations.filter(c => c.difficulty === 'easy' && c.status === 'unclaimed' && c.isFree);
    if (easyUnclaimed.length > 0) {
      recommendations.push(`Quick wins - claim these easy, free citations: ${easyUnclaimed.map(c => c.directory).join(", ")}`);
    }

    // Industry-specific recommendations
    const industryCitations = citations.filter(c => c.category === 'industry' && c.status === 'unclaimed');
    if (industryCitations.length > 0) {
      recommendations.push(`Industry-specific citations will build authority: ${industryCitations.map(c => c.directory).join(", ")}`);
    }

    // Local recommendations
    if (businessInfo.city) {
      const localCitations = citations.filter(c => c.category === 'local' && c.status === 'unclaimed');
      if (localCitations.length > 0) {
        recommendations.push(`Strengthen local presence with: ${localCitations.map(c => c.directory).join(", ")}`);
      }
    }

    // Progress recommendations
    const claimedPercentage = (citations.filter(c => c.status === 'claimed').length / citations.length) * 100;
    if (claimedPercentage < 25) {
      recommendations.push("Focus on building foundational citations from major directories");
    } else if (claimedPercentage < 50) {
      recommendations.push("Continue with industry-specific and local directories");
    } else if (claimedPercentage < 75) {
      recommendations.push("Complete remaining citations for comprehensive coverage");
    } else {
      recommendations.push("Maintain existing citations and monitor for consistency");
    }

    return recommendations;
  }

  /**
   * Export citations data for external use
   */
  exportCitations(citations: CitationOpportunity[], format: 'csv' | 'json'): string {
    if (format === 'json') {
      return JSON.stringify(citations, null, 2);
    }

    // CSV format
    const headers = ['Directory', 'Category', 'Priority', 'Difficulty', 'Status', 'URL', 'Estimated Time', 'Is Free'];
    const rows = citations.map(citation => [
      citation.directory,
      citation.category,
      citation.priority,
      citation.difficulty,
      citation.status,
      citation.url,
      citation.estimatedTime,
      citation.isFree ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Get available directory categories
   */
  getAvailableCategories(): string[] {
    return [...new Set(this.directories.map(dir => dir.category))];
  }

  /**
   * Get available difficulty levels
   */
  getAvailableDifficulties(): string[] {
    return [...new Set(this.directories.map(dir => dir.difficulty))];
  }

  /**
   * Get directories by category
   */
  getDirectoriesByCategory(category: string): CitationDirectory[] {
    return this.directories.filter(dir => dir.category === category);
  }
}

// Export singleton instance
export const citationHelper = new CitationHelper();