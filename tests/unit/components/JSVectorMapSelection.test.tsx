import { setRegionSelected, applySelection } from '../../../src/components/JSVectorMapComponent';

// Mirrors jsvectormap's own shape: regions[code] = { config, element: Region },
// where the Region holds its SVG path at .shape.node. Reading element.node
// instead silently highlights nothing, which is the regression this guards.
const makeRegion = () => {
  const parent = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  parent.appendChild(node);
  return { region: { config: {}, element: { shape: { node } } }, node, parent };
};

describe('setRegionSelected', () => {
  it('marks the region path when selected', () => {
    const { region, node } = makeRegion();

    setRegionSelected(region, true);

    expect(node.getAttribute('data-selected')).toBe('true');
  });

  it('clears the mark when deselected', () => {
    const { region, node } = makeRegion();

    setRegionSelected(region, true);
    setRegionSelected(region, false);

    expect(node.hasAttribute('data-selected')).toBe(false);
  });

  it('moves the selected path last so neighbours cannot paint over its outline', () => {
    const { region, node, parent } = makeRegion();
    const neighbour = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    parent.appendChild(neighbour);
    expect(parent.lastChild).toBe(neighbour);

    setRegionSelected(region, true);

    expect(parent.lastChild).toBe(node);
  });

  it('does not throw on a region with no rendered shape', () => {
    expect(() => setRegionSelected({ config: {}, element: {} }, true)).not.toThrow();
    expect(() => setRegionSelected(undefined, true)).not.toThrow();
  });
});

describe('applySelection', () => {
  // jsvectormap's world map keys every region uppercase (BD, IE, US).
  const makeRegions = () => {
    const ie = makeRegion();
    const us = makeRegion();
    return { regions: { IE: ie.region, US: us.region }, ie, us };
  };

  it('highlights the matching region regardless of the code casing given', () => {
    const { regions, ie, us } = makeRegions();

    applySelection(regions, 'ie');

    expect(ie.node.getAttribute('data-selected')).toBe('true');
    expect(us.node.hasAttribute('data-selected')).toBe(false);
  });

  it('keeps exactly one region highlighted when selection moves', () => {
    const { regions, ie, us } = makeRegions();

    applySelection(regions, 'IE');
    applySelection(regions, 'US');

    expect(ie.node.hasAttribute('data-selected')).toBe(false);
    expect(us.node.getAttribute('data-selected')).toBe('true');
  });

  it('clears every highlight when selection is emptied', () => {
    const { regions, ie, us } = makeRegions();

    applySelection(regions, 'IE');
    applySelection(regions, null);

    expect(ie.node.hasAttribute('data-selected')).toBe(false);
    expect(us.node.hasAttribute('data-selected')).toBe(false);
  });
});
