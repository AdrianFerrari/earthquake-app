export {};

declare global {
  namespace Cypress {
    interface Chainable {
      interceptEarthquakes(fixture?: string): void;
      interceptMetrics(fixture?: string): void;
    }
  }
}

Cypress.Commands.add('interceptEarthquakes', (fixture = 'earthquakes') => {
  cy.intercept('GET', '**/earthquakes', { fixture }).as('getEarthquakes');
});

Cypress.Commands.add('interceptMetrics', (fixture = 'metrics') => {
  cy.intercept('GET', '**/earthquakes/metrics', { fixture }).as('getMetrics');
});
