/**
 * Customer Segments Management Page
 * Create and manage customer segments for targeted marketing
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge, Input } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { marketingService } from '@/services/api';
import { toast } from '@/services/toast';
import type { CustomerSegment } from '@/services/api/marketing';

const CustomerSegmentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // Fetch segments
  const { data: segmentsData, isLoading } = useQuery({
    queryKey: ['customer-segments', page, search],
    queryFn: () =>
      marketingService.getCustomerSegments({
        page,
        page_size: 20,
        search: search || undefined,
      }),
  });

  // Fetch customers for selected segment
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['segment-customers', selectedSegment],
    queryFn: () =>
      selectedSegment
        ? marketingService.getSegmentCustomers(selectedSegment, { page: 1, page_size: 50 })
        : Promise.resolve(null),
    enabled: !!selectedSegment,
  });

  // Mutations
  const deleteSegmentMutation = useMutation({
    mutationFn: (id: string) => marketingService.deleteCustomerSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      toast.success('Segment deleted successfully');
      if (selectedSegment) setSelectedSegment(null);
    },
    onError: () => toast.error('Failed to delete segment'),
  });

  const duplicateSegmentMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      marketingService.duplicateCustomerSegment(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-segments'] });
      toast.success('Segment duplicated successfully');
    },
    onError: () => toast.error('Failed to duplicate segment'),
  });

  // Handlers
  const handleDeleteSegment = (id: string) => {
    if (confirm('Delete this segment? This action cannot be undone.')) {
      deleteSegmentMutation.mutate(id);
    }
  };

  const handleDuplicateSegment = (segment: CustomerSegment) => {
    const newName = prompt('Enter name for duplicated segment:', `${segment.name} (Copy)`);
    if (newName) {
      duplicateSegmentMutation.mutate({ id: segment.id, name: newName });
    }
  };

  const segments = segmentsData?.data?.items || [];
  const metadata = segmentsData?.data?.metadata;
  const customers = customersData?.data?.items || [];

  // Table columns
  const columns = [
    {
      key: 'segment',
      header: 'Segment',
      render: (_: any, segment: CustomerSegment) => (
        <div>
          <div className="font-medium">{segment.name}</div>
          {segment.description && (
            <div className="text-sm text-gray-500 mt-1">{segment.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'criteria',
      header: 'Criteria',
      render: (_: any, segment: CustomerSegment) => (
        <div className="space-y-1 text-sm">
          {segment.criteria.age_range && (
            <div>Age: {segment.criteria.age_range.min}-{segment.criteria.age_range.max}</div>
          )}
          {segment.criteria.locations && segment.criteria.locations.length > 0 && (
            <div>Locations: {segment.criteria.locations.join(', ')}</div>
          )}
          {segment.criteria.purchase_history && (
            <div>
              Purchases: {segment.criteria.purchase_history.min_count || 0}+
              {segment.criteria.purchase_history.total_spent_min && 
                ` ($${segment.criteria.purchase_history.total_spent_min}+)`}
            </div>
          )}
          {segment.criteria.engagement_level && (
            <div className="capitalize">
              Engagement: {segment.criteria.engagement_level.join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'customers',
      header: 'Customers',
      render: (_: any, segment: CustomerSegment) => (
        <div>
          <div className="font-semibold text-lg">{segment.customer_count.toLocaleString()}</div>
          <Button
            variant="link"
            size="sm"
            onClick={() => setSelectedSegment(segment.id)}
          >
            View customers
          </Button>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, segment: CustomerSegment) => (
        <Badge
          variant={segment.is_active ? 'success' : 'default'}
          size="sm"
        >
          {segment.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'updated',
      header: 'Last Updated',
      render: (_: any, segment: CustomerSegment) => (
        <div className="text-sm text-gray-500">
          {new Date(segment.updated_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, segment: CustomerSegment) => (
        <div className="flex space-x-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate({ to: `/marketing/segments/${segment.id}/edit` })}
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDuplicateSegment(segment)}
            title="Duplicate"
          >
            <UserGroupIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteSegment(segment.id)}
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Customer columns for modal
  const customerColumns = [
    {
      key: 'name',
      header: 'Customer',
      render: (_: any, customer: any) => (
        <div>
          <div className="font-medium">{customer.full_name}</div>
          <div className="text-sm text-gray-500">{customer.email}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (_: any, customer: any) => customer.location || '-',
    },
    {
      key: 'purchases',
      header: 'Purchases',
      render: (_: any, customer: any) => customer.purchase_count || 0,
    },
    {
      key: 'value',
      header: 'Total Value',
      render: (_: any, customer: any) => `$${(customer.total_spent || 0).toFixed(2)}`,
    },
  ];

  return (
    <PageTemplate
      title="Customer Segments"
      subtitle="Create and manage customer segments for targeted campaigns"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Marketing', path: '/marketing' },
        { label: 'Segments', path: '/marketing/segments' },
      ]}
      actions={
        <Button
          variant="primary"
          onClick={() => navigate({ to: '/marketing/segments/new' })}
          icon={PlusIcon}
        >
          New Segment
        </Button>
      }
    >
      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                type="text"
                placeholder="Search segments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={MagnifyingGlassIcon}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Segments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading level={3}>All Segments</Heading>
            <Text className="text-sm text-gray-500">{metadata?.total_items || 0} segments</Text>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            data={segments}
            columns={columns}
            loading={isLoading}
            emptyMessage="No segments found. Create your first segment to start targeting customers."
          />
          {metadata && metadata.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Text className="text-sm text-gray-500">
                Page {metadata.page} of {metadata.total_pages}
              </Text>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!metadata.has_previous}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!metadata.has_next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Customer Details Modal */}
      {selectedSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Heading level={3}>Segment Customers</Heading>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedSegment(null)}
              >
                Close
              </Button>
            </div>
            <Table
              data={customers}
              columns={customerColumns}
              loading={customersLoading}
              emptyMessage="No customers in this segment"
            />
          </div>
        </div>
      )}
    </PageTemplate>
  );
};

export default CustomerSegmentsPage;
