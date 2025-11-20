import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  CheckCircle,
  XCircle,
  Star,
  Users,
  MapPinned,
  Building2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Spinner } from '../../../atoms/Spinner';
import { addressesService } from '../../../../services/api';
import type { AddressStatistics } from '../../../../types/api.types';

/**
 * Addresses Dashboard - Statistics overview for address management
 */
export function AddressesDashboard() {
  // Fetch address statistics
  const { data: stats, isLoading } = useQuery<AddressStatistics>({
    queryKey: ['addresses', 'statistics'],
    queryFn: () => addressesService.getStatistics(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No statistics available</p>
        </div>
      </div>
    );
  }

  // Calculate verification rate
  const verificationRate =
    stats.total_addresses > 0
      ? ((stats.verified_addresses / stats.total_addresses) * 100).toFixed(1)
      : '0.0';

  // Calculate default address percentage
  const defaultRate =
    stats.total_addresses > 0
      ? ((stats.default_addresses / stats.total_addresses) * 100).toFixed(1)
      : '0.0';

  // Get top states by address count
  const topStates = Object.entries(stats.addresses_by_state || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get top cities by address count
  const topCities = Object.entries(stats.addresses_by_city || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Address Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage and verify addresses across all user types
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Addresses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.total_addresses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.verified_addresses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{verificationRate}% of total</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unverified</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {stats.unverified_addresses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Pending verification</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Default Addresses</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {stats.default_addresses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{defaultRate}% of total</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Addresses by Owner Type */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          Addresses by Owner Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.addresses_by_owner_type || {}).map(([ownerType, count]) => {
            const getOwnerIcon = () => {
              switch (ownerType) {
                case 'provider':
                  return <Building2 className="h-5 w-5" />;
                case 'customer':
                  return <Users className="h-5 w-5" />;
                case 'admin':
                  return <MapPinned className="h-5 w-5" />;
                default:
                  return <MapPin className="h-5 w-5" />;
              }
            };

            const getOwnerColor = () => {
              switch (ownerType) {
                case 'provider':
                  return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
                case 'customer':
                  return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
                case 'admin':
                  return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
                default:
                  return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
              }
            };

            return (
              <div
                key={ownerType}
                className={`p-4 rounded-lg border ${getOwnerColor()}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getOwnerIcon()}
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {ownerType}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {count.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top States */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Top States
          </h2>
          <div className="space-y-3">
            {topStates.length > 0 ? (
              topStates.map(([state, count], index) => {
                const percentage =
                  stats.total_addresses > 0
                    ? ((count / stats.total_addresses) * 100).toFixed(1)
                    : '0.0';

                return (
                  <div key={state} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{state}</p>
                        <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">No state data available</p>
            )}
          </div>
        </Card>

        {/* Top Cities */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Top Cities
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {topCities.length > 0 ? (
              topCities.map(([city, count]) => (
                <div
                  key={city}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                    {city}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {count.toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500 col-span-2">
                No city data available
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
            <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">View All Addresses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Browse and manage all addresses
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors">
            <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Verify Addresses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.unverified_addresses} addresses pending
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
            <MapPinned className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Bulk Import</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Import multiple addresses at once
            </p>
          </button>
        </div>
      </Card>
    </div>
  );
}
