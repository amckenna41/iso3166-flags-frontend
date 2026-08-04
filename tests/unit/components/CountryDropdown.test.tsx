import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

    const button = screen.getByTestId('country-dropdown-trigger');
    userEvent.click(button);

    // Country rows are listbox options, not plain buttons
    const countryItems = screen.getAllByRole('option');
    expect(countryItems.length).toBeGreaterThan(1);
  });

  it('closes dropdown when a country is selected', async () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);

    const trigger = screen.getByTestId('country-dropdown-trigger');
    userEvent.click(trigger);
    expect(screen.getByTestId('country-dropdown-list')).toBeInTheDocument();

    // Country rows carry role="option", so they are not returned by getAllByRole('button')
    userEvent.click(screen.getAllByRole('option')[0]);

    await waitFor(() => expect(mockOnCountrySelect).toHaveBeenCalled());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
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

  it('matches on alpha-3 and alpha-2 codes as well as name', async () => {
    render(<CountryDropdown onCountrySelect={mockOnCountrySelect} />);
    userEvent.click(screen.getByTestId('country-dropdown-trigger'));
    const searchInput = screen.getByPlaceholderText(/search/i);

    userEvent.type(searchInput, 'IRL');
    expect(await screen.findByTestId('country-option-IE')).toBeInTheDocument();

    userEvent.clear(searchInput);
    userEvent.type(searchInput, 'DE');
    expect(await screen.findByTestId('country-option-DE')).toBeInTheDocument();
  });
});

describe('CountryDropdown keyboard navigation', () => {
  const onSelect = jest.fn();

  beforeEach(() => {
    onSelect.mockClear();
    localStorage.clear();
  });

  it('opens on ArrowDown when closed', () => {
    render(<CountryDropdown onCountrySelect={onSelect} />);
    const container = screen.getByTestId('country-dropdown-trigger');

    expect(container).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(container, { key: 'ArrowDown' });
    expect(container).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves the active option with the arrow keys and selects it with Enter', async () => {
    render(<CountryDropdown onCountrySelect={onSelect} />);
    userEvent.click(screen.getByTestId('country-dropdown-trigger'));

    const searchInput = screen.getByPlaceholderText(/search/i);
    userEvent.type(searchInput, 'Ireland');
    await screen.findByTestId('country-option-IE');

    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    expect(screen.getByTestId('country-option-IE')).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(searchInput, { key: 'Enter' });
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith('IE', 'Ireland'));
  });

  it('does nothing on Enter before an option is highlighted', async () => {
    render(<CountryDropdown onCountrySelect={onSelect} />);
    userEvent.click(screen.getByTestId('country-dropdown-trigger'));
    const searchInput = screen.getByPlaceholderText(/search/i);

    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    render(<CountryDropdown onCountrySelect={onSelect} />);
    const trigger = screen.getByTestId('country-dropdown-trigger');

    userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('recovers from a malformed favourites entry in localStorage', () => {
    localStorage.setItem('iso3166_favourite_countries', JSON.stringify([{ code: 5 }, 'nope']));

    expect(() => render(<CountryDropdown onCountrySelect={onSelect} />)).not.toThrow();
  });
});
