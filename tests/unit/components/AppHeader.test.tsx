import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppHeader from '../../../src/components/AppHeader';

describe('AppHeader', () => {
  it('renders the header with title', () => {
    render(<AppHeader />);
    expect(screen.getByText('ISO 3166 Flags Explorer')).toBeInTheDocument();
  });

  it('displays the globe emoji', () => {
    render(<AppHeader />);
    const emoji = screen.getByText('🌍');
    expect(emoji).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<AppHeader />);
    const flags_link = screen.getByText(/Flags Dataset/i);
    const subdivision_link = screen.getByText(/Subdivision Data/i);
    
    expect(flags_link).toBeInTheDocument();
    expect(subdivision_link).toBeInTheDocument();
  });

  it('has correct href for GitHub link', () => {
    render(<AppHeader />);
    const github_link = screen.getByRole('link', { name: /Flags Dataset/i });
    expect(github_link).toHaveAttribute('href', expect.stringContaining('github.com'));
  });

  it('renders info button', () => {
    const mockOnInfoClick = jest.fn();
    render(<AppHeader onInfoClick={mockOnInfoClick} />);
    // The button renders the text 'About' (with an Info icon)
    const infoButton = screen.getByRole('button', { name: /About/i });
    expect(infoButton).toBeInTheDocument();
  });

  it('calls onInfoClick when info button is clicked', async () => {
    const mockOnInfoClick = jest.fn();
    render(<AppHeader onInfoClick={mockOnInfoClick} />);
    
    const infoButton = screen.getByRole('button', { name: /About/i });
    userEvent.click(infoButton);
    
    expect(mockOnInfoClick).toHaveBeenCalled();
  });

  it('renders responsive layout', () => {
    const { container } = render(<AppHeader />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });
});
