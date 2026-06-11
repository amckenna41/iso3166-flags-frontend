# Tech Stack

## Runtime Platform

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| SPA framework | [React](https://react.dev) | 19.1.x | UI rendering, component model, hooks |
| Language | [TypeScript](https://www.typescriptlang.org) | 4.9.x | Static typing across all source files |
| Build toolchain | [Create React App](https://create-react-app.dev) (react-scripts) | 5.0.1 | Webpack bundler, dev server, Jest runner |
| Deployment | [Vercel](https://vercel.com) | — | Static CDN + Serverless Functions |

---

## Frontend Libraries

### UI & Styling

| Package | Version | Usage |
|---|---|---|
| [styled-components](https://styled-components.com) | 6.1.x | CSS-in-JS — all component styles, theming, animations, responsive breakpoints |
| [lucide-react](https://lucide.dev) | 0.544.x | Icon set (SVG icons as React components) |

### Map

| Package | Version | Usage |
|---|---|---|
| [jsvectormap](https://jsvectormap.com) | 1.7.x | Interactive SVG world map — click, hover, zoom, `setFocus()` for country auto-zoom |

### HTTP & Data

| Package | Version | Usage |
|---|---|---|
| [axios](https://axios-http.com) | 1.12.x | HTTP client for all API requests; request timeout configuration |

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

---

## Backend (Vercel Serverless)

| File | Runtime | Purpose |
|---|---|---|
| `api/country-info.js` | Node.js (Vercel) | Proxy to RestCountries v5 API — holds `REST_COUNTRIES_API_KEY` server-side so it never reaches the browser bundle |
| `src/setupProxy.js` | Node.js (CRA dev server) | Express middleware that mirrors the Vercel function during local development — same request path, same env var |

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
| ISO 3166 Flags CDN | `https://raw.githubusercontent.com/amckenna41/iso3166-flags/main` | SVG country flags (`iso3166-1-flags/`) and PNG subdivision flags (`iso3166-2-flags/`) |

---

## Testing

### Unit & Integration Tests

| Package | Version | Usage |
|---|---|---|
| [Jest](https://jestjs.io) | (bundled with react-scripts) | Test runner, assertion library, module mocking |
| [@testing-library/react](https://testing-library.com/react) | 16.3.x | Component rendering and user-event simulation |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | 6.8.x | Custom DOM matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.) |
| [@testing-library/user-event](https://github.com/testing-library/user-event) | 13.5.x | Realistic user interaction simulation (type, click, keyboard) |
| [identity-obj-proxy](https://github.com/keyz/identity-obj-proxy) | 3.0.x | CSS module mock for Jest (maps class names to themselves) |

**Test coverage:** `src/**/*.test.tsx` and `tests/unit/**/*.test.tsx`

### End-to-End Tests

| Package | Version | Usage |
|---|---|---|
| [Cypress](https://www.cypress.io) | 13.x | Full browser E2E tests covering app load, country selection, search, and responsive layouts |

**Test suites:** `cypress/e2e/app.cy.ts`, `country-selection.cy.ts`, `search.cy.ts`, `responsive.cy.ts`

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
| Content Security Policy | Vercel `headers` config restricts `connect-src`, `script-src`, `img-src` to known origins |
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
| **URL as state** | `?country=GB&subdivision=GB-ENG` — bookmarkable, shareable, restored on mount |
| **localStorage persistence** | Favourites and recents survive page reloads without a backend |
| **In-memory cache** | `ISO3166Service` caches API responses with a 10-minute TTL to avoid duplicate requests |
| **CustomEvent bus** | `iso3166:favourites-changed` event decouples `CountryInfo` ↔ `CountryDropdown` without prop drilling |

### Performance

| Pattern | Where used |
|---|---|
| **Virtual / windowed list** | `IntersectionObserver` loads 30 subdivision cards at a time; the sentinel div at the list bottom triggers the next batch |
| **Debouncing** | Search input waits 300 ms before firing an API request |
| **Lazy image loading** | `loading="lazy"` on all subdivision flag images |
| **Request timeout** | All axios calls have a 15-second timeout to fail fast on slow connections |
| **`Array.isArray()` guards** | Prevents `.map()` / `.reduce()` TypeErrors when the RestCountries v5 API returns unexpected field types |

### Mobile / Accessibility

| Pattern | Where used |
|---|---|
| **Touch swipe navigation** | `touchstart` + `touchend` in `SubdivisionModal` — only triggers on predominantly horizontal swipes (≥50 px, Δx ≥ 1.5× Δy) |
| **Keyboard navigation** | `ArrowLeft` / `ArrowRight` to navigate subdivisions; `Escape` to close modal — gated by `enableKeyboardNavigation` feature flag |
| **`@media (pointer: coarse)`** | Swipe hint shown only on touch devices |
| **Semantic HTML + ARIA** | `aria-label`, `aria-haspopup`, `aria-expanded`, `role="button"`, `tabIndex` on interactive non-button elements |
| **Responsive breakpoints** | Three tiers: desktop (>1024px), tablet (768–1024px), mobile (<768px) — handled with styled-components media queries |
