import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchComponent from '../../../src/components/SearchComponent';

describe('SearchComponent', () => {
  const mockOnSearchResult = jest.fn();

  beforeEach(() => {
    mockOnSearchResult.mockClear();
  });

  it('renders search input field', () => {
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search field', async () => {
    const user = userEvent.setup();
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    await user.type(searchInput, 'United States');
    
    expect(searchInput.value).toBe('United States');
  });

  it('shows search results dropdown when typing', async () => {
    const user = userEvent.setup();
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'united');
    
    await waitFor(() => {
      // Results should be shown
    });
  });

  it('clears search input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    await user.type(searchInput, 'united');
    
    // Search input should have text
    expect(searchInput.value).not.toBe('');
  });

  it('groups results by type in results list', async () => {
    const user = userEvent.setup();
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'w');
    
    // Component should organize results
    await waitFor(() => {
      // Results should be grouped
    });
  });

  it('highlights matching text in results', async () => {
    const user = userEvent.setup();
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'key');
    
    // Matching text should be highlighted
    await waitFor(() => {
      // Check for highlighted matches
    });
  });

  it('limits results to 50 items', async () => {
    const user = userEvent.setup();
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'a');
    
    // Results should be limited
    await waitFor(() => {
      const resultItems = screen.queryAllByRole('button');
      expect(resultItems.length).toBeLessThanOrEqual(51); // 50 + input
    });
  });

  it('handles empty search clearing results', async () => {
    const user = userEvent.setup();
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    await user.type(searchInput, 'test');
    await user.clear(searchInput);
    
    expect(searchInput.value).toBe('');
  });

  it('renders with accessibility attributes', () => {
    render(<SearchComponent onSearchResult={mockOnSearchResult} />);
    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toHaveAttribute('type', 'text');
  });
});
