import { useQuery } from '@tanstack/react-query';
import {
  Lock,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { Card } from '../../../molecules/Card';
import { Spinner } from '../../../atoms/Spinner';
import { Badge } from '../../../atoms/Badge';
import { otpManagementService } from '../../../../services/api';
import type { OTPStatistics, BlockedUser } from '../../../../types/api.types';

/**
 * OTP Management Dashboard - Overview of OTP verification system
 */
export function OTPManagementDashboard() {
  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery<OTPStatistics>({
    queryKey: ['otp', 'statistics'],
    queryFn: () => otpManagementService.getStatistics(),
  });

  // Fetch blocked users
  const { data: blockedUsers, isLoading: blockedLoading } = useQuery<BlockedUser[]>({
    queryKey: ['otp', 'blocked-users'],
    queryFn: () => otpManagementService.getBlockedUsers(),
  });

  const isLoading = statsLoading || blockedLoading;

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

  // Get top purposes
  const topPurposes = Object.entries(stats.by_purpose || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get user types
  const userTypes = Object.entries(stats.by_user_type || {})
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OTP Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor and manage OTP verifications across the platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total OTPs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.total_otps.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {stats.verified_otps.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.verification_rate.toFixed(1)}% success rate
              </p>
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
                {stats.unverified_otps.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked Numbers</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {stats.blocked_numbers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Due to failed attempts</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Ban className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired OTPs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.expired_otps.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {stats.total_otps > 0
              ? ((stats.expired_otps / stats.total_otps) * 100).toFixed(1)
              : '0.0'}
            % of total OTPs
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Verification Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.avg_verification_time_seconds
                  ? `${stats.avg_verification_time_seconds.toFixed(1)}s`
                  : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Time from OTP generation to verification
          </p>
        </Card>
      </div>

      {/* OTP by Purpose & User Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OTP by Purpose */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Top OTP Purposes
          </h2>
          <div className="space-y-3">
            {topPurposes.length > 0 ? (
              topPurposes.map(([purpose, count]) => {
                const percentage =
                  stats.total_otps > 0 ? ((count / stats.total_otps) * 100).toFixed(1) : '0.0';

                return (
                  <div key={purpose} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="info" className="capitalize min-w-[100px] justify-center">
                        {purpose}
                      </Badge>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
              <p className="text-sm text-gray-500 dark:text-gray-500">No purpose data available</p>
            )}
          </div>
        </Card>

        {/* OTP by User Type */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            OTP by User Type
          </h2>
          <div className="space-y-3">
            {userTypes.length > 0 ? (
              userTypes.map(([userType, count]) => {
                const percentage =
                  stats.total_otps > 0 ? ((count / stats.total_otps) * 100).toFixed(1) : '0.0';

                return (
                  <div key={userType} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="default" className="capitalize min-w-[100px] justify-center">
                        {userType || 'Unknown'}
                      </Badge>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full"
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
              <p className="text-sm text-gray-500 dark:text-gray-500">No user type data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Blocked Users */}
      {blockedUsers && blockedUsers.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
            Recently Blocked Numbers ({blockedUsers.length})
          </h2>
          <div className="space-y-2">
            {blockedUsers.slice(0, 5).map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">
                      {user.country_code} {user.phone_number}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {user.attempts_count} attempts
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Until {new Date(user.blocked_until).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">View All OTPs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.total_otps.toLocaleString()} total verifications
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <Ban className="h-6 w-6 text-red-600 dark:text-red-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Manage Blocked</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.blocked_numbers} numbers blocked
            </p>
          </button>

          <button className="p-4 text-left border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Verification Stats</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.verification_rate.toFixed(1)}% success rate
            </p>
          </button>
        </div>
      </Card>
    </div>
  );
}
