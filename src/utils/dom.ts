/**
 * DOM helpers that tolerate environments where the API is missing.
 *
 * scrollIntoView is not implemented in jsdom and is absent from some older
 * mobile browsers; calling it unguarded turns a cosmetic scroll into a render
 * crash. Scrolling is always optional, so failing silently is correct.
 */
export const scrollIntoViewIfSupported = (
  element: Element | null | undefined,
  options?: ScrollIntoViewOptions
): void => {
  if (element && typeof element.scrollIntoView === 'function') {
    element.scrollIntoView(options);
  }
};
