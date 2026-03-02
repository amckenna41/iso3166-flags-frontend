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
    const updates_link = screen.getByText(/Updates/i);
    
    expect(flags_link).toBeInTheDocument();
    expect(updates_link).toBeInTheDocument();
  });

  it('has correct href for GitHub link', () => {
    render(<AppHeader />);
    const github_link = screen.getByRole('link', { name: /Flags Dataset/i });
    expect(github_link).toHaveAttribute('href', expect.stringContaining('github.com'));
  });

  it('renders info button', () => {
    const mockOnInfoClick = jest.fn();
    render(<AppHeader onInfoClick={mockOnInfoClick} />);
    const infoButton = screen.getByRole('button', { name: /Info/i });
    expect(infoButton).toBeInTheDocument();
  });

  it('calls onInfoClick when info button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnInfoClick = jest.fn();
    render(<AppHeader onInfoClick={mockOnInfoClick} />);
    
    const infoButton = screen.getByRole('button', { name: /Info/i });
    await user.click(infoButton);
    
    expect(mockOnInfoClick).toHaveBeenCalled();
  });

  it('renders responsive layout', () => {
    const { container } = render(<AppHeader />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });
});
