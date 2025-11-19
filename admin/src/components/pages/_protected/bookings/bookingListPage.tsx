/**
 * BookingList Page Component
 * Displays and manages the list of bookings in the system
 */

import React, { useState } from 'react';
import { 
  Button, 
  Heading, 
  Text, 
  Badge 
} from '@/components/atoms';
import { 
  Card, 
  CardBody, 
  SearchBox, 
  Dropdown,
  Pagination 
} from '@/components/molecules';

interface Booking {
  id: number;
  service: string;
  customer: string;
  provider: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  duration: number;
  location: string;
}

const BookingListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - will be replaced with real API calls
  const mockBookings: Booking[] = [
    {
      id: 1,
      service: 'House Cleaning',
      customer: 'Sarah Johnson',
      provider: 'CleanPro LLC',
      date: new Date('2024-01-15T10:00:00'),
      status: 'completed',
      amount: 150,
      duration: 120,
      location: '123 Main St, Downtown',
    },
    {
      id: 2,
      service: 'Plumbing Repair',
      customer: 'Mike Chen',
      provider: 'Quick Fix Solutions',
      date: new Date('2024-01-14T14:30:00'),
      status: 'in_progress',
      amount: 280,
      duration: 180,
      location: '456 Oak Ave, Midtown',
    },
    {
      id: 3,
      service: 'Garden Maintenance',
      customer: 'Emma Wilson',
      provider: 'Green Thumb Services',
      date: new Date('2024-01-16T09:00:00'),
      status: 'confirmed',
      amount: 120,
      duration: 240,
      location: '789 Pine St, Uptown',
    },
    {
      id: 4,
      service: 'Electrical Work',
      customer: 'David Brown',
      provider: 'Lightning Fast Electric',
      date: new Date('2024-01-17T11:00:00'),
      status: 'pending',
      amount: 350,
      duration: 150,
      location: '321 Elm St, Suburb',
    },
    {
      id: 5,
      service: 'Pet Grooming',
      customer: 'Lisa Martinez',
      provider: 'Paws & Claws Spa',
      date: new Date('2024-01-13T13:00:00'),
      status: 'cancelled',
      amount: 85,
      duration: 90,
      location: '654 Maple Dr, Eastside',
    },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'primary';
      case 'in_progress': return 'warning';
      case 'pending': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  // Filter bookings based on search and status
  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || booking.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBookings.length / 10);
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Heading as="h1" size="2xl" className="text-gray-900">
            Booking Management
          </Heading>
          <Text color="muted" className="mt-1">
            Monitor and manage all service bookings on the platform.
          </Text>
        </div>
        <Button variant="primary" size="sm">
          Export Data
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="flex-1 max-w-md">
            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search bookings by service, customer, or provider..."
            />
          </div>
          <div className="min-w-[180px]">
            <Dropdown
              value={selectedStatus}
              onSelect={(value) => setSelectedStatus(value)}
              options={statusOptions}
              placeholder="Filter by status"
            />
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Total Bookings</Text>
              <Heading as="h3" size="lg" className="text-blue-600">
                {mockBookings.length}
              </Heading>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Completed</Text>
              <Heading as="h3" size="lg" className="text-green-600">
                {mockBookings.filter(b => b.status === 'completed').length}
              </Heading>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">In Progress</Text>
              <Heading as="h3" size="lg" className="text-yellow-600">
                {mockBookings.filter(b => b.status === 'in_progress').length}
              </Heading>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Pending</Text>
              <Heading as="h3" size="lg" className="text-blue-600">
                {mockBookings.filter(b => b.status === 'pending').length}
              </Heading>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <Text variant="caption" color="muted">Total Revenue</Text>
              <Heading as="h3" size="lg" className="text-purple-600">
                ${mockBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)}
              </Heading>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardBody>
          {paginatedBookings.length === 0 ? (
            <div className="text-center py-8">
              <Text color="muted">No bookings found matching your criteria.</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Text variant="body" className="font-medium text-gray-900">
                        {booking.service}
                      </Text>
                      <Text variant="caption" color="muted">
                        ID: #{booking.id}
                      </Text>
                    </div>
                    
                    <div>
                      <Text variant="caption" color="muted" className="block">Customer</Text>
                      <Text variant="body" className="font-medium">
                        {booking.customer}
                      </Text>
                      <Text variant="caption" color="muted" className="block mt-1">Provider</Text>
                      <Text variant="body">
                        {booking.provider}
                      </Text>
                    </div>

                    <div>
                      <Text variant="caption" color="muted" className="block">Date & Time</Text>
                      <Text variant="body">
                        {formatDate(booking.date)}
                      </Text>
                      <Text variant="caption" color="muted" className="block mt-1">Duration</Text>
                      <Text variant="body">
                        {formatDuration(booking.duration)}
                      </Text>
                    </div>

                    <div>
                      <Text variant="caption" color="muted" className="block">Location</Text>
                      <Text variant="body" className="text-sm">
                        {booking.location}
                      </Text>
                      <Text variant="caption" color="muted" className="block mt-1">Amount</Text>
                      <Text variant="body" className="font-medium text-green-600">
                        ${booking.amount}
                      </Text>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    <Badge variant={getStatusVariant(booking.status)} size="sm">
                      {booking.status.replace('_', ' ')}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View booking', booking.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Edit booking', booking.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default BookingListPage;