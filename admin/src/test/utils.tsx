/**
 * Test Utilities
 * Helper functions and custom render methods for testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, RouterProvider } from '@tanstack/react-router';
import userEvent from '@testing-library/user-event';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Create a mock router for testing
const createMockRouter = () => {
  const rootRoute = {
    id: '__root__',
    path: '/',
    component: () => React.createElement('div', { 'data-testid': 'mock-router' }),
  } as any;

  return new Router({
    routeTree: rootRoute,
    history: {
      location: { pathname: '/', search: '', hash: '', state: null },
      listen: () => () => {},
      push: () => {},
      replace: () => {},
      go: () => {},
      back: () => {},
      forward: () => {},
      createHref: (to: any) => String(to),
      block: () => () => {},
    } as any,
  });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  router?: Router<any, any>;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
    router = createMockRouter(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}>
        {children}
      </RouterProvider>
    </QueryClientProvider>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override render method
export { renderWithProviders as render };

// Custom matchers and utilities
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectNotToBeInDocument = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument();
};

// Mock functions for common use cases
export const mockApiCall = (response: any, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(response), delay);
  });
};

export const mockApiError = (error: string, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(error)), delay);
  });
};

// Toast mocking utilities
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
};

// Local storage mock utilities
export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Window location mock utilities
export const mockWindowLocation = {
  assign: vi.fn(),
  reload: vi.fn(),
  replace: vi.fn(),
};

// Form testing utilities
export const fillForm = async (user: any, formData: Record<string, string>) => {
  for (const [name, value] of Object.entries(formData)) {
    const field = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (field) {
      await user.clear(field);
      await user.type(field, value);
    }
  }
};

export const submitForm = async (user: any, formSelector = 'form') => {
  const form = document.querySelector(formSelector);
  if (form) {
    await user.click(form.querySelector('[type="submit"]') || form.querySelector('button[form]'));
  }
};

// Table testing utilities
export const getTableRows = (tableSelector = 'table') => {
  const table = document.querySelector(tableSelector);
  return table ? table.querySelectorAll('tbody tr') : [];
};

export const getTableCells = (rowIndex: number, tableSelector = 'table') => {
  const rows = getTableRows(tableSelector);
  return rows[rowIndex] ? rows[rowIndex].querySelectorAll('td') : [];
};

// Modal testing utilities
export const expectModalToBeOpen = (modalTitle?: string) => {
  const modal = document.querySelector('[role="dialog"]');
  expect(modal).toBeInTheDocument();
  
  if (modalTitle) {
    expect(modal).toHaveTextContent(modalTitle);
  }
};

export const expectModalToBeClosed = () => {
  const modal = document.querySelector('[role="dialog"]');
  expect(modal).not.toBeInTheDocument();
};

// Button testing utilities
export const expectButtonToBeDisabled = (buttonText: string) => {
  const button = document.querySelector(`button:contains("${buttonText}")`) as HTMLButtonElement;
  expect(button).toBeDisabled();
};

export const expectButtonToBeEnabled = (buttonText: string) => {
  const button = document.querySelector(`button:contains("${buttonText}")`) as HTMLButtonElement;
  expect(button).toBeEnabled();
};

// Loading state utilities
export const expectLoadingState = () => {
  const loadingIndicator = document.querySelector('[data-testid="loading"]') || 
                          document.querySelector('.animate-spin') ||
                          document.querySelector('text*="Loading"');
  expect(loadingIndicator).toBeInTheDocument();
};

export const expectNoLoadingState = () => {
  const loadingIndicator = document.querySelector('[data-testid="loading"]') || 
                          document.querySelector('.animate-spin');
  expect(loadingIndicator).not.toBeInTheDocument();
};

// Error state utilities
export const expectErrorMessage = (message: string) => {
  const errorElement = document.querySelector('[data-testid="error"]') ||
                      document.querySelector('.text-red-600') ||
                      document.querySelector('text*="Error"');
  expect(errorElement).toBeInTheDocument();
  expect(errorElement).toHaveTextContent(message);
};

// Custom assertions
expect.extend({
  toHaveFormValues(received: HTMLFormElement, expected: Record<string, any>) {
    const formData = new FormData(received);
    const actual: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      actual[key] = value;
    }
    
    const pass = Object.keys(expected).every(key => actual[key] === expected[key]);
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected form not to have values ${JSON.stringify(expected)}`
          : `Expected form to have values ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`,
    };
  },
});