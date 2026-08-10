import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InteractiveMap from '../../../src/components/InteractiveMap';
import { iso3166Service } from '../../../src/services/iso3166Service';

// Stub out the heavy map component so tests run without a browser canvas
jest.mock('../../../src/components/JSVectorMapComponent', () => ({
  __esModule: true,
  default: ({ onCountryClick }: { onCountryClick?: (code: string, name: string) => void }) => (
    <div
      data-testid="mock-map"
      onClick={() => onCountryClick?.('US', 'United States')}
    />
  ),
}));

// Prevent real network calls from any component that uses the service
jest.mock('../../../src/services/iso3166Service', () => ({
  iso3166Service: {
    getCountrySubdivisions: jest.fn(),
    getCountryFlagUrl: jest.fn().mockReturnValue(''),
    getCountryInfo: jest.fn(),
    searchSubdivisions: jest.fn().mockResolvedValue({}),
    getAllCountries: jest.fn().mockResolvedValue({}),
  },
}));

const mockGetCountrySubdivisions = iso3166Service.getCountrySubdivisions as jest.Mock;

const MOCK_SUBDIVISIONS = {
  'US-CA': { code: 'US-CA', name: 'California', type: 'State', latLng: [37, -120] as [number, number], flag: '' },
  'US-TX': { code: 'US-TX', name: 'Texas', type: 'State', latLng: [31, -100] as [number, number], flag: '' },
};

describe('InteractiveMap', () => {
  beforeEach(() => {
    mockGetCountrySubdivisions.mockClear();
    mockGetCountrySubdivisions.mockResolvedValue(MOCK_SUBDIVISIONS);
    // Reset location search so URL tests don't bleed between cases
    window.history.replaceState(null, '', '/');
  });

  it('renders without crashing', () => {
    render(<InteractiveMap />);
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
  });

  it('shows loading indicator while fetching country data', async () => {
    // Make the service hang so we can observe the loading state
    mockGetCountrySubdivisions.mockReturnValue(new Promise(() => {}));

    render(<InteractiveMap />);
    fireEvent.click(screen.getByTestId('mock-map'));

    await waitFor(() => {
      expect(screen.getByText(/loading country data/i)).toBeInTheDocument();
    });
  });

  it('fetches subdivisions and opens info panel when a country is clicked', async () => {
    render(<InteractiveMap />);
    fireEvent.click(screen.getByTestId('mock-map'));

    await waitFor(() => {
      expect(mockGetCountrySubdivisions).toHaveBeenCalledWith('us');
    });
  });

  it('shows an error message when the service rejects', async () => {
    mockGetCountrySubdivisions.mockRejectedValue(new Error('Network error'));

    render(<InteractiveMap />);
    fireEvent.click(screen.getByTestId('mock-map'));

    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
    });
  });

  it('dismisses the error when the dismiss button is clicked', async () => {
    mockGetCountrySubdivisions.mockRejectedValue(new Error('Network error'));

    render(<InteractiveMap />);
    fireEvent.click(screen.getByTestId('mock-map'));

    await waitFor(() => screen.getByText(/error loading data/i));

    userEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(screen.queryByText(/error loading data/i)).not.toBeInTheDocument();
  });

  it('collapses and expands the info panel via the toggle button', async () => {
    render(<InteractiveMap />);
    fireEvent.click(screen.getByTestId('mock-map'));

    await waitFor(() => expect(mockGetCountrySubdivisions).toHaveBeenCalled());

    // The toggle button is always rendered
    const toggle = screen.getByTitle(/hide info panel/i);
    expect(toggle).toBeInTheDocument();

    userEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByTitle(/show info panel/i)).toBeInTheDocument();
    });
  });

  it('updates the URL query string when a country is selected', async () => {
    render(<InteractiveMap />);
    fireEvent.click(screen.getByTestId('mock-map'));

    await waitFor(() => expect(mockGetCountrySubdivisions).toHaveBeenCalled());

    expect(window.location.search).toContain('country=US');
  });

  it('restores state from URL on mount', async () => {
    // Pre-seed the URL as if the user arrived via a shared link
    window.history.replaceState(null, '', '?country=US');

    render(<InteractiveMap />);

    await waitFor(() => {
      expect(mockGetCountrySubdivisions).toHaveBeenCalledWith('us');
    });
  });
});
