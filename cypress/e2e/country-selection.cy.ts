describe('Country Selection Workflow', () => {
  beforeEach(() => {
    // Stub subdivision and country-info API calls so tests run offline and deterministically
    cy.intercept('GET', '**/iso3166-2-api**/alpha/DE', {
      statusCode: 200,
      body: {
        'DE-BE': { code: 'DE-BE', name: 'Berlin', type: 'State', latLng: [52.52, 13.405], flag: '' },
        'DE-BY': { code: 'DE-BY', name: 'Bavaria', type: 'State', latLng: [48.79, 11.49], flag: '' },
      },
    }).as('getSubdivisions');

    cy.intercept('GET', '**/restcountries.com**/alpha/DE', {
      statusCode: 200,
      body: [
        {
          name: { common: 'Germany', official: 'Federal Republic of Germany' },
          cca2: 'DE', cca3: 'DEU', ccn3: '276',
          region: 'Europe', subregion: 'Western Europe',
          capital: ['Berlin'], area: 357114, population: 83240525,
          timezones: ['UTC+01:00'],
          currencies: { EUR: { name: 'Euro', symbol: '€' } },
          languages: { deu: 'German' },
          flags: { svg: '', png: '' },
        },
      ],
    }).as('getCountryInfo');

    cy.visit('/');
  });

  it('should show the country dropdown trigger on load', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').should('be.visible');
  });

  it('should open the dropdown list when the trigger is clicked', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').click();
    cy.get('[data-testid="country-dropdown-list"]').should('be.visible');
    cy.get('[data-testid="country-dropdown-search"]').should('be.visible');
  });

  it('should filter countries by typing in the search box', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').click();
    cy.get('[data-testid="country-dropdown-search"]').type('Germany');
    cy.get('[data-testid="country-option-DE"]').should('be.visible');
    // Other countries should be hidden
    cy.get('[data-testid="country-option-US"]').should('not.exist');
  });

  it('should close the dropdown and load subdivision data after selecting a country', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').click();
    cy.get('[data-testid="country-dropdown-search"]').type('Germany');
    cy.get('[data-testid="country-option-DE"]').click();

    // Dropdown should close
    cy.get('[data-testid="country-dropdown-list"]').should('not.be.visible');

    // API should have been called
    cy.wait('@getSubdivisions');
  });

  it('should display the selected country name in the trigger after selection', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').click();
    cy.get('[data-testid="country-dropdown-search"]').type('Germany');
    cy.get('[data-testid="country-option-DE"]').click();

    cy.get('[data-testid="country-dropdown-trigger"]').should('contain.text', 'Germany');
  });

  it('should show a clear button after selection and reset on click', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').click();
    cy.get('[data-testid="country-dropdown-search"]').type('Germany');
    cy.get('[data-testid="country-option-DE"]').click();

    cy.get('[data-testid="country-dropdown-clear"]').should('be.visible').click();
    cy.get('[data-testid="country-dropdown-trigger"]').should('contain.text', 'Select a country');
  });

  it('should close the dropdown when clicking outside', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').click();
    cy.get('[data-testid="country-dropdown-list"]').should('be.visible');
    cy.get('body').click(0, 0);
    cy.get('[data-testid="country-dropdown-list"]').should('not.be.visible');
  });

  it('should show a flag image for the selected country in the trigger', () => {
    cy.get('[data-testid="country-dropdown-trigger"]').click();
    cy.get('[data-testid="country-dropdown-search"]').type('Germany');
    cy.get('[data-testid="country-option-DE"]').click();

    // Flag image should appear in the trigger button
    cy.get('[data-testid="country-dropdown-trigger"]').find('img[alt]').should('exist');
  });
});
