import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

// jsvectormap needs real SVG geometry (getBBox) that jsdom does not implement, so
// the library is faked. The fake records how it was constructed, which is exactly
// what these tests are about: the right map name, and a rebuild per projection.
// The `mock` prefix is what lets jest's hoisted factory reference these.
const mockConstructions: string[] = [];
const mockDestroyed: string[] = [];

// Captures the options each instance was built with, so tests can drive the
// library's callbacks (there is no real map to hover in jsdom).
const mockOptions: any[] = [];

// Marker add/remove calls, in order — pins are managed after construction.
const mockMarkerCalls: [string, any][] = [];

jest.mock('jsvectormap', () => {
  return jest.fn().mockImplementation((options: any) => {
    mockConstructions.push(options.map);
    mockOptions.push(options);
    // Two regions keyed the way jsvectormap keys them: uppercase alpha-2.
    const makeRegion = () => {
      const parent = global.document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const node = global.document.createElementNS('http://www.w3.org/2000/svg', 'path');
      parent.appendChild(node);
      return { config: {}, element: { shape: { node } } };
    };
    return {
      regions: { IE: makeRegion(), US: makeRegion() },
      addMarkers: (config: any) => mockMarkerCalls.push(['add', config]),
      removeMarkers: (indexes?: any) => mockMarkerCalls.push(['remove', indexes]),
      destroy: () => mockDestroyed.push(options.map),
    };
  });
});

jest.mock('jsvectormap/dist/maps/world.js', () => ({}), { virtual: true });
jest.mock('jsvectormap/dist/maps/world-merc.js', () => ({}), { virtual: true });

import JSVectorMapComponent from '../../../src/components/JSVectorMapComponent';

const selectedPathsIn = (instanceIndex: number) => {
  const jsVectorMap = jest.requireMock('jsvectormap') as jest.Mock;
  const regions = jsVectorMap.mock.results[instanceIndex].value.regions;
  return Object.keys(regions).filter(code =>
    regions[code].element.shape.node.hasAttribute('data-selected')
  );
};

const switchToMercator = () =>
  fireEvent.change(screen.getByTestId('map-variant-select'), {
    target: { value: 'world_merc' },
  });

beforeEach(() => {
  mockConstructions.length = 0;
  mockDestroyed.length = 0;
  mockOptions.length = 0;
  mockMarkerCalls.length = 0;
  (jest.requireMock('jsvectormap') as jest.Mock).mockClear();
});

describe('map projection variants', () => {

  it('builds the Miller projection by default', () => {
    render(<JSVectorMapComponent />);

    expect(mockConstructions).toEqual(['world']);
  });

  it('rebuilds with the Mercator map when the user switches projection', () => {
    render(<JSVectorMapComponent />);

    switchToMercator();

    expect(mockConstructions).toEqual(['world', 'world_merc']);
    // The old instance must be torn down, not left running behind the new one.
    expect(mockDestroyed).toContain('world');
  });

  it('keeps the selected country highlighted across a projection switch', () => {
    render(<JSVectorMapComponent selectedCountry="IE" />);

    switchToMercator();

    // Index 1 is the freshly built Mercator instance.
    expect(selectedPathsIn(1)).toEqual(['IE']);
  });

  it('leaves the new projection unhighlighted when nothing is selected', () => {
    render(<JSVectorMapComponent />);

    switchToMercator();

    expect(selectedPathsIn(1)).toEqual([]);
  });

  it('keeps the projection control alive after the map container is wiped', () => {
    render(<JSVectorMapComponent />);

    // The setup effect clears its own container with innerHTML=''; the control has
    // to survive that, so it must not be a descendant of the map canvas.
    switchToMercator();

    expect(screen.getByTestId('map-variant-select')).toBeInTheDocument();
    expect(screen.getByTestId('map-variant-select')).toHaveValue('world_merc');
  });
});

