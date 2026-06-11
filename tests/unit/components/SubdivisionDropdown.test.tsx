import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubdivisionDropdown from '../../../src/components/SubdivisionDropdown';
import { iso3166Service } from '../../../src/services/iso3166Service';

jest.mock('../../../src/services/iso3166Service', () => ({
  iso3166Service: {
    getCountrySubdivisions: jest.fn(),
  },
}));

const mockGetCountrySubdivisions = iso3166Service.getCountrySubdivisions as jest.Mock;

const MOCK_SUBDIVISIONS = {
  'US-CA': { name: 'California', type: 'State', code: 'US-CA', latLng: [36.78, -119.42] as [number, number], flag: '', history: [] },
  'US-TX': { name: 'Texas', type: 'State', code: 'US-TX', latLng: [31.0, -100.0] as [number, number], flag: '', history: [] },
  'US-NY': { name: 'New York', type: 'State', code: 'US-NY', latLng: [43.0, -75.0] as [number, number], flag: '', history: [] },
};

const defaultProps = {
  selectedCountryCode: null,
  selectedCountryName: null,
  onSubdivisionSelect: jest.fn(),
  visible: true,
};

describe('SubdivisionDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCountrySubdivisions.mockResolvedValue({});
  });

  it('renders the dropdown button when visible', () => {
    render(<SubdivisionDropdown {...defaultProps} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows disabled state when no country is selected', () => {
    render(<SubdivisionDropdown {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is enabled when a country is selected', async () => {
    mockGetCountrySubdivisions.mockResolvedValue(MOCK_SUBDIVISIONS);
    render(
      <SubdivisionDropdown
        {...defaultProps}
        selectedCountryCode="US"
        selectedCountryName="United States"
      />
    );
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('calls getCountrySubdivisions when selectedCountryCode changes', async () => {
    mockGetCountrySubdivisions.mockResolvedValue(MOCK_SUBDIVISIONS);

    render(
      <SubdivisionDropdown
        {...defaultProps}
        selectedCountryCode="US"
        selectedCountryName="United States"
      />
    );

    await waitFor(() => {
      expect(mockGetCountrySubdivisions).toHaveBeenCalledWith('us');
    });
  });

  it('renders subdivision items after loading', async () => {
    mockGetCountrySubdivisions.mockResolvedValue(MOCK_SUBDIVISIONS);

    render(
      <SubdivisionDropdown
        {...defaultProps}
        selectedCountryCode="US"
        selectedCountryName="United States"
      />
    );

    const button = await screen.findByRole('button');
    userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('California')).toBeInTheDocument();
      expect(screen.getByText('Texas')).toBeInTheDocument();
    });
  });

  it('calls onSubdivisionSelect with correct args when item clicked', async () => {
    const onSubdivisionSelect = jest.fn();
    mockGetCountrySubdivisions.mockResolvedValue(MOCK_SUBDIVISIONS);

    render(
      <SubdivisionDropdown
        {...defaultProps}
        selectedCountryCode="US"
        selectedCountryName="United States"
        onSubdivisionSelect={onSubdivisionSelect}
      />
    );

    const button = await screen.findByRole('button');
    userEvent.click(button);

    const californiaItem = await screen.findByText('California');
    userEvent.click(californiaItem);

    await waitFor(() => {
      expect(onSubdivisionSelect).toHaveBeenCalledWith('US-CA', 'California');
    });
  });

  it('filters subdivision list by search term', async () => {
    mockGetCountrySubdivisions.mockResolvedValue(MOCK_SUBDIVISIONS);

    render(
      <SubdivisionDropdown
        {...defaultProps}
        selectedCountryCode="US"
        selectedCountryName="United States"
      />
    );

    const button = await screen.findByRole('button');
    userEvent.click(button);

    const searchInput = await screen.findByPlaceholderText(/search/i);
    userEvent.type(searchInput, 'Cali');

    await waitFor(() => {
      expect(screen.getByText('California')).toBeInTheDocument();
      expect(screen.queryByText('Texas')).not.toBeInTheDocument();
    });
  });
});
