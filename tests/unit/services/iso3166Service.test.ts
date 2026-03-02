import { iso3166Service } from '../../../src/services/iso3166Service';

describe('iso3166Service', () => {
  describe('getCountryFlagUrl', () => {
    it('should return a valid flag URL for a country code', () => {
      const url = iso3166Service.getCountryFlagUrl('US');
      expect(url).toContain('US');
      expect(url).toBeTruthy();
    });

    it('should handle lowercase country codes', () => {
      const url = iso3166Service.getCountryFlagUrl('us');
      expect(url).toBeTruthy();
    });

    it('should return URL for GB country code', () => {
      const url = iso3166Service.getCountryFlagUrl('GB');
      expect(url).toContain('GB');
    });
  });

  describe('getCountrySubdivisions', () => {
    it('should return an object for valid country code', async () => {
      const subdivisions = await iso3166Service.getCountrySubdivisions('US');
      expect(subdivisions).toBeDefined();
      expect(typeof subdivisions).toBe('object');
    });

    it('should contain subdivision data with expected structure', async () => {
      const subdivisions = await iso3166Service.getCountrySubdivisions('US');
      if (subdivisions && Object.keys(subdivisions).length > 0) {
        const firstKey = Object.keys(subdivisions)[0];
        const firstSubdivision = subdivisions[firstKey];
        expect(firstSubdivision).toHaveProperty('name');
      }
    });

    it('should handle lowercase country codes', async () => {
      const subdivisions = await iso3166Service.getCountrySubdivisions('us');
      expect(subdivisions).toBeDefined();
    });

    it('should reject with invalid country code', async () => {
      await expect(iso3166Service.getCountrySubdivisions('XX')).rejects.toThrow();
    });
  });

  describe('getRestCountryData', () => {
    it('should return country data for valid country code', async () => {
      const data = await iso3166Service.getRestCountryData('US');
      expect(data).toBeDefined();
      expect(data.name).toBeDefined();
    });

    it('should contain expected country properties', async () => {
      const data = await iso3166Service.getRestCountryData('US');
      expect(data).toHaveProperty('alpha2Code');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('capital');
    });

    it('should reject with invalid country code', async () => {
      await expect(iso3166Service.getRestCountryData('XX')).rejects.toThrow();
    });
  });
});
