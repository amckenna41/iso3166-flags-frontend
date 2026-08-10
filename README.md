# 🌍 ISO 3166 Flags Explorer

An interactive map for exploring countries and their administrative subdivisions (regions/states) with comprehensive country and regional flags and detailed information sourced from the ISO 3166 standard. All data sourced from the custom-built [iso3166-flags](https://github.com/iso3166-flags) dataset and repository.

Visit the ISO 3166 Flags Explorer here:
> https://iso3166-flags.vercel.app/

<br>

## Features

- **Interactive World Map**: Explore countries and regions with an interactive map interface. Zoom, pan, and click to learn more about countries and regions. Clicking a country outlines it in blue and leaves your current view untouched, and the map can be switched between Miller and Mercator projections. Countries and territories too small to have an outline of their own — Curaçao, Monaco, Singapore, Hong Kong, the Channel Islands and 70 others — are marked with a pin when selected, so they are reachable on the map like anywhere else.
- **Rich Subdivision Data**: Access comprehensive information about over 5,000 administrative subdivisions including flags, local names, precise coordinates, parent codes, and historical change records from the ISO 3166-2 standard. Flags are shown only where one officially exists — most subdivisions have none, and those say so rather than linking to a file that is not there.
- **Browse Country by Country**: Arrows in the country card step to the previous or next country alphabetically, without going back to the dropdown.
- **Comprehensive Flags**: Browse thousands of official flags for countries and their subdivisions sourced from the [ISO 3166 Flags Dataset](https://github.com/amckenna41/iso3166-flags).
- **Historical Updates**: Access historical information about changes to subdivision codes and naming conventions from the [ISO 3166 Updates Dataset](https://github.com/iso3166-updates).
- **Country Comparison**: Compare up to four countries side by side — codes, capital, region, population, area, currencies, languages, timezones and TLDs — and export the comparison to CSV or JSON.
- **Search Anywhere**: Search subdivisions by name or code across every country, and find countries by name, alpha-2 or alpha-3 code ("Ireland", "IE", "IRL").
- **Favourites & Recents**: Starred and recently viewed countries are kept in the browser and surface at the top of the country dropdown.
- **Shareable Links**: The country, subdivision, filter, type and sort are all mirrored into the URL, so a link reproduces the exact view you were looking at.
- **Works Offline**: A service worker precaches the app shell and caches flags and subdivision data, so revisits load instantly and previously viewed countries keep working without a network.
- **Keyboard & Screen Reader Friendly**: Every dropdown, menu and modal is operable from the keyboard with ARIA roles and states.

## Shareable links

| Parameter | Accepts | Example |
|---|---|---|
| `country` | alpha-2, alpha-3 or country name | `?country=IE` · `?country=IRL` · `?country=Ireland` |
| `subdivision` | ISO 3166-2 code belonging to `country` | `?country=GB&subdivision=GB-ENG` |
| `filter` | free text matched against subdivision name/code | `?country=IE&filter=cork` |
| `type` | subdivision type as listed in the type filter | `?country=IE&type=County` |
| `sort` | `code-asc`, `name-asc`, `name-desc` | `?country=IE&sort=name-asc` |

Anything unrecognised is ignored rather than applied.

## Testing

```bash
npm test          # Jest unit tests (jest.config.js)
npm run test:ci   # ...with coverage, non-watch
npm run cypress:run   # Cypress E2E suite
```

## Data sources

- [ISO 3166 Flags Dataset](https://github.com/amckenna41/iso3166-flags) - Comprehensive flag imagery for countries and subdivisions
- [ISO 3166 Updates Dataset](https://github.com/iso3166-updates) - Historical changes to ISO 3166 codes and naming

## Configuration

All application configuration is centralized in [`src/config/appConfig.ts`](src/config/appConfig.ts). This eliminates the need for environment variables and makes configuration management simpler and more explicit.

**Key configuration values:**
- **API Endpoints**: ISO 3166-2 API and REST Countries API
- **Data Sources**: Flag repository URLs
- **External Links**: References to datasets and repositories

API base URLs can be overridden via `REACT_APP_*` environment variables (see `.env.example`). If no `.env` file is present, `src/config/appConfig.ts` falls back to the public production endpoints, so no `.env` file is required for local development.
- [ISO 3166-2 Dataset](https://github.com/iso3166-2) - ISO 3166-2 subdivision data