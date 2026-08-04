/**
 * Without the boundary, a render throw anywhere under it blanks the whole page.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../../../src/components/ErrorBoundary';

const Boom: React.FC<{ explode: boolean }> = ({ explode }) => {
  if (explode) throw new Error('kaboom');
  return <div>child content</div>;
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    // React logs the caught error itself; keep the test output readable
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => consoleError.mockRestore());

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Boom explode={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders a labelled fallback instead of unmounting the page', () => {
    render(
      <ErrorBoundary label="info panel">
        <Boom explode />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong in the info panel');
    expect(screen.getByText('kaboom')).toBeInTheDocument();
    expect(screen.queryByText('child content')).not.toBeInTheDocument();
  });

  it('re-renders the children when "Try again" is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Boom explode />
      </ErrorBoundary>
    );

    rerender(
      <ErrorBoundary>
        <Boom explode={false} />
      </ErrorBoundary>
    );
    userEvent.click(screen.getByText('Try again'));

    expect(screen.getByText('child content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
