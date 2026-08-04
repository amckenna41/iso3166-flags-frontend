/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

/**
 * Service worker — offline support.
 *
 * The app shell is precached at build time by workbox's InjectManifest. Flag
 * images and subdivision data are near-immutable, so they are worth caching at
 * runtime: a revisit loads instantly and previously viewed countries keep
 * working without a network.
 *
 * Only registered in production, and only after the page has loaded — see
 * serviceWorkerRegistration.ts.
 */

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache everything webpack emitted. self.__WB_MANIFEST is replaced at build time.
precacheAndRoute(self.__WB_MANIFEST);

// Single-page app: serve index.html for navigations, except real files and /api.
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  new NavigationRoute(createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html'), {
    denylist: [/^\/_/, fileExtensionRegexp, /^\/api\//],
  })
);

// Flag images: these are content-addressed by country/subdivision code and
// effectively never change, so cache-first with a generous window.
registerRoute(
  ({ url }) => url.origin === 'https://raw.githubusercontent.com',
  new CacheFirst({
    cacheName: 'iso3166-flags',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 600,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Subdivision data: revalidate in the background so an offline or slow load
// still renders, but a fresh copy lands for next time.
registerRoute(
  ({ url }) => url.hostname === 'iso3166-2-api.vercel.app',
  new StaleWhileRevalidate({
    cacheName: 'iso3166-subdivisions',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 300,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Let the page trigger an immediate update instead of waiting for all tabs to close
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
