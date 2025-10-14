/**
 * Location API Service
 * Handles location autocomplete and geolocation functionality
 */

export interface LocationSuggestion {
  place_id: string | number;
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    province?: string;
    region?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
  };
  class: string;
  type: string;
  boundingbox?: [string, string, string, string]; // [min lat, max lat, min lon, max lon]
  population?: number;
  rank?: number; // Administrative rank (0-30 for major settlements)
}

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface ReverseGeocodeResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    province?: string;
    region?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
  };
}

export interface DetailedLocation {
  // Basic location info
  city: string;
  state?: string;
  country: string;
  countryCode?: string;
  postcode?: string;

  // Coordinates
  latitude: number;
  longitude: number;
  accuracy: number;

  // Formatted display strings
  shortDisplay: string;      // "New York, NY"
  fullDisplay: string;       // "New York, NY, USA"
  detailedDisplay: string;   // "New York, New York, United States"

  // Enhanced location context for AI
  locationType: 'city' | 'town' | 'village' | 'county' | 'state' | 'country' | 'region';
  population?: number;
  administrativeRank?: number;
  timeZone?: string;
  geographicContext?: string; // e.g., "coastal city", "mountain region", "urban center"

  // Raw data
  displayName: string;
  address: ReverseGeocodeResult['address'];

  // AI-friendly context
  localizedDescription?: string; // Human-readable description for content generation
  searchContext?: string; // Enhanced context for AI content generation
}

