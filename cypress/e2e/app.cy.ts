describe('Application Loading and Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the application successfully', () => {
    cy.get('header').should('exist');
    cy.get('h1').should('contain', 'ISO 3166 Flags Explorer');
  });

  it('should display the main map container', () => {
    cy.get('[data-testid="interactive-map"]').should('exist');
  });

  it('should display the header with navigation links', () => {
    cy.get('header').should('be.visible');
    cy.get('a').should('have.length.greaterThan', 0);
  });

  it('should have responsive header on mobile viewport', () => {
    cy.viewport('iphone-12');
    cy.get('header').should('be.visible');
    cy.get('h1').should('be.visible');
  });

  it('should open info button without errors', () => {
    cy.get('button').contains(/Info/i).click();
  });

  it('should navigate to external links', () => {
    cy.get('a').should('have.attr', 'href').and('include', 'github.com');
  });
});
