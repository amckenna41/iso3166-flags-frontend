/**
 * Behaviour changes in InteractiveMap: URL parameter handling, and the search
 * box no longer being gated behind a country selection.
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InteractiveMap from '../../../src/components/InteractiveMap';
import { iso3166Service } from '../../../src/services/iso3166Service';

jest.mock('../../../src/components/JSVectorMapComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-map" />,
}));

jest.mock('../../../src/services/iso3166Service', () => ({
  iso3166Service: {
    getCountrySubdivisions: jest.fn(),
    getCountryFlagUrl: jest.fn().mockReturnValue(''),
    getSubdivisionFlagUrl: jest.fn().mockReturnValue(''),
    getCountryInfo: jest.fn().mockResolvedValue(null),
    searchSubdivisions: jest.fn().mockResolvedValue({}),
  },
}));

const mockGetSubdivisions = iso3166Service.getCountrySubdivisions as jest.Mock;

const IE_SUBDIVISIONS = {
  'IE-C': { code: 'IE-C', name: 'Cork', type: 'County', latLng: [51.9, -8.4] as [number, number], flag: '' },
  'IE-D': { code: 'IE-D', name: 'Dublin', type: 'County', latLng: [53.3, -6.2] as [number, number], flag: '' },
};

const renderAt = (search: string) => {
  window.history.replaceState(null, '', search);
  return render(<InteractiveMap />);
};

describe('InteractiveMap URL parameters', () => {
  beforeEach(() => {
    mockGetSubdivisions.mockClear();
    mockGetSubdivisions.mockResolvedValue(IE_SUBDIVISIONS);
    window.history.replaceState(null, '', '/');
  });

  it('restores a country from an alpha-2 code', async () => {
    renderAt('/?country=IE');
    await waitFor(() => expect(mockGetSubdivisions).toHaveBeenCalledWith('ie'));
    expect(await screen.findByRole('heading', { name: 'Ireland' })).toBeInTheDocument();
  });

  it('restores a country from an alpha-3 code', async () => {
    renderAt('/?country=IRL');
    await waitFor(() => expect(mockGetSubdivisions).toHaveBeenCalledWith('ie'));
    expect(await screen.findByRole('heading', { name: 'Ireland' })).toBeInTheDocument();
  });

  it('restores a country from a country name', async () => {
    renderAt('/?country=Ireland');
    await waitFor(() => expect(mockGetSubdivisions).toHaveBeenCalledWith('ie'));
  });

  it('ignores an unrecognised country parameter', async () => {
    renderAt('/?country=%3Cscript%3E');
    await new Promise(r => setTimeout(r, 50));
    expect(mockGetSubdivisions).not.toHaveBeenCalled();
  });

  it('ignores a malformed subdivision parameter', async () => {
    renderAt('/?country=IE&subdivision=javascript:alert(1)');
    await waitFor(() => expect(mockGetSubdivisions).toHaveBeenCalledWith('ie'));
    // The country still loads; only the bad subdivision is dropped
    expect(await screen.findByRole('heading', { name: 'Ireland' })).toBeInTheDocument();
  });

  it('ignores a subdivision belonging to a different country', async () => {
    renderAt('/?country=IE&subdivision=US-CA');
    await waitFor(() => expect(mockGetSubdivisions).toHaveBeenCalledWith('ie'));
    expect(await screen.findByRole('heading', { name: 'Ireland' })).toBeInTheDocument();
  });

  it('does not clobber filter/sort params when writing country state', async () => {
    renderAt('/?country=IE&sort=name-asc&filter=cork');
    await waitFor(() => expect(mockGetSubdivisions).toHaveBeenCalledWith('ie'));
    await screen.findByRole('heading', { name: 'Ireland' });
    // Settle every effect before asserting. Checking too early passes even when
    // a later effect wipes the params, which is exactly how this regressed.
    await act(() => new Promise(r => setTimeout(r, 150)));

    const params = new URLSearchParams(window.location.search);
    expect(params.get('country')).toBe('IE');
    expect(params.get('sort')).toBe('name-asc');
    expect(params.get('filter')).toBe('cork');
  });

  it('keeps the URL filter applied to the list once data loads', async () => {
    renderAt('/?country=IE&filter=cork');
    await screen.findByRole('heading', { name: 'Ireland' });
    await act(() => new Promise(r => setTimeout(r, 150)));

    // The filter box holds the URL value, and the list is actually filtered
    expect(screen.getByPlaceholderText('Search by name or code…')).toHaveValue('cork');
    // The results counter is specific to the filtered panel list. Dublin still
    // appears elsewhere on the page (the subdivision dropdown is unfiltered),
    // so asserting its absence document-wide would be wrong.
    expect(screen.getByText(/1 of 2 results/)).toBeInTheDocument();
  });

  it('clears filters when the user moves to a different country', async () => {
    renderAt('/?country=IE&filter=cork');
    await screen.findByRole('heading', { name: 'Ireland' });
    await act(() => new Promise(r => setTimeout(r, 150)));

    mockGetSubdivisions.mockResolvedValue({
      'FR-ARA': { code: 'FR-ARA', name: 'Auvergne', type: 'Region', latLng: [45, 4] as [number, number], flag: '' },
    });
    userEvent.click(screen.getByTestId('country-dropdown-trigger'));
    userEvent.type(screen.getByTestId('country-dropdown-search'), 'France');
    userEvent.click(await screen.findByTestId('country-option-FR'));

    await screen.findByRole('heading', { name: 'France' });
    await act(() => new Promise(r => setTimeout(r, 150)));
    expect(screen.getByPlaceholderText('Search by name or code…')).toHaveValue('');
    expect(new URLSearchParams(window.location.search).get('filter')).toBeNull();
  });
});

describe('InteractiveMap search availability', () => {
  beforeEach(() => {
    mockGetSubdivisions.mockClear();
    mockGetSubdivisions.mockResolvedValue(IE_SUBDIVISIONS);
    window.history.replaceState(null, '', '/');
  });

  it('shows the subdivision search before any country is selected', () => {
    render(<InteractiveMap />);
    // Previously gated on selectedCountry, which made cross-country name
    // search unreachable until you had already picked a country.
    expect(screen.getByLabelText('Search subdivisions')).toBeInTheDocument();
  });
});
