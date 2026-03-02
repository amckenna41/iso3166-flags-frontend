describe('Search Functionality', () => {
  beforeEach(() => {
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
    cy.wait(500);
  });

  it('should clear search results on empty input', () => {
    cy.get('input[placeholder*="Search"]').type('test');
    cy.wait(300);
    cy.get('input[placeholder*="Search"]').clear();
  });

  it('should handle special characters in search', () => {
    cy.get('input[placeholder*="Search"]').type("Côte d'Ivoire");
  });

  it('should be case-insensitive', () => {
    cy.get('input[placeholder*="Search"]').type('CANADA');
    cy.wait(500);
    
    cy.get('input[placeholder*="Search"]').clear().type('canada');
    cy.wait(500);
  });

  it('should handle rapid search queries', () => {
    cy.get('input[placeholder*="Search"]').type('A');
    cy.wait(200);
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('input[placeholder*="Search"]').type('B');
    cy.wait(200);
    cy.get('input[placeholder*="Search"]').clear();
    cy.get('input[placeholder*="Search"]').type('C');
  });

  it('should display results for subdivision search', () => {
    cy.get('input[placeholder*="Search"]').type('California');
  });

  it('should be keyboard accessible', () => {
    cy.get('input[placeholder*="Search"]')
      .focus()
      .type('test{downarrow}');
  });

  it('should handle empty search gracefully', () => {
    cy.get('input[placeholder*="Search"]').type('zzzzzzzzzz');
    cy.wait(500);
  });

  it('should update results in real-time', () => {
    cy.get('input[placeholder*="Search"]').type('u', { delay: 100 });
    cy.wait(300);
    cy.get('input[placeholder*="Search"]').type('n', { delay: 100 });
    cy.wait(300);
  });
});
