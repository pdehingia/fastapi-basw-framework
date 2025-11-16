/**
 * Booking List Page Route
 * Booking management with filters and actions
 * Enhanced with search params and loading states
 */

/**
 * Booking List Page Route
 * Booking management with filters and actions using TanStack Query
 * Enhanced with search params and loading states
 */

import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/templates';
import { Spinner } from '@/components/atoms';
import { useBookings, useUpdateBooking, useCancelBooking, useExportBookings } from '@/hooks/api/useBookings';
import { z } from 'zod';
import { ROUTES } from '@/config/routes';

// Search parameters schema - all optional
const bookingsSearchSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).optional();

function BookingListWithLayout() {
  const search = Route.useSearch();
  // TODO: Implement bulk selection functionality
  // const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  const { 
    data: bookings, 
    isLoading, 
    error,
    refetch 
  } = useBookings({
    page: search?.page || 1,
    limit: search?.limit || 10,
    search: search?.search,
    status: search?.status,
    dateFrom: search?.dateFrom,
    dateTo: search?.dateTo,
  });

  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();
  const exportMutation = useExportBookings();

  const handleExport = () => {
    exportMutation.mutate({
      status: search?.status,
      dateFrom: search?.dateFrom,
      dateTo: search?.dateTo,
      search: search?.search,
    });
  };

  const handleStatusChange = (bookingId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    if (status === 'cancelled') {
      if (window.confirm('Are you sure you want to cancel this booking?')) {
        cancelBookingMutation.mutate({ id: bookingId, reason: 'Admin cancellation' });
      }
    } else {
      // TODO: Update booking mutation should support status updates
      // updateBookingMutation.mutate({ id: bookingId, data: { status } });
      console.warn('Status update not implemented for:', status);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        navigationProps={{
          title: 'Booking Management',
          breadcrumbs: [
            { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
            { id: 'bookings', label: 'Bookings', current: true },
          ],
        }}
      >
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        navigationProps={{
          title: 'Booking Management - Error',
          breadcrumbs: [
            { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
            { id: 'bookings', label: 'Bookings', current: true },
          ],
        }}
      >
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Bookings Error</h3>
          <p className="text-red-600 mb-4">Failed to load bookings</p>
          <p className="text-sm text-gray-500">{error?.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navigationProps={{
        title: 'Booking Management',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'bookings', label: 'Bookings', current: true },
        ],
        actions: [
          {
            id: 'export-bookings',
            label: 'Export',
            icon: 'ArrowDownTrayIcon',
            variant: 'secondary',
            onClick: handleExport,
            disabled: exportMutation.isPending,
          },
          {
            id: 'add-booking',
            label: 'Add Booking',
            icon: 'PlusIcon',
            variant: 'primary',
            onClick: () => {
              console.log('Add booking clicked');
            },
          },
        ],
      }}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search bookings..."
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              placeholder="From Date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="To Date"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings?.data.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{booking.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={booking.customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customer.fullName)}&background=3B82F6&color=fff`}
                          alt={booking.customer.fullName}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customer.fullName}
                        </div>
                        <div className="text-sm text-gray-500">{booking.customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.service.name}</div>
                    <div className="text-sm text-gray-500">{booking.service.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.scheduledTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.pricing.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => console.log('View booking', booking.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                            disabled={updateBookingMutation.isPending}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            disabled={cancelBookingMutation.isPending}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(booking.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={updateBookingMutation.isPending}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {bookings?.pagination && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  disabled={!bookings.pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={!bookings.pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(bookings.pagination.page - 1) * bookings.pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(bookings.pagination.page * bookings.pagination.limit, bookings.pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{bookings.pagination.total}</span> results
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export const Route = createFileRoute('/_protected/bookings')({
  component: BookingListWithLayout,
  
  // Validate search parameters
  validateSearch: (search) => bookingsSearchSchema.parse(search),
  
  // Loading component
  pendingComponent: () => (
    <DashboardLayout
      navigationProps={{
        title: 'Booking Management',
        breadcrumbs: [
          { id: 'home', label: 'Home', href: ROUTES.DASHBOARD },
          { id: 'bookings', label: 'Bookings', current: true },
        ],
      }}
    >
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    </DashboardLayout>
  ),
});