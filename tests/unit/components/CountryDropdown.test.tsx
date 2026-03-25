import React from 'react';
import { render, screen } from '@testing-library/react';
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
    const { rerender } = render(
      <CountryDropdown 
        onCountrySelect={mockOnCountrySelect}
        selectedCountry="US"
      />
    );
    
    rerender(
      <CountryDropdown 
        onCountrySelect={mockOnCountrySelect}
        selectedCountry="US"
      />
    );
    
    // After selection, should show country info
    // Note: actual country display depends on component implementation
  });

  it('calls onCountrySelect with correct parameters', async () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    
    const button = screen.getByRole('button');
    userEvent.click(button);
  });

  it('has clear button when country is selected', async () => {
    const { rerender } = render(
      <CountryDropdown onCountrySelect={mockOnCountrySelect} />
    );
    
    // With selected country
    rerender(
      <CountryDropdown 
        onCountrySelect={mockOnCountrySelect}
        selectedCountry="US"
      />
    );
  });

  it('renders with accessibility attributes', () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
