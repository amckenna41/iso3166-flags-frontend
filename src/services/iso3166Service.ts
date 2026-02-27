import axios from 'axios';
import APP_CONFIG from '../config/appConfig';

// Base URLs for the APIs and data sources
const ISO3166_2_API_BASE = APP_CONFIG.api.iso3166_2;
const FLAGS_BASE_URL = APP_CONFIG.data.flagsRepository;
const REST_COUNTRIES_API = APP_CONFIG.api.restCountries;

// Types for RestCountries API
export interface RestCountryData {
  name: {
    common: string;
    official: string;
    nativeName?: { [key: string]: { official: string; common: string } };
  };
  cca2: string;
  cca3: string;
  ccn3: string;
  region: string;
  subregion: string;
  capital: string[];
  area: number;
  population: number;
  flags: {
    svg: string;
    png: string;
  };
}

// Types for the data structures
export interface SubdivisionData {
  code: string;
  name: string;
  localOtherName?: string;
  type: string;
  parentCode?: string;
  latLng: [number, number];
  flag: string;
  history?: any;
}

export interface CountryData {
  [subdivisionCode: string]: SubdivisionData;
}

export interface CountryFlags {
  [countryCode: string]: string;
}

export interface SearchResult {
  [countryCode: string]: CountryData;
}

// World countries GeoJSON data - we'll use a simplified version
export interface CountryFeature {
  type: 'Feature';
  properties: {
    NAME: string;
    ISO_A2: string;
    ISO_A3: string;
    ISO_N3: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
}

export interface WorldGeoJSON {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

class ISO3166Service {
  private cache: { [key: string]: any } = {};

  // Get all subdivision data for a specific country
  async getCountrySubdivisions(countryCode: string): Promise<CountryData> {
    const cacheKey = `subdivisions_${countryCode}`;
    
    console.log(`🔧 Service: getCountrySubdivisions called for: ${countryCode}`);
    
    if (this.cache[cacheKey]) {
      console.log(`🎯 Service: returning cached data for ${countryCode}`, Object.keys(this.cache[cacheKey]).length, 'subdivisions');
      return this.cache[cacheKey];
    }

    try {
      console.log(`📡 Service: making API call to ${ISO3166_2_API_BASE}/alpha/${countryCode}`);
      const response = await axios.get(`${ISO3166_2_API_BASE}/alpha/${countryCode}`);
      console.log(`✅ Service: API response received`, response.status, Object.keys(response.data).length, 'subdivisions');
      this.cache[cacheKey] = response.data;
      return response.data;
    } catch (error) {
      console.error(`❌ Service: Error fetching subdivisions for ${countryCode}:`, error);
      if (error instanceof Error) {
        console.error(`❌ Service: Error message:`, error.message);
      }
      return {};
    }
  }

  // Get country flag URL
  getCountryFlagUrl(countryCode: string | null | undefined): string {
    if (!countryCode) {
      return ''; // Return empty string for invalid country codes
    }
    return `${FLAGS_BASE_URL}/iso3166-1-flags/${countryCode.toLowerCase()}.svg`;
  }

  // Get subdivision flag URL
  getSubdivisionFlagUrl(countryCode: string | null | undefined, subdivisionCode: string | null | undefined): string {
    if (!countryCode || !subdivisionCode) {
      return ''; // Return empty string for invalid codes
    }
    const subdivisionPart = subdivisionCode.split('-')[1]?.toLowerCase();
    if (!subdivisionPart) {
      return ''; // Return empty string if subdivision part is invalid
    }
    return `${FLAGS_BASE_URL}/iso3166-2-flags/${countryCode.toUpperCase()}/${countryCode.toUpperCase()}-${subdivisionPart.padStart(2, '0')}.png`;
  }

  // Search for subdivisions by name
  async searchSubdivisions(searchTerm: string, likeness: number = 80): Promise<SearchResult> {
    const cacheKey = `search_${searchTerm}_${likeness}`;
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await axios.get(`${ISO3166_2_API_BASE}/search/${encodeURIComponent(searchTerm)}?likeness=${likeness}&excludeMatchScore=1`);
      this.cache[cacheKey] = response.data;
      return response.data;
    } catch (error) {
      console.error(`Error searching subdivisions for "${searchTerm}":`, error);
      return {};
    }
  }

  // Get world countries GeoJSON (simplified version for demo)
  async getWorldGeoJSON(): Promise<WorldGeoJSON> {
    const cacheKey = 'world_geojson';
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      // Using a public GeoJSON dataset of world countries
      const response = await axios.get('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
      this.cache[cacheKey] = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching world GeoJSON:', error);
      // Return a fallback empty structure
      return {
        type: 'FeatureCollection',
        features: []
      };
    }
  }

  // Get subdivision codes list for a country
  async getSubdivisionCodes(countryCode: string): Promise<string[]> {
    const cacheKey = `subdivision_codes_${countryCode}`;
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await axios.get(`${ISO3166_2_API_BASE}/list_subdivisions/${countryCode}`);
      // The API returns an array of subdivision codes
      const codes = Array.isArray(response.data) ? response.data : [];
      this.cache[cacheKey] = codes;
      return codes;
    } catch (error) {
      console.error(`Error fetching subdivision codes for ${countryCode}:`, error);
      return [];
    }
  }

  // Get all countries list
  async getAllCountries(): Promise<{ [key: string]: any }> {
    const cacheKey = 'all_countries';
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await axios.get(`${ISO3166_2_API_BASE}/all`);
      this.cache[cacheKey] = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching all countries:', error);
      return {};
    }
  }

  // Get country information from RestCountries API
  async getCountryInfo(countryCode: string): Promise<RestCountryData | null> {
    const cacheKey = `country_info_${countryCode}`;
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await axios.get(`${REST_COUNTRIES_API}/alpha/${countryCode}`);
      if (response.data && response.data.length > 0) {
        this.cache[cacheKey] = response.data[0];
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching country info:', error);
      return null;
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache = {};
  }
}

export const iso3166Service = new ISO3166Service();