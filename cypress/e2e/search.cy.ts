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
    cy.intercept('GET', '**/iso3166-2-api.vercel.app/**', (req) => {
      const url = req.url;
      if (url.includes('/search') || url.includes('?q=')) {
        req.reply({ statusCode: 200, body: STUB_SEARCH_RESPONSE });
      } else if (url.includes('/us') || url.includes('/US')) {
        req.reply({ statusCode: 200, body: STUB_SUBDIVISIONS_RESPONSE });
      } else {
        req.reply({ statusCode: 200, body: {} });
      }
    }).as('apiCall');
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
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').should('have.length.at.least', 1);
  });

  it('should clear search results on empty input', () => {
    cy.get('input[placeholder*="Search"]').type('test');
    cy.wait(300);
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('[role="listbox"]').should('not.exist');
  });

  it('should handle special characters in search', () => {
    cy.get('input[placeholder*="Search"]').type("Côte d'Ivoire");
    cy.get('input[placeholder*="Search"]').should('have.value', "Côte d'Ivoire");
  });

  it('should be case-insensitive', () => {
    cy.get('input[placeholder*="Search"]').type('FRANCE');
    cy.wait('@apiCall');
    cy.get('[role="listbox"]').should('be.visible');

    cy.get('input[placeholder*="Search"]').clear().type('france');
    cy.wait('@apiCall');
    cy.get('[role="listbox"]').should('be.visible');
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
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().should('be.visible');
  });

  it('should be keyboard accessible', () => {
    cy.get('input[placeholder*="Search"]')
      .focus()
      .should('have.focus')
      .type('France');
    cy.wait('@apiCall');
    cy.get('[role="listbox"]').should('be.visible');
  });

  it('should handle empty search gracefully', () => {
    cy.get('input[placeholder*="Search"]').type('zzzzzzzzzz');
    cy.wait('@apiCall');
    cy.get('[role="listbox"]').should('be.visible');
    cy.contains('No subdivisions found').should('be.visible');
  });

  it('should update results in real-time', () => {
    cy.get('input[placeholder*="Search"]').type('fr');
    cy.wait('@apiCall');
    cy.get('[role="listbox"]').should('be.visible');
  });
});