class LocationService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly REQUEST_DELAY = 1000; // Rate limiting: 1 second between requests
  private lastRequestTime = 0;
  private readonly API_TIMEOUT = 3000; // Reduced timeout to fail fast

  /**
   * Fetch location suggestions based on search query
   */
  async getLocationSuggestions(query: string): Promise<LocationSuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest));
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: query.trim(),
          format: 'json',
          addressdetails: '1',
          limit: '8',
          extratags: '1', // Get extra tags for population and other details
          namedetails: '1', // Get detailed name information
          accept: 'application/json',
        }),
        {
          headers: {
            'User-Agent': 'SEO-Topic-Generator/1.0', // Required by Nominatim policy
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const suggestions: LocationSuggestion[] = await response.json();
      this.lastRequestTime = Date.now();

      // Filter and sort suggestions - be more inclusive for international locations
      return suggestions
        .filter(suggestion => {
          // Accept places, boundary, and other relevant classes
          const isValidClass = ['place', 'boundary', 'relation', 'landuse', 'natural'].includes(suggestion.class);

          // More inclusive address checking for international formats
          const hasAddress = suggestion.address.city || suggestion.address.town ||
                           suggestion.address.village || suggestion.address.county ||
                           suggestion.address.state || suggestion.address.province ||
                           suggestion.address.region || suggestion.address.country;
          const hasGoodImportance = suggestion.importance > 0.2; // Lower threshold for international locations

          return isValidClass && (hasAddress || hasGoodImportance);
        })
        .sort((a, b) => {
          // Prioritize populated places, then sort by importance
          const aIsPopulated = ['city', 'town', 'village'].includes(a.type);
          const bIsPopulated = ['city', 'town', 'village'].includes(b.type);

          if (aIsPopulated && !bIsPopulated) return -1;
          if (!aIsPopulated && bIsPopulated) return 1;

          return b.importance - a.importance;
        })
        .slice(0, 6);

      } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Location API unavailable, using fallback suggestions:', errorMessage);
      // Provide fallback suggestions for common locations when API fails
      console.log('🌍 [LOCATION] Using fallback location suggestions due to API unavailability');
      return this.getFallbackSuggestions(query);
    }
  }

  /**
   * Provide fallback suggestions when the main API fails
   */
  private getFallbackSuggestions(query: string): LocationSuggestion[] {
    const queryLower = query.toLowerCase();
    const fallbacks = [
      // Major international cities with comprehensive coverage
      {
        place_id: 'fallback1',
        display_name: 'New York, NY, USA',
        lat: '40.7128',
        lon: '-74.0060',
        importance: 1.0,
        address: { city: 'New York', state: 'New York', country: 'United States', country_code: 'us' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback2',
        display_name: 'London, UK',
        lat: '51.5074',
        lon: '-0.1278',
        importance: 0.95,
        address: { city: 'London', country: 'United Kingdom', country_code: 'gb' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback3',
        display_name: 'Tokyo, Japan',
        lat: '35.6762',
        lon: '139.6503',
        importance: 0.9,
        address: { city: 'Tokyo', country: 'Japan', country_code: 'jp' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback4',
        display_name: 'Paris, France',
        lat: '48.8566',
        lon: '2.3522',
        importance: 0.85,
        address: { city: 'Paris', country: 'France', country_code: 'fr' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback5',
        display_name: 'Sydney, NSW, Australia',
        lat: '-33.8688',
        lon: '151.2093',
        importance: 0.8,
        address: { city: 'Sydney', state: 'New South Wales', country: 'Australia', country_code: 'au' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback6',
        display_name: 'Toronto, ON, Canada',
        lat: '43.6532',
        lon: '-79.3832',
        importance: 0.75,
        address: { city: 'Toronto', state: 'Ontario', country: 'Canada', country_code: 'ca' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback7',
        display_name: 'Mumbai, India',
        lat: '19.0760',
        lon: '72.8777',
        importance: 0.7,
        address: { city: 'Mumbai', country: 'India', country_code: 'in' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback8',
        display_name: 'Dubai, UAE',
        lat: '25.2048',
        lon: '55.2708',
        importance: 0.65,
        address: { city: 'Dubai', country: 'United Arab Emirates', country_code: 'ae' },
        class: 'place',
        type: 'city'
      },
      // More international cities
      {
        place_id: 'fallback9',
        display_name: 'Berlin, Germany',
        lat: '52.5200',
        lon: '13.4050',
        importance: 0.82,
        address: { city: 'Berlin', country: 'Germany', country_code: 'de' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback10',
        display_name: 'Madrid, Spain',
        lat: '40.4168',
        lon: '-3.7038',
        importance: 0.78,
        address: { city: 'Madrid', country: 'Spain', country_code: 'es' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback11',
        display_name: 'Singapore, Singapore',
        lat: '1.3521',
        lon: '103.8198',
        importance: 0.76,
        address: { city: 'Singapore', country: 'Singapore', country_code: 'sg' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback12',
        display_name: 'São Paulo, Brazil',
        lat: '-23.5505',
        lon: '-46.6333',
        importance: 0.74,
        address: { city: 'São Paulo', country: 'Brazil', country_code: 'br' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback13',
        display_name: 'Mexico City, Mexico',
        lat: '19.4326',
        lon: '-99.1332',
        importance: 0.72,
        address: { city: 'Mexico City', country: 'Mexico', country_code: 'mx' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback14',
        display_name: 'Lagos, Nigeria',
        lat: '6.5244',
        lon: '3.3792',
        importance: 0.68,
        address: { city: 'Lagos', country: 'Nigeria', country_code: 'ng' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback15',
        display_name: 'Moscow, Russia',
        lat: '55.7558',
        lon: '37.6173',
        importance: 0.66,
        address: { city: 'Moscow', country: 'Russia', country_code: 'ru' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback16',
        display_name: 'Cairo, Egypt',
        lat: '30.0444',
        lon: '31.2357',
        importance: 0.64,
        address: { city: 'Cairo', country: 'Egypt', country_code: 'eg' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback17',
        display_name: 'Beijing, China',
        lat: '39.9042',
        lon: '116.4074',
        importance: 0.62,
        address: { city: 'Beijing', country: 'China', country_code: 'cn' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback18',
        display_name: 'Bangkok, Thailand',
        lat: '13.7563',
        lon: '100.5018',
        importance: 0.6,
        address: { city: 'Bangkok', country: 'Thailand', country_code: 'th' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback19',
        display_name: 'Jakarta, Indonesia',
        lat: '-6.2088',
        lon: '106.8456',
        importance: 0.58,
        address: { city: 'Jakarta', country: 'Indonesia', country_code: 'id' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback20',
        display_name: 'Istanbul, Turkey',
        lat: '41.0082',
        lon: '28.9784',
        importance: 0.56,
        address: { city: 'Istanbul', country: 'Turkey', country_code: 'tr' },
        class: 'place',
        type: 'city'
      }
    ];

    // Filter fallbacks based on query
    const filtered = fallbacks.filter(fallback =>
      fallback.display_name.toLowerCase().includes(queryLower) ||
      fallback.address.city?.toLowerCase().includes(queryLower) ||
      fallback.address.state?.toLowerCase().includes(queryLower) ||
      fallback.address.country?.toLowerCase().includes(queryLower) ||
      fallback.address.country_code?.toLowerCase().includes(queryLower)
    );

    // If no matches found, return top 6 most popular cities
    return filtered.length > 0 ? filtered.slice(0, 6) : fallbacks.slice(0, 6);
  }

  /**
   * Get user's current geolocation
   */
  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest));
    }

    try {
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}/reverse?` +
        new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          format: 'json',
          addressdetails: '1',
          zoom: '10', // City level
        }),
        {
          headers: {
            'User-Agent': 'SEO-Topic-Generator/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ReverseGeocodeResult = await response.json();
      this.lastRequestTime = Date.now();

      return result;

    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Get formatted location name from geolocation
   */
  async getLocationFromGeolocation(): Promise<string> {
    try {
      const detailedLocation = await this.getDetailedLocationFromGeolocation();
      return detailedLocation.fullDisplay;
    } catch (error) {
      console.error('Error getting location from geolocation:', error);
      throw error;
    }
  }

  /**
   * Get detailed location information from geolocation
   */
  async getDetailedLocationFromGeolocation(): Promise<DetailedLocation> {
    try {
      const position = await this.getCurrentPosition();
      const reverseGeocodeResult = await this.reverseGeocode(position.latitude, position.longitude);

      if (!reverseGeocodeResult) {
        throw new Error('Could not determine location from coordinates');
      }

      // Extract location components
      const { address, display_name } = reverseGeocodeResult;
      const city = address.city || address.town || address.village || address.county || 'Unknown';
      const state = address.state || address.province || address.region;
      const country = address.country || 'Unknown';
      const countryCode = address.country_code?.toUpperCase();
      const postcode = address.postcode;

      // Create formatted display strings
      const shortDisplay = state ? `${city}, ${state}` : city;
      const fullDisplay = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
      const detailedDisplay = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;

      // Determine location type from address components
      let locationType: DetailedLocation['locationType'] = 'region';
      if (address.city) locationType = 'city';
      else if (address.town) locationType = 'town';
      else if (address.village) locationType = 'village';
      else if (address.county) locationType = 'county';
      else if (address.state || address.province) locationType = 'state';
      else if (address.region) locationType = 'region';
      else if (address.country) locationType = 'country';

      // Generate location context for geolocation results
      let geographicContext = '';
      if (countryCode) {
        const regionContexts = {
          'US': 'American',
          'GB': 'British',
          'CA': 'Canadian',
          'AU': 'Australian',
          'IN': 'Indian',
          'JP': 'Japanese',
          'FR': 'French',
          'DE': 'German',
          'IT': 'Italian',
          'ES': 'Spanish',
          'BR': 'Brazilian',
          'MX': 'Mexican',
          'AE': 'Middle Eastern',
          'SG': 'Southeast Asian',
          'HK': 'Asian financial hub',
          'NZ': 'New Zealand'
        };
        geographicContext = regionContexts[countryCode as keyof typeof regionContexts] || '';
      }

      const localizedDescription = `${city}, ${locationType} in ${country}`;
      let searchContext = `Location: ${city}`;
      if (state) searchContext += `, ${state}`;
      if (country) searchContext += `, ${country}`;
      if (geographicContext) searchContext += ` | Cultural context: ${geographicContext}`;

      const typeContexts = {
        'city': 'urban metropolitan area',
        'town': 'populated town',
        'village': 'small village',
        'county': 'county region',
        'state': 'state/province level',
        'country': 'country-wide',
        'region': 'geographic region'
      };
      searchContext += ` | Location type: ${typeContexts[locationType]}`;

      return {
        city,
        state,
        country,
        countryCode,
        postcode,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        shortDisplay,
        fullDisplay,
        detailedDisplay,
        locationType,
        geographicContext,
        localizedDescription,
        searchContext,
        displayName: display_name,
        address
      };

    } catch (error) {
      console.error('Error getting detailed location from geolocation:', error);
      throw error;
    }
  }

  /**
   * Determine location type from suggestion data
   */
  private determineLocationType(suggestion: LocationSuggestion): DetailedLocation['locationType'] {
    const { type, address } = suggestion;

    if (['city', 'town', 'village'].includes(type)) {
      return type as 'city' | 'town' | 'village';
    } else if (address.city) {
      return 'city';
    } else if (address.town) {
      return 'town';
    } else if (address.village) {
      return 'village';
    } else if (address.county) {
      return 'county';
    } else if (address.state || address.province) {
      return 'state';
    } else if (address.region) {
      return 'region';
    } else if (address.country) {
      return 'country';
    } else {
      return 'region';
    }
  }

  /**
   * Generate enhanced location context for AI content generation
   */
  private generateLocationContext(suggestion: LocationSuggestion): {
    geographicContext?: string;
    localizedDescription?: string;
    searchContext?: string;
  } {
    const { address, type, importance } = suggestion;
    const city = address.city || address.town || address.village;
    const state = address.state || address.province || address.region;
    const country = address.country;
    const countryCode = address.country_code?.toUpperCase();

    // Generate geographic context based on location characteristics
    let geographicContext = '';
    if (countryCode) {
      const regionContexts = {
        'US': 'American',
        'GB': 'British',
        'CA': 'Canadian',
        'AU': 'Australian',
        'IN': 'Indian',
        'JP': 'Japanese',
        'FR': 'French',
        'DE': 'German',
        'IT': 'Italian',
        'ES': 'Spanish',
        'BR': 'Brazilian',
        'MX': 'Mexican',
        'AE': 'Middle Eastern',
        'SG': 'Southeast Asian',
        'HK': 'Asian financial hub',
        'NZ': 'New Zealand'
      };
      geographicContext = regionContexts[countryCode as keyof typeof regionContexts] || '';
    }

    // Create localized description
    let localizedDescription = '';
    if (city && state && country) {
      localizedDescription = `${city}, a ${type} in ${state}, ${country}`;
    } else if (city && country) {
      localizedDescription = `${city}, a ${type} in ${country}`;
    } else if (city) {
      localizedDescription = `${city}, ${type}`;
    }

    // Create search context for AI
    let searchContext = `Location: ${city || address.county || 'Unknown'}`;
    if (state) searchContext += `, ${state}`;
    if (country) searchContext += `, ${country}`;

    if (geographicContext) {
      searchContext += ` | Cultural context: ${geographicContext}`;
    }

    // Add location type context
    const typeContexts = {
      'city': 'urban metropolitan area',
      'town': 'populated town',
      'village': 'small village',
      'county': 'county region',
      'state': 'state/province level',
      'country': 'country-wide',
      'region': 'geographic region'
    };
    searchContext += ` | Location type: ${typeContexts[this.determineLocationType(suggestion)]}`;

    return {
      geographicContext,
      localizedDescription,
      searchContext
    };
  }

  /**
   * Format location suggestion for display
   */
  formatSuggestionForDisplay(suggestion: LocationSuggestion): string {
    const { address } = suggestion;
    const city = address.city || address.town || address.village;
    const state = address.state || address.province || address.region;
    const country = address.country;

    if (city && state && country) {
      return `${city}, ${state}, ${country}`;
    } else if (city && state) {
      return `${city}, ${state}`;
    } else if (city && country) {
      return `${city}, ${country}`;
    } else if (city) {
      return city;
    } else {
      // Fallback to display name, but clean it up
      return suggestion.display_name.split(',')[0].trim();
    }
  }

  /**
   * Get detailed location information from a location suggestion
   */
  getDetailedLocationFromSuggestion(suggestion: LocationSuggestion): DetailedLocation {
    const { address, lat, lon, display_name, population, rank } = suggestion;
    const city = address.city || address.town || address.village || address.county || 'Unknown';
    const state = address.state || address.province || address.region;
    const country = address.country || 'Unknown';
    const countryCode = address.country_code?.toUpperCase();
    const postcode = address.postcode;

    // Create formatted display strings
    const shortDisplay = state ? `${city}, ${state}` : city;
    const fullDisplay = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
    const detailedDisplay = state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;

    // Generate enhanced location context
    const locationType = this.determineLocationType(suggestion);
    const context = this.generateLocationContext(suggestion);

    return {
      city,
      state,
      country,
      countryCode,
      postcode,
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      accuracy: 0, // Search results don't have GPS accuracy
      shortDisplay,
      fullDisplay,
      detailedDisplay,
      locationType,
      population,
      administrativeRank: rank,
      geographicContext: context.geographicContext,
      localizedDescription: context.localizedDescription,
      searchContext: context.searchContext,
      displayName: display_name,
      address
    };
  }
}

// Singleton instance
export const locationService = new LocationService();