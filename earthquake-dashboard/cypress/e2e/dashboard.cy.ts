describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.interceptEarthquakes();
    cy.visit('/dashboard');
    cy.wait('@getEarthquakes');
  });

  it('should display the page title', () => {
    cy.contains('h1', 'Earthquake Dashboard').should('be.visible');
  });

  it('should display the earthquake list after loading', () => {
    cy.get('app-earthquake-card').should('have.length', 3);
  });

  it('should display earthquake magnitudes', () => {
    cy.get('.magnitude').first().should('contain.text', '4.5');
  });

  it('should display earthquake locations', () => {
    cy.get('.place').first().should('contain.text', '10km N of Test City, CA');
  });

  it('should display alert badge for yellow alert earthquakes', () => {
    cy.get('.alert-badge').should('contain.text', 'YELLOW');
  });

  it('should show result count', () => {
    cy.contains('Showing 3 events').should('be.visible');
  });

  it('should redirect from root to /dashboard', () => {
    cy.visit('/');
    cy.url().should('include', '/dashboard');
  });

  describe('Filter form', () => {
    it('should be visible on the dashboard', () => {
      cy.get('app-filter-form').should('be.visible');
    });

    it('should reload earthquakes when Apply Filters is clicked', () => {
      cy.intercept('GET', '**/earthquakes*', { fixture: 'earthquakes' }).as('getEarthquakesFiltered');
      cy.get('#minmag').clear().type('5');
      cy.get('button[type="submit"]').click();
      cy.wait('@getEarthquakesFiltered').its('request.url').should('include', 'minmagnitude=5');
    });

    it('should reset filters when Reset is clicked', () => {
      cy.intercept('GET', '**/earthquakes*', { fixture: 'earthquakes' }).as('getEarthquakesReset');
      cy.get('#minmag').clear().type('5');
      cy.get('button[type="button"]').contains('Reset').click();
      cy.wait('@getEarthquakesReset');
      cy.get('#minmag').should('have.value', '');
    });
  });

  describe('Navigation', () => {
    it('should have navigation links visible', () => {
      cy.get('nav').should('be.visible');
      cy.get('a[routerLink="/dashboard"]').should('exist');
      cy.get('a[routerLink="/metrics"]').should('exist');
    });

    it('should navigate to metrics page', () => {
      cy.interceptMetrics();
      cy.get('a[routerLink="/metrics"]').click();
      cy.url().should('include', '/metrics');
      cy.wait('@getMetrics');
    });
  });
});
