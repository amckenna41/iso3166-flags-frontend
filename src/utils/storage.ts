/**
 * localStorage helpers.
 *
 * JSON.parse succeeding does not mean the value has the shape we expect — a
 * tampered or stale entry parses fine and then throws on `.map`/`.some` outside
 * the try block. Every read is validated against the expected shape.
 */

export interface StoredCountry {
  code: string;
  name: string;
}

const isStoredCountry = (value: unknown): value is StoredCountry =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as StoredCountry).code === 'string' &&
  typeof (value as StoredCountry).name === 'string';

/**
 * Read an array of {code, name} from localStorage.
 * Returns [] for missing, unparseable, wrong-shaped or non-array values, and
 * drops individual malformed entries rather than failing the whole read.
 */
export const readCountryList = (key: string): StoredCountry[] => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredCountry);
  } catch {
    return [];
  }
};

/** Write a list, swallowing quota/privacy-mode errors. */
export const writeCountryList = (key: string, value: StoredCountry[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled (Safari private mode) — non-fatal
  }
};