describe('small-country markers', () => {
  const CURACAO_PIN = { name: 'Curaçao', coords: [12.1167, -68.9333] };

  it('shows no pin until a pinned country is selected', () => {
    render(<JSVectorMapComponent />);

    expect(mockOptions[0].markers).toEqual([]);
  });

  it('pins Curaçao once it is selected', async () => {
    const { rerender } = render(<JSVectorMapComponent />);

    rerender(<JSVectorMapComponent selectedCountry="CW" />);

    // The selection effect is debounced by 100ms.
    await waitFor(() => expect(mockMarkerCalls).toEqual([
      ['remove', undefined],
      ['add', [CURACAO_PIN]],
    ]));
  });

  it('removes the pin when a different country is selected', async () => {
    const { rerender } = render(<JSVectorMapComponent selectedCountry="CW" />);
    await waitFor(() => expect(mockOptions).toHaveLength(1));
    mockMarkerCalls.length = 0;

    rerender(<JSVectorMapComponent selectedCountry="IE" />);

    await waitFor(() => expect(mockMarkerCalls).toEqual([['remove', undefined]]));
  });

  it('keeps the pin across a projection switch', () => {
    render(<JSVectorMapComponent selectedCountry="CW" />);

    switchToMercator();

    expect(mockOptions[1].markers).toEqual([CURACAO_PIN]);
  });

  it('selects the country when its pin is clicked', () => {
    const onCountryClick = jest.fn();
    render(<JSVectorMapComponent selectedCountry="CW" onCountryClick={onCountryClick} />);

    act(() => mockOptions[0].onMarkerClick({}, '0'));

    expect(onCountryClick).toHaveBeenCalledWith('CW', 'Curaçao');
  });
});

describe('hover tooltip', () => {
  // jsvectormap only calls onRegionTooltipShow; it has no region-out callback, so
  // hiding is driven by real DOM events on the map canvas.
  const hoverCountry = (code = 'IE') => {
    act(() => {
      mockOptions[0].onRegionTooltipShow({}, { element: { style: {} } }, code);
    });
  };

  const canvasOf = (container: HTMLElement) =>
    container.firstElementChild!.firstElementChild as HTMLElement;

  const moveOver = (canvas: HTMLElement, target: Element) =>
    fireEvent.mouseMove(target, { clientX: 10, clientY: 10 }) && canvas;

  it('shows the country name and flag while hovering a region', () => {
    render(<JSVectorMapComponent />);

    hoverCountry('IE');

    expect(screen.getByText('Ireland')).toBeInTheDocument();
    expect(screen.getByAltText('Ireland flag')).toBeInTheDocument();
  });

  it('hides the tooltip when the cursor moves off a country onto the map background', () => {
    const { container } = render(<JSVectorMapComponent />);
    const canvas = canvasOf(container);
    hoverCountry('IE');
    expect(screen.getByText('Ireland')).toBeInTheDocument();

    // The ocean is the canvas itself, not a .jvm-region path.
    moveOver(canvas, canvas);

    expect(screen.queryByText('Ireland')).not.toBeInTheDocument();
  });

  it('keeps the tooltip while the cursor is still over a region path', () => {
    const { container } = render(<JSVectorMapComponent />);
    const canvas = canvasOf(container);
    const regionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    regionPath.setAttribute('class', 'jvm-region jvm-element');
    canvas.appendChild(regionPath);
    hoverCountry('IE');

    moveOver(canvas, regionPath);

    expect(screen.getByText('Ireland')).toBeInTheDocument();
  });

  it('hides the tooltip when the cursor leaves the map entirely', () => {
    const { container } = render(<JSVectorMapComponent />);
    const canvas = canvasOf(container);
    hoverCountry('IE');

    fireEvent.mouseLeave(canvas);

    expect(screen.queryByText('Ireland')).not.toBeInTheDocument();
  });

  it('keeps the tooltip while the cursor is over a marker pin', () => {
    const { container } = render(<JSVectorMapComponent selectedCountry="CW" />);
    const canvas = canvasOf(container);
    const pin = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pin.setAttribute('class', 'jvm-marker jvm-element');
    canvas.appendChild(pin);
    act(() => {
      mockOptions[0].onMarkerTooltipShow({}, { element: { style: {} } }, '0');
    });

    moveOver(canvas, pin);

    expect(screen.getByText('Curaçao')).toBeInTheDocument();
  });

  it('notifies the parent once when the country is left', () => {
    const onCountryLeave = jest.fn();
    const { container } = render(<JSVectorMapComponent onCountryLeave={onCountryLeave} />);
    const canvas = canvasOf(container);
    hoverCountry('IE');

    moveOver(canvas, canvas);
    moveOver(canvas, canvas);
    fireEvent.mouseLeave(canvas);

    expect(onCountryLeave).toHaveBeenCalledTimes(1);
  });
});
