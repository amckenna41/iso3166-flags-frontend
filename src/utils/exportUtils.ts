/**
 * Export utilities for CSV and JSON data export
 */
import { RestCountryData, SubdivisionData } from '../services/iso3166Service';

export interface CountryExportData {
  'Country Name': string;
  'ISO 3166-1 Alpha-2': string;
  'ISO 3166-1 Alpha-3': string;
  'ISO 3166-1 Numeric': string;
  'Region': string;
  'SubRegion': string;
  'Population': string;
  'Area (km²)': string;
  'Capital': string;
  'Timezone': string;
  'Currency': string;
  'Languages': string;
}

// Key order is the CSV column order and the JSON key order — both come straight
// from Object.keys, so keep this list and the literal in formatSubdivisionForExport
// in the same order.
export interface SubdivisionExportData {
  'Subdivision Name': string;
  'Code': string;
  'Local Name': string;
  'Parent Country': string;
  'Parent Code': string;
  'Type': string;
  'Flag URL': string;
  'Latitude': string;
  'Longitude': string;
}

/**
 * Neutralise spreadsheet formula injection (CWE-1236).
 *
 * Excel / Sheets / LibreOffice strip the surrounding quotes of a CSV field and
 * then evaluate it if it starts with a formula trigger, so quoting alone is not
 * a defence. Prefixing a single quote forces the cell to be read as text.
 * Subdivision names and local names come from a third-party API, so this is a
 * live input path — not a theoretical one.
 */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

export const escapeCSVValue = (value: unknown): string => {
  // Only null/undefined become empty — 0 and false are real values and must survive.
  const stringValue = value === null || value === undefined ? '' : String(value);
  return FORMULA_TRIGGERS.includes(stringValue.charAt(0)) ? `'${stringValue}` : stringValue;
};

/**
 * Convert array of objects to CSV format
 */
export const convertToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';

  // Union of keys across all rows so a sparse first row cannot drop columns
  const headers = Array.from(new Set(data.flatMap(item => Object.keys(item))));
  const headerLine = headers.map(h => `"${h}"`).join(',');

  // Convert data rows — every field is quoted, inner quotes doubled
  const rows = data.map(item =>
    headers.map(header => `"${escapeCSVValue(item[header]).replace(/"/g, '""')}"`).join(',')
  );

  return [headerLine, ...rows].join('\n');
};

/**
 * Download CSV file to user's device
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up URL object
  URL.revokeObjectURL(url);
};

/**
 * Export country data to CSV
 */
export const exportCountryAsCSV = (country: CountryExportData): void => {
  const csvContent = convertToCSV([country]);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${country['Country Name']
    .toLowerCase()
    .replace(/\s+/g, '-')}-${country['ISO 3166-1 Alpha-2'].toLowerCase()}-${timestamp}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Export subdivisions to CSV
 */
export const exportSubdivisionsAsCSV = (
  subdivisions: SubdivisionExportData[],
  countryName: string,
  countryCode: string
): void => {
  const csvContent = convertToCSV(subdivisions);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${countryName
    .toLowerCase()
    .replace(/\s+/g, '-')}-subdivisions-${countryCode.toLowerCase()}-${timestamp}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Export multiple countries for comparison
 */
export const exportCountriesComparison = (
  countries: CountryExportData[]
): void => {
  const csvContent = convertToCSV(countries);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `countries-comparison-${timestamp}.csv`;

  downloadCSV(csvContent, filename);
};

/**
 * Export multiple countries for comparison as JSON
 */
export const exportCountriesComparisonAsJSON = (
  countries: CountryExportData[]
): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  downloadJSON(countries, `countries-comparison-${timestamp}.json`);
};

// ── JSON export helpers ───────────────────────────────────────────────────────

/**
 * Download a JSON file to the user's device
 */
export const downloadJSON = (data: object, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export country data as a JSON file
 */
export const exportCountryAsJSON = (country: CountryExportData): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${country['Country Name']
    .toLowerCase()
    .replace(/\s+/g, '-')}-${country['ISO 3166-1 Alpha-2'].toLowerCase()}-${timestamp}.json`;
  downloadJSON(country, filename);
};

/**
 * Export subdivisions as a JSON file
 */
export const exportSubdivisionsAsJSON = (
  subdivisions: SubdivisionExportData[],
  countryName: string,
  countryCode: string
): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${countryName
    .toLowerCase()
    .replace(/\s+/g, '-')}-subdivisions-${countryCode.toLowerCase()}-${timestamp}.json`;
  downloadJSON(subdivisions, filename);
};

/**
 * Format country object for export
 */
export const formatCountryForExport = (country: RestCountryData): CountryExportData => {
  // Number.isFinite, not truthiness — a population or area of 0 is a real value
  const num = (n: number | undefined) => (Number.isFinite(n) ? String(n) : '');

  return {
    'Country Name': country.name?.common || country.name?.official || '',
    'ISO 3166-1 Alpha-2': country.cca2 || '',
    'ISO 3166-1 Alpha-3': country.cca3 || '',
    'ISO 3166-1 Numeric': country.ccn3 || '',
    'Region': country.region || '',
    'SubRegion': country.subregion || '',
    'Population': num(country.population),
    'Area (km²)': num(country.area),
    'Capital': (country.capital && country.capital.length > 0 ? country.capital[0] : '') || '',
    'Timezone': (country.timezones && country.timezones.length > 0 ? country.timezones[0] : '') || '',
    'Currency': Object.keys(country.currencies || {}).join(', ') || '',
    'Languages': Object.values(country.languages || {}).join(', ') || '',
  };
};

/**
 * Format subdivision object for export
 */
export const formatSubdivisionForExport = (
  subdivision: SubdivisionData,
  countryName: string
): SubdivisionExportData => {
  // Number.isFinite, not truthiness — the equator (lat 0) and prime meridian
  // (lng 0) are valid coordinates and were previously exported as blank.
  const latitude = Number.isFinite(subdivision.latLng?.[0]) ? String(subdivision.latLng[0]) : '';
  const longitude = Number.isFinite(subdivision.latLng?.[1]) ? String(subdivision.latLng[1]) : '';


  return {
    'Subdivision Name': subdivision.name || '',
    'Code': subdivision.code || '',
    'Local Name': subdivision.localOtherName || '',
    'Parent Country': countryName,
    'Parent Code': subdivision.parentCode || '',
    'Type': subdivision.type || '',
    'Flag URL': subdivision.flag || '',
    'Latitude': latitude,
    'Longitude': longitude,
  };
};
