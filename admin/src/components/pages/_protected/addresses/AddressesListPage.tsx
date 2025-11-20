import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Star,
  Building2,
  User,
  Shield,
  Eye,
  Trash2,
  MapPinned,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Spinner } from '../../../atoms/Spinner';
import { EnhancedDataTable } from '../../../organisms';
import { addressesService } from '../../../../services/api';
import type { Address, AddressFilters, AddressListResponse } from '../../../../types/api.types';

/**
 * Addresses List Page - Manage all addresses with filtering and actions
 */
export function AddressesListPage() {
  const queryClient = useQueryClient();

  // State
  const [filters, setFilters] = useState<AddressFilters>({});
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Query for addresses list
  const { data, isLoading } = useQuery<AddressListResponse>({
    queryKey: ['addresses', 'list', filters, page],
    queryFn: () =>
      addressesService.getAddresses(filters, {
        page,
        page_size: 20,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (addressId: string) => addressesService.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  // Verify mutation (mock - would need actual coordinates)
  const verifyMutation = useMutation({
    mutationFn: (addressId: string) =>
      addressesService.verifyAddress(addressId, {
        latitude: 0,
        longitude: 0,
        verification_notes: 'Verified by admin',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  // Handle search
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchQuery || undefined }));
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AddressFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  };

  // Define table columns
  const columns = [
    {
      key: 'owner' as keyof Address,
      label: 'Owner',
      sortable: true,
      render: (address: Address) => (
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              address.owner_type === 'provider'
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : address.owner_type === 'customer'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-purple-100 dark:bg-purple-900/30'
            }`}
          >
            {address.owner_type === 'provider' ? (
              <Building2
                className={`h-4 w-4 ${
                  address.owner_type === 'provider'
                    ? 'text-blue-600 dark:text-blue-400'
                    : ''
                }`}
              />
            ) : address.owner_type === 'customer' ? (
              <User
                className={`h-4 w-4 ${
                  address.owner_type === 'customer'
                    ? 'text-green-600 dark:text-green-400'
                    : ''
                }`}
              />
            ) : (
              <Shield
                className={`h-4 w-4 ${
                  address.owner_type === 'admin'
                    ? 'text-purple-600 dark:text-purple-400'
                    : ''
                }`}
              />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {address.owner_name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{address.owner_email}</p>
            <Badge
              variant={
                address.owner_type === 'provider'
                  ? 'info'
                  : address.owner_type === 'customer'
                    ? 'success'
                    : 'default'
              }
              className="mt-1"
            >
              {address.owner_type}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'address' as keyof Address,
      label: 'Address',
      sortable: false,
      render: (address: Address) => (
        <div className="max-w-xs">
          {address.label && (
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {address.label}
            </p>
          )}
          <p className="text-sm text-gray-900 dark:text-white">{address.address_line1}</p>
          {address.address_line2 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{address.address_line2}</p>
          )}
          {address.contact_name && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Contact: {address.contact_name}
              {address.contact_phone && ` • ${address.contact_phone}`}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'city' as keyof Address,
      label: 'City',
      sortable: true,
      render: (address: Address) => (
        <span className="text-sm text-gray-900 dark:text-white">{address.city}</span>
      ),
    },
    {
      key: 'state' as keyof Address,
      label: 'State',
      sortable: true,
      render: (address: Address) => (
        <span className="text-sm text-gray-900 dark:text-white">{address.state}</span>
      ),
    },
    {
      key: 'pincode' as keyof Address,
      label: 'Pincode',
      sortable: false,
      render: (address: Address) => (
        <span className="text-sm font-mono text-gray-900 dark:text-white">{address.pincode}</span>
      ),
    },
    {
      key: 'coordinates' as keyof Address,
      label: 'Coordinates',
      sortable: false,
      render: (address: Address) => (
        <div className="text-xs">
          {address.latitude && address.longitude ? (
            <>
              <p className="text-gray-900 dark:text-white font-mono">
                {address.latitude.toFixed(4)}
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-mono">
                {address.longitude.toFixed(4)}
              </p>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">No coordinates</span>
          )}
        </div>
      ),
    },
    {
      key: 'status' as keyof Address,
      label: 'Status',
      sortable: true,
      render: (address: Address) => (
        <div className="flex flex-col gap-2">
          <Badge variant={address.is_verified ? 'success' : 'warning'}>
            {address.is_verified ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Unverified
              </>
            )}
          </Badge>
          {address.is_default && (
            <Badge variant="default">
              <Star className="h-3 w-3 mr-1" />
              Default
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions' as keyof Address,
      label: 'Actions',
      sortable: false,
      render: (address: Address) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          {!address.is_verified && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => verifyMutation.mutate(address.id)}
              disabled={verifyMutation.isPending}
              title="Verify Address"
            >
              <MapPinned className="h-4 w-4 text-green-600 dark:text-green-400" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm('Are you sure you want to delete this address?')) {
                deleteMutation.mutate(address.id);
              }
            }}
            disabled={deleteMutation.isPending}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  // Summary stats
  const totalAddresses = data?.total || 0;
  const verifiedCount =
    data?.addresses.filter((a) => a.is_verified).length || 0;
  const unverifiedCount =
    data?.addresses.filter((a) => !a.is_verified).length || 0;
  const defaultCount =
    data?.addresses.filter((a) => a.is_default).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Addresses</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage all addresses across the platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Addresses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalAddresses.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {verifiedCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unverified</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {unverifiedCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Star className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Default</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {defaultCount}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Addresses
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by address, city, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Owner Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Owner Type
            </label>
            <Select
              value={filters.owner_type || ''}
              onChange={(e) => handleFilterChange('owner_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="provider">Provider</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification
            </label>
            <Select
              value={
                filters.is_verified === undefined
                  ? ''
                  : filters.is_verified
                    ? 'true'
                    : 'false'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_verified',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <Input
              type="text"
              placeholder="Filter by city"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <Input
              type="text"
              placeholder="Filter by state"
              value={filters.state || ''}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pincode
            </label>
            <Input
              type="text"
              placeholder="Filter by pincode"
              value={filters.pincode || ''}
              onChange={(e) => handleFilterChange('pincode', e.target.value)}
            />
          </div>

          {/* Default Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default
            </label>
            <Select
              value={
                filters.is_default === undefined
                  ? ''
                  : filters.is_default
                    ? 'true'
                    : 'false'
              }
              onChange={(e) =>
                handleFilterChange(
                  'is_default',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
            >
              <option value="">All</option>
              <option value="true">Default Only</option>
              <option value="false">Non-Default</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Addresses Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : !data || data.addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No addresses found matching your filters
            </p>
          </div>
        ) : (
          <EnhancedDataTable
            data={data.addresses}
            columns={columns}
            pagination={{
              currentPage: page,
              totalPages: data.total_pages,
              pageSize: 20,
              totalItems: data.total,
              onPageChange: setPage,
            }}
          />
        )}
      </Card>
    </div>
  );
}
