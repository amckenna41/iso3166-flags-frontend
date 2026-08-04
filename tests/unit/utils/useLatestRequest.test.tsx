/**
 * The out-of-order response guard used by InteractiveMap, CountryInfo and
 * SearchComponent. If this breaks, a slow response for country A lands after a
 * fast one for country B and the panel shows mismatched data.
 */
import { renderHook } from '@testing-library/react';
import { useLatestRequest } from '../../../src/utils/useLatestRequest';

describe('useLatestRequest', () => {
  it('treats only the most recent request as current', () => {
    const { result } = renderHook(() => useLatestRequest());

    const first = result.current();
    const second = result.current();

    expect(first()).toBe(false);
    expect(second()).toBe(true);
  });

  it('treats a single request as current', () => {
    const { result } = renderHook(() => useLatestRequest());
    expect(result.current()()).toBe(true);
  });

  it('reports not-current after unmount, so no state is set on a gone component', () => {
    const { result, unmount } = renderHook(() => useLatestRequest());

    const isCurrent = result.current();
    expect(isCurrent()).toBe(true);

    unmount();
    expect(isCurrent()).toBe(false);
  });

  it('returns a stable function across re-renders', () => {
    const { result, rerender } = renderHook(() => useLatestRequest());
    const before = result.current;
    rerender();
    expect(result.current).toBe(before);
  });
});
