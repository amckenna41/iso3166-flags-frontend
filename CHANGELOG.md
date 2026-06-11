# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Fixed
- **Country dropdown highlight** — Selecting a country via the dropdown now correctly highlights it on the map. The `useEffect` that applies selection styling when the `selectedCountry` prop changes was setting SVG attributes but not the corresponding inline `style` properties. Because jsvectormap uses inline styles internally, the attribute-only update was silently overridden and the country appeared unhighlighted. The fix mirrors the same `element.style.*` writes already present in the direct-click path.

---

## [0.1.0] — 2026-04-04

### Security
- **[XSS fix]** Replaced `dangerouslySetInnerHTML` in `JSVectorMapComponent` with a JSX-rendered tooltip. The previous implementation assembled an HTML string containing an inline `onerror` JS event handler, creating a cross-site scripting vulnerability.

### Added
- **Env-var configuration** — `appConfig.ts` now reads API base URLs from `REACT_APP_*` environment variables, with sensible defaults. `.env` and `.env.example` files added to the project root.
- **Unit tests** — Added `tests/unit/utils/exportUtils.test.ts` (14 tests) and `tests/unit/utils/errorHandler.test.ts` (16 tests), covering previously untested utility modules.
- **`data-testid` attributes** — Added `data-testid` selectors to `CountryDropdown` (`country-dropdown-trigger`, `country-dropdown-list`, `country-dropdown-search`, `country-dropdown-clear`, `country-option-{CODE}`) to support reliable E2E testing.
- **Cypress E2E stubs** — Rewrote `cypress/e2e/country-selection.cy.ts` to use `cy.intercept()` stubs and `data-testid` selectors.
- **ARIA accessibility** — Added ARIA attributes across interactive components:
  - `CountryDropdown`: `aria-expanded`, `aria-haspopup="listbox"` on trigger button
  - `SubdivisionDropdown`: `aria-expanded`, `aria-haspopup="listbox"` on trigger button
  - `SearchComponent`: `aria-label` and `aria-autocomplete="list"` on input; `aria-expanded` and `aria-controls` linking input to results list; `role="listbox"` on results container; `role="option"` on each result item; `aria-label="Clear search"` on clear button

### Changed
- **`handleSearchResult` memoised** — Wrapped `handleSearchResult` in `InteractiveMap` with `useCallback` to prevent unnecessary re-renders of `SearchComponent`.
- **Spinner animation** — Replaced the non-functional `className="animate-spin"` (Tailwind, which is not loaded in this project) on the `Loader` icon in `SubdivisionDropdown` with a `SpinningLoader` styled-component using a `keyframes` CSS animation. The spinner now actually animates.
- **Mouse position tracking** — Changed `mousePosition` in `JSVectorMapComponent` from a `useState` to a `useRef`. Mouse events no longer trigger React re-renders; the tooltip position only re-renders when the tooltip is visible.
- **Selection-lock interval** — Reduced the `setInterval` that enforces selected-region styling from `16 ms` (~60 fps) to `100 ms`, significantly reducing CPU usage while remaining visually imperceptible.
- **`tsconfig.json`** — Added `"tests"` to the `include` array so TypeScript now type-checks the `tests/` directory.
- **`package.json`** — Moved all test and type-definition packages (`@testing-library/*`, `@types/*`) from `dependencies` to `devDependencies`.
- **`errorHandler.ts`** — Changed `getErrorMessage` parameter type from `any` to `unknown` with explicit type narrowing, improving type safety.

### Fixed
- **Silent API error swallowing** — `getCountrySubdivisions` in `iso3166Service.ts` previously returned `{}` on failure, silently masking errors and preventing `InteractiveMap`'s error UI from ever showing. It now re-throws so callers can handle errors properly.
- **Duplicate `SubdivisionData` interface** — Removed the local `SubdivisionData` interface in `SubdivisionDropdown.tsx` (which included an untyped `history?: any` field) and replaced it with an import of the canonical `SubdivisionData` type from `iso3166Service.ts`.
- **Broken `iso3166Service` tests** — Replaced incorrect calls to the non-existent `getRestCountryData` method in `tests/unit/services/iso3166Service.test.ts` with correct `getCountryInfo` tests using proper axios mocks.
- **Feature flag wiring** — `CountryInfo` now conditionally renders `<UsageGuide />` based on `APP_CONFIG.features.enableUsageGuide`, which was previously imported but never used.
- **Debug console logs** — Removed all development `console.log` calls (including ~25 emoji-prefixed logs) from `JSVectorMapComponent`, `InteractiveMap`, and `CountryInfo`.
- **Cache type safety** — `ISO3166Service` private cache type changed from `CacheEntry<any>` to `CacheEntry<unknown>`, requiring explicit casts on retrieval.

### Removed
- **"How to Use" section** — Removed the `<UsageGuide />` component from `CountryInfo`. The `UsageGuide.tsx` file is retained but no longer rendered.
