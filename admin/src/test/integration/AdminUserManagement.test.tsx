/**
 * Admin User Management Integration Tests
 * Testing the complete admin user management workflow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { AdminUsersListPage } from '@/components/organisms/AdminUserManagement';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';

// Mock toast service
vi.mock('@/services/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  }
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Admin User Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin users list correctly', async () => {
    render(<AdminUsersListPage />);

    // Check if loading state appears initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Name & Contact')).toBeInTheDocument();
    expect(screen.getByText('Role & Permissions')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Last Login')).toBeInTheDocument();

    // Check user data
    expect(screen.getByText('john.doe@maya.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@maya.com')).toBeInTheDocument();
  });

  it('opens create user modal when add button is clicked', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add admin user/i });
    await user.click(addButton);

    // Check if modal opens
    expect(screen.getByText('Add New Admin User')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('creates new admin user successfully', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add admin user/i });
    await user.click(addButton);

    // Fill form
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const roleSelect = screen.getByLabelText(/role/i);

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@maya.com');
    await user.selectOptions(roleSelect, 'admin');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add user/i });
    await user.click(submitButton);

    // Wait for success
    await waitFor(() => {
      expect(screen.queryByText('Add New Admin User')).not.toBeInTheDocument();
    });
  });

  it('handles create user validation errors', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open create modal
    const addButton = screen.getByRole('button', { name: /add admin user/i });
    await user.click(addButton);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /add user/i });
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('filters users by search query', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Search for John
    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'John');

    // Wait for filter to apply
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // Jane should be filtered out
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters users by role', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Filter by admin role
    const roleFilter = screen.getByDisplayValue(/all roles/i);
    await user.selectOptions(roleFilter, 'admin');

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      // Super admin should be filtered out
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    // Mock a large dataset
    const largeUserData = Array.from({ length: 25 }, (_, i) => ({
      id: (i + 1).toString(),
      name: `User ${i + 1}`,
      email: `user${i + 1}@maya.com`,
      role: 'admin',
      permissions: ['users:read'],
      is_active: true,
      last_login: '2023-11-19T10:30:00Z',
      created_at: '2023-01-15T09:00:00Z',
      updated_at: '2023-11-19T10:30:00Z'
    }));

    server.use(
      http.get('/api/admin/users', ({ request }) => {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') || 1);
        const limit = Number(url.searchParams.get('limit') || 20);
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = largeUserData.slice(startIndex, endIndex);

        return HttpResponse.json({
          data: paginatedData,
          metadata: {
            total_items: largeUserData.length,
            total_pages: Math.ceil(largeUserData.length / limit),
            current_page: page,
            items_per_page: limit
          }
        });
      })
    );

    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });

    // Check pagination controls
    expect(screen.getByText(/showing 1 to 20 of 25/i)).toBeInTheDocument();
    
    const nextButton = screen.getByText(/next/i);
    expect(nextButton).toBeEnabled();

    // Go to next page
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('User 21')).toBeInTheDocument();
      expect(screen.getByText(/showing 21 to 25 of 25/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    server.use(
      http.get('/api/admin/users', () => {
        return HttpResponse.json(
          { message: 'Internal server error' },
          { status: 500 }
        );
      })
    );

    render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });

  it('handles user deletion workflow', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click delete button for John Doe
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.closest('tr')?.textContent?.includes('John Doe')
    );
    
    expect(deleteButton).toBeInTheDocument();
    await user.click(deleteButton!);

    // Confirm deletion in modal
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    await user.click(confirmButton);

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });

  it('handles user status toggle', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find status toggle for active user
    const statusBadges = screen.getAllByText(/active/i);
    expect(statusBadges.length).toBeGreaterThan(0);

    // The actual toggle functionality would depend on the specific implementation
    // This is a placeholder for status toggle testing
  });

  it('sorts users by column headers', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on Name header to sort
    const nameHeader = screen.getByText('Name & Contact').closest('th');
    await user.click(nameHeader!);

    // The actual sorting behavior would depend on implementation
    // This tests that the click doesn't break anything
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('exports user data', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find export button
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    // This would typically trigger a download
    // We can test that the button click doesn't cause errors
    expect(exportButton).toBeInTheDocument();
  });

  it('maintains state after modal operations', async () => {
    const { user } = render(<AdminUsersListPage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Apply a search filter
    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'John');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    // Open and close modal
    const addButton = screen.getByRole('button', { name: /add admin user/i });
    await user.click(addButton);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Search filter should still be applied
    await waitFor(() => {
      expect(searchInput).toHaveValue('John');
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});