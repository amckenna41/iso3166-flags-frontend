import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubdivisionModal from '../../../src/components/SubdivisionModal';
import { SubdivisionData } from '../../../src/services/iso3166Service';

const base: SubdivisionData = {
  code: 'DZ-08',
  name: 'Béchar',
  type: 'Province',
  latLng: [31.61, -2.21],
  flag: null,
};

const renderModal = (subdivision: SubdivisionData) =>
  render(
    <SubdivisionModal
      subdivision={subdivision}
      subdivisions={[subdivision]}
      currentIndex={0}
      countryCode="DZ"
      onClose={jest.fn()}
      onNavigateNext={jest.fn()}
      onNavigatePrevious={jest.fn()}
    />
  );

describe('SubdivisionModal flag URL', () => {
  it('shows no flag URL when the API reports none', () => {
    renderModal(base);
    expect(screen.queryByRole('link')).toBeNull();
    expect(document.body.innerHTML).not.toContain('iso3166-2-flags');
  });

  it('links the flag URL the API supplies', () => {
    const url = 'https://example.com/US-CA.svg';
    renderModal({ ...base, code: 'US-CA', flag: url });
    expect(screen.getByRole('link', { name: url })).toHaveAttribute('href', url);
  });

  it('copies the flag URL to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const url = 'https://example.com/US-CA.svg';
    renderModal({ ...base, code: 'US-CA', flag: url });
    fireEvent.click(screen.getByTitle('Copy flag URL'));
    expect(writeText).toHaveBeenCalledWith(url);
  });
});
