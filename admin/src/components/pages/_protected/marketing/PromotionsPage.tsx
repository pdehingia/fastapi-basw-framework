/**
 * Promotions & Coupons Management Page
 * Create and manage promotional offers and coupon codes
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  TicketIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { PageTemplate } from '@/components/templates';
import { Button, Heading, Text, Badge, Input, Select } from '@/components/atoms';
import { Card, CardHeader, CardBody, Table } from '@/components/molecules';
import { marketingService } from '@/services/api';
import { toast } from '@/services/toast';
import type { Promotion, Coupon } from '@/services/api/marketing';

const PromotionsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [activeTab, setActiveTab] = useState<'promotions' | 'coupons'>('promotions');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch promotions
  const { data: promotionsData, isLoading: promotionsLoading } = useQuery({
    queryKey: ['marketing-promotions', page, search, statusFilter],
    queryFn: () =>
      marketingService.getPromotions({
        page,
        page_size: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
    enabled: activeTab === 'promotions',
  });

  // Fetch coupons
  const { data: couponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ['marketing-coupons', page, search, statusFilter],
    queryFn: () =>
      marketingService.getCoupons({
        page,
        page_size: 20,
        search: search || undefined,
        is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      }),
    enabled: activeTab === 'coupons',
  });

  // Mutations
  const deletePromotionMutation = useMutation({
    mutationFn: (id: string) => marketingService.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-promotions'] });
      toast.success('Promotion deleted successfully');
    },
    onError: () => toast.error('Failed to delete promotion'),
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) => marketingService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: () => toast.error('Failed to delete coupon'),
  });

  const generateCouponsMutation = useMutation({
    mutationFn: ({ promotionId, count, prefix }: { promotionId: string; count: number; prefix?: string }) =>
      marketingService.generateCouponCodes(promotionId, count, prefix),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-coupons'] });
      toast.success(`Generated ${response.data.generated_count} coupon codes`);
    },
    onError: () => toast.error('Failed to generate coupons'),
  });

  // Handlers
  const handleDeletePromotion = (id: string) => {
    if (confirm('Delete this promotion? This action cannot be undone.')) {
      deletePromotionMutation.mutate(id);
    }
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Delete this coupon? This action cannot be undone.')) {
      deleteCouponMutation.mutate(id);
    }
  };

  const handleGenerateCoupons = (promotion: Promotion) => {
    const count = prompt('How many coupon codes to generate?', '10');
    if (count && !isNaN(parseInt(count))) {
      const prefix = prompt('Enter prefix for codes (optional):', promotion.code);
      generateCouponsMutation.mutate({
        promotionId: promotion.id,
        count: parseInt(count),
        prefix: prefix || undefined,
      });
    }
  };

  const promotions = promotionsData?.data?.items || [];
  const coupons = couponsData?.data?.items || [];
  const metadata = activeTab === 'promotions' ? promotionsData?.data?.metadata : couponsData?.data?.metadata;
  const isLoading = activeTab === 'promotions' ? promotionsLoading : couponsLoading;

  // Promotion columns
  const promotionColumns = [
    {
      key: 'promotion',
      header: 'Promotion',
      render: (_: any, promotion: Promotion) => (
        <div>
          <div className="font-medium">{promotion.name}</div>
          <div className="text-sm text-gray-500">{promotion.code}</div>
          {promotion.description && (
            <div className="text-xs text-gray-400 mt-1">{promotion.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (_: any, promotion: Promotion) => (
        <div>
          <div className="font-semibold">
            {promotion.discount_type === 'percentage'
              ? `${promotion.discount_value}%`
              : `$${promotion.discount_value}`}
          </div>
          {promotion.max_discount_amount && (
            <div className="text-xs text-gray-500">
              Max: ${promotion.max_discount_amount}
            </div>
          )}
          {promotion.min_purchase_amount && (
            <div className="text-xs text-gray-500">
              Min: ${promotion.min_purchase_amount}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (_: any, promotion: Promotion) => (
        <div className="space-y-1">
          <div className="text-sm">
            Used: {promotion.used_count} / {promotion.max_usage || '∞'}
          </div>
          {promotion.max_usage && (
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${Math.min((promotion.used_count / promotion.max_usage) * 100, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (_: any, promotion: Promotion) => (
        <div className="text-sm">
          <div>Start: {new Date(promotion.start_date).toLocaleDateString()}</div>
          <div>End: {new Date(promotion.end_date).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, promotion: Promotion) => (
        <Badge
          variant={
            promotion.is_active && new Date(promotion.end_date) > new Date()
              ? 'success'
              : 'default'
          }
          size="sm"
        >
          {promotion.is_active && new Date(promotion.end_date) > new Date() ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, promotion: Promotion) => (
        <div className="flex space-x-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate({ to: `/marketing/promotions/${promotion.id}/edit` })}
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleGenerateCoupons(promotion)}
            title="Generate Coupons"
          >
            <SparklesIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeletePromotion(promotion.id)}
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Coupon columns
  const couponColumns = [
    {
      key: 'code',
      header: 'Coupon Code',
      render: (_: any, coupon: Coupon) => (
        <div>
          <div className="font-mono font-bold text-lg">{coupon.code}</div>
          {coupon.promotion && (
            <div className="text-sm text-gray-500">{coupon.promotion.name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (_: any, coupon: Coupon) => (
        <div className="font-semibold">
          {coupon.discount_type === 'percentage'
            ? `${coupon.discount_value}%`
            : `$${coupon.discount_value}`}
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (_: any, coupon: Coupon) => (
        <div className="text-sm">
          <div>Used: {coupon.usage_count}</div>
          {coupon.max_uses && <div>Max: {coupon.max_uses}</div>}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (_: any, coupon: Coupon) => (
        <div className="text-sm">
          {coupon.assigned_to_customer ? (
            <Badge variant="info" size="sm">Assigned</Badge>
          ) : (
            <Badge variant="default" size="sm">Public</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Valid Until',
      render: (_: any, coupon: Coupon) => (
        <div className="text-sm">
          {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'No expiry'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, coupon: Coupon) => (
        <Badge
          variant={coupon.is_active ? 'success' : 'default'}
          size="sm"
        >
          {coupon.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, coupon: Coupon) => (
        <div className="flex space-x-1">
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteCoupon(coupon.id)}
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTemplate
      title="Promotions & Coupons"
      subtitle="Create promotional offers and manage coupon codes"
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Marketing', path: '/marketing' },
        { label: 'Promotions', path: '/marketing/promotions' },
      ]}
      actions={
        <Button
          variant="primary"
          onClick={() => navigate({ to: '/marketing/promotions/new' })}
          icon={PlusIcon}
        >
          New Promotion
        </Button>
      }
    >
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'promotions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('promotions');
            setPage(1);
          }}
        >
          Promotions
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'coupons'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('coupons');
            setPage(1);
          }}
        >
          Coupons
        </button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Search</label>
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={MagnifyingGlassIcon}
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading level={3}>
              {activeTab === 'promotions' ? 'All Promotions' : 'All Coupons'}
            </Heading>
            <Text className="text-sm text-gray-500">
              {metadata?.total_items || 0} {activeTab}
            </Text>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            data={activeTab === 'promotions' ? promotions : coupons}
            columns={activeTab === 'promotions' ? promotionColumns : couponColumns}
            loading={isLoading}
            emptyMessage={`No ${activeTab} found`}
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
    </PageTemplate>
  );
};

export default PromotionsPage;
