/**
 * Side-by-side country comparison panel.
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountryComparison from '../../../src/components/CountryComparison';
import { iso3166Service, RestCountryData } from '../../../src/services/iso3166Service';
import { exportCountriesComparison } from '../../../src/utils/exportUtils';

jest.mock('../../../src/services/iso3166Service', () => ({
  iso3166Service: {
    getCountryInfo: jest.fn(),
    getCountryFlagUrl: jest.fn().mockReturnValue(''),
  },
}));

jest.mock('../../../src/utils/exportUtils', () => ({
  ...jest.requireActual('../../../src/utils/exportUtils'),
  exportCountriesComparison: jest.fn(),
  exportCountriesComparisonAsJSON: jest.fn(),
}));

const mockGetCountryInfo = iso3166Service.getCountryInfo as jest.Mock;

const country = (code: string, common: string, population: number): RestCountryData => ({
  name: { common, official: `Republic of ${common}` },
  cca2: code,
  cca3: `${code}X`,
  ccn3: '000',
  region: 'Europe',
  subregion: 'Northern Europe',
  capital: [`${common} City`],
  population,
  area: 0,
  timezones: ['UTC'],
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  languages: { eng: 'English' },
  flags: { svg: '', png: '' },
});

describe('CountryComparison', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCountryInfo.mockImplementation((code: string) =>
      Promise.resolve(country(code, code === 'IE' ? 'Ireland' : 'France', code === 'IE' ? 5_000_000 : 0))
    );
  });

  it('seeds the table with the country the user was already viewing', async () => {
    render(<CountryComparison initialCountryCode="IE" onClose={onClose} />);

    await waitFor(() => expect(screen.getByText('Republic of Ireland')).toBeInTheDocument());
    expect(mockGetCountryInfo).toHaveBeenCalledWith('IE');
  });

  it('renders a real zero rather than a dash', async () => {
    render(<CountryComparison initialCountryCode="FR" onClose={onClose} />);

    // area is 0 for the fixture — Number.isFinite, not truthiness
    await waitFor(() => expect(screen.getByText('Republic of France')).toBeInTheDocument());
    const areaRow = screen.getByRole('row', { name: /Area/ });
    expect(areaRow).toHaveTextContent('0');
  });

  it('adds a country chosen from the picker', async () => {
    render(<CountryComparison onClose={onClose} />);

    expect(screen.getByText(/Add up to 4 countries/)).toBeInTheDocument();

    userEvent.selectOptions(screen.getByLabelText('Choose a country to compare'), 'IE');
    userEvent.click(screen.getByText('Add'));

    await waitFor(() => expect(screen.getByText('Republic of Ireland')).toBeInTheDocument());
  });

  it('removes a country from the comparison', async () => {
    render(<CountryComparison initialCountryCode="IE" onClose={onClose} />);
    await waitFor(() => expect(screen.getByText('Republic of Ireland')).toBeInTheDocument());

    userEvent.click(screen.getByLabelText('Remove Ireland from comparison'));

    expect(screen.getByText(/Add up to 4 countries/)).toBeInTheDocument();
  });

  it('stops at four countries', async () => {
    render(<CountryComparison onClose={onClose} />);
    const picker = screen.getByLabelText('Choose a country to compare');

    ['IE', 'FR', 'DE', 'ES'].forEach(code => {
      userEvent.selectOptions(picker, code);
      userEvent.click(screen.getByText('Add'));
    });

    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /from comparison$/ })).toHaveLength(4)
    );
    expect(screen.getByText('Maximum of 4 countries')).toBeInTheDocument();
    expect(picker).toBeDisabled();
    expect(screen.getByText('Add').closest('button')).toBeDisabled();
  });

  it('only enables export once data has loaded', async () => {
    render(<CountryComparison onClose={onClose} />);

    const csv = screen.getByText('CSV').closest('button') as HTMLButtonElement;
    expect(csv).toBeDisabled();

    userEvent.selectOptions(screen.getByLabelText('Choose a country to compare'), 'IE');
    userEvent.click(screen.getByText('Add'));
    await waitFor(() => expect(csv).not.toBeDisabled());

    userEvent.click(csv);
    expect(exportCountriesComparison).toHaveBeenCalledWith([
      expect.objectContaining({ 'Country Name': 'Ireland' }),
    ]);
  });

  it('closes on Escape and on the close button', async () => {
    const { unmount } = render(<CountryComparison onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    unmount();

    onClose.mockClear();
    render(<CountryComparison onClose={onClose} />);
    userEvent.click(screen.getByLabelText('Close comparison'));
    expect(onClose).toHaveBeenCalled();
  });
});
