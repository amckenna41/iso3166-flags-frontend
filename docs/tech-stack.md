# Tech Stack

## Runtime Platform

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| SPA framework | [React](https://react.dev) | 19.2.x | UI rendering, component model, hooks |
| Language | [TypeScript](https://www.typescriptlang.org) | 4.9.x | Static typing across all source files — pinned: `react-scripts` 5 resolves TypeScript through `resolve@1`, which ignores the `exports`-only manifest that TypeScript 5+ ships, so a newer compiler is not loadable until the build toolchain moves off CRA |
| Build toolchain | [Create React App](https://create-react-app.dev) (react-scripts) | 5.0.1 | Webpack bundler, dev server (a dev dependency — Jest now runs standalone) |
| Offline / PWA | [Workbox](https://developer.chrome.com/docs/workbox) | 7.4.x | Service worker: precached app shell, runtime caching of flags and subdivision data |
| Deployment | [Vercel](https://vercel.com) | — | Static CDN + Serverless Functions |

---

## Frontend Libraries

### UI & Styling

| Package | Version | Usage |
|---|---|---|
| [styled-components](https://styled-components.com) | 6.4.x | CSS-in-JS — all component styles, theming, animations, responsive breakpoints |
| [lucide-react](https://lucide.dev) | 0.544.x | Icon set (SVG icons as React components) |

### Map

| Package | Version | Usage |
|---|---|---|
| [jsvectormap](https://jsvectormap.com) | 1.7.x | Interactive SVG world map — click, hover, manual zoom/pan. Both bundled projections are registered (`world` Miller, `world_merc` Mercator) and selectable from the map |

### HTTP & Data

| Package | Version | Usage |
|---|---|---|
| [axios](https://axios-http.com) | 1.19.x | HTTP client for all API requests; request timeout configuration |

### Browser APIs (no package required)

| API | Usage |
|---|---|
| `Intl.DisplayNames` | Resolves ISO 3166-1 alpha-2 codes to English country names client-side |
| `IntersectionObserver` | Virtual scrolling — loads 30 subdivision cards at a time |
| `navigator.clipboard` | Copy-to-clipboard for subdivision codes and share links |
| `localStorage` | Persists favourite and recently-viewed countries across sessions |
| `URL / URLSearchParams` | Deep-link state sync (`?country=GB&subdivision=GB-ENG`) |
| `CustomEvent` / `window.dispatchEvent` | Decoupled cross-component communication (favourite toggle sync) |
| `Touch events` | Swipe left/right navigation in the subdivision modal on mobile |
| `ServiceWorker` / `Cache Storage` | Offline support — app shell, flag images and subdivision responses |
| `history.replaceState` | Query-string updates without a navigation or a router library |

---

## Backend (Vercel Serverless)

| File | Runtime | Purpose |
|---|---|---|
| `api/country-info.js` | Node.js (Vercel) | Proxy to RestCountries v5 API — holds `REST_COUNTRIES_API_KEY` server-side so it never reaches the browser bundle |
| `src/setupProxy.js` | Node.js (CRA dev server) | Express middleware that mirrors the Vercel function during local development — same request path, same env var, same `code` validation. Also proxies `/api/iso3166-2` while the upstream API lacks CORS headers |

### Environment Variables

| Variable | Where set | Purpose |
|---|---|---|
| `REST_COUNTRIES_API_KEY` | `.env.local` (local) · Vercel dashboard (prod) | Bearer token for RestCountries v5 API — **no** `REACT_APP_` prefix, never bundled |
| `REACT_APP_ISO3166_2_API` | `.env` (optional) | Override the ISO 3166-2 API base URL |
| `REACT_APP_FLAGS_REPOSITORY` | `.env` (optional) | Override the GitHub flags CDN base URL |

---

## External APIs & Data Sources

| Service | URL | Data provided |
|---|---|---|
| ISO 3166-2 API | `https://iso3166-2-api.vercel.app/api` | Subdivision name, type, parent code, coordinates, local name, history, flag URL |
| RestCountries v5 | `https://api.restcountries.com/countries/v5` | Country name, capital, region, population, area, currencies, languages, timezones, TLD, memberships |
| ISO 3166 Flags CDN | `https://raw.githubusercontent.com/amckenna41/iso3166-flags/main` | SVG country flags (`iso3166-1-flags/<cc>.svg`) and SVG subdivision flags (`iso3166-2-flags/<CC>/<CC>-<SUB>.svg`) |

---

## Testing

### Unit & Integration Tests

| Package | Version | Usage |
|---|---|---|
| [Jest](https://jestjs.io) | (via `jest.config.js`) | Test runner, assertion library, module mocking — run directly, not through `react-scripts test` |
| [@testing-library/react](https://testing-library.com/react) | 16.3.x | Component rendering and user-event simulation |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | 7.0.x | Custom DOM matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.) |
| [@testing-library/user-event](https://github.com/testing-library/user-event) | 13.5.x | Realistic user interaction simulation (type, click, keyboard) |
| [identity-obj-proxy](https://github.com/keyz/identity-obj-proxy) | 3.0.x | CSS module mock for Jest (maps class names to themselves) |

**Test coverage:** `src/**/*.test.{ts,tsx}` and `tests/**/*.test.{ts,tsx}` — 202 tests across 19 suites (components, services, utils and the `api/country-info` serverless handler). `JSVectorMapSelection.test.tsx` covers region highlighting, `JSVectorMapVariant.test.tsx` the projection switch and hover tooltip (jsvectormap is mocked — jsdom has no `getBBox`), and `AboutModal.test.tsx` the About dialog and its header button.

| Command | What it runs |
|---|---|
| `npm test` | Jest against `jest.config.js` |
| `npm run test:ci` | Same, with `--ci --coverage` |
| `npm run cypress:run` | Cypress E2E suite |

### End-to-End Tests

| Package | Version | Usage |
|---|---|---|
| [Cypress](https://www.cypress.io) | 15.x | Full browser E2E tests covering app load, country selection, search, and responsive layouts |

**Test suites:** `cypress/e2e/app.cy.ts`, `country-selection.cy.ts`, `search.cy.ts`, `responsive.cy.ts` — 38 tests, including the About dialog, the map projection switch and the selected-country outline (asserted against the real jsvectormap DOM, which the mocked unit suites cannot cover). All network calls are stubbed with `cy.intercept()` using path-only patterns (`**/alpha/*`, `**/search/**`, `**/api/country-info*`) so the same specs match both the dev proxy and the public API. Requires the dev server on `http://localhost:3000`.

---

## CI / CD

| Tool | Trigger | Steps |
|---|---|---|
| GitHub Actions (`.github/workflows/ci.yml`) | Push / PR to `main` | `npm ci` → unit tests with coverage → production build |
| Vercel | Push to `main` (post-CI) | Install → build (`INLINE_RUNTIME_CHUNK=false npm run build`) → deploy to CDN + Serverless |

---

## Security

| Measure | Implementation |
|---|---|
| API key isolation | `REST_COUNTRIES_API_KEY` lives only in Vercel env vars and `.env.local` — never in the browser bundle |
| Content Security Policy | Vercel `headers` config restricts `connect-src`, `script-src`, `img-src` to known origins, plus `base-uri 'none'` and `form-action 'none'` |
| Serverless input validation | `/api/country-info` requires a 2-letter alpha-2 `code` (arrays rejected) before any upstream request is spent |
| Upstream error masking | Upstream 401/403 collapse to a 502 — the endpoint cannot be used to probe the API key's state; only 404 passes through |
| URL parameter validation | `country` resolved against the ISO 3166-1 list, `subdivision` matched against the ISO 3166-2 code shape and its country, `sort` constrained to a known set |
| `localStorage` shape validation | Every read is validated (`src/utils/storage.ts`) — parseable JSON is not proof of the expected shape |
| CSV formula injection (CWE-1236) | Export values starting with `=`, `+`, `-`, `@`, tab or CR are prefixed with `'` so spreadsheets treat them as text |
| Secrets excluded from deploys | `.vercelignore` excludes `.env` and `.env.*` (keeping `.env.example`) |
| `X-Frame-Options: DENY` | Prevents the app from being embedded in iframes |
| `X-Content-Type-Options: nosniff` | Blocks MIME-type sniffing attacks |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limits referrer leakage on cross-origin requests |
| `Permissions-Policy` | Disables geolocation, camera, and microphone access |
| XSS prevention | All dynamic content rendered as React JSX (no `dangerouslySetInnerHTML`); custom map tooltip replaced with JSX |

---

## Key Paradigms & Patterns

### React Patterns

| Pattern | Where used |
|---|---|
| **Lifting state up** | All app state lives in `InteractiveMap` — passed down as props to children |
| **Custom hooks pattern** | `useCallback` / `useMemo` throughout to stabilise references and avoid re-renders |
| **Controlled components** | All inputs (`CountryDropdown` search, filter bar, `SearchComponent`) are fully controlled |
| **Transient props** (`$prop`) | styled-components v6 pattern — prevents unknown props forwarding to the DOM (e.g. `$isOpen`, `$highlighted`) |
| **Compound component layout** | `InfoPanel` composes `CountryInfo` + `ExportButton` + `SubdivisionModal` + `DemoInfo` |

### State Management

| Pattern | Where used |
|---|---|
| **URL as state** | `?country=GB&subdivision=GB-ENG&filter=&type=&sort=` — bookmarkable, shareable, restored on mount. `mergeUrlState()` merges so the two owning components cannot clobber each other |
| **localStorage persistence** | Favourites and recents survive page reloads without a backend |
| **In-memory cache** | `ISO3166Service` caches API responses with a 10-minute TTL to avoid duplicate requests |
| **In-flight de-duplication** | Identical requests issued in the same tick join the pending promise instead of firing again |
| **Latest-request wins** | `useLatestRequest` discards superseded async responses (and post-unmount ones) — aborting is not an option for a shared, cached request |
| **Error boundaries** | `ErrorBoundary` around the app, map, info panel and comparison — a render throw degrades one region instead of blanking the page |
| **CustomEvent bus** | `iso3166:favourites-changed` event decouples `CountryInfo` ↔ `CountryDropdown` without prop drilling |

### Performance

| Pattern | Where used |
|---|---|
| **Virtual / windowed list** | `IntersectionObserver` loads 30 subdivision cards at a time; the sentinel div at the list bottom triggers the next batch |
| **Debouncing** | Search input waits 300 ms before firing an API request |
| **Lazy image loading** | `loading="lazy"` on all subdivision flag images |
| **Request timeout** | All axios calls have a 15-second timeout to fail fast on slow connections |
| **Service worker caching** | Flags cache-first (600 entries / 30 days), subdivision data stale-while-revalidate (300 entries / 7 days) |
| **CSS over polling** | Map selection held by a `[data-selected]` `!important` rule instead of a 100 ms repaint interval |
| **`vector-effect: non-scaling-stroke`** | Selected-country outline keeps a constant on-screen width; zoom is a `transform: scale()` on the root `<g>`, which would otherwise thicken the stroke with it |
| **Ref, not dependency, for selection** | The map rebuild reads the live selection from a ref — a prop dependency would tear down and rebuild the whole map on every country click |
| **Inline style for cursor position** | Tooltip x/y kept out of the styled-components template, which would inject a class per pixel of movement |
| **`Array.isArray()` guards** | Prevents `.map()` / `.reduce()` TypeErrors when the RestCountries v5 API returns unexpected field types |

### Mobile / Accessibility

| Pattern | Where used |
|---|---|
| **Touch swipe navigation** | `touchstart` + `touchend` in `SubdivisionModal` — only triggers on predominantly horizontal swipes (≥50 px, Δx ≥ 1.5× Δy) |
| **Keyboard navigation** | `ArrowLeft` / `ArrowRight` to navigate subdivisions and `Escape` to close the modal (gated by `enableKeyboardNavigation`); `ArrowUp`/`ArrowDown`/`Home`/`End`/`Enter`/`Escape` in `CountryDropdown` and `SearchComponent`; `ExportButton` submenus open on click and Enter/Space rather than hover only |
| **`@media (pointer: coarse)`** | Swipe hint shown only on touch devices |
| **Semantic HTML + ARIA** | `role="listbox"` / `role="option"` / `aria-selected` in the country dropdown, `role="combobox"` + `aria-activedescendant` in search, `role="menu"` / `role="menuitem"` in the export menu, `role="dialog"` + focus restore in the about, comparison and subdivision modals, `role="alert"` in the error fallback; the map projection selector carries `aria-label="Map projection"` |
| **Real buttons** | The dropdown clear control is a sibling `<button>`, not a `<span role="button">` nested inside another button |
| **Responsive breakpoints** | Three tiers: desktop (>1024px), tablet (768–1024px), mobile (<768px) — handled with styled-components media queries |
