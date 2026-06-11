import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportButton from '../../../src/components/ExportButton';
import {
  exportCountryAsCSV,
  exportSubdivisionsAsCSV,
  exportCountryAsJSON,
  exportSubdivisionsAsJSON,
} from '../../../src/utils/exportUtils';

jest.mock('../../../src/utils/exportUtils', () => ({
  formatCountryForExport: jest.fn(c => c),
  formatSubdivisionForExport: jest.fn(s => s),
  exportCountryAsCSV: jest.fn(),
  exportSubdivisionsAsCSV: jest.fn(),
  exportCountryAsJSON: jest.fn(),
  exportSubdivisionsAsJSON: jest.fn(),
}));

const MOCK_COUNTRY = {
  name: { common: 'France', official: 'French Republic' },
  cca2: 'FR',
  cca3: 'FRA',
  ccn3: '250',
  capital: ['Paris'],
  region: 'Europe',
  subregion: 'Western Europe',
  population: 67000000,
  area: 551695,
  flags: { png: 'https://example.com/fr.png', svg: 'https://example.com/fr.svg' },
  latlng: [46, 2],
  languages: { fra: 'French' },
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  borders: ['AND', 'BEL'],
  timezones: ['UTC+01:00'],
};

const MOCK_SUBDIVISIONS: any[] = [
  { name: 'Île-de-France', type: 'Region', code: 'FR-IDF', latLng: [48.85, 2.35] as [number, number], flag: '', history: [] },
];

describe('ExportButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Export button', () => {
    render(<ExportButton country={MOCK_COUNTRY as any} subdivisions={MOCK_SUBDIVISIONS} />);
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('opens the dropdown menu on click', () => {
    render(<ExportButton country={MOCK_COUNTRY as any} subdivisions={MOCK_SUBDIVISIONS} />);
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    expect(screen.getByText(/export country details/i)).toBeInTheDocument();
    expect(screen.getByText(/export subdivisions/i)).toBeInTheDocument();
  });

  it('shows country submenu on hover when country is provided', () => {
    render(<ExportButton country={MOCK_COUNTRY as any} subdivisions={MOCK_SUBDIVISIONS} />);
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    const countryItem = screen.getByText(/export country details/i);
    fireEvent.mouseEnter(countryItem);
    expect(screen.getByText('Export to CSV')).toBeInTheDocument();
    expect(screen.getByText('Export to JSON')).toBeInTheDocument();
  });

  it('triggers CSV export for country on click', () => {
    render(
      <ExportButton
        country={MOCK_COUNTRY as any}
        subdivisions={MOCK_SUBDIVISIONS}
        countryName="France"
      />
    );
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    const countryItem = screen.getByText(/export country details/i);
    fireEvent.mouseEnter(countryItem);
    const csvButtons = screen.getAllByText('Export to CSV');
    userEvent.click(csvButtons[0]);
    expect(exportCountryAsCSV).toHaveBeenCalled();
  });

  it('triggers JSON export for country on click', () => {
    render(
      <ExportButton
        country={MOCK_COUNTRY as any}
        subdivisions={MOCK_SUBDIVISIONS}
        countryName="France"
      />
    );
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    const countryItem = screen.getByText(/export country details/i);
    fireEvent.mouseEnter(countryItem);
    const jsonButtons = screen.getAllByText('Export to JSON');
    userEvent.click(jsonButtons[0]);
    expect(exportCountryAsJSON).toHaveBeenCalled();
  });

  it('triggers subdivision CSV export on click', () => {
    render(
      <ExportButton
        country={MOCK_COUNTRY as any}
        subdivisions={MOCK_SUBDIVISIONS}
        countryName="France"
      />
    );
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    const subdivisionsItem = screen.getByText(/export subdivisions/i);
    fireEvent.mouseEnter(subdivisionsItem);
    const csvButtons = screen.getAllByText('Export to CSV');
    userEvent.click(csvButtons[csvButtons.length - 1]);
    expect(exportSubdivisionsAsCSV).toHaveBeenCalled();
  });

  it('triggers subdivision JSON export on click', () => {
    render(
      <ExportButton
        country={MOCK_COUNTRY as any}
        subdivisions={MOCK_SUBDIVISIONS}
        countryName="France"
      />
    );
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    const subdivisionsItem = screen.getByText(/export subdivisions/i);
    fireEvent.mouseEnter(subdivisionsItem);
    const jsonButtons = screen.getAllByText('Export to JSON');
    userEvent.click(jsonButtons[jsonButtons.length - 1]);
    expect(exportSubdivisionsAsJSON).toHaveBeenCalled();
  });

  it('does not open country submenu when no country prop given', () => {
    render(<ExportButton country={null} subdivisions={MOCK_SUBDIVISIONS} />);
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    // Country item is rendered but disabled — no submenu CSV/JSON should appear
    fireEvent.mouseEnter(screen.getByTitle(/select a country first/i));
    expect(screen.queryByText('Export to CSV')).not.toBeInTheDocument();
  });

  it('does not open subdivisions submenu when subdivisions is empty', () => {
    render(<ExportButton country={MOCK_COUNTRY as any} subdivisions={[]} />);
    const exportBtn = screen.getByRole('button', { name: /export/i });
    userEvent.click(exportBtn);
    // Subdivisions item is rendered but disabled — hover should not reveal submenu
    fireEvent.mouseEnter(screen.getByTitle(/load a country first/i));
    expect(screen.queryByText('Export to CSV')).not.toBeInTheDocument();
  });
});
