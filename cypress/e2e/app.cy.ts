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
    cy.viewport('iphone-x');
    cy.get('header').should('be.visible');
    cy.get('h1').should('be.visible');
  });

  it('should open and close the About dialog', () => {
    cy.get('[role="dialog"]').should('not.exist');
    cy.contains('button', /About/i).click();
    cy.get('[role="dialog"]').should('be.visible').and('contain.text', 'About');
    cy.get('[aria-label="Close about dialog"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should switch the map projection', () => {
    cy.get('[data-testid="map-variant-select"]').should('have.value', 'world');
    cy.get('[data-testid="map-variant-select"]').select('world_merc');
    cy.get('[data-testid="map-variant-select"]').should('have.value', 'world_merc');
    cy.get('.jvm-region').should('exist');
  });

  it('should open the country comparison panel', () => {
    cy.contains('button', /Compare/i).click();
    cy.get('[role="dialog"]').should('be.visible').and('contain.text', 'Compare countries');
    cy.get('[aria-label="Close comparison"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should navigate to external links', () => {
    cy.get('a').should('have.attr', 'href').and('include', 'github.com');
  });
});
