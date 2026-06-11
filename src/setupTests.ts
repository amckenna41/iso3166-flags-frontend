// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// IntersectionObserver is not implemented in jsdom
global.IntersectionObserver = class IntersectionObserver {
  constructor(_callback: IntersectionObserverCallback) {}
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
} as unknown as typeof IntersectionObserver;
