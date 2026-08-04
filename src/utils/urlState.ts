/**
 * URL query-string state.
 *
 * Several components own a slice of the shared view state (country, subdivision,
 * filter, sort). They must merge into the query string rather than replace it,
 * otherwise the last writer wins and clobbers everyone else's params.
 */

export type UrlState = Record<string, string | null | undefined>;

/** Read the current query string as a plain object. */
export const readUrlState = (): Record<string, string> =>
  Object.fromEntries(new URLSearchParams(window.location.search).entries());

/**
 * Merge `updates` into the current query string via replaceState.
 * A null/undefined/empty value removes that key.
 */
export const mergeUrlState = (updates: UrlState): void => {
  const params = new URLSearchParams(window.location.search);

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const search = params.toString();
  window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
};

/**
 * Constrain an untrusted URL value to a known set of options.
 * Everything reaching the app from the query string goes through here or an
 * explicit lookup — never straight into state.
 */
export const oneOf = <T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback);

/**
 * ISO 3166-2 subdivision codes look like `IE-C`, `US-CA`, `KE-01`.
 * Reject anything else so a hand-edited URL cannot inject arbitrary strings
 * into component state.
 */
export const isValidSubdivisionCode = (value: string | null | undefined): value is string =>
  typeof value === 'string' && /^[A-Za-z]{2}-[A-Za-z0-9]{1,3}$/.test(value);
