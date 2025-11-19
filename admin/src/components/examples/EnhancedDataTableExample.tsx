/**
 * Enhanced DataTable Example
 * Demonstrates advanced table features
 */

import React, { useState, useMemo } from 'react';
import { Eye, Edit3, Trash2, Archive, Download } from 'lucide-react';
import EnhancedDataTable from '../organisms/EnhancedDataTable/EnhancedDataTable';
import Button from '../atoms/Button/Button';
import { TableColumn, BulkOperation } from '@/utils/datatable';

// Sample data interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  department: string;
  salary: number;
  age: number;
}

// Generate sample data
const generateSampleData = (count: number): User[] => {
  const roles = ['Admin', 'Manager', 'Developer', 'Designer', 'Analyst'];
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR'];
  const statuses: User['status'][] = ['active', 'inactive', 'pending'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `user-${index + 1}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    age: Math.floor(Math.random() * 40) + 22,
  }));
};

const EnhancedDataTableExample: React.FC = () => {
  // Sample data
  const data = useMemo(() => generateSampleData(1000), []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: 'id',
      header: 'ID',
      width: 100,
      sortable: true,
      filterType: 'text',
    },
    {
      key: 'name',
      header: 'Name',
      width: 200,
      sortable: true,
      filterType: 'text',
      render: (value: string, row: User) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
            {value.charAt(0)}
          </div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      width: 250,
      sortable: true,
      filterType: 'text',
    },
    {
      key: 'role',
      header: 'Role',
      width: 120,
      sortable: true,
      filterType: 'select',
      options: [
        { value: 'Admin', label: 'Administrator' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Developer', label: 'Developer' },
        { value: 'Designer', label: 'Designer' },
        { value: 'Analyst', label: 'Analyst' },
      ],
    },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      sortable: true,
      filterType: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
      render: (value: User['status']) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : value === 'inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      width: 150,
      sortable: true,
      filterType: 'select',
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Design', label: 'Design' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Sales' },
        { value: 'HR', label: 'Human Resources' },
      ],
    },
    {
      key: 'salary',
      header: 'Salary',
      width: 120,
      sortable: true,
      filterType: 'number',
      render: (value: number) => (
        <span className="font-mono">
          ${value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'age',
      header: 'Age',
      width: 80,
      sortable: true,
      filterType: 'number',
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      width: 150,
      sortable: true,
      filterType: 'date',
      render: (value: string) => (
        <span className="text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      width: 150,
      sortable: true,
      filterType: 'date',
      render: (value: string) => (
        <span className="text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 120,
      sortable: false,
      render: (_, row: User) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View user:', row.id);
            }}
            ariaLabel="View user"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit user:', row.id);
            }}
            ariaLabel="Edit user"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete user:', row.id);
            }}
            ariaLabel="Delete user"
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Define bulk operations
  const bulkOperations: BulkOperation[] = [
    {
      id: 'delete',
      label: 'Delete Selected',
      requiresConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete the selected users? This action cannot be undone.',
    },
    {
      id: 'export',
      label: 'Export Selected',
      requiresConfirmation: false,
    },
    {
      id: 'activate',
      label: 'Activate',
      requiresConfirmation: false,
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      requiresConfirmation: true,
      confirmationMessage: 'Deactivating users will prevent them from accessing the system.',
    },
    {
      id: 'archive',
      label: 'Archive',
      requiresConfirmation: true,
      confirmationMessage: 'Archived users will be hidden from normal views.',
    },
  ];

  // Handle bulk operations
  const handleBulkOperation = async (operation: BulkOperation, ids: string[]): Promise<void> => {
    console.log(`Executing ${operation.label} on:`, ids);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (operation.id) {
      case 'delete':
        console.log('Users deleted:', ids);
        break;
      case 'export':
        console.log('Users exported:', ids);
        break;
      case 'activate':
        console.log('Users activated:', ids);
        break;
      case 'deactivate':
        console.log('Users deactivated:', ids);
        break;
      case 'archive':
        console.log('Users archived:', ids);
        break;
      default:
        console.log('Unknown operation:', operation.id);
    }
  };

  // Handle row click
  const handleRowClick = (row: User, index: number) => {
    console.log('Row clicked:', row, 'at index:', index);
  };

  // Handle selection change
  const handleSelectionChange = (newSelectedIds: string[]) => {
    setSelectedIds(newSelectedIds);
    console.log('Selection changed:', newSelectedIds);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Enhanced DataTable Example</h2>
          <p className="mt-2 text-gray-600">
            Demonstrates advanced table features including virtualization, filtering, column customization, 
            bulk operations, and export functionality.
          </p>
        </div>

        <div className="p-6">
          <EnhancedDataTable
            data={data}
            columns={columns}
            height={500}
            rowHeight={56}
            enableVirtualization={true}
            enableSelection={true}
            enableSorting={true}
            enableFiltering={true}
            enableColumnCustomization={true}
            enableBulkOperations={true}
            enableExport={true}
            bulkOperations={bulkOperations}
            onBulkOperation={handleBulkOperation}
            onRowClick={handleRowClick}
            onSelectionChange={handleSelectionChange}
            tableId="users-table"
            className="border rounded-lg"
          />
        </div>
      </div>

      {/* Selection Info */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Current Selection</h3>
          <p className="text-blue-700">
            {selectedIds.length} user{selectedIds.length !== 1 ? 's' : ''} selected
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedIds.slice(0, 10).map(id => (
              <span 
                key={id}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {id}
              </span>
            ))}
            {selectedIds.length > 10 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                +{selectedIds.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Feature Overview */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Demonstrated</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Data Management</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Virtualized rendering for 1,000+ rows</li>
              <li>• Advanced filtering with multiple operators</li>
              <li>• Quick search across all columns</li>
              <li>• Column sorting (ascending/descending)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">User Interface</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Drag-and-drop column reordering</li>
              <li>• Column visibility toggles</li>
              <li>• Column width adjustment</li>
              <li>• Column pinning for important data</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Bulk Operations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Multi-row selection with checkboxes</li>
              <li>• Bulk operations toolbar</li>
              <li>• Confirmation dialogs for destructive actions</li>
              <li>• Progress tracking for long operations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Export & Persistence</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Export to CSV, Excel, and JSON</li>
              <li>• Column configuration persistence</li>
              <li>• Filter state management</li>
              <li>• Customizable export options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDataTableExample;