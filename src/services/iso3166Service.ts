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
  timezones: string[];
  currencies: { [code: string]: { name: string; symbol: string } };
  languages: { [code: string]: string };
  flags: {
    svg: string;
    png: string;
  };
}

// Types for the data structures
export interface SubdivisionHistory {
  edition: string;
  description: string;
  date?: string;
}

export interface SubdivisionData {
  code: string;
  name: string;
  localOtherName?: string;
  type: string;
  parentCode?: string;
  latLng: [number, number];
  flag: string;
  history?: SubdivisionHistory[];
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
    coordinates: number[][][][];
  };
}

export interface WorldGeoJSON {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ISO3166Service {
  // Use unknown so stored values must be explicitly cast on retrieval
  private cache: { [key: string]: CacheEntry<unknown> } = {};
  // Cache entries expire after 10 minutes
  private readonly CACHE_TTL_MS = 10 * 60 * 1000;
  private readonly REQUEST_TIMEOUT_MS = 15000;

  // Returns cached data only if still within the TTL window
  private getCached<T>(key: string): T | null {
    const entry = this.cache[key];
    if (entry && Date.now() - entry.timestamp < this.CACHE_TTL_MS) {
      return entry.data as T;
    }
    return null;
  }

  // Store a value in the cache with the current timestamp
  private setCached<T>(key: string, data: T): void {
    this.cache[key] = { data, timestamp: Date.now() };
  }

  // Get all subdivision data for a specific country
  async getCountrySubdivisions(countryCode: string): Promise<CountryData> {
    const cacheKey = `subdivisions_${countryCode}`;
    const cached = this.getCached<CountryData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${ISO3166_2_API_BASE}/alpha/${countryCode}`, {
        timeout: this.REQUEST_TIMEOUT_MS,
      });
      this.setCached(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subdivisions for ${countryCode}:`, error);
      throw error;
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
    const cached = this.getCached<SearchResult>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${ISO3166_2_API_BASE}/search/${encodeURIComponent(searchTerm)}?likeness=${likeness}&excludeMatchScore=1`,
        { timeout: this.REQUEST_TIMEOUT_MS }
      );
      this.setCached(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error searching subdivisions for "${searchTerm}":`, error);
      return {};
    }
  }

  // Get world countries GeoJSON (simplified version for demo)
  async getWorldGeoJSON(): Promise<WorldGeoJSON> {
    const cacheKey = 'world_geojson';
    const cached = this.getCached<WorldGeoJSON>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
        { timeout: this.REQUEST_TIMEOUT_MS }
      );
      this.setCached(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching world GeoJSON:', error);
      return { type: 'FeatureCollection', features: [] };
    }
  }

  // Get subdivision codes list for a country
  async getSubdivisionCodes(countryCode: string): Promise<string[]> {
    const cacheKey = `subdivision_codes_${countryCode}`;
    const cached = this.getCached<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${ISO3166_2_API_BASE}/list_subdivisions/${countryCode}`, {
        timeout: this.REQUEST_TIMEOUT_MS,
      });
      // The API returns an array of subdivision codes
      const codes: string[] = Array.isArray(response.data) ? response.data : [];
      this.setCached(cacheKey, codes);
      return codes;
    } catch (error) {
      console.error(`Error fetching subdivision codes for ${countryCode}:`, error);
      return [];
    }
  }

  // Get all countries list
  async getAllCountries(): Promise<{ [countryCode: string]: CountryData }> {
    const cacheKey = 'all_countries';
    const cached = this.getCached<{ [countryCode: string]: CountryData }>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${ISO3166_2_API_BASE}/all`, {
        timeout: this.REQUEST_TIMEOUT_MS,
      });
      this.setCached(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all countries:', error);
      return {};
    }
  }

  // Get country information from RestCountries API
  async getCountryInfo(countryCode: string): Promise<RestCountryData | null> {
    const cacheKey = `country_info_${countryCode}`;
    const cached = this.getCached<RestCountryData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${REST_COUNTRIES_API}/alpha/${countryCode}`, {
        timeout: this.REQUEST_TIMEOUT_MS,
      });
      if (response.data && response.data.length > 0) {
        this.setCached(cacheKey, response.data[0]);
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching country info:', error);
      return null;
    }
  }

  // Clear the entire cache
  clearCache(): void {
    this.cache = {};
  }
}

export const iso3166Service = new ISO3166Service();