const STUB_SEARCH_RESPONSE = {
  FR: {
    'FR-IDF': {
      name: 'Île-de-France',
      type: 'Metropolitan region',
      code: 'FR-IDF',
      localOtherName: null,
      latLng: [48.8566, 2.3522],
      parentCode: null,
      history: [],
    },
  },
};

const STUB_SUBDIVISIONS_RESPONSE = {
  'US-CA': {
    name: 'California',
    type: 'State',
    code: 'US-CA',
    localOtherName: null,
    latLng: [36.7783, -119.4179],
    parentCode: null,
    history: [],
  },
};

describe('Search Functionality', () => {
  beforeEach(() => {
    // Path-only patterns: the ISO 3166-2 base URL is the dev proxy
    // (/api/iso3166-2) locally and the public API in production.
    cy.intercept('GET', '**/search/**', { statusCode: 200, body: STUB_SEARCH_RESPONSE }).as('apiCall');
    cy.intercept('GET', '**/alpha/*', { statusCode: 200, body: STUB_SUBDIVISIONS_RESPONSE }).as('subdivisionsCall');
    cy.visit('/');
  });

  it('should display search input field', () => {
    cy.get('input[placeholder*="Search"]').should('be.visible');
  });

  it('should allow typing in search field', () => {
    cy.get('input[placeholder*="Search"]')
      .type('United States')
      .should('have.value', 'United States');
  });

  it('should display search results', () => {
    cy.get('input[placeholder*="Search"]').type('France');
    cy.wait('@apiCall');
    cy.get('#search-results-list').should('be.visible');
    cy.get('#search-results-list [role="option"]').should('have.length.at.least', 1);
  });

  it('should clear search results on empty input', () => {
    cy.get('input[placeholder*="Search"]').type('test');
    cy.wait(300);
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('#search-results-list').should('not.exist');
  });

  it('should handle special characters in search', () => {
    cy.get('input[placeholder*="Search"]').type("Côte d'Ivoire");
    cy.get('input[placeholder*="Search"]').should('have.value', "Côte d'Ivoire");
  });

  it('should be case-insensitive', () => {
    cy.get('input[placeholder*="Search"]').type('FRANCE');
    cy.wait('@apiCall');
    cy.get('#search-results-list').should('be.visible');

    cy.get('input[placeholder*="Search"]').clear().type('france');
    cy.wait('@apiCall');
    cy.get('#search-results-list').should('be.visible');
  });

  it('should handle rapid search queries', () => {
    cy.get('input[placeholder*="Search"]').type('A');
    cy.wait(200);
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('input[placeholder*="Search"]').type('B');
    cy.wait(200);
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('input[placeholder*="Search"]').type('C');
    cy.get('input[placeholder*="Search"]').should('have.value', 'C');
  });

  it('should display results for subdivision search', () => {
    cy.get('input[placeholder*="Search"]').type('California');
    cy.wait('@apiCall');
    cy.get('#search-results-list').should('be.visible');
    cy.get('#search-results-list [role="option"]').first().should('be.visible');
  });

  it('should be keyboard accessible', () => {
    cy.get('input[placeholder*="Search"]')
      .focus()
      .should('have.focus')
      .type('France');
    cy.wait('@apiCall');
    cy.get('#search-results-list').should('be.visible');
  });

  it('should handle empty search gracefully', () => {
    // Override the default stub: this query matches nothing upstream
    cy.intercept('GET', '**/search/**', { statusCode: 200, body: {} }).as('emptyCall');
    cy.get('input[placeholder*="Search"]').type('zzzzzzzzzz');
    cy.wait('@emptyCall');
    cy.get('#search-results-list').should('be.visible');
    cy.contains('No subdivisions found matching your search').should('be.visible');
  });

  it('should update results in real-time', () => {
    // A bare 2-letter term is treated as a country code, so it loads that
    // country's subdivisions rather than hitting the name-search endpoint.
    cy.get('input[placeholder*="Search"]').type('fr');
    cy.wait('@subdivisionsCall');
    cy.get('#search-results-list').should('be.visible');
  });
});

