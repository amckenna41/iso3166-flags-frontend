import { COUNTRIES, SMALL_COUNTRY_MARKERS } from '../../../src/data/countries';

// The real map file registers itself by calling a global jsVectorMap.addMap().
const loadMapRegions = (): string[] => {
  let paths: Record<string, unknown> = {};
  (global as any).jsVectorMap = {
    addMap: (_name: string, data: any) => { paths = data.paths; },
  };
  jest.isolateModules(() => { require('jsvectormap/dist/maps/world.js'); });
  return Object.keys(paths);
};

describe('small-country markers', () => {
  // The list is derived data: every supported country the map cannot draw needs
  // a pin, or it is unreachable by clicking. This catches drift in either list.
  it('covers every supported country the world map has no region for', () => {
    const regions = loadMapRegions();
    const unmapped = COUNTRIES
      .map(country => country.code)
      // Antarctica is missing because the projection cuts it off, not because
      // it is too small to see.
      .filter(code => code !== 'AQ' && !regions.includes(code));

    expect(Object.keys(SMALL_COUNTRY_MARKERS).sort()).toEqual(unmapped.sort());
  });

  it('pins nothing that already has a region on the map', () => {
    const regions = loadMapRegions();
    const overlapping = Object.keys(SMALL_COUNTRY_MARKERS).filter(code => regions.includes(code));

    expect(overlapping).toEqual([]);
  });

  it('holds plausible [lat, lng] pairs', () => {
    Object.entries(SMALL_COUNTRY_MARKERS).forEach(([code, [lat, lng]]) => {
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(lng)).toBeLessThanOrEqual(180);
      expect(`${code}:${lat},${lng}`).not.toContain('NaN');
    });
  });
});
