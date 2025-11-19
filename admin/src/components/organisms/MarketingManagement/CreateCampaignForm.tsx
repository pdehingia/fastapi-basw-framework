/**
 * Campaign Creation Form
 * Comprehensive form for creating marketing campaigns with validation and preview
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Heading } from '@/components/atoms';
import { Card, Modal } from '@/components/molecules';
import { useCreateCampaign } from '@/hooks/api/useMarketing';
import { CreateCampaignRequest } from '@/services/api/marketing';
import { ArrowLeftIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from '@/services/toast';

interface CampaignFormData extends Omit<CreateCampaignRequest, 'channels' | 'goals'> {
  channels: string[];
  goals: Record<string, number>;
  goalConversions?: number;
  goalRevenue?: number;
  goalClicks?: number;
  goalImpressions?: number;
  status?: 'draft' | 'active';
  schedule_settings?: {
    timezone: string;
    send_immediately: boolean;
  };
}

const CAMPAIGN_TYPES = [
  { value: 'email', label: 'Email Campaign' },
  { value: 'social', label: 'Social Media' },
  { value: 'referral', label: 'Referral Program' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'seasonal', label: 'Seasonal' }
] as const;

const TARGET_AUDIENCES = [
  { value: 'all', label: 'All Customers' },
  { value: 'new_customers', label: 'New Customers' },
  { value: 'existing_customers', label: 'Existing Customers' },
  { value: 'high_value', label: 'High Value Customers' },
  { value: 'inactive', label: 'Inactive Customers' }
] as const;

const AVAILABLE_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'push', label: 'Push Notifications' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'display_ads', label: 'Display Ads' },
  { value: 'search_ads', label: 'Search Ads' }
];

export const CreateCampaignForm = () => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const { register, handleSubmit, control, watch, formState: { errors, isValid } } = useForm<CampaignFormData>({
    mode: 'onChange',
    defaultValues: {
      type: 'email',
      target_audience: 'all',
      status: 'draft',
      channels: ['email'],
      goals: {},
      schedule_settings: {
        timezone: 'UTC',
        send_immediately: true
      }
    }
  });

  const createCampaignMutation = useCreateCampaign();

  const watchedValues = watch();

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(watchedValues.name && watchedValues.description && watchedValues.type);
      case 2:
        return !!(watchedValues.target_audience && watchedValues.channels && watchedValues.channels.length > 0);
      case 3:
        return !!(watchedValues.budget && watchedValues.start_date && watchedValues.end_date);
      case 4:
        return true; // Review step - always valid if we got here
      default:
        return false;
    }
  };

  const onSubmit = async (data: CampaignFormData) => {
    try {
      // Transform form data to API format
      const campaignData: CreateCampaignRequest = {
        name: data.name,
        description: data.description,
        type: data.type,
        target_audience: data.target_audience,
        budget: Number(data.budget),
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status || 'draft',
        channels: data.channels,
        goals: {
          ...(data.goalConversions && { conversions: data.goalConversions }),
          ...(data.goalRevenue && { revenue: data.goalRevenue }),
          ...(data.goalClicks && { clicks: data.goalClicks }),
          ...(data.goalImpressions && { impressions: data.goalImpressions }),
        },
        content: data.content || {},
        schedule_settings: data.schedule_settings || {
          timezone: 'UTC',
          send_immediately: true
        }
      };

      const result = await createCampaignMutation.mutateAsync(campaignData);
      
      toast.success('Campaign created successfully!');
      // Navigate to campaigns list for now
      navigate({ to: '/admin-users' }); // placeholder route
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(Math.min(step + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep(Math.max(step - 1, 1));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              stepNumber === step
                ? 'bg-blue-600 text-white'
                : stepNumber < step
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {stepNumber < step ? '✓' : stepNumber}
          </div>
          {stepNumber < 4 && (
            <div
              className={`w-16 h-0.5 ${
                stepNumber < step ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Heading size="medium" className="mb-4">Campaign Basics</Heading>
        <p className="text-gray-600 mb-6">Let's start with the basic information about your campaign.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Campaign name is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter campaign name"
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
            placeholder="Describe your campaign objectives and strategy"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Type *
          </label>
          <select
            {...register('type', { required: 'Campaign type is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CAMPAIGN_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Heading size="medium" className="mb-4">Targeting & Channels</Heading>
        <p className="text-gray-600 mb-6">Define your target audience and select marketing channels.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience *
          </label>
          <select
            {...register('target_audience', { required: 'Target audience is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TARGET_AUDIENCES.map(audience => (
              <option key={audience.value} value={audience.value}>
                {audience.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marketing Channels *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_CHANNELS.map(channel => (
              <Controller
                key={channel.value}
                name="channels"
                control={control}
                rules={{ required: 'At least one channel is required' }}
                render={({ field: { value, onChange } }) => (
                  <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value?.includes(channel.value) || false}
                      onChange={(e) => {
                        const updatedChannels = e.target.checked
                          ? [...(value || []), channel.value]
                          : (value || []).filter((c: string) => c !== channel.value);
                        onChange(updatedChannels);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">{channel.label}</span>
                  </label>
                )}
              />
            ))}
          </div>
          {errors.channels && (
            <p className="text-red-500 text-sm mt-1">{errors.channels.message}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Heading size="medium" className="mb-4">Budget & Schedule</Heading>
        <p className="text-gray-600 mb-6">Set your budget and campaign timeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Budget *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              {...register('budget', { 
                required: 'Budget is required',
                min: { value: 1, message: 'Budget must be at least $1' }
              })}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          {errors.budget && (
            <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Status
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Save as Draft</option>
            <option value="active">Launch Immediately</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="datetime-local"
            {...register('start_date', { required: 'Start date is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.start_date && (
            <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="datetime-local"
            {...register('end_date', { required: 'End date is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.end_date && (
            <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      <div>
        <Heading size="small" className="mb-4">Campaign Goals (Optional)</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Conversions
            </label>
            <input
              type="number"
              {...register('goalConversions')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Revenue ($)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('goalRevenue')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Clicks
            </label>
            <input
              type="number"
              {...register('goalClicks')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Impressions
            </label>
            <input
              type="number"
              {...register('goalImpressions')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50000"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Heading size="medium" className="mb-4">Review & Launch</Heading>
        <p className="text-gray-600 mb-6">Review your campaign details before launching.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Campaign Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {watchedValues.name}</div>
              <div><span className="font-medium">Type:</span> {CAMPAIGN_TYPES.find(t => t.value === watchedValues.type)?.label}</div>
              <div><span className="font-medium">Status:</span> {watchedValues.status}</div>
              <div><span className="font-medium">Target Audience:</span> {TARGET_AUDIENCES.find(a => a.value === watchedValues.target_audience)?.label}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Budget & Timeline</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Budget:</span> ${Number(watchedValues.budget || 0).toFixed(2)}</div>
              <div><span className="font-medium">Start Date:</span> {watchedValues.start_date ? new Date(watchedValues.start_date).toLocaleString() : 'Not set'}</div>
              <div><span className="font-medium">End Date:</span> {watchedValues.end_date ? new Date(watchedValues.end_date).toLocaleString() : 'Not set'}</div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-2">Channels & Goals</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Channels:</span> {
                  watchedValues.channels?.map(channel => 
                    AVAILABLE_CHANNELS.find(c => c.value === channel)?.label
                  ).join(', ') || 'None'
                }
              </div>
              <div>
                <span className="font-medium">Goals:</span> {
                  [
                    watchedValues.goalConversions && `${watchedValues.goalConversions} conversions`,
                    watchedValues.goalRevenue && `$${watchedValues.goalRevenue} revenue`,
                    watchedValues.goalClicks && `${watchedValues.goalClicks} clicks`,
                    watchedValues.goalImpressions && `${watchedValues.goalImpressions} impressions`
                  ].filter(Boolean).join(', ') || 'No specific goals set'
                }
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-700">{watchedValues.description}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/admin-users' })} // placeholder route
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <div className="flex-1">
          <Heading size="large">Create New Campaign</Heading>
          <p className="text-gray-600 mt-1">Step {step} of {totalSteps}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowPreview(true)}
          disabled={!watchedValues.name}
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </Button>

              {step < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  disabled={!validateStep(step)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isValid}
                  isLoading={createCampaignMutation.isPending}
                >
                  Create Campaign
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Campaign Preview"
          size="large"
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {watchedValues.name || 'Untitled Campaign'}
              </h3>
              <p className="text-gray-600">
                {watchedValues.description || 'No description provided'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span> {CAMPAIGN_TYPES.find(t => t.value === watchedValues.type)?.label}
              </div>
              <div>
                <span className="font-medium">Budget:</span> ${Number(watchedValues.budget || 0).toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Audience:</span> {TARGET_AUDIENCES.find(a => a.value === watchedValues.target_audience)?.label}
              </div>
              <div>
                <span className="font-medium">Status:</span> {watchedValues.status}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowPreview(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};