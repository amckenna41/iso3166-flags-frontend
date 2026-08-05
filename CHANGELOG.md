# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Security
- **CSV formula injection (CWE-1236)** — Export values beginning with `=`, `+`, `-`, `@`, tab or carriage return are now prefixed with a single quote. Quoting alone is not a defence: Excel, Sheets and LibreOffice strip the quotes and evaluate the cell. Subdivision names and local names come from a third-party API, so this is a live input path.
- **`/api/country-info` input validation** — The `code` parameter must be a 2-letter ISO 3166-1 alpha-2 code before any upstream request is made (`req.query` values can also be arrays, e.g. `?code=a&code=b`). `src/setupProxy.js` mirrors the same check so dev and production behave alike.
- **Upstream error masking** — Upstream 401/403 responses are no longer forwarded; everything except 404 is collapsed to a 502 so the endpoint cannot be used to probe the state of `REST_COUNTRIES_API_KEY`.
- **URL parameter validation** — `subdivision` is validated against the ISO 3166-2 code shape and must belong to the resolved country; `sort` is constrained to a known set; `country` goes through `resolveCountry()`, which returns `null` for anything unrecognised. Previously `subdivision` was trusted verbatim.
- **`localStorage` shape validation** — Favourites and recents are validated on read (`src/utils/storage.ts`). A tampered or stale entry parses as JSON but used to throw on `.map()` during render; malformed entries are now dropped individually.
- **CSP hardened** — Added `base-uri 'none'` and `form-action 'none'`; removed `https://restcountries.com` from `connect-src` (that API is only ever called server-side through the proxy function).
- **`.vercelignore`** — Excludes `.env` and `.env.*` (keeping `.env.example`) so a CLI deploy cannot upload `REST_COUNTRIES_API_KEY`.

### Added
- **Map projection selector** — The map can be switched between the two projections jsvectormap ships, Miller (`world`) and Mercator (`world_merc`), from a control in the top-right of the map. Switching rebuilds the map instance (the library cannot swap map data in place) and carries the current selection, highlight and every callback across.
- **About dialog** — `AboutModal` presents the project information (`DemoInfo`) in a proper dialog: `role="dialog"`, `aria-modal`, focus moved in on open and restored on close, Escape to dismiss, a Tab focus trap, and backdrop-click to close.
- **Country comparison** — New `CountryComparison` panel, opened from the **Compare** button in the header, showing up to four countries side by side across 13 fields. Seeded with the country currently selected, and exportable to CSV or JSON.
- **Offline support (PWA)** — A workbox service worker (`src/service-worker.ts`) precaches the app shell, caches flag images cache-first (600 entries / 30 days) and subdivision data stale-while-revalidate (300 entries / 7 days). Registered in production only, after `load` (`src/serviceWorkerRegistration.ts`). `public/manifest.json` now carries the app's real name, description, maskable icon and theme colours.
- **Error boundaries** — `ErrorBoundary` wraps the app, the map, the info panel and the comparison panel, so a render throw in one area shows a recoverable "Try again" fallback instead of blanking the page.
- **Keyboard navigation** — `CountryDropdown` supports ArrowUp/ArrowDown/Home/End/Enter/Escape with a highlighted option (`aria-selected`, auto-scrolled into view); `SearchComponent` supports arrow keys and Enter with `role="combobox"` and `aria-activedescendant`; `ExportButton` submenus open on click and Enter/Space instead of hover only.
- **Country list (`src/data/countries.ts`)** — The full ISO 3166-1 list (249 entries) with alpha-2, alpha-3 and name, plus `resolveCountry()`. The dropdown now matches on alpha-3 and alpha-2 as well as name ("IRL", "IE" and "Ireland" all find Ireland), and the `country` URL parameter accepts all three forms.
- **Shareable view state** — `filter`, `type` and `sort` are mirrored into the query string alongside `country` and `subdivision`, so a shared link reproduces the exact view rather than just the country.
- **In-flight request de-duplication** — `ISO3166Service` joins identical requests that are already in flight, so two components reacting to the same click no longer fire duplicate requests.
- **New utilities** — `src/utils/storage.ts` (validated localStorage reads), `src/utils/urlState.ts` (merging query-string state), `src/utils/dom.ts` (`scrollIntoView` guard), `src/utils/useLatestRequest.ts` (out-of-order response guard).
- **`exportCountriesComparisonAsJSON`** — JSON counterpart to the existing comparison CSV export.
- **Dev proxy for the ISO 3166-2 API** — `setupProxy.js` proxies `/api/iso3166-2` in development while the upstream API lacks CORS headers.
- **Tests** — Suite grew from 147 to 202 across 19 suites: `tests/unit/utils/security.test.ts`, `tests/unit/utils/useLatestRequest.test.tsx`, `tests/unit/components/InteractiveMapUrl.test.tsx`, `tests/unit/components/CountryComparison.test.tsx`, `tests/unit/components/ErrorBoundary.test.tsx`, `tests/unit/api/countryInfo.test.ts`, `tests/unit/components/JSVectorMapSelection.test.tsx` (region highlighting, code casing, paint order), `tests/unit/components/JSVectorMapVariant.test.tsx` (projection switch, selection carried across a rebuild, tooltip show/hide) and `tests/unit/components/AboutModal.test.tsx` (dialog render, all three close paths, header-button wiring), plus keyboard-navigation cases in `CountryDropdown.test.tsx` and de-duplication cases in `iso3166Service.test.ts`. jsvectormap is mocked in the map suites — jsdom implements no `getBBox`. The Cypress suite grew from 36 to 38: the vacuous About test (it clicked the button and asserted nothing) now checks the dialog opens and closes, plus new specs for the projection switch and the selected-country outline against the real map DOM.

