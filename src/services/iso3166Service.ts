import axios from 'axios';
import APP_CONFIG from '../config/appConfig';

// Base URLs for the APIs and data sources
const ISO3166_2_API_BASE = APP_CONFIG.api.iso3166_2;
const FLAGS_BASE_URL = APP_CONFIG.data.flagsRepository;

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
  area?: number;
  population?: number;
  timezones: string[];
  currencies: { [code: string]: { name: string; symbol: string } };
  languages: { [code: string]: string };
  flags: {
    svg: string;
    png: string;
  };
  landlocked?: boolean;
  borders?: string[];
  callingCodes?: string[];
  tlds?: string[];
  demonyms?: { [lang: string]: { f: string; m: string } };
  memberships?: string[];
  wikipedia?: string;
}

// Types for the data structures
export interface SubdivisionHistory {
  'Date Issued'?: string;
  Change?: string;
  'Description of Change'?: string;
  Source?: string;
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

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ISO3166Service {
  // Use unknown so stored values must be explicitly cast on retrieval
  private cache: { [key: string]: CacheEntry<unknown> } = {};
  // Requests that have been issued but have not settled yet, keyed like the cache
  private inFlight: { [key: string]: Promise<unknown> } = {};
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

  /**
   * Run `request` unless an identical one is already in flight, in which case
   * join it. Without this, two components reacting to the same click both miss
   * the cache in the same tick and fire duplicate requests.
   */
  private dedupe<T>(key: string, request: () => Promise<T>): Promise<T> {
    const existing = this.inFlight[key];
    if (existing) return existing as Promise<T>;

    const promise = request().finally(() => {
      delete this.inFlight[key];
    });
    this.inFlight[key] = promise;
    return promise;
  }

  // Get all subdivision data for a specific country.
  // Deliberately takes no AbortSignal: the request is shared between callers, so
  // one caller aborting would cancel it for everyone. Callers that need to drop
  // a superseded response discard the result instead (see useLatestRequest).
  async getCountrySubdivisions(countryCode: string): Promise<CountryData> {
    const cacheKey = `subdivisions_${countryCode}`;
    const cached = this.getCached<CountryData>(cacheKey);
    if (cached) return cached;

    return this.dedupe(cacheKey, async () => {
      try {
        const response = await axios.get(`${ISO3166_2_API_BASE}/alpha/${countryCode}`, {
          timeout: this.REQUEST_TIMEOUT_MS,
        });
        this.setCached(cacheKey, response.data);
        return response.data as CountryData;
      } catch (error) {
        console.error(`Error fetching subdivisions for ${countryCode}:`, error);
        throw error;
      }
    });
  }

  // Get country flag URL
  getCountryFlagUrl(countryCode: string | null | undefined): string {
    if (!countryCode) {
      return ''; // Return empty string for invalid country codes
    }
    return `${FLAGS_BASE_URL}/iso3166-1-flags/${countryCode.toLowerCase()}.svg`;
  }

  // Get subdivision flag URL.
  // The repository stores these as `<CC>/<CC>-<SUB>.svg` with the subdivision
  // part in its original case and no padding — e.g. IE/IE-C.svg. The previous
  // implementation lowercased, zero-padded to two chars and asked for .png,
  // producing IE-0c.png, which 404s.
  getSubdivisionFlagUrl(countryCode: string | null | undefined, subdivisionCode: string | null | undefined): string {
    if (!countryCode || !subdivisionCode) {
      return ''; // Return empty string for invalid codes
    }
    const subdivisionPart = subdivisionCode.split('-')[1]?.toUpperCase();
    if (!subdivisionPart) {
      return ''; // Return empty string if subdivision part is invalid
    }
    const country = countryCode.toUpperCase();
    return `${FLAGS_BASE_URL}/iso3166-2-flags/${country}/${country}-${subdivisionPart}.svg`;
  }

  // Search for subdivisions by name
  async searchSubdivisions(searchTerm: string, likeness: number = 80): Promise<SearchResult> {
    const cacheKey = `search_${searchTerm}_${likeness}`;
    const cached = this.getCached<SearchResult>(cacheKey);
    if (cached) return cached;

    return this.dedupe(cacheKey, async () => {
      try {
        const response = await axios.get(
          `${ISO3166_2_API_BASE}/search/${encodeURIComponent(searchTerm)}?likeness=${likeness}&excludeMatchScore=1`,
          { timeout: this.REQUEST_TIMEOUT_MS }
        );
        this.setCached(cacheKey, response.data);
        return response.data as SearchResult;
      } catch (error) {
        console.error(`Error searching subdivisions for "${searchTerm}":`, error);
        throw error;
      }
    });
  }

  // Get country information via the internal /api/country-info proxy.
  // The REST Countries API key never reaches the browser — it lives in the
  // Vercel serverless function (api/country-info.js) / CRA dev proxy (setupProxy.js).
  async getCountryInfo(countryCode: string): Promise<RestCountryData | null> {
    const cacheKey = `country_info_${countryCode}`;
    const cached = this.getCached<RestCountryData>(cacheKey);
    if (cached) return cached;

    return this.dedupe(cacheKey, () => this.fetchCountryInfo(cacheKey, countryCode));
  }

  private async fetchCountryInfo(cacheKey: string, countryCode: string): Promise<RestCountryData | null> {
    try {
      const response = await axios.get('/api/country-info', {
        params: { code: countryCode },
        timeout: this.REQUEST_TIMEOUT_MS,
      });

      // v5 API wraps results as { data: { objects: [...] } }
      const v5 = response.data?.data?.objects?.[0];
      if (!v5) return null;

      const countryData: RestCountryData = {
        name: {
          common: v5.names?.common ?? '',
          official: v5.names?.official ?? '',
        },
        cca2: v5.codes?.alpha_2 ?? '',
        cca3: v5.codes?.alpha_3 ?? '',
        ccn3: v5.codes?.ccn3 ?? '',
        region: v5.region ?? '',
        subregion: v5.subregion ?? '',
        capital: Array.isArray(v5.capitals)
          ? v5.capitals.map((c: any) => c.name).filter(Boolean)
          : [],
        area: v5.area?.kilometers,
        population: v5.population,
        timezones: Array.isArray(v5.timezones) ? v5.timezones : [],
        currencies: Array.isArray(v5.currencies)
          ? v5.currencies.reduce((acc: any, c: any) => {
              if (c.code) acc[c.code] = { name: c.name ?? '', symbol: c.symbol ?? '' };
              return acc;
            }, {})
          : {},
        languages: Array.isArray(v5.languages)
          ? v5.languages.reduce((acc: any, l: any) => {
              const key = l.iso639_1 ?? l.iso639_2b ?? l.name;
              if (key) acc[key] = l.name ?? key;
              return acc;
            }, {})
          : {},
        flags: {
          svg: v5.flag?.url_svg ?? '',
          png: v5.flag?.url_png ?? '',
        },
        landlocked: v5.landlocked,
        borders: Array.isArray(v5.borders) ? v5.borders : [],
        callingCodes: (() => {
          const raw = v5.phone?.calling_codes ?? v5.calling_codes;
          if (!Array.isArray(raw)) return [];
          return raw.map((c: any) => `+${String(c).trim()}`);
        })(),
        tlds: Array.isArray(v5.tlds) ? v5.tlds : [],
        demonyms: v5.demonyms && typeof v5.demonyms === 'object' ? v5.demonyms : {},
        memberships: (() => {
          const raw = v5.memberships ?? v5.international_organizations;
          if (!Array.isArray(raw)) return [];
          return raw.map((m: any) => typeof m === 'string' ? m : (m.abbreviation ?? m.name ?? String(m)));
        })(),
        wikipedia: v5.links?.wikipedia ?? '',
      };

      this.setCached(cacheKey, countryData);
      return countryData;
    } catch (error) {
      console.error(`Error fetching country info for ${countryCode}:`, error);
      return null;
    }
  }

  // Clear the entire cache
  clearCache(): void {
    this.cache = {};
    this.inFlight = {};
  }
}

export const iso3166Service = new ISO3166Service();