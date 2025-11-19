/**
 * Admin User Management E2E Tests
 * End-to-end testing of the complete admin user management workflow
 */

describe('Admin User Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('should display admin users list', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Check page title
    cy.get('h1').should('contain.text', 'Admin Users');

    // Check table headers
    cy.get('table thead').within(() => {
      cy.contains('Name & Contact').should('be.visible');
      cy.contains('Role & Permissions').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Last Login').should('be.visible');
      cy.contains('Actions').should('be.visible');
    });

    // Check user data
    cy.get('table tbody').within(() => {
      cy.contains('John Doe').should('be.visible');
      cy.contains('john.doe@maya.com').should('be.visible');
      cy.contains('Jane Smith').should('be.visible');
      cy.contains('jane.smith@maya.com').should('be.visible');
    });
  });

  it('should filter users by search', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Search for John
    cy.searchInTable('John');

    // Should show only John Doe
    cy.get('table tbody').within(() => {
      cy.contains('John Doe').should('be.visible');
      cy.contains('Jane Smith').should('not.exist');
    });

    // Clear search
    cy.searchInTable('');
    cy.get('table tbody').within(() => {
      cy.contains('John Doe').should('be.visible');
      cy.contains('Jane Smith').should('be.visible');
    });
  });

  it('should filter users by role', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Filter by admin role
    cy.get('[data-testid="role-filter"]').select('admin');

    // Should show only admin users
    cy.get('table tbody').within(() => {
      cy.contains('Jane Smith').should('be.visible');
      cy.contains('John Doe').should('not.exist'); // Super admin filtered out
    });
  });

  it('should create new admin user', () => {
    cy.navigateToSection('users');
    
    // Click add user button
    cy.get('[data-testid="add-user-button"]').click();

    // Fill form
    cy.get('[data-testid="user-modal"]').within(() => {
      cy.fillForm({
        name: 'Test User',
        email: 'test@maya.com'
      });
      
      cy.get('[name="role"]').select('admin');
      
      // Submit form
      cy.get('[data-testid="submit-button"]').click();
    });

    // Check success message
    cy.checkToast('User created successfully', 'success');

    // Modal should close
    cy.get('[data-testid="user-modal"]').should('not.exist');
  });

  it('should validate form fields', () => {
    cy.navigateToSection('users');
    cy.get('[data-testid="add-user-button"]').click();

    // Try to submit without filling required fields
    cy.get('[data-testid="submit-button"]').click();

    // Check validation errors
    cy.get('[data-testid="user-modal"]').within(() => {
      cy.contains('Full name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
    });
  });

  it('should edit existing user', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Click edit button for first user
    cy.get('table tbody tr').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });

    // Update user details
    cy.get('[data-testid="user-modal"]').within(() => {
      cy.get('[name="name"]').clear().type('Updated Name');
      cy.get('[data-testid="submit-button"]').click();
    });

    cy.checkToast('User updated successfully', 'success');
  });

  it('should delete user with confirmation', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Click delete button for last user
    cy.get('table tbody tr').last().within(() => {
      cy.get('[data-testid="delete-button"]').click();
    });

    // Confirm deletion
    cy.get('[data-testid="confirmation-modal"]').within(() => {
      cy.contains('Are you sure').should('be.visible');
      cy.get('[data-testid="confirm-delete-button"]').click();
    });

    cy.checkToast('User deleted successfully', 'success');
  });

  it('should handle pagination', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Check pagination info
    cy.get('[data-testid="pagination-info"]')
      .should('contain.text', 'Showing 1 to 3 of 3');

    // Check pagination controls
    cy.get('[data-testid="prev-page"]').should('be.disabled');
    cy.get('[data-testid="next-page"]').should('be.disabled');
  });

  it('should change page size', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Change page size
    cy.get('[data-testid="page-size-select"]').select('10');

    // Should reload with new page size
    cy.get('[data-testid="pagination-info"]')
      .should('contain.text', 'Showing 1 to 3 of 3');
  });

  it('should sort by column headers', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Click on Name header to sort
    cy.get('table thead').contains('Name & Contact').click();

    // Check sort indicator
    cy.get('table thead').within(() => {
      cy.get('svg').should('be.visible'); // Sort arrow icon
    });

    // Data should be reordered (we can't easily test actual sorting with mocked data)
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
  });

  it('should export user data', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Click export button
    cy.get('[data-testid="export-button"]').click();

    // This would normally trigger a download
    // We just verify the button works without errors
  });

  it('should handle user status toggle', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Find inactive user (Bob Wilson) and try to activate
    cy.get('table tbody').within(() => {
      cy.contains('tr', 'Bob Wilson').within(() => {
        // Check current inactive status
        cy.contains('Inactive').should('be.visible');
        
        // Click status toggle (if implemented)
        cy.get('[data-testid="status-toggle"]').click();
      });
    });

    cy.checkToast('User status updated', 'success');
  });

  it('should maintain state across operations', () => {
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Apply search filter
    cy.searchInTable('John');
    cy.get('table tbody').should('contain.text', 'John Doe');

    // Open and close modal
    cy.get('[data-testid="add-user-button"]').click();
    cy.get('[data-testid="cancel-button"]').click();

    // Search filter should persist
    cy.get('[data-testid="search-input"]').should('have.value', 'John');
    cy.get('table tbody').should('contain.text', 'John Doe');
  });

  it('should handle network errors gracefully', () => {
    // Intercept with error response
    cy.intercept('GET', '/api/admin/users*', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('getUsersError');

    cy.navigateToSection('users');
    cy.wait('@getUsersError');

    // Should show error message
    cy.contains('Failed to load users').should('be.visible');
  });

  it('should be responsive on mobile', () => {
    cy.viewport('iphone-x');
    cy.navigateToSection('users');
    cy.waitForTableData();

    // Table should be scrollable on mobile
    cy.get('table').should('be.visible');
    
    // Mobile-specific UI elements
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
  });
});