### Changed
- **Selecting a country no longer moves the viewport** — `setFocus()` auto-zoom on selection has been removed, along with the reset-to-world-view that undid it. Selection is a highlight; the user's own zoom and pan survive picking a country from the map or the dropdown.
- **Selected-country outline** — The selected region is drawn with a heavier, darker outline (`#1d4ed8`, width 3) that is distinct from the hover style, uses `vector-effect: non-scaling-stroke` so it keeps a constant on-screen width at any zoom, and is moved last in its parent so neighbouring fills cannot paint over the shared border.
- **Hover tooltip content** — Reduced to the country flag and name; the `Code: XX` line and the "Click to view subdivisions" hint have been removed.
- **Map overlays moved out of the jsvectormap container** — The setup effect clears its container with `innerHTML = ''` on every build. React-rendered overlays are now siblings of that node rather than children, so a rebuild cannot tear them out from under React.
- **GitHub Actions upgrades** — `actions/checkout` v4 → v7 (13 uses) and `actions/setup-node` v4 → v7 (11 uses) across all six workflows.
- **TypeScript stays on 4.9.5** — An attempted bump to ^7.0.2 was reverted. `react-scripts` 5 resolves TypeScript with `resolve@1`, which does not understand the `exports`-only package manifest that modern TypeScript ships, so the build fails with `Cannot find module 'typescript'` on Vercel and in CI. Upgrading needs the move off CRA first.
- **Search is no longer gated on a country** — The cross-country subdivision search was hidden until a country had been selected, which defeated its purpose. It is always visible; only the subdivision dropdown depends on a selection.
- **Map selection styling** — The 100 ms polling interval that repainted the selected region has been replaced by a `[data-selected='true']` CSS rule marked `!important`, which outranks the inline styles jsvectormap re-applies on hover. The component only toggles an attribute.
- **Map tooltip position** — Cursor coordinates moved from the styled-components template into an inline style; interpolating them was injecting a new class and stylesheet rule per pixel of mouse movement.
- **Jest runs standalone** — `npm test` / `npm run test:ci` use `jest.config.js` directly instead of `react-scripts test`; the inline `jest` block in `package.json` is gone and `react-scripts` / `typescript` moved to `devDependencies`.
- **Dependency upgrades** — `axios` ^1.12.2 → ^1.19.0, `styled-components` ^6.1.19 → ^6.4.4, `react` / `react-dom` ^19.1.1 → ^19.2.8, `@types/react` ^19.1.16 → ^19.2.18, `@types/react-dom` ^19.1.9 → ^19.2.4, `@testing-library/react` ^16.3.0 → ^16.3.2, `@testing-library/jest-dom` ^6.8.0 → ^7.0.0, `@types/jest` ^27.5.2 → ^30.0.0, `@types/styled-components` ^5.1.34 → ^5.1.36, `cypress` ^13.0.0 → ^15.19.0; added the `workbox-*` packages.
- **Feature flags trimmed** — Removed `showDebugLogs` and `enableUsageGuide`; flags nothing reads are dead code, not configuration.

