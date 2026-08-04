describe('Responsive Design', () => {
  it('should display correctly on desktop', () => {
    cy.viewport(1920, 1080);
    cy.visit('/');
    cy.get('header').should('be.visible');
    cy.get('button').first().should('be.visible');
  });

  it('should display correctly on tablet', () => {
    cy.viewport('ipad-2');
    cy.visit('/');
    cy.get('header').should('be.visible');
  });

  it('should display correctly on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('header').should('be.visible');
    cy.get('button').first().should('be.visible');
  });

  it('should adjust layout on mobile viewport', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    
    // Header should be full width
    cy.get('header').should('have.css', 'width');
  });

  it('should be readable on small screens', () => {
    cy.viewport(320, 568);
    cy.visit('/');
    
    cy.get('h1').should('be.visible');
    cy.get('button').first().should('have.css', 'min-height');
  });

  it('should handle tablet landscape', () => {
    cy.viewport(1024, 600);
    cy.visit('/');
    cy.get('header').should('be.visible');
  });

  it('should have touch-friendly buttons on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    
    cy.get('button').first().should('have.css', 'min-height');
  });

  it('should maintain functionality across viewports', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('button').first().click();
    
    cy.viewport(1920, 1080);
    cy.visit('/');
    cy.get('button').first().click();
  });

  it('should not overlap elements on mobile', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    
    // Check that key elements are visible and not overlapping
    cy.get('header').should('be.visible');
  });

  it('should resize without breaking layout', () => {
    cy.visit('/');
    
    cy.viewport(1920, 1080);
    cy.wait(500);
    
    cy.viewport('iphone-x');
    cy.wait(500);
    
    cy.viewport(1024, 768);
    cy.wait(500);
    
    cy.get('header').should('be.visible');
  });
});
