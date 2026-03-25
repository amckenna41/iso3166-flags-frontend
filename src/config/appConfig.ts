/**
 * Application Configuration
 * 
 * Centralized configuration file for the application.
 * All environment-specific values are defined here.
 */

export const APP_CONFIG = {
  // Application information
  name: 'ISO 3166 Flags Explorer',
  version: '1.0.0',
  
  // API Configuration — values come from environment variables (see .env.example)
  api: {
    iso3166_2: process.env.REACT_APP_ISO3166_2_API ?? 'https://iso3166-2-api.vercel.app/api',
    restCountries: process.env.REACT_APP_REST_COUNTRIES_API ?? 'https://restcountries.com/v3.1',
  },
  
  // Data source URLs
  data: {
    flagsRepository: process.env.REACT_APP_FLAGS_REPOSITORY ?? 'https://raw.githubusercontent.com/amckenna41/iso3166-flags/main',
  },
  
  // External links
  links: {
    flagsDataset: 'https://github.com/amckenna41/iso3166-flags',
    updatesDataset: 'https://github.com/iso3166-updates',
    github: 'https://github.com/amckenna41',
  },
  
  // Feature flags (can be used to enable/disable features)
  features: {
    showDebugLogs: false,
    enableKeyboardNavigation: true,
    // Toggle individual UI features without code changes
    enableExport: true,
    enableSearch: true,
    enableUsageGuide: true,
  },
};

export default APP_CONFIG;
