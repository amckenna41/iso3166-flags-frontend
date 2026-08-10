import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutModal from '../../../src/components/AboutModal';
import InteractiveMap from '../../../src/components/InteractiveMap';

// The About content itself is DemoInfo, already covered by its own tests.
jest.mock('../../../src/components/DemoInfo', () => () => <div data-testid="demo-info">About content</div>);

// Keep the heavy map and the network out of the wiring test.
jest.mock('../../../src/components/JSVectorMapComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-map" />,
}));

jest.mock('../../../src/services/iso3166Service', () => ({
  iso3166Service: {
    getCountrySubdivisions: jest.fn().mockResolvedValue({}),
    getCountryFlagUrl: jest.fn().mockReturnValue(''),
    getCountryInfo: jest.fn().mockResolvedValue(null),
    searchSubdivisions: jest.fn().mockResolvedValue({}),
    getAllCountries: jest.fn().mockResolvedValue({}),
  },
}));

describe('AboutModal', () => {
  it('renders the about content in a labelled dialog', () => {
    render(<AboutModal onClose={jest.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByTestId('demo-info')).toBeInTheDocument();
  });

  it('closes on the close button', async () => {
    const onClose = jest.fn();
    render(<AboutModal onClose={onClose} />);

    await userEvent.click(screen.getByLabelText('Close about dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();
    render(<AboutModal onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked but not the dialog itself', () => {
    const onClose = jest.fn();
    render(<AboutModal onClose={onClose} />);

    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('about-modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('About button wiring', () => {
  it('opens the About dialog on click and closes it again', async () => {
    render(<InteractiveMap />);

    // The whole point of the fix: nothing visible happened before this click.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /about/i }));
    const dialog = screen.getByRole('dialog');
    // Scoped: the side panel also renders DemoInfo while no country is selected.
    expect(within(dialog).getByTestId('demo-info')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Close about dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
