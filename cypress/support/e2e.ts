// Cypress support file - setup commands and hooks

// Prevent Cypress from failing on unhandled exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (
    err.message.includes('ResizeObserver loop limit exceeded') ||
    err.message.includes('Network request failed')
  ) {
    return false;
  }
});

// Custom command to select a country from dropdown
Cypress.Commands.add('selectCountry', (countryName: string) => {
  cy.get('button').first().click();
  cy.get('input[placeholder*="search"]').type(countryName);
  cy.get('button').contains(countryName).click();
});

// Custom command to search for a country
Cypress.Commands.add('searchForLocation', (query: string) => {
  cy.get('input[placeholder*="Search"]').type(query);
  cy.get('button').contains(query).first().click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      selectCountry(countryName: string): Chainable<void>;
      searchForLocation(query: string): Chainable<void>;
    }
  }
}
