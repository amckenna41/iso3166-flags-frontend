import axios from 'axios';
import { iso3166Service } from '../../../src/services/iso3166Service';

// Mock axios to avoid real network calls in unit tests
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
  // Clear in-memory cache between tests
  iso3166Service.clearCache();
});

describe('iso3166Service', () => {
  describe('getCountryFlagUrl', () => {
    it('should return a valid flag URL for an uppercase country code', () => {
      const url = iso3166Service.getCountryFlagUrl('US');
      expect(url).toContain('us.svg');
      expect(url).toBeTruthy();
    });

    it('should lowercase the country code in the URL', () => {
      const url = iso3166Service.getCountryFlagUrl('GB');
      expect(url).toContain('gb.svg');
    });

    it('should return empty string for null input', () => {
      expect(iso3166Service.getCountryFlagUrl(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(iso3166Service.getCountryFlagUrl(undefined)).toBe('');
    });
  });

  describe('getSubdivisionFlagUrl', () => {
    it('should return a valid flag URL for a subdivision code', () => {
      // The flags repository stores these as <CC>/<CC>-<SUB>.svg, uppercase and
      // unpadded. Lowercasing/zero-padding to .png produced URLs that 404.
      expect(iso3166Service.getSubdivisionFlagUrl('US', 'US-CA')).toBe(
        'https://raw.githubusercontent.com/amckenna41/iso3166-flags/main/iso3166-2-flags/US/US-CA.svg'
      );
    });

    it('should not zero-pad single-character subdivision codes', () => {
      // Regression: IE-C used to become IE-0c.png
      expect(iso3166Service.getSubdivisionFlagUrl('IE', 'IE-C')).toBe(
        'https://raw.githubusercontent.com/amckenna41/iso3166-flags/main/iso3166-2-flags/IE/IE-C.svg'
      );
    });

    it('should return empty string when countryCode is null', () => {
      expect(iso3166Service.getSubdivisionFlagUrl(null, 'US-CA')).toBe('');
    });

    it('should return empty string when subdivisionCode is null', () => {
      expect(iso3166Service.getSubdivisionFlagUrl('US', null)).toBe('');
    });

    it('should return empty string when subdivisionCode has no hyphen part', () => {
      expect(iso3166Service.getSubdivisionFlagUrl('US', 'INVALID')).toBe('');
    });
  });

  describe('getCountrySubdivisions', () => {
    it('should return subdivision data from the API', async () => {
      const mockData = {
        'US-CA': { code: 'US-CA', name: 'California', type: 'State', latLng: [36.7, -119.7], flag: '' },
        'US-NY': { code: 'US-NY', name: 'New York', type: 'State', latLng: [42.1, -74.2], flag: '' },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await iso3166Service.getCountrySubdivisions('US');
      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/alpha/US'),
        expect.any(Object)
      );
    });

    it('should re-throw when the API request fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(iso3166Service.getCountrySubdivisions('XX')).rejects.toThrow('Network error');
    });

    it('should return cached data on subsequent calls', async () => {
      const mockData = { 'DE-BE': { code: 'DE-BE', name: 'Berlin', type: 'State', latLng: [52.5, 13.4], flag: '' } };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      await iso3166Service.getCountrySubdivisions('DE');
      await iso3166Service.getCountrySubdivisions('DE');

      // API should only be called once due to caching
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCountryInfo', () => {
    // v5 API format expected by the service's /api/country-info proxy
    const mockV5CountryInfo = {
      names: { common: 'United States', official: 'United States of America' },
      codes: { alpha_2: 'US', alpha_3: 'USA', ccn3: '840' },
      region: 'Americas',
      subregion: 'Northern America',
      capitals: [{ name: 'Washington, D.C.' }],
      area: { kilometers: 9372610 },
      population: 329484123,
      timezones: ['UTC-12:00'],
      currencies: [{ code: 'USD', name: 'United States dollar', symbol: '$' }],
      languages: [{ iso639_1: 'en', name: 'English' }],
      flag: { url_svg: 'https://example.com/us.svg', url_png: 'https://example.com/us.png' },
    };

    const v5Response = { data: { data: { objects: [mockV5CountryInfo] } } };

    it('should return country data matching the RestCountryData shape', async () => {
      mockedAxios.get.mockResolvedValueOnce(v5Response);

      const result = await iso3166Service.getCountryInfo('US');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('cca2', 'US');
      expect(result).toHaveProperty('cca3', 'USA');
      expect(result).toHaveProperty('region', 'Americas');
      expect(result).toHaveProperty('population', 329484123);
    });

    it('should expose name.common and name.official', async () => {
      mockedAxios.get.mockResolvedValueOnce(v5Response);

      const result = await iso3166Service.getCountryInfo('US');
      expect(result?.name.common).toBe('United States');
      expect(result?.name.official).toBe('United States of America');
    });

    it('should expose capital as an array', async () => {
      mockedAxios.get.mockResolvedValueOnce(v5Response);

      const result = await iso3166Service.getCountryInfo('US');
      expect(Array.isArray(result?.capital)).toBe(true);
      expect(result?.capital[0]).toBe('Washington, D.C.');
    });

    it('should return null when the API returns no objects', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { data: { objects: [] } } });

      const result = await iso3166Service.getCountryInfo('XX');
      expect(result).toBeNull();
    });

    it('should return null when the API request fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await iso3166Service.getCountryInfo('XX');
      expect(result).toBeNull();
    });

    it('should cache results and avoid duplicate API calls', async () => {
      mockedAxios.get.mockResolvedValueOnce(v5Response);

      await iso3166Service.getCountryInfo('US');
      await iso3166Service.getCountryInfo('US');

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('in-flight request de-duplication', () => {
    it('shares one request between callers that miss the cache in the same tick', async () => {
      let resolveRequest: (value: unknown) => void = () => {};
      mockedAxios.get.mockReturnValueOnce(new Promise(resolve => { resolveRequest = resolve; }) as any);

      const first = iso3166Service.getCountrySubdivisions('FR');
      const second = iso3166Service.getCountrySubdivisions('FR');

      resolveRequest({ data: { 'FR-BRE': { code: 'FR-BRE', name: 'Bretagne', type: 'Region', latLng: [48, -3], flag: '' } } });

      await expect(first).resolves.toEqual(await second);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('does not wedge the key after a failure — a later call retries', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      await expect(iso3166Service.getCountrySubdivisions('IT')).rejects.toThrow('Network error');

      mockedAxios.get.mockResolvedValueOnce({ data: {} });
      await expect(iso3166Service.getCountrySubdivisions('IT')).resolves.toEqual({});
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('de-duplicates searches as well', async () => {
      let resolveRequest: (value: unknown) => void = () => {};
      mockedAxios.get.mockReturnValueOnce(new Promise(resolve => { resolveRequest = resolve; }) as any);

      const first = iso3166Service.searchSubdivisions('cork');
      const second = iso3166Service.searchSubdivisions('cork');
      resolveRequest({ data: {} });

      await Promise.all([first, second]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchSubdivisions', () => {
    it('should return search results from the API', async () => {
      const mockResults = {
        US: { 'US-CA': { code: 'US-CA', name: 'California', type: 'State', latLng: [36.7, -119.7], flag: '' } },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResults });

      const result = await iso3166Service.searchSubdivisions('California');
      expect(result).toEqual(mockResults);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('California'),
        expect.any(Object)
      );
    });

    it('should re-throw on API failure', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(iso3166Service.searchSubdivisions('test')).rejects.toThrow('Network error');
    });
  });
});
