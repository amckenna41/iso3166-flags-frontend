/**
 * Regression tests for the security fixes and the data-loss bugs they sat next
 * to. Each test names the behaviour that was previously wrong.
 */
import {
  convertToCSV,
  escapeCSVValue,
  formatCountryForExport,
  formatSubdivisionForExport,
} from '../../../src/utils/exportUtils';
import { readCountryList, writeCountryList } from '../../../src/utils/storage';
import { isValidSubdivisionCode, oneOf, mergeUrlState, readUrlState } from '../../../src/utils/urlState';
import { resolveCountry, COUNTRIES } from '../../../src/data/countries';

describe('CSV formula injection', () => {
  it.each(['=', '+', '-', '@', '\t', '\r'])('neutralises a leading %j', trigger => {
    expect(escapeCSVValue(`${trigger}HYPERLINK("http://evil")`)).toMatch(/^'/);
  });

  it('leaves ordinary values untouched', () => {
    expect(escapeCSVValue('County Cork')).toBe('County Cork');
  });

  it('does not emit an evaluable formula through convertToCSV', () => {
    const csv = convertToCSV([{ Name: '=cmd|calc' }]);
    // The data row must not begin a field with =
    expect(csv.split('\n')[1]).toBe(`"'=cmd|calc"`);
  });

  it('still escapes embedded quotes', () => {
    expect(convertToCSV([{ Name: 'a"b' }]).split('\n')[1]).toBe('"a""b"');
  });
});

describe('export value preservation', () => {
  it('keeps zero and false rather than blanking them', () => {
    expect(escapeCSVValue(0)).toBe('0');
    expect(escapeCSVValue(false)).toBe('false');
    expect(escapeCSVValue(null)).toBe('');
    expect(escapeCSVValue(undefined)).toBe('');
  });

  it('keeps a population or area of zero', () => {
    const out = formatCountryForExport({ population: 0, area: 0 } as any);
    expect(out.Population).toBe('0');
    expect(out['Area (km²)']).toBe('0');
  });

  it('keeps coordinates on the equator and prime meridian', () => {
    const out = formatSubdivisionForExport({ code: 'X-1', name: 'n', type: 't', latLng: [0, 0] } as any, 'C');
    expect(out.Latitude).toBe('0');
    expect(out.Longitude).toBe('0');
  });

  it('emits blanks for genuinely missing coordinates', () => {
    const out = formatSubdivisionForExport({ code: 'X-1', name: 'n', type: 't' } as any, 'C');
    expect(out.Latitude).toBe('');
  });

  it('unions keys so a sparse first row cannot drop columns', () => {
    expect(convertToCSV([{ a: 1 }, { a: 2, b: 3 }]).split('\n')[0]).toBe('"a","b"');
  });
});

describe('localStorage shape validation', () => {
  beforeEach(() => localStorage.clear());

  it('returns [] for a non-array payload instead of throwing later', () => {
    localStorage.setItem('k', JSON.stringify({ code: 'IE' }));
    expect(readCountryList('k')).toEqual([]);
  });

  it('returns [] for unparseable JSON', () => {
    localStorage.setItem('k', 'not json');
    expect(readCountryList('k')).toEqual([]);
  });

  it('drops malformed entries but keeps valid ones', () => {
    localStorage.setItem('k', JSON.stringify([{ code: 'IE', name: 'Ireland' }, { code: 5 }, null, 'x']));
    expect(readCountryList('k')).toEqual([{ code: 'IE', name: 'Ireland' }]);
  });

  it('round-trips a written list', () => {
    writeCountryList('k', [{ code: 'FR', name: 'France' }]);
    expect(readCountryList('k')).toEqual([{ code: 'FR', name: 'France' }]);
  });
});

describe('URL parameter validation', () => {
  it('accepts real subdivision codes', () => {
    ['IE-C', 'US-CA', 'KE-01'].forEach(c => expect(isValidSubdivisionCode(c)).toBe(true));
  });

  it('rejects anything else', () => {
    ['<script>', 'IE', 'IE-', 'TOOLONG-XX', '', null, undefined].forEach(c =>
      expect(isValidSubdivisionCode(c as any)).toBe(false)
    );
  });

  it('constrains a value to an allowed set', () => {
    expect(oneOf('name-asc', ['code-asc', 'name-asc'] as const, 'code-asc')).toBe('name-asc');
    expect(oneOf('../../etc/passwd', ['code-asc', 'name-asc'] as const, 'code-asc')).toBe('code-asc');
  });
});

describe('URL state merging', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'));

  it('merges instead of replacing, so two owners do not clobber each other', () => {
    mergeUrlState({ country: 'IE' });
    mergeUrlState({ sort: 'name-asc' });
    expect(readUrlState()).toEqual({ country: 'IE', sort: 'name-asc' });
  });

  it('removes a key when given an empty value', () => {
    mergeUrlState({ country: 'IE', filter: 'cork' });
    mergeUrlState({ filter: null });
    expect(readUrlState()).toEqual({ country: 'IE' });
  });
});

describe('country resolution', () => {
  it('resolves alpha-2, alpha-3 and name, case insensitively', () => {
    expect(resolveCountry('IE')?.code).toBe('IE');
    expect(resolveCountry('irl')?.code).toBe('IE');
    expect(resolveCountry('Ireland')?.code).toBe('IE');
    expect(resolveCountry('  united kingdom ')?.code).toBe('GB');
  });

  it('returns null for unknown input', () => {
    ['ZZ', 'javascript:alert(1)', '', null, undefined].forEach(v =>
      expect(resolveCountry(v as any)).toBeNull()
    );
  });

  it('covers the full ISO 3166-1 list', () => {
    expect(COUNTRIES).toHaveLength(249);
  });
});
