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
import type { PromotionCampaign, CouponCode } from '@/types';

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
    queryKey: ['marketing-promotions', page, search],
    queryFn: () =>
      marketingService.getPromotions({
        page,
        page_size: 20,
        search: search || undefined,
      }),
    enabled: activeTab === 'promotions',
  });

  // Fetch coupons
  const { data: couponsData, isLoading: couponsLoading } = useQuery({
    queryKey: ['marketing-coupons', page, search],
    queryFn: () =>
      marketingService.getCoupons({
        page,
        page_size: 20,
        search: search || undefined,
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
    mutationFn: (params: { count: number; prefix?: string; discount_type: 'percentage' | 'fixed'; discount_value: number }) =>
      marketingService.generateCouponCodes(params),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-coupons'] });
      toast.success(`Generated ${response.data?.length || 0} coupon codes`);
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

  const handleGenerateCoupons = (promotion: PromotionCampaign) => {
    const count = prompt('How many coupon codes to generate?', '10');
    if (count && !isNaN(parseInt(count))) {
      const prefix = prompt('Enter prefix for codes (optional):', 'PROMO');
      generateCouponsMutation.mutate({
        count: parseInt(count),
        prefix: prefix || undefined,
        discount_type: 'percentage',
        discount_value: 10,
      });
    }
  };

  const promotions = promotionsData?.data?.data || [];
  const coupons = couponsData?.data?.data || [];
  const pagination = activeTab === 'promotions' ? promotionsData?.data : couponsData?.data;
  const isLoading = activeTab === 'promotions' ? promotionsLoading : couponsLoading;

  // Promotion columns
  const promotionColumns = [
    {
      key: 'promotion',
      header: 'Promotion',
      render: (_: any, promotion: PromotionCampaign) => (
        <div>
          <div className="font-medium">{promotion.name}</div>
          <div className="text-sm text-gray-500">{promotion.promo_code || 'N/A'}</div>
          {promotion.description && (
            <div className="text-xs text-gray-400 mt-1">{promotion.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (_: any, promotion: PromotionCampaign) => (
        <div>
          <div className="font-semibold">
            {promotion.discount_percentage ? `${promotion.discount_percentage}%` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {promotion.type}
          </div>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage Limit',
      render: (_: any, promotion: PromotionCampaign) => (
        <div className="text-sm">
          {promotion.usage_limit > 0 ? promotion.usage_limit : 'Unlimited'}
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (_: any, promotion: PromotionCampaign) => (
        <div className="text-sm">
          <div>Start: {new Date(promotion.start_date).toLocaleDateString()}</div>
          <div>End: {new Date(promotion.end_date).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, promotion: PromotionCampaign) => (
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
      render: (_: any, promotion: PromotionCampaign) => (
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
            variant="secondary"
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
      render: (_: any, coupon: CouponCode) => (
        <div>
          <div className="font-mono font-bold text-lg">{coupon.code}</div>
          {coupon.description && (
            <div className="text-sm text-gray-500">{coupon.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      render: (_: any, coupon: CouponCode) => (
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
      render: (_: any, coupon: CouponCode) => (
        <div className="text-sm">
          <div>Limit: {coupon.usage_limit > 0 ? coupon.usage_limit : 'Unlimited'}</div>
          <div>Per User: {coupon.per_user_limit}</div>
        </div>
      ),
    },
    {
      key: 'minimum',
      header: 'Min Amount',
      render: (_: any, coupon: CouponCode) => (
        <div className="text-sm">
          ${coupon.minimum_amount.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Valid Until',
      render: (_: any, coupon: CouponCode) => (
        <div className="text-sm">
          {new Date(coupon.valid_until).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, coupon: CouponCode) => (
        <Badge
          variant={new Date(coupon.valid_until) > new Date() ? 'success' : 'default'}
          size="sm"
        >
          {new Date(coupon.valid_until) > new Date() ? 'Active' : 'Expired'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, coupon: CouponCode) => (
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
        { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
        { id: 'marketing', label: 'Marketing', href: '/marketing/campaigns' },
        { id: 'promotions', label: 'Promotions', href: '/marketing/promotions', current: true },
      ]}
      primaryAction={{
        id: 'new-promotion',
        label: 'New Promotion',
        onClick: () => navigate({ to: '/marketing/promotions' }),
        variant: 'primary' as const,
      }}
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
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: '', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Heading size="lg">
              {activeTab === 'promotions' ? 'All Promotions' : 'All Coupons'}
            </Heading>
            <Text className="text-sm text-gray-500">
              {pagination?.total || 0} {activeTab}
            </Text>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            data={(activeTab === 'promotions' ? promotions : coupons) as any[]}
            columns={(activeTab === 'promotions' ? promotionColumns : couponColumns) as any[]}
            loading={isLoading}
            emptyMessage={`No ${activeTab} found`}
          />
          {pagination && pagination.total_pages && pagination.total_pages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Text className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.total_pages}
              </Text>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (pagination.total_pages || 1)}
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