### Fixed
- **Country selection was never highlighted** — Clicking a country, or picking one from the dropdown, left the map unchanged. Two independent faults in the same path: `setRegionSelected` read the SVG node from `region.element.node`, but jsvectormap stores regions as `{ config, element: Region }` with the path one level deeper at `element.shape.node`, so the lookup was always `undefined` and the function returned early; and both call sites lowercased the country code before comparing it against `Object.keys(regions)`, which jsvectormap keys **uppercase** (`IE`, `US`), so no region ever matched. The same casing fault meant `setFocus()` was being handed a code the map data does not contain.
- **Hover tooltip never disappeared** — The tooltip stayed pinned to the map after the cursor left a country. The component passed an `onRegionOut` callback, but jsvectormap has no such option — its event list is `onRegionClick`, `onRegionSelected` and `onRegionTooltipShow`, and its internal `mouseout` handling hides only the built-in tooltip and emits nothing. Leaving a region is now detected from the DOM via `mousemove` (target is not a `.jvm-region`) and `mouseleave` (cursor off the map entirely). This also fixes `onCountryLeave` never firing, which left `hoveredCountry` stuck in `InteractiveMap`.
- **About button did nothing** — It was wired to `setInfoPanelCollapsed(false)`, but that state initialises to `false`, so the click set the value it already held and nothing rendered differently. It now opens the About dialog.
- **Stale service worker breaking the dev server** — `register()` returned early in development without touching an existing registration, so a worker left behind by a local production build (`serve -s build` on `:3000`) kept control of the origin and served its precached bundle to the dev server. The mismatched webpack runtime surfaced as `originalFactory.call is not a function` from react-refresh. Development now enumerates and unregisters any leftover workers.
- **Out-of-order responses** — Clicking through countries quickly, or typing quickly in the search box, could land an older response last and show one country's data under another country's name. Country selection, subdivision selection, search and country-info fetches now discard superseded responses (`useLatestRequest`), and no longer set state after unmount.
- **Subdivision flag URLs** — `getSubdivisionFlagUrl` lowercased, zero-padded and asked for `.png`, producing `IE/IE-0c.png`, which 404s. It now produces `IE/IE-C.svg`, matching how the flags repository stores them.
- **Zero values blanked on export** — A population, area, latitude or longitude of `0` was exported as an empty cell (truthiness check instead of `Number.isFinite`). The equator and prime meridian are valid coordinates.
- **Dropped CSV columns** — `convertToCSV` took its headers from the first row only, so a sparse first row silently dropped every column the later rows added. Headers are now the union of all rows' keys.
- **Subdivision modal navigation** — Next/previous and the "3 of 47" counter used the unfiltered subdivision list, so they jumped to cards that were not on screen and disagreed with the visible results. Both now follow the filtered list.
- **Filters cleared by their own link** — Opening a link carrying `filter`/`type`/`sort` reset those values as soon as the country's data loaded. The reset now fires only when the user moves to a *different* country.
- **Clear button markup** — `CountryDropdown`'s clear control was a `<span role="button">` nested inside the trigger `<button>`; invalid HTML that swallowed keyboard events. It is now a real sibling `<button>` with a visible focus outline.
- **`scrollIntoView` crashes** — Guarded via `scrollIntoViewIfSupported`; the API is missing in jsdom and in some older mobile browsers, turning a cosmetic scroll into a render crash.
- **Timer leak** — The delayed scroll-to-subdivision `setTimeout` is now cleared on unmount / dependency change.
- **Debug text in the UI** — Removed the "Debug: countryData has N keys" line from the empty-subdivisions message.
- **Missing `data-testid` on the map wrapper** — It was applied via `MapWrapper.defaultProps`, which React 19 ignores for function components, so `[data-testid="interactive-map"]` never reached the DOM. It is now set on the element itself.
- **Cypress suite green again (36 tests)** — The specs had drifted from the app: intercepts matched `iso3166-2-api.vercel.app` and so missed the new `/api/iso3166-2` dev proxy; the country-info stub still used the pre-v5 response shape; `[role="listbox"]` now matches the country dropdown as well as the search results, so the search assertions are scoped to `#search-results-list`; the About button was searched for by the text "Info"; and `cy.viewport('iphone-12')` is not a preset in Cypress 13 (replaced with `iphone-x`). Added E2E coverage for the comparison panel.
- **Vacuous unit test** — `CountryDropdown`'s "closes dropdown when a country is selected" wrapped its only assertion in an `if` that is never true now that country rows carry `role="option"`, so the test passed even with `onCountrySelect` disabled. It now asserts the callback and the closed state directly.

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
