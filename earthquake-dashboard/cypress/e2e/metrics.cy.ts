describe('Metrics Page', () => {
  beforeEach(() => {
    cy.interceptMetrics();
    cy.visit('/metrics');
    cy.wait('@getMetrics');
  });

  it('should display the page title', () => {
    cy.contains('h1', 'Earthquake Metrics').should('be.visible');
  });

  it('should display total events stat card', () => {
    cy.contains('.stat-value', '150').should('be.visible');
    cy.contains('.stat-label', 'Total Events').should('be.visible');
  });

  it('should display average magnitude', () => {
    cy.contains('.stat-value', '3.42').should('be.visible');
  });

  it('should display max magnitude in red', () => {
    cy.contains('.stat-value', '6.2').should('be.visible');
  });

  it('should render the by-magnitude-range chart', () => {
    cy.contains('h3', 'By Magnitude Range').should('be.visible');
    cy.contains('.bar-label', 'minor (2.0-3.9)').should('be.visible');
  });

  it('should render the by-alert-level chart', () => {
    cy.contains('h3', 'By Alert Level').should('be.visible');
  });

  it('should reload metrics when filters change', () => {
    cy.intercept('GET', '**/metrics*', { fixture: 'metrics' }).as('getMetricsFiltered');
    cy.get('#minmag').clear().type('4');
    cy.get('button[type="submit"]').click();
    cy.wait('@getMetricsFiltered').its('request.url').should('include', 'minmagnitude=4');
  });
});
