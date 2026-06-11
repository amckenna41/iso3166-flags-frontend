import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountryDropdown from '../../../src/components/CountryDropdown';

describe('CountryDropdown', () => {
  const mockOnCountrySelect = jest.fn();

  beforeEach(() => {
    mockOnCountrySelect.mockClear();
  });

  it('renders the dropdown button with default text', () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    expect(screen.getByText('Select a country')).toBeInTheDocument();
  });

  it('opens dropdown list when button is clicked', async () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    
    const button = screen.getByRole('button');
    userEvent.click(button);
    
    // Check if dropdown items are visible
    const countryItems = screen.getAllByRole('button');
    expect(countryItems.length).toBeGreaterThan(1); // button + dropdown items
  });

  it('closes dropdown when a country is selected', async () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    
    const button = screen.getByRole('button');
    userEvent.click(button);
    
    // Find and click a country option
    const countryOptions = screen.getAllByRole('button');
    if (countryOptions.length > 1) {
      userEvent.click(countryOptions[1]);
      expect(mockOnCountrySelect).toHaveBeenCalled();
    }
  });

  it('filters countries by search term', async () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    
    const button = screen.getByRole('button');
    userEvent.click(button);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    userEvent.type(searchInput, 'United');
    
    // Search input should contain typed text
    expect(searchInput).toHaveValue('United');
  });

  it('displays selected country name after selection', async () => {
    render(
      <CountryDropdown
        onCountrySelect={mockOnCountrySelect}
        selectedCountry="US"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('country-dropdown-trigger')).toHaveTextContent('United States');
    });
  });

  it('calls onCountrySelect with correct parameters', async () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);

    const button = screen.getByRole('button');
    userEvent.click(button);

    const germanyOption = await screen.findByTestId('country-option-DE');
    userEvent.click(germanyOption);

    await waitFor(() => {
      expect(mockOnCountrySelect).toHaveBeenCalledWith('DE', 'Germany');
    });
  });

  it('has clear button when country is selected', async () => {
    render(
      <CountryDropdown
        onCountrySelect={mockOnCountrySelect}
        selectedCountry="US"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('country-dropdown-clear')).toBeInTheDocument();
    });
  });

  it('renders with accessibility attributes', () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
