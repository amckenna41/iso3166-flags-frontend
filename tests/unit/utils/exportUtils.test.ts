import {
  convertToCSV,
  formatCountryForExport,
  formatSubdivisionForExport,
  exportCountryAsCSV,
  exportSubdivisionsAsCSV,
  exportCountryAsJSON,
  exportSubdivisionsAsJSON,
} from '../../../src/utils/exportUtils';
import { RestCountryData, SubdivisionData } from '../../../src/services/iso3166Service';

// Minimal RestCountryData fixture
const mockCountry: RestCountryData = {
  name: { common: 'Germany', official: 'Federal Republic of Germany' },
  cca2: 'DE',
  cca3: 'DEU',
  ccn3: '276',
  region: 'Europe',
  subregion: 'Western Europe',
  capital: ['Berlin'],
  area: 357114,
  population: 83240525,
  timezones: ['UTC+01:00'],
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  languages: { deu: 'German' },
  flags: { svg: 'https://example.com/de.svg', png: 'https://example.com/de.png' },
};

// Minimal SubdivisionData fixture
const mockSubdivision: SubdivisionData = {
  code: 'DE-BE',
  name: 'Berlin',
  type: 'State',
  latLng: [52.52, 13.405],
  flag: 'https://example.com/de-be.png',
};

// Suppress DOM method calls triggered by download helpers
beforeAll(() => {
  // jsdom does not implement URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();

  // Stub appendChild/click/removeChild so download helpers don't throw
  jest.spyOn(document.body, 'appendChild').mockImplementation((el) => el);
  jest.spyOn(document.body, 'removeChild').mockImplementation((el) => el);
  HTMLAnchorElement.prototype.click = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('convertToCSV', () => {
  it('should return empty string for an empty array', () => {
    expect(convertToCSV([])).toBe('');
  });

  it('should produce a header row and one data row', () => {
    const csv = convertToCSV([{ Name: 'Germany', Code: 'DE' }]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('"Name","Code"');
    expect(lines[1]).toBe('"Germany","DE"');
  });

  it('should escape values containing commas', () => {
    const csv = convertToCSV([{ Name: 'Last, First' }]);
    expect(csv).toContain('"Last, First"');
  });

  it('should escape values containing double-quotes', () => {
    const csv = convertToCSV([{ Name: 'Say "Hello"' }]);
    expect(csv).toContain('"Say ""Hello"""');
  });

  it('should handle numeric values by converting them to strings', () => {
    const csv = convertToCSV([{ Population: 83000000 }]);
    expect(csv).toContain('83000000');
  });
});

describe('formatCountryForExport', () => {
  it('should map RestCountryData fields to the export schema', () => {
    const result = formatCountryForExport(mockCountry);
    expect(result['Country Name']).toBe('Germany');
    expect(result['ISO 3166-1 Alpha-2']).toBe('DE');
    expect(result['ISO 3166-1 Alpha-3']).toBe('DEU');
    expect(result['ISO 3166-1 Numeric']).toBe('276');
    expect(result['Region']).toBe('Europe');
    expect(result['SubRegion']).toBe('Western Europe');
    expect(result['Population']).toBe('83240525');
    expect(result['Capital']).toBe('Berlin');
    expect(result['Currency']).toBe('EUR');
    expect(result['Languages']).toBe('German');
  });

  it('should handle missing optional fields gracefully', () => {
    const sparse = { ...mockCountry, capital: [], currencies: {}, languages: {}, timezones: [] };
    const result = formatCountryForExport(sparse);
    expect(result['Capital']).toBe('');
    expect(result['Currency']).toBe('');
    expect(result['Languages']).toBe('');
    expect(result['Timezone']).toBe('');
  });
});

describe('formatSubdivisionForExport', () => {
  it('should map SubdivisionData fields to the export schema', () => {
    const result = formatSubdivisionForExport(mockSubdivision, 'Germany');
    expect(result['Subdivision Name']).toBe('Berlin');
    expect(result['Code']).toBe('DE-BE');
    expect(result['Parent Country']).toBe('Germany');
    expect(result['Type']).toBe('State');
    expect(result['Latitude']).toBe('52.52');
    expect(result['Longitude']).toBe('13.405');
    expect(result['Flag URL']).toBe(mockSubdivision.flag);
  });

  it('should handle missing latLng gracefully', () => {
    const noLatLng = { ...mockSubdivision, latLng: undefined as unknown as [number, number] };
    const result = formatSubdivisionForExport(noLatLng, 'Germany');
    expect(result['Latitude']).toBe('');
    expect(result['Longitude']).toBe('');
  });
});

describe('exportCountryAsCSV', () => {
  it('should trigger a CSV download without throwing', () => {
    const exported = formatCountryForExport(mockCountry);
    expect(() => exportCountryAsCSV(exported)).not.toThrow();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });
});

describe('exportSubdivisionsAsCSV', () => {
  it('should trigger a CSV download for subdivisions without throwing', () => {
    const exported = [formatSubdivisionForExport(mockSubdivision, 'Germany')];
    expect(() => exportSubdivisionsAsCSV(exported, 'Germany', 'DE')).not.toThrow();
  });
});

describe('exportCountryAsJSON', () => {
  it('should trigger a JSON download without throwing', () => {
    const exported = formatCountryForExport(mockCountry);
    expect(() => exportCountryAsJSON(exported)).not.toThrow();
  });
});

describe('exportSubdivisionsAsJSON', () => {
  it('should trigger a JSON download for subdivisions without throwing', () => {
    const exported = [formatSubdivisionForExport(mockSubdivision, 'Germany')];
    expect(() => exportSubdivisionsAsJSON(exported, 'Germany', 'DE')).not.toThrow();
  });
});
