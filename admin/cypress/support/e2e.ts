/**
 * Cypress E2E Support
 * Global commands and setup for end-to-end testing
 */

import '@cypress/code-coverage/support';
import './commands';

// Global test setup
beforeEach(() => {
  // Clear local storage before each test
  cy.clearLocalStorage();
  
  // Set viewport size
  cy.viewport(1280, 720);
  
  // Intercept common API calls
  cy.intercept('GET', '/api/auth/me', { fixture: 'user.json' }).as('getUser');
  cy.intercept('POST', '/api/auth/login', { fixture: 'auth.json' }).as('login');
  cy.intercept('GET', '/api/admin/users*', { fixture: 'users.json' }).as('getUsers');
  cy.intercept('GET', '/api/marketing/campaigns*', { fixture: 'campaigns.json' }).as('getCampaigns');
  cy.intercept('GET', '/api/marketing/analytics*', { fixture: 'analytics.json' }).as('getAnalytics');
});

// Global error handling
Cypress.on('uncaught:exception', (err) => {
  // Prevent Cypress from failing on application errors
  // that don't affect the test
  console.error('Uncaught exception:', err);
  return false;
});

// Configure Cypress to handle promises
Cypress.Promise = global.Promise;