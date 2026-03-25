import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchComponent from '../../../src/components/SearchComponent';
import { iso3166Service } from '../../../src/services/iso3166Service';

// Mock the service so tests don't make real network calls
jest.mock('../../../src/services/iso3166Service', () => ({
  iso3166Service: {
    searchSubdivisions: jest.fn(),
    getCountrySubdivisions: jest.fn(),
  },
}));

const mockSearchSubdivisions = iso3166Service.searchSubdivisions as jest.Mock;
const mockGetCountrySubdivisions = iso3166Service.getCountrySubdivisions as jest.Mock;

// Representative search result fixture used by multiple tests
const MOCK_SEARCH_RESULTS = {
  US: {
    'US-CA': { code: 'US-CA', name: 'California', type: 'State', latLng: [37, -120] as [number, number], flag: '' },
    'US-TX': { code: 'US-TX', name: 'Texas', type: 'State', latLng: [31, -100] as [number, number], flag: '' },
  },
  DE: {
    'DE-BY': { code: 'DE-BY', name: 'Bavaria', type: 'State', latLng: [48, 11] as [number, number], flag: '' },
  },
};

describe('SearchComponent', () => {
  const mockOnResultSelect = jest.fn();

  beforeEach(() => {
    mockOnResultSelect.mockClear();
    mockSearchSubdivisions.mockClear();
    mockGetCountrySubdivisions.mockClear();
    // Default: resolve with empty results unless overridden per-test
    mockSearchSubdivisions.mockResolvedValue({});
    mockGetCountrySubdivisions.mockResolvedValue({});
  });

  it('renders search input field', () => {
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('allows typing in search field', () => {
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    const searchInput = screen.getByRole('textbox') as HTMLInputElement;
    userEvent.type(searchInput, 'United States');

    expect(searchInput.value).toBe('United States');
  });

  it('shows search results dropdown when typing', async () => {
    mockSearchSubdivisions.mockResolvedValue(MOCK_SEARCH_RESULTS);
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    // 'united' is >2 chars and does not match the 2-char country-code pattern
    userEvent.type(screen.getByRole('textbox'), 'united');

    await waitFor(() => {
      expect(screen.getByText('California')).toBeInTheDocument();
    });
  });

  it('clears search input on clear button click', () => {
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    const searchInput = screen.getByRole('textbox') as HTMLInputElement;
    userEvent.type(searchInput, 'united');
    expect(searchInput.value).not.toBe('');

    // The clear (X) button is the only button rendered while input has a value
    const clearButton = screen.getByRole('button');
    userEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('shows results from multiple countries', async () => {
    mockSearchSubdivisions.mockResolvedValue(MOCK_SEARCH_RESULTS);
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    // 'california' is longer than 2 chars, does not match the country-code pattern
    userEvent.type(screen.getByRole('textbox'), 'california');

    await waitFor(() => {
      expect(screen.getByText('California')).toBeInTheDocument();
      expect(screen.getByText('Bavaria')).toBeInTheDocument();
    });
  });

  it('calls onResultSelect with correct args when a result is clicked', async () => {
    mockSearchSubdivisions.mockResolvedValue(MOCK_SEARCH_RESULTS);
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    userEvent.type(screen.getByRole('textbox'), 'cali');

    await waitFor(() => expect(screen.getByText('California')).toBeInTheDocument());
    userEvent.click(screen.getByText('California'));

    expect(mockOnResultSelect).toHaveBeenCalledWith('US', 'California', 'US-CA');
  });

  it('limits displayed results to 10 items', async () => {
    // Return more than 10 subdivisions for this test
    const manyResults: Record<string, Record<string, any>> = { GB: {} };
    for (let i = 1; i <= 15; i++) {
      manyResults['GB'][`GB-${String(i).padStart(3, '0')}`] = {
        code: `GB-${i}`,
        name: `Region ${i}`,
        type: 'Region',
        latLng: [51, -1] as [number, number],
        flag: '',
      };
    }
    mockSearchSubdivisions.mockResolvedValue(manyResults);
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    // 'region' is a multi-char name search (not a 2-char country code)
    userEvent.type(screen.getByRole('textbox'), 'region');

    await waitFor(() => {
      const items = screen.getAllByText(/Region \d+/);
      expect(items.length).toBeLessThanOrEqual(10);
    });
  });

  it('shows no-results message when search returns empty', async () => {
    mockSearchSubdivisions.mockResolvedValue({});
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    userEvent.type(screen.getByRole('textbox'), 'zzzzz');

    await waitFor(() => {
      expect(screen.getByText(/no subdivisions found/i)).toBeInTheDocument();
    });
  });

  it('handles empty search clearing results', () => {
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);

    const searchInput = screen.getByRole('textbox') as HTMLInputElement;
    userEvent.type(searchInput, 'test');
    userEvent.clear(searchInput);

    expect(searchInput.value).toBe('');
  });

  it('renders with correct input type attribute', () => {
    render(<SearchComponent onResultSelect={mockOnResultSelect} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });
});
