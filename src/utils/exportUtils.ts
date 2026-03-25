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

export interface SubdivisionExportData {
  'Subdivision Name': string;
  'Code': string;
  'Parent Country': string;
  'Type': string;
  'Latitude': string;
  'Longitude': string;
  'Parent Code': string;
  'Flag URL': string;
  'Local Name': string;
}

/**
 * Convert array of objects to CSV format
 */
export const convertToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const headerLine = headers.map(h => `"${h}"`).join(',');

  // Convert data rows
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header];
      // Escape quotes and wrap in quotes if contains comma, quotes, or newlines
      const stringValue = String(value || '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return `"${stringValue}"`;
    }).join(',')
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
  return {
    'Country Name': country.name?.common || country.name?.official || '',
    'ISO 3166-1 Alpha-2': country.cca2 || '',
    'ISO 3166-1 Alpha-3': country.cca3 || '',
    'ISO 3166-1 Numeric': country.ccn3 || '',
    'Region': country.region || '',
    'SubRegion': country.subregion || '',
    'Population': String(country.population || ''),
    'Area (km²)': String(country.area || ''),
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
  const latitude = subdivision.latLng && subdivision.latLng[0] ? String(subdivision.latLng[0]) : '';
  const longitude = subdivision.latLng && subdivision.latLng[1] ? String(subdivision.latLng[1]) : '';
  
  return {
    'Subdivision Name': subdivision.name || '',
    'Code': subdivision.code || '',
    'Parent Country': countryName,
    'Type': subdivision.type || '',
    'Latitude': latitude,
    'Longitude': longitude,
    'Parent Code': subdivision.parentCode || '',
    'Flag URL': subdivision.flag || '',
    'Local Name': subdivision.localOtherName || '',
  };
};
