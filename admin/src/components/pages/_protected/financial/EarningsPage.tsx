import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  Search,
  Download,
  RefreshCw,
  BarChart3,
  Users,
} from 'lucide-react';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EnhancedDataTable } from '@/components/organisms';
import { financialService } from '@/services/api';
import type { TopEarner, MonthlyEarnings } from '@/types/api.types';
import type { TableColumn } from '@/types';

export function EarningsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'3' | '6' | '12'>('6');
  const [page, setPage] = useState(1);

  // Fetch top earners
  const {
    data: topEarnersData,
    isLoading: loadingTopEarners,
    refetch: refetchTopEarners,
  } = useQuery({
    queryKey: ['financial', 'top-earners', page],
    queryFn: async () => {
      const response = await financialService.getTopEarners({
        page,
        size: 20,
        start_date: new Date(Date.now() - parseInt(selectedPeriod) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      });
      return response.data;
    },
  });

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      const blob = await financialService.exportEarnings({
        format: 'csv',
        start_date: new Date(Date.now() - parseInt(selectedPeriod) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `earnings-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export earnings:', error);
    }
  };

  const topEarnersColumns: TableColumn<TopEarner>[] = [
    {
      key: 'rank',
      title: 'Rank',
      render: (earner) => (
        <div className="flex items-center gap-2">
          {earner.rank <= 3 ? (
            <Award className={`w-5 h-5 ${earner.rank === 1 ? 'text-yellow-500' : earner.rank === 2 ? 'text-gray-400' : 'text-orange-500'}`} />
          ) : (
            <span className="text-gray-600 dark:text-gray-400">#{earner.rank}</span>
          )}
        </div>
      ),
    },
    {
      key: 'provider_name',
      title: 'Provider',
      render: (earner) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{earner.provider_name}</div>
          {earner.business_name && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{earner.business_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'total_earnings',
      title: 'Total Earnings',
      render: (earner) => (
        <div className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(earner.total_earnings)}
        </div>
      ),
    },
    {
      key: 'booking_count',
      title: 'Bookings',
      render: (earner) => (
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <span>{earner.booking_count}</span>
        </div>
      ),
    },
    {
      key: 'average_rating',
      title: 'Rating',
      render: (earner) => (
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span>{earner.average_rating?.toFixed(1) || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (earner) => (
        <Button variant="ghost" size="sm" onClick={() => {}}>
          View Details
        </Button>
      ),
    },
  ];

  // Calculate total statistics
  const totalEarnings = topEarnersData?.items?.reduce((sum, e) => sum + e.total_earnings, 0) || 0;
  const totalBookings = topEarnersData?.items?.reduce((sum, e) => sum + e.booking_count, 0) || 0;
  const averageEarnings = topEarnersData?.items?.length ? totalEarnings / topEarnersData.items.length : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Provider Earnings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and analyze provider earnings and performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetchTopEarners()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="primary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {totalBookings.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Earnings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(averageEarnings)}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Providers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {topEarnersData?.metadata?.total_items?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Input
              placeholder="Search by provider name, business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value as '3' | '6' | '12')}>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
            <option value="12">Last 12 Months</option>
          </Select>
          <Select defaultValue="all">
            <option value="all">All Categories</option>
            <option value="beauty">Beauty & Wellness</option>
            <option value="fitness">Fitness</option>
            <option value="tutoring">Tutoring</option>
            <option value="events">Events</option>
          </Select>
        </div>
      </Card>

      {/* Top Earners Leaderboard */}
      <Card>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Earners Leaderboard
          </h2>
        </div>
        {loadingTopEarners ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <EnhancedDataTable
            data={topEarnersData?.items || []}
            columns={topEarnersColumns}
            pagination={{
              currentPage: topEarnersData?.metadata?.page || 1,
              totalPages: topEarnersData?.metadata?.total_pages || 1,
              pageSize: topEarnersData?.metadata?.page_size || 20,
              totalItems: topEarnersData?.metadata?.total_items || 0,
              onPageChange: setPage,
            }}
            isLoading={loadingTopEarners}
            emptyMessage="No earnings data found"
          />
        )}
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Top Performer of the Month
          </h3>
          {topEarnersData?.items?.[0] && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {topEarnersData.items[0].provider_name}
                  </div>
                  {topEarnersData.items[0].business_name && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {topEarnersData.items[0].business_name}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(topEarnersData.items[0].total_earnings)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bookings</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {topEarnersData.items[0].booking_count}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Earnings Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Top 10%</span>
              <Badge variant="success">High Performers</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Middle 60%</span>
              <Badge variant="info">Average Performers</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Bottom 30%</span>
              <Badge variant="warning">Needs Improvement</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
