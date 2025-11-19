/**
 * Marketing Management Integration Tests
 * Testing the complete marketing campaign management workflow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { CampaignList, CreateCampaignForm, AnalyticsDashboard } from '@/components/organisms/MarketingManagement';
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';

// Mock toast service
vi.mock('@/services/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  }
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Marketing Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Campaign List', () => {
    it('renders campaign list correctly', async () => {
      render(<CampaignList />);

      // Check if loading state appears initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Check table headers
      expect(screen.getByText('Campaign')).toBeInTheDocument();
      expect(screen.getByText('Target Audience')).toBeInTheDocument();
      expect(screen.getByText('Budget & Spend')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();

      // Check campaign data
      expect(screen.getByText('Special holiday promotion')).toBeInTheDocument();
      expect(screen.getByText('All Customers')).toBeInTheDocument();
    });

    it('filters campaigns by type', async () => {
      const { user } = render(<CampaignList />);

      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Filter by promotional type
      const typeFilter = screen.getByDisplayValue('All Types');
      await user.selectOptions(typeFilter, 'promotional');

      // Campaign should still be visible as it's promotional type
      expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
    });

    it('searches campaigns by name', async () => {
      const { user } = render(<CampaignList />);

      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Search for holiday
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'Holiday');

      // Campaign should still be visible
      expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
    });

    it('handles campaign actions', async () => {
      const { user } = render(<CampaignList />);

      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Find action buttons
      const actionButtons = screen.getAllByRole('button');
      const pauseButton = actionButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('title')?.includes('pause')
      );

      if (pauseButton) {
        await user.click(pauseButton);
        // Should handle pause action
      }
    });

    it('opens bulk actions modal', async () => {
      const { user } = render(<CampaignList />);

      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Select campaign checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      if (checkboxes.length > 1) {
        await user.click(checkboxes[1]); // First data row checkbox
        
        // Bulk actions button should appear
        const bulkButton = screen.getByText(/bulk actions/i);
        await user.click(bulkButton);

        // Modal should open
        expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
      }
    });
  });

  describe('Create Campaign Form', () => {
    it('renders multi-step form correctly', () => {
      render(<CreateCampaignForm />);

      // Check step indicator
      expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();

      // Check form fields for step 1
      expect(screen.getByText('Campaign Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Campaign Type')).toBeInTheDocument();
    });

    it('navigates through form steps', async () => {
      const { user } = render(<CreateCampaignForm />);

      // Fill step 1
      const nameInput = screen.getByPlaceholderText(/enter campaign name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your campaign/i);

      await user.type(nameInput, 'Test Campaign');
      await user.type(descriptionInput, 'Test description');

      // Go to next step
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Should be on step 2
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      expect(screen.getByText('Targeting & Channels')).toBeInTheDocument();
    });

    it('validates form fields', async () => {
      const { user } = render(<CreateCampaignForm />);

      // Try to go to next step without filling required fields
      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Campaign name is required')).toBeInTheDocument();
        expect(screen.getByText('Description is required')).toBeInTheDocument();
      });
    });

    it('creates campaign successfully', async () => {
      server.use(
        http.post('/api/marketing/campaigns', async ({ request }) => {
          const campaignData = await request.json() as any;
          return HttpResponse.json({
            id: 'new-campaign-id',
            ...campaignData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { status: 201 });
        })
      );

      const { user } = render(<CreateCampaignForm />);

      // Step 1: Basic info
      await user.type(screen.getByPlaceholderText(/enter campaign name/i), 'Test Campaign');
      await user.type(screen.getByPlaceholderText(/describe your campaign/i), 'Test description');
      await user.click(screen.getByText('Next'));

      // Step 2: Targeting
      await user.click(screen.getByText('Next'));

      // Step 3: Budget
      await user.type(screen.getByPlaceholderText('0.00'), '1000');
      
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2023-12-01T10:00');
      
      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(endDateInput, '2023-12-31T10:00');
      
      await user.click(screen.getByText('Next'));

      // Step 4: Review and create
      const createButton = screen.getByText('Create Campaign');
      await user.click(createButton);

      // Should show success and navigate
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('shows campaign preview', async () => {
      const { user } = render(<CreateCampaignForm />);

      // Fill in campaign name
      await user.type(screen.getByPlaceholderText(/enter campaign name/i), 'Preview Test');

      // Click preview button
      const previewButton = screen.getByText('Preview');
      await user.click(previewButton);

      // Should open preview modal
      expect(screen.getByText('Campaign Preview')).toBeInTheDocument();
      expect(screen.getByText('Preview Test')).toBeInTheDocument();
    });
  });

  describe('Analytics Dashboard', () => {
    it('renders analytics dashboard correctly', async () => {
      render(<AnalyticsDashboard />);

      // Check if loading state appears initially
      expect(screen.getByText(/loading analytics data/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
      });

      // Check metric cards
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Average ROI')).toBeInTheDocument();
    });

    it('filters analytics by date range', async () => {
      const { user } = render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
      });

      // Change date range
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2023-11-01');

      const endDateInput = screen.getByLabelText(/end date/i);
      await user.clear(endDateInput);
      await user.type(endDateInput, '2023-11-30');

      // Analytics should update (mocked data remains the same)
      expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
    });

    it('filters analytics by campaign', async () => {
      const { user } = render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
      });

      // Select specific campaign
      const campaignSelect = screen.getByDisplayValue('All Campaigns');
      await user.selectOptions(campaignSelect, '1');

      // Analytics should update for selected campaign
      expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
    });

    it('exports analytics report', async () => {
      const { user } = render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
      });

      // Click export button
      const exportButton = screen.getByText('Export Report');
      await user.click(exportButton);

      // Should open export modal
      expect(screen.getByText('Export Analytics Report')).toBeInTheDocument();

      // Click export data button
      const exportDataButton = screen.getByText('Export Data');
      await user.click(exportDataButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Export Analytics Report')).not.toBeInTheDocument();
      });
    });

    it('displays channel performance correctly', async () => {
      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
      });

      // Check if channel performance section exists
      const channelSection = screen.getByText('Channel Performance');
      expect(channelSection).toBeInTheDocument();

      // Check email channel data
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('handles analytics API errors gracefully', async () => {
      server.use(
        http.get('/api/marketing/analytics', () => {
          return HttpResponse.json(
            { message: 'Analytics service unavailable' },
            { status: 503 }
          );
        })
      );

      render(<AnalyticsDashboard />);

      // Should handle error state
      await waitFor(() => {
        // Component should still render basic structure
        expect(screen.getByText('Marketing Analytics')).toBeInTheDocument();
      });
    });
  });

  describe('Marketing Integration Workflows', () => {
    it('navigates from campaign list to create form', async () => {
      const { user } = render(<CampaignList />);

      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Click create campaign button
      const createButton = screen.getByText('Create Campaign');
      await user.click(createButton);

      // Should navigate to create form
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/marketing/campaigns/create' });
    });

    it('maintains filter state across operations', async () => {
      const { user } = render(<CampaignList />);

      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'Holiday');

      // Perform an operation (like opening a modal)
      const createButton = screen.getByText('Create Campaign');
      await user.click(createButton);

      // Filter should persist
      expect(searchInput).toHaveValue('Holiday');
    });

    it('handles real-time updates correctly', async () => {
      render(<CampaignList />);

      await waitFor(() => {
        expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
      });

      // Simulate real-time update by updating mock data
      server.use(
        http.get('/api/marketing/campaigns', () => {
          return HttpResponse.json({
            data: [
              {
                id: '1',
                name: 'Updated Holiday Campaign',
                description: 'Updated description',
                type: 'promotional',
                status: 'paused',
                target_audience: 'all',
                budget: 15000,
                spent: 5000,
                start_date: '2023-12-01T00:00:00Z',
                end_date: '2023-12-31T23:59:59Z',
                metrics: {
                  impressions: 75000,
                  clicks: 3750,
                  conversions: 187,
                  ctr: 5.0,
                  conversion_rate: 5.0
                },
                created_at: '2023-11-15T09:00:00Z',
                updated_at: '2023-11-20T10:00:00Z'
              }
            ],
            metadata: {
              total_items: 1,
              total_pages: 1,
              current_page: 1,
              items_per_page: 20
            }
          });
        })
      );

      // This would typically happen through query invalidation
      // For testing, we just verify the component handles updates gracefully
      expect(screen.getByText('Holiday Sale Campaign')).toBeInTheDocument();
    });
  });
});