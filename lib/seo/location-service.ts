/**
 * Location API Service
 * Handles location autocomplete and geolocation functionality
 */

export interface LocationSuggestion {
  place_id: string;
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
    country?: string;
    postcode?: string;
  };
  class: string;
  type: string;
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
    country?: string;
    postcode?: string;
  };
}

class LocationService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly REQUEST_DELAY = 1000; // Rate limiting: 1 second between requests
  private lastRequestTime = 0;

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
      const response = await fetch(
        `${this.NOMINATIM_BASE_URL}/search?` +
        new URLSearchParams({
          q: query.trim(),
          format: 'json',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'us,ca,gb,au,nz', // Limit to English-speaking countries
          accept: 'application/json',
        }),
        {
          headers: {
            'User-Agent': 'SEO-Topic-Generator/1.0', // Required by Nominatim policy
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const suggestions: LocationSuggestion[] = await response.json();
      this.lastRequestTime = Date.now();

      // Filter and sort suggestions - be more lenient with filtering
      return suggestions
        .filter(suggestion => {
          // Accept places, boundary, and other relevant classes
          const isValidClass = ['place', 'boundary', 'relation'].includes(suggestion.class);
          const hasAddress = suggestion.address.city || suggestion.address.town ||
                           suggestion.address.village || suggestion.address.county ||
                           suggestion.address.state;
          return isValidClass && (hasAddress || suggestion.importance > 0.3);
        })
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5);

    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      // Provide fallback suggestions for common locations when API fails
      return this.getFallbackSuggestions(query);
    }
  }

  /**
   * Provide fallback suggestions when the main API fails
   */
  private getFallbackSuggestions(query: string): LocationSuggestion[] {
    const queryLower = query.toLowerCase();
    const fallbacks = [
      {
        place_id: 'fallback1',
        display_name: 'New York, NY, USA',
        lat: '40.7128',
        lon: '-74.0060',
        importance: 1.0,
        address: { city: 'New York', state: 'New York', country: 'United States' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback2',
        display_name: 'Los Angeles, CA, USA',
        lat: '34.0522',
        lon: '-118.2437',
        importance: 0.9,
        address: { city: 'Los Angeles', state: 'California', country: 'United States' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback3',
        display_name: 'Chicago, IL, USA',
        lat: '41.8781',
        lon: '-87.6298',
        importance: 0.8,
        address: { city: 'Chicago', state: 'Illinois', country: 'United States' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback4',
        display_name: 'Houston, TX, USA',
        lat: '29.7604',
        lon: '-95.3698',
        importance: 0.7,
        address: { city: 'Houston', state: 'Texas', country: 'United States' },
        class: 'place',
        type: 'city'
      },
      {
        place_id: 'fallback5',
        display_name: 'Phoenix, AZ, USA',
        lat: '33.4484',
        lon: '-112.0740',
        importance: 0.6,
        address: { city: 'Phoenix', state: 'Arizona', country: 'United States' },
        class: 'place',
        type: 'city'
      }
    ];

    // Filter fallbacks based on query
    return fallbacks.filter(fallback =>
      fallback.display_name.toLowerCase().includes(queryLower) ||
      fallback.address.city?.toLowerCase().includes(queryLower) ||
      fallback.address.state?.toLowerCase().includes(queryLower)
    ).slice(0, 3);
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
      const position = await this.getCurrentPosition();
      const reverseGeocodeResult = await this.reverseGeocode(position.latitude, position.longitude);

      if (reverseGeocodeResult) {
        // Format the location name
        const { address } = reverseGeocodeResult;
        const city = address.city || address.town || address.village;
        const state = address.state;

        if (city && state) {
          return `${city}, ${state}`;
        } else if (city) {
          return city;
        } else if (address.county) {
          return address.county;
        } else {
          return reverseGeocodeResult.display_name.split(',')[0].trim();
        }
      }

      throw new Error('Could not determine location from coordinates');

    } catch (error) {
      console.error('Error getting location from geolocation:', error);
      throw error;
    }
  }

  /**
   * Format location suggestion for display
   */
  formatSuggestionForDisplay(suggestion: LocationSuggestion): string {
    const { address } = suggestion;
    const city = address.city || address.town || address.village;
    const state = address.state;

    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else {
      // Fallback to display name, but clean it up
      return suggestion.display_name.split(',')[0].trim();
    }
  }
}

// Singleton instance
export const locationService = new LocationService();