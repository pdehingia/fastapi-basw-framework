/**
 * DataTable Component Tests
 * Unit tests for the DataTable organism component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { DataTable } from '@/components/organisms/DataTable';

// Mock data for testing
const mockData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
];

const mockColumns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (_: any, item: any) => <span>{item.name}</span>
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    render: (_: any, item: any) => <span>{item.email}</span>
  },
  {
    key: 'role',
    header: 'Role',
    render: (_: any, item: any) => <span>{item.role}</span>
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (_: any, item: any) => (
      <button data-testid={`edit-${item.id}`}>Edit</button>
    )
  }
];

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 3,
  pageSize: 10,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('DataTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with data correctly', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={defaultPagination}
      />
    );

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check data
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders loading state correctly', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        loading={true}
        pagination={defaultPagination}
      />
    );

    const loadingText = screen.getByText(/loading/i);
    expect(loadingText).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        pagination={defaultPagination}
      />
    );

    const emptyMessage = screen.getByText(/no data available/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it('handles sorting when sortable column is clicked', async () => {
    const mockSorting = {
      sortBy: 'name',
      sortOrder: 'asc' as const,
      onSort: vi.fn(),
    };

    const { user } = render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={defaultPagination}
        sorting={mockSorting}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    await user.click(nameHeader!);

    expect(mockSorting.onSort).toHaveBeenCalledWith('name');
  });

  it('displays sort indicators correctly', () => {
    const mockSorting = {
      sortBy: 'name',
      sortOrder: 'desc' as const,
      onSort: vi.fn(),
    };

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={defaultPagination}
        sorting={mockSorting}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toHaveTextContent('Name');
    
    // Check for sort indicator (arrow down for desc)
    const sortIcon = nameHeader?.querySelector('svg');
    expect(sortIcon).toBeInTheDocument();
  });

  it('renders pagination correctly', () => {
    const paginationProps = {
      currentPage: 2,
      totalPages: 5,
      totalItems: 50,
      pageSize: 10,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    };

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={paginationProps}
      />
    );

    // Check pagination info
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Check pagination controls
    const prevButton = screen.getByText(/previous/i);
    const nextButton = screen.getByText(/next/i);
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('handles page changes correctly', async () => {
    const paginationProps = {
      currentPage: 1,
      totalPages: 3,
      totalItems: 30,
      pageSize: 10,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    };

    const { user } = render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={paginationProps}
      />
    );

    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    expect(paginationProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('handles page size changes correctly', async () => {
    const paginationProps = {
      currentPage: 1,
      totalPages: 2,
      totalItems: 20,
      pageSize: 10,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    };

    const { user } = render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={paginationProps}
      />
    );

    const pageSizeSelect = screen.getByDisplayValue('10');
    await user.selectOptions(pageSizeSelect, '20');

    expect(paginationProps.onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('renders custom cell content correctly', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={defaultPagination}
      />
    );

    // Check custom action buttons
    expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    expect(screen.getByTestId('edit-2')).toBeInTheDocument();
    expect(screen.getByTestId('edit-3')).toBeInTheDocument();
  });

  it('applies hover effects on rows', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={defaultPagination}
      />
    );

    const firstRow = screen.getByText('John Doe').closest('tr');
    expect(firstRow).toHaveClass('hover:bg-gray-50');
  });

  it('handles empty columns array gracefully', () => {
    render(
      <DataTable
        data={mockData}
        columns={[]}
        pagination={defaultPagination}
      />
    );

    // Should still render table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('disables pagination buttons appropriately', () => {
    const paginationProps = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 3,
      pageSize: 10,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    };

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={paginationProps}
      />
    );

    const prevButton = screen.getByText(/previous/i);
    const nextButton = screen.getByText(/next/i);
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('shows correct row numbers', () => {
    const paginationProps = {
      currentPage: 2,
      totalPages: 3,
      totalItems: 25,
      pageSize: 10,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    };

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={paginationProps}
      />
    );

    // Should show "Showing 11 to 13 of 25"
    const paginationText = screen.getByText(/showing/i);
    expect(paginationText).toHaveTextContent('11');
    expect(paginationText).toHaveTextContent('13');
    expect(paginationText).toHaveTextContent('25');
  });

  it('handles missing render function gracefully', () => {
    const columnsWithoutRender = [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' }
    ];

    render(
      <DataTable
        data={mockData}
        columns={columnsWithoutRender}
        pagination={defaultPagination}
      />
    );

    // Should render basic cell content
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('maintains accessibility attributes', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        pagination={defaultPagination}
      />
    );

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(4);

    const rows = screen.getAllByRole('row');
    // Header row + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it('handles large datasets efficiently', async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: i.toString(),
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: 'User'
    }));

    render(
      <DataTable
        data={largeData.slice(0, 10)} // Only show first 10
        columns={mockColumns}
        pagination={{
          ...defaultPagination,
          totalItems: 1000,
          totalPages: 100
        }}
      />
    );

    // Should render only the visible rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(11); // Header + 10 data rows
  });
});