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
  
  // API Configuration
  api: {
    iso3166_2: 'https://iso3166-2-api.vercel.app/api',
    restCountries: 'https://restcountries.com/v3.1',
  },
  
  // Data source URLs
  data: {
    flagsRepository: 'https://raw.githubusercontent.com/amckenna41/iso3166-flags/main',
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
  },
};

export default APP_CONFIG;
