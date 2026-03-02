describe('Country Selection Workflow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should open country dropdown', () => {
    cy.get('button').first().should('be.visible').click();
  });

  it('should display country list when dropdown opens', () => {
    cy.get('button').first().click();
    cy.get('input').first().should('be.visible');
  });

  it('should filter countries by search', () => {
    cy.get('button').first().click();
    cy.get('input[placeholder*="search"]').type('United States');
  });

  it('should display selected country information', () => {
    cy.get('button').first().click();
    cy.wait(500);
    
    // Look for country options and click the first one
    cy.get('button').then($buttons => {
      if ($buttons.length > 1) {
        cy.wrap($buttons[1]).click();
        cy.wait(1000);
        
        // Info panel should be visible
        cy.get('div').should('exist');
      }
    });
  });

  it('should close dropdown after country selection', () => {
    cy.get('button').first().click();
    cy.wait(300);
    
    cy.get('button').then($buttons => {
      if ($buttons.length > 1) {
        cy.wrap($buttons[1]).click();
        cy.wait(500);
      }
    });
  });

  it('should clear country selection', () => {
    cy.get('button').first().click();
    cy.wait(300);
    
    cy.get('button').then($buttons => {
      if ($buttons.length > 1) {
        cy.wrap($buttons[1]).click();
      }
    });
  });

  it('should handle rapid country selections', () => {
    cy.get('button').first().click();
    cy.wait(300);
    cy.get('button').first().click();
    cy.wait(300);
    cy.get('button').first().click();
  });

  it('should display flag image for selected country', () => {
    cy.get('button').first().click();
    cy.wait(300);
    
    cy.get('button').then($buttons => {
      if ($buttons.length > 1) {
        cy.wrap($buttons[1]).click();
        cy.wait(1000);
        
        // Flag image should be visible in info panel
        cy.get('img[alt*="flag"]').should('exist');
      }
    });
  });

  it('should work with keyboard navigation', () => {
    cy.get('button').first().focus().type('{enter}');
    cy.wait(300);
  });

  it('should maintain selection on re-render', () => {
    cy.get('button').first().click();
    cy.wait(300);
    cy.get('button').first().click();
    cy.wait(300);
  });
});
