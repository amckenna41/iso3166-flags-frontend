import { useCallback, useEffect, useRef } from 'react';

/**
 * Guards against out-of-order async responses.
 *
 * Requests are not cancellable here (they are shared and cached in
 * iso3166Service), so instead of aborting we discard superseded results. Call
 * `beginRequest()` when starting work; it returns a predicate that is true only
 * while that request is still the most recent one — and false after unmount, so
 * no state is set on a gone component.
 *
 *   const beginRequest = useLatestRequest();
 *   const isCurrent = beginRequest();
 *   const data = await fetchThing();
 *   if (!isCurrent()) return;
 *   setThing(data);
 */
export const useLatestRequest = (): (() => () => boolean) => {
  const tokenRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => {
    const token = ++tokenRef.current;
    return () => mountedRef.current && token === tokenRef.current;
  }, []);
};

export default useLatestRequest;
