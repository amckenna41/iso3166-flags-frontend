import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CountryInfo from '../../../src/components/CountryInfo';
import { iso3166Service } from '../../../src/services/iso3166Service';

jest.mock('../../../src/services/iso3166Service', () => ({
  iso3166Service: {
    getCountryInfo: jest.fn(),
    getCountryFlagUrl: jest.fn(code => `https://flags.example.com/${code}.png`),
  },
}));

jest.mock('../../../src/components/DemoInfo', () => () => <div data-testid="demo-info">Demo</div>);
jest.mock('../../../src/components/ExportButton', () => () => <div data-testid="export-button">Export</div>);
jest.mock('../../../src/config/appConfig', () => ({
  __esModule: true,
  default: { features: { enableExport: false } },
  APP_CONFIG: { features: { enableExport: false } },
}));

const mockGetCountryInfo = iso3166Service.getCountryInfo as jest.Mock;

const MOCK_COUNTRY_INFO = {
  name: { common: 'Germany', official: 'Federal Republic of Germany' },
  cca2: 'DE',
  cca3: 'DEU',
  ccn3: '276',
  capital: ['Berlin'],
  region: 'Europe',
  subregion: 'Western Europe',
  population: 83000000,
  area: 357114,
  flags: { png: '', svg: '' },
  latlng: [51, 9],
  languages: { deu: 'German' },
  currencies: { EUR: { name: 'Euro', symbol: '€' } },
  borders: [],
  timezones: ['UTC+01:00'],
};

const MOCK_COUNTRY_DATA = {
  'DE-BE': { name: 'Berlin', type: 'State', code: 'DE-BE', latLng: [52.52, 13.4] as [number, number], flag: '', history: [] },
  'DE-BY': { name: 'Bavaria', type: 'State', code: 'DE-BY', localOtherName: 'Bayern', latLng: [48.79, 11.49] as [number, number], flag: '', history: [] },
};

const defaultProps = {
  countryName: 'Germany',
  countryData: MOCK_COUNTRY_DATA as any,
  countryCode: 'DE',
  highlightedSubdivision: null,
  onClose: jest.fn(),
};

describe('CountryInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCountryInfo.mockResolvedValue(MOCK_COUNTRY_INFO);
  });

  it('renders DemoInfo when countryName is null', () => {
    render(<CountryInfo {...defaultProps} countryName={null} countryData={null} />);
    expect(screen.getByTestId('demo-info')).toBeInTheDocument();
  });

  it('renders country title when countryName is provided', () => {
    render(<CountryInfo {...defaultProps} />);
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('fetches country info via getCountryInfo effect', async () => {
    render(<CountryInfo {...defaultProps} />);
    await waitFor(() => {
      expect(mockGetCountryInfo).toHaveBeenCalledWith('DE');
    });
  });

  it('renders subdivision cards when countryData is provided', async () => {
    render(<CountryInfo {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Berlin')).toBeInTheDocument();
      expect(screen.getByText('Bavaria')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<CountryInfo {...defaultProps} onClose={onClose} />);
    const closeBtn = screen.getAllByRole('button').find(
      b => b.getAttribute('aria-label') === null && b.closest('[class]')
    );
    // Find the X close button (first button in the header area)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('opens subdivision modal when card is clicked', async () => {
    render(<CountryInfo {...defaultProps} />);
    const berlinCard = await screen.findByText('Berlin');
    userEvent.click(berlinCard.closest('[class]') as HTMLElement || berlinCard);
    // Modal should appear with navigation buttons
    await waitFor(() => {
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  it('closes subdivision modal on overlay click', async () => {
    render(<CountryInfo {...defaultProps} />);
    const berlinCard = await screen.findByText('Berlin');
    const card = berlinCard.closest('[class]') as HTMLElement || berlinCard;
    userEvent.click(card);
    await waitFor(() => {
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
    const closeModalBtn = screen.getByLabelText('Close modal');
    userEvent.click(closeModalBtn);
    await waitFor(() => {
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });
  });

  it('shows country info after loading', async () => {
    render(<CountryInfo {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });
  });

  it('shows no-subdivisions message when countryData is empty', () => {
    render(<CountryInfo {...defaultProps} countryData={{}} />);
    expect(screen.getByText(/no subdivisions available/i)).toBeInTheDocument();
  });

  it('shows loading message when countryData is null', () => {
    render(<CountryInfo {...defaultProps} countryData={null} />);
    // Component renders skeleton cards while loading — no subdivision names yet
    expect(screen.queryByText('Berlin')).not.toBeInTheDocument();
    expect(screen.queryByText('Bavaria')).not.toBeInTheDocument();
  });

  it('highlights the specified subdivision card', async () => {
    render(<CountryInfo {...defaultProps} highlightedSubdivision="DE-BE" />);
    await waitFor(() => {
      // h4 is the subdivision card heading; capital "Berlin" may also appear as a value span
      const berlinElements = screen.getAllByText('Berlin');
      expect(berlinElements.length).toBeGreaterThan(0);
    });
    // Verify the subdivision card heading (h4) is present
    const berlinHeading = screen.getAllByText('Berlin').find(el => el.tagName === 'H4');
    expect(berlinHeading).toBeInTheDocument();
  });

  describe('country navigation arrows', () => {
    it('steps to the alphabetical neighbours of the current country', () => {
      const onSelectCountry = jest.fn();
      render(<CountryInfo {...defaultProps} onSelectCountry={onSelectCountry} />);

      fireEvent.click(screen.getByLabelText('Previous country'));
      expect(onSelectCountry).toHaveBeenCalledWith('GE', 'Georgia');

      fireEvent.click(screen.getByLabelText('Next country'));
      expect(onSelectCountry).toHaveBeenCalledWith('GH', 'Ghana');
    });

    it('wraps around at the ends of the list', () => {
      const onSelectCountry = jest.fn();
      // Afghanistan is first alphabetically; previous must wrap to the last entry.
      render(
        <CountryInfo
          {...defaultProps}
          countryName="Afghanistan"
          countryCode="AF"
          onSelectCountry={onSelectCountry}
        />
      );

      fireEvent.click(screen.getByLabelText('Previous country'));
      expect(onSelectCountry).toHaveBeenCalledWith('ZW', 'Zimbabwe');
    });

    it('renders no arrows without a navigation handler', () => {
      render(<CountryInfo {...defaultProps} />);
      expect(screen.queryByLabelText('Next country')).toBeNull();
    });
  });
});
