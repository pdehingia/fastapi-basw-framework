/**
 * Cypress Custom Commands
 * Reusable commands for testing workflows
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login as admin user
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>;
      
      /**
       * Navigate to a specific admin section
       * @param section - Admin section to navigate to
       * @example cy.navigateToSection('users')
       */
      navigateToSection(section: string): Chainable<void>;
      
      /**
       * Fill and submit a form
       * @param formData - Object with field names and values
       * @example cy.fillForm({ name: 'John Doe', email: 'john@example.com' })
       */
      fillForm(formData: Record<string, string>): Chainable<void>;
      
      /**
       * Wait for table to load with data
       * @example cy.waitForTableData()
       */
      waitForTableData(): Chainable<void>;
      
      /**
       * Search in data table
       * @param searchTerm - Term to search for
       * @example cy.searchInTable('John Doe')
       */
      searchInTable(searchTerm: string): Chainable<void>;
      
      /**
       * Create a test campaign
       * @param campaignData - Campaign data
       * @example cy.createTestCampaign({ name: 'Test Campaign' })
       */
      createTestCampaign(campaignData?: Partial<{
        name: string;
        description: string;
        budget: string;
      }>): Chainable<void>;
      
      /**
       * Check toast message
       * @param message - Expected toast message
       * @param type - Toast type (success, error, etc.)
       * @example cy.checkToast('User created successfully', 'success')
       */
      checkToast(message: string, type?: 'success' | 'error' | 'info'): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/auth/login');
  cy.get('[data-testid="email-input"]').type('admin@maya.com');
  cy.get('[data-testid="password-input"]').type('password123');
  cy.get('[data-testid="login-button"]').click();
  cy.wait('@login');
  cy.url().should('not.include', '/auth/login');
});

// Navigation command
Cypress.Commands.add('navigateToSection', (section: string) => {
  const sectionMap: Record<string, string> = {
    'users': '[data-testid="nav-admin-users"]',
    'marketing': '[data-testid="nav-marketing"]',
    'support': '[data-testid="nav-support"]',
    'reviews': '[data-testid="nav-reviews"]',
    'payments': '[data-testid="nav-payments"]'
  };
  
  const selector = sectionMap[section];
  if (!selector) {
    throw new Error(`Unknown section: ${section}`);
  }
  
  cy.get(selector).click();
  cy.url().should('include', section);
});

// Form filling command
Cypress.Commands.add('fillForm', (formData: Record<string, string>) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[name="${field}"], [data-testid="${field}-input"]`)
      .clear()
      .type(value);
  });
});

// Wait for table data
Cypress.Commands.add('waitForTableData', () => {
  // Wait for loading to finish
  cy.get('[data-testid="loading"]').should('not.exist');
  
  // Ensure table has data
  cy.get('table tbody tr').should('have.length.greaterThan', 0);
  
  // Wait for any async operations to complete
  cy.wait(100);
});

// Search in table
Cypress.Commands.add('searchInTable', (searchTerm: string) => {
  cy.get('[data-testid="search-input"], [placeholder*="search" i]')
    .clear()
    .type(searchTerm);
  
  // Wait for search results
  cy.wait(500);
});

// Create test campaign
Cypress.Commands.add('createTestCampaign', (campaignData = {}) => {
  const defaultData = {
    name: 'Test Campaign',
    description: 'Test campaign description',
    budget: '1000'
  };
  
  const data = { ...defaultData, ...campaignData };
  
  cy.navigateToSection('marketing');
  cy.get('[data-testid="create-campaign-button"]').click();
  
  // Step 1: Basic Info
  cy.fillForm({
    name: data.name,
    description: data.description
  });
  cy.get('[data-testid="next-button"]').click();
  
  // Step 2: Targeting (use defaults)
  cy.get('[data-testid="next-button"]').click();
  
  // Step 3: Budget
  cy.get('[name="budget"]').clear().type(data.budget);
  cy.get('[name="start_date"]').type('2023-12-01T10:00');
  cy.get('[name="end_date"]').type('2023-12-31T10:00');
  cy.get('[data-testid="next-button"]').click();
  
  // Step 4: Submit
  cy.get('[data-testid="create-campaign-button"]').click();
  cy.checkToast('Campaign created successfully', 'success');
});

// Check toast message
Cypress.Commands.add('checkToast', (message: string, type = 'success') => {
  const toastSelector = type === 'success' 
    ? '[data-testid="toast-success"]' 
    : `[data-testid="toast-${type}"]`;
    
  cy.get(toastSelector)
    .should('be.visible')
    .and('contain.text', message);
  
  // Wait for toast to disappear
  cy.get(toastSelector).should('not.exist', { timeout: 5000 });
});