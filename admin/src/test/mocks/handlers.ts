/**
 * MSW API Handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw';

// Mock data
const mockAdminUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@maya.com',
    role: 'super_admin',
    permissions: ['users:read', 'users:write', 'payments:read'],
    is_active: true,
    last_login: '2023-11-19T10:30:00Z',
    created_at: '2023-01-15T09:00:00Z',
    updated_at: '2023-11-19T10:30:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@maya.com',
    role: 'admin',
    permissions: ['users:read', 'payments:read'],
    is_active: true,
    last_login: '2023-11-18T14:20:00Z',
    created_at: '2023-02-01T09:00:00Z',
    updated_at: '2023-11-18T14:20:00Z'
  }
];

const mockSupportTickets = [
  {
    id: '1',
    title: 'Payment Processing Issue',
    description: 'User unable to process payment for subscription',
    status: 'open',
    priority: 'high',
    category: 'payment',
    user_id: 'user123',
    assigned_to: 'admin1',
    created_at: '2023-11-19T08:00:00Z',
    updated_at: '2023-11-19T08:00:00Z'
  }
];

const mockMarketingCampaigns = [
  {
    id: '1',
    name: 'Holiday Sale Campaign',
    description: 'Special holiday promotion for premium subscriptions',
    type: 'promotional',
    status: 'active',
    target_audience: 'all',
    budget: 10000,
    spent: 2500,
    start_date: '2023-12-01T00:00:00Z',
    end_date: '2023-12-31T23:59:59Z',
    metrics: {
      impressions: 50000,
      clicks: 2500,
      conversions: 125,
      ctr: 5.0,
      conversion_rate: 5.0
    },
    created_at: '2023-11-15T09:00:00Z',
    updated_at: '2023-11-19T10:00:00Z'
  }
];

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      token_type: 'bearer',
      user: {
        id: '1',
        name: 'Test Admin',
        email: 'test@maya.com',
        role: 'admin'
      }
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Admin Users endpoints
  http.get('/api/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);
    
    return HttpResponse.json({
      data: mockAdminUsers,
      metadata: {
        total_items: mockAdminUsers.length,
        total_pages: 1,
        current_page: page,
        items_per_page: limit
      }
    });
  }),

  http.get('/api/admin/users/:id', ({ params }) => {
    const user = mockAdminUsers.find(u => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  http.post('/api/admin/users', async ({ request }) => {
    const newUser = await request.json() as any;
    const user = {
      id: Date.now().toString(),
      ...newUser,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return HttpResponse.json(user, { status: 201 });
  }),

  http.put('/api/admin/users/:id', async ({ params, request }) => {
    const updatedData = await request.json() as any;
    const user = mockAdminUsers.find(u => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...user, ...updatedData, updated_at: new Date().toISOString() });
  }),

  http.delete('/api/admin/users/:id', () => {
    return HttpResponse.json({ message: 'User deleted successfully' });
  }),

  // Support Tickets endpoints
  http.get('/api/support/tickets', () => {
    return HttpResponse.json({
      data: mockSupportTickets,
      metadata: {
        total_items: mockSupportTickets.length,
        total_pages: 1,
        current_page: 1,
        items_per_page: 20
      }
    });
  }),

  http.get('/api/support/tickets/:id', ({ params }) => {
    const ticket = mockSupportTickets.find(t => t.id === params.id);
    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }
    return HttpResponse.json(ticket);
  }),

  http.post('/api/support/tickets', async ({ request }) => {
    const newTicket = await request.json() as any;
    const ticket = {
      id: Date.now().toString(),
      ...newTicket,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return HttpResponse.json(ticket, { status: 201 });
  }),

  // Marketing endpoints
  http.get('/api/marketing/campaigns', () => {
    return HttpResponse.json({
      data: mockMarketingCampaigns,
      metadata: {
        total_items: mockMarketingCampaigns.length,
        total_pages: 1,
        current_page: 1,
        items_per_page: 20
      }
    });
  }),

  http.post('/api/marketing/campaigns', async ({ request }) => {
    const newCampaign = await request.json() as any;
    const campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      spent: 0,
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversion_rate: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return HttpResponse.json(campaign, { status: 201 });
  }),

  http.get('/api/marketing/analytics', () => {
    return HttpResponse.json({
      overview: {
        total_campaigns: 1,
        active_campaigns: 1,
        total_budget: 10000,
        total_spent: 2500,
        avg_roi: 25.5,
        total_conversions: 125
      },
      by_channel: [
        {
          channel: 'email',
          campaigns: 1,
          spent: 2500,
          conversions: 125
        }
      ]
    });
  }),

  // Customer Segmentation endpoints
  http.get('/api/marketing/segments', () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'High Value Customers',
          description: 'Customers with high lifetime value',
          criteria: { total_spent: { operator: 'gt', value: '1000' } },
          is_active: true,
          estimated_size: 1250,
          created_at: '2023-11-01T00:00:00Z',
          updated_at: '2023-11-19T10:00:00Z'
        }
      ],
      total: 1
    });
  }),

  http.get('/api/marketing/segments/:id/analytics', () => {
    return HttpResponse.json({
      avg_order_value: 85.50,
      conversion_rate: 12.5,
      total_customers: 1250
    });
  }),

  // Fallback for unhandled requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.post('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.put('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.delete('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  })
];