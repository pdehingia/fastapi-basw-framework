/**
 * Customer Segmentation Management
 * Create, manage, and analyze customer segments for targeted marketing
 */

import { useState } from 'react';
import { DataTable } from '@/components/organisms/DataTable';
import { Button, Heading } from '@/components/atoms';
import { Card, Modal } from '@/components/molecules';
import { 
  useCustomerSegments, 
  useCreateSegment, 
  useDeleteSegment,
  useUpdateSegment,
  useSegmentAnalytics
} from '@/hooks/api/useMarketing';
import { CustomerSegment, CreateSegmentRequest } from '@/services/api/marketing';
import { useForm } from 'react-hook-form';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  EyeIcon,
  UsersIcon,
  ChartBarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from '@/services/toast';

interface SegmentFormData extends CreateSegmentRequest {}

export const CustomerSegmentation = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // API hooks
  const { data: segmentsData, isLoading } = useCustomerSegments({
    page,
    page_size: pageSize
  });

  const { data: analyticsData } = useSegmentAnalytics(
    selectedSegment ? { segment_id: selectedSegment.id } : undefined
  );

  const createSegmentMutation = useCreateSegment();
  const updateSegmentMutation = useUpdateSegment();
  const deleteSegmentMutation = useDeleteSegment();

  const segments = segmentsData?.data || [];

  // Form setup
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isValid } } = useForm<SegmentFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      criteria: {},
      is_active: true
    }
  });

  const watchedCriteria = watch('criteria');

  const handleCreateSegment = async (data: SegmentFormData) => {
    try {
      await createSegmentMutation.mutateAsync(data);
      setShowCreateModal(false);
      reset();
      toast.success('Segment created successfully!');
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Failed to create segment');
    }
  };

  const handleEditSegment = async (data: SegmentFormData) => {
    if (!selectedSegment) return;
    
    try {
      await updateSegmentMutation.mutateAsync({
        id: selectedSegment.id,
        data
      });
      setShowEditModal(false);
      setSelectedSegment(null);
      reset();
      toast.success('Segment updated successfully!');
    } catch (error) {
      console.error('Error updating segment:', error);
      toast.error('Failed to update segment');
    }
  };

  const handleDeleteSegment = async () => {
    if (!selectedSegment) return;
    
    try {
      await deleteSegmentMutation.mutateAsync(selectedSegment.id);
      setShowDeleteModal(false);
      setSelectedSegment(null);
      toast.success('Segment deleted successfully!');
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const openEditModal = (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setValue('name', segment.name);
    setValue('description', segment.description);
    setValue('criteria', segment.criteria);
    setValue('is_active', segment.is_active);
    setShowEditModal(true);
  };

  const openDeleteModal = (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setShowDeleteModal(true);
  };

  const openAnalyticsModal = (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setShowAnalyticsModal(true);
  };

  const addCriteria = (field: string, operator: string, value: string) => {
    const currentCriteria = watchedCriteria || {};
    const newCriteria = {
      ...currentCriteria,
      [field]: { operator, value }
    };
    setValue('criteria', newCriteria);
  };

  const removeCriteria = (field: string) => {
    const currentCriteria = watchedCriteria || {};
    const { [field]: removed, ...newCriteria } = currentCriteria;
    setValue('criteria', newCriteria);
  };

  const getSegmentStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatCriteria = (criteria: Record<string, any>) => {
    if (!criteria || Object.keys(criteria).length === 0) {
      return 'No criteria defined';
    }
    
    return Object.entries(criteria)
      .map(([field, condition]) => {
        if (typeof condition === 'object' && condition.operator && condition.value) {
          return `${field} ${condition.operator} ${condition.value}`;
        }
        return `${field}: ${condition}`;
      })
      .join(', ');
  };

  const columns = [
    {
      key: 'segment',
      header: 'Segment',
      sortable: true,
      render: (_: any, segment: CustomerSegment) => (
        <div>
          <div className="font-medium text-gray-900">{segment.name}</div>
          <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
            {segment.description}
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSegmentStatusColor(segment.is_active)}`}>
              {segment.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'criteria',
      header: 'Criteria',
      render: (_: any, segment: CustomerSegment) => (
        <div className="text-sm text-gray-600 max-w-xs">
          {formatCriteria(segment.criteria)}
        </div>
      )
    },
    {
      key: 'size',
      header: 'Estimated Size',
      sortable: true,
      render: (_: any, segment: CustomerSegment) => (
        <div className="text-sm text-gray-900">
          {segment.estimated_size?.toLocaleString() || 'Unknown'}
        </div>
      )
    },
    {
      key: 'created',
      header: 'Created',
      sortable: true,
      render: (_: any, segment: CustomerSegment) => (
        <div className="text-sm text-gray-600">
          {new Date(segment.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, segment: CustomerSegment) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAnalyticsModal(segment)}
          >
            <ChartBarIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(segment)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => openDeleteModal(segment)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const renderSegmentForm = (isEdit: boolean = false) => (
    <form onSubmit={handleSubmit(isEdit ? handleEditSegment : handleCreateSegment)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Segment Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Segment name is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="High Value Customers"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the characteristics of this customer segment"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('is_active')}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Active Segment</span>
          </label>
        </div>
      </div>

      {/* Criteria Builder */}
      <div>
        <Heading size="small" className="mb-4">Segmentation Criteria</Heading>
        
        {/* Display current criteria */}
        <div className="space-y-2 mb-4">
          {Object.entries(watchedCriteria || {}).map(([field, condition]) => (
            <div key={field} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {field} {typeof condition === 'object' && condition.operator} {typeof condition === 'object' && condition.value}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCriteria(field)}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add criteria form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <select
              id="criteria-field"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Field</option>
              <option value="total_spent">Total Spent</option>
              <option value="order_count">Order Count</option>
              <option value="last_order_days">Days Since Last Order</option>
              <option value="account_age_days">Account Age (Days)</option>
              <option value="user_type">User Type</option>
            </select>
          </div>
          
          <div>
            <select
              id="criteria-operator"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Operator</option>
              <option value="gt">Greater Than</option>
              <option value="lt">Less Than</option>
              <option value="eq">Equals</option>
              <option value="gte">Greater Than or Equal</option>
              <option value="lte">Less Than or Equal</option>
              <option value="in">In List</option>
              <option value="contains">Contains</option>
            </select>
          </div>
          
          <div>
            <input
              type="text"
              id="criteria-value"
              placeholder="Value"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                const field = (document.getElementById('criteria-field') as HTMLSelectElement).value;
                const operator = (document.getElementById('criteria-operator') as HTMLSelectElement).value;
                const value = (document.getElementById('criteria-value') as HTMLInputElement).value;
                
                if (field && operator && value) {
                  addCriteria(field, operator, value);
                  (document.getElementById('criteria-field') as HTMLSelectElement).value = '';
                  (document.getElementById('criteria-operator') as HTMLSelectElement).value = '';
                  (document.getElementById('criteria-value') as HTMLInputElement).value = '';
                }
              }}
            >
              Add Criteria
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false);
            } else {
              setShowCreateModal(false);
            }
            setSelectedSegment(null);
            reset();
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid}
          isLoading={isEdit ? updateSegmentMutation.isPending : createSegmentMutation.isPending}
        >
          {isEdit ? 'Update Segment' : 'Create Segment'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading size="large" className="text-gray-900">Customer Segmentation</Heading>
          <p className="text-gray-600 mt-1">Create and manage customer segments for targeted marketing</p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {/* Segments Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={segments}
          columns={columns}
          loading={isLoading}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil((segmentsData?.total ?? 0) / pageSize),
            totalItems: segmentsData?.total ?? 0,
            pageSize: pageSize,
            onPageChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* Create Segment Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            reset();
          }}
          title="Create Customer Segment"
          size="large"
        >
          {renderSegmentForm(false)}
        </Modal>
      )}

      {/* Edit Segment Modal */}
      {showEditModal && selectedSegment && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSegment(null);
            reset();
          }}
          title="Edit Customer Segment"
          size="large"
        >
          {renderSegmentForm(true)}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSegment && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSegment(null);
          }}
          title="Delete Segment"
          size="medium"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the segment "{selectedSegment.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSegment(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteSegment}
                isLoading={deleteSegmentMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedSegment && (
        <Modal
          isOpen={showAnalyticsModal}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedSegment(null);
          }}
          title={`Analytics: ${selectedSegment.name}`}
          size="large"
        >
          <div className="space-y-6">
            {/* Segment Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="p-4 text-center">
                  <UsersIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Segment Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedSegment.estimated_size?.toLocaleString() || 'Unknown'}
                  </p>
                </div>
              </Card>
              
              <Card>
                <div className="p-4 text-center">
                  <ChartBarIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analyticsData?.avg_order_value?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </Card>
              
              <Card>
                <div className="p-4 text-center">
                  <FunnelIcon className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData?.conversion_rate?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              </Card>
            </div>

            {/* Segment Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Segment Details</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Description:</span> {selectedSegment.description}</div>
                <div><span className="font-medium">Criteria:</span> {formatCriteria(selectedSegment.criteria)}</div>
                <div><span className="font-medium">Status:</span> {selectedSegment.is_active ? 'Active' : 'Inactive'}</div>
                <div><span className="font-medium">Created:</span> {new Date(selectedSegment.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowAnalyticsModal(false);
                  setSelectedSegment(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};