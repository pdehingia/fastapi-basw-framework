# 🏗️ **Maya Admin Dashboard - Development Standards & Checklist**
## **Atomic Design Principles & Modern React Best Practices**

**Document Version:** 2.0  
**Date:** November 14, 2025  
**Project:** Maya Platform Admin Dashboard  
**Technology Stack:** React 18 + TypeScript + Vite + Tailwind CSS + TanStack Router/Query + Zustand

---

## 🎯 **Streamlined Implementation Strategy**

### **Selected Tech Stack (Focused Approach)**
Based on requirements 1, 2, 4, 5, 9 + TanStack Router:

- **[1] React 18 + Concurrent Features** - Modern React with Suspense, useTransition
- **[2] Vite + TypeScript** - Lightning fast dev builds and type safety  
- **[4] Tailwind CSS + Headless UI** - Utility-first styling with accessible components
- **[5] TanStack Query v5** - Server state management and caching
- **[9] Zustand** - Simple global state management
- **[+] TanStack Router** - Type-safe file-based routing

### **Simplified Architecture Focus**
```
src/
├── routes/                  # TanStack Router file-based routing
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Dashboard home
│   ├── login.tsx           # Authentication
│   └── users/              # User management routes
│       ├── index.tsx       # Users list
│       └── $userId.tsx     # User detail
├── components/             # Essential UI components
│   ├── ui/                 # Core design system
│   │   ├── button.tsx      # Button component
│   │   ├── input.tsx       # Input components
│   │   ├── table.tsx       # Data table
│   │   └── form.tsx        # Form components
│   └── layout/             # Layout components
│       ├── header.tsx      # App header
│       ├── sidebar.tsx     # Navigation sidebar
│       └── main-layout.tsx # Main layout wrapper
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts         # Authentication hook
│   ├── use-users.ts        # User management hooks
│   └── use-bookings.ts     # Booking management hooks
├── lib/                    # Utilities & configuration
│   ├── api.ts              # API client setup
│   ├── auth.ts             # Auth utilities
│   └── utils.ts            # Utility functions
├── stores/                 # Zustand stores
│   ├── auth-store.ts       # Authentication state
│   └── ui-store.ts         # UI state (modals, etc.)
├── constants/              # API endpoints & routes
│   ├── api.ts              # API endpoint constants
│   └── permissions.ts      # Permission constants
└── types/                  # TypeScript definitions
    ├── auth.ts             # Auth types
    ├── user.ts             # User types
    └── api.ts              # API response types
```

### **Essential Features Checklist**
- [ ] **TanStack Router** file-based routing with type-safe navigation
- [ ] **httpOnly Cookie Authentication** with automatic token refresh
- [ ] **TanStack Query** for server state with background updates
- [ ] **Zustand** for client state (auth, UI preferences)
- [ ] **Tailwind + Headless UI** for accessible, responsive design
- [ ] **TypeScript** strict mode with comprehensive type safety

### **Implementation Examples**

#### **TanStack Router Setup**
```typescript
// routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout/main-layout'

export const Route = createRootRoute({
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
})

// routes/users/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { UsersList } from '@/components/users/users-list'

export const Route = createFileRoute('/users/')({
  component: UsersList,
})

// routes/users/$userId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { UserDetail } from '@/components/users/user-detail'

export const Route = createFileRoute('/users/$userId')({
  component: UserDetail,
})
```

#### **TanStack Query Integration**
```typescript
// hooks/use-users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API_ENDPOINTS } from '@/constants/api'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get(API_ENDPOINTS.USERS.LIST),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: CreateUserData) => 
      api.post(API_ENDPOINTS.USERS.CREATE, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

#### **Zustand Store Setup**
```typescript
// stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'maya-auth-storage',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
)

// stores/ui-store.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  modals: Record<string, boolean>
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  modals: {},
  openModal: (modalId) => set((state) => ({ 
    modals: { ...state.modals, [modalId]: true } 
  })),
  closeModal: (modalId) => set((state) => ({ 
    modals: { ...state.modals, [modalId]: false } 
  })),
}))
```

#### **Streamlined API Client**
```typescript
// lib/api.ts
import axios from 'axios'
import { API_ENDPOINTS } from '@/constants/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for auth
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      try {
        await api.post(API_ENDPOINTS.AUTH.REFRESH)
        return api.request(error.config)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
```

#### **Essential UI Components**
```typescript
// components/ui/button.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'border border-gray-300 bg-transparent hover:bg-gray-50': variant === 'outline',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)
```

### **Streamlined Development Workflow**

#### **Quick Start Checklist**
- [ ] **Project Setup** (30 minutes)
  - [ ] `npm create vite@latest maya-admin --template react-ts`
  - [ ] Install core dependencies: TanStack Router/Query, Zustand, Tailwind
  - [ ] Configure TypeScript strict mode
  - [ ] Setup folder structure

- [ ] **Essential Configuration** (1 hour)
  - [ ] TanStack Router file-based routing
  - [ ] Tailwind CSS + Headless UI setup
  - [ ] API client with httpOnly cookie auth
  - [ ] Basic error boundary

- [ ] **Core Components** (2-3 hours)
  - [ ] Button, Input, Table components
  - [ ] Layout components (Header, Sidebar)
  - [ ] Authentication components (Login form)

- [ ] **State Management** (1 hour)
  - [ ] Zustand auth store
  - [ ] TanStack Query setup
  - [ ] API endpoints constants

#### **4-Week Implementation Plan**

**Week 1: Foundation**
- [ ] Project setup with Vite + React + TypeScript
- [ ] TanStack Router configuration
- [ ] Basic UI components (Button, Input, Layout)
- [ ] Authentication setup with httpOnly cookies

**Week 2: User Management**
- [ ] User CRUD operations with TanStack Query
- [ ] Data table with sorting/filtering
- [ ] Form validation with react-hook-form + zod
- [ ] Toast notifications

**Week 3: Booking Management**
- [ ] Booking list and detail pages
- [ ] Status management and updates
- [ ] Calendar view (optional)
- [ ] Export functionality

**Week 4: Polish & Production**
- [ ] Error handling and loading states
- [ ] Responsive design optimization
- [ ] Basic testing setup
- [ ] Production build and deployment

### **Essential Dependencies**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0",
    "tailwindcss": "^3.0.0",
    "@headlessui/react": "^1.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^3.0.0",
    "axios": "^1.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

---

## 📋 **Executive Summary**

This document outlines the comprehensive development standards, architecture principles, and quality gates for the Maya Admin Dashboard frontend application. Following Atomic Design methodology and modern React best practices, this guide ensures scalable, maintainable, and high-performance code delivery.

### **Key Principles:**
- **Atomic Design:** Component hierarchy from atoms to pages
- **Type Safety:** Comprehensive TypeScript implementation
- **Performance First:** Optimized for speed and scalability
- **Accessibility:** WCAG 2.1 AA compliance
- **Testing:** 80%+ code coverage requirement
- **Security:** Enterprise-grade authentication and data protection

---

## 🏗️ **Project Architecture**

### **Folder Structure (Atomic Design)**
```
src/
├── components/               # Atomic Design Components
│   ├── atoms/               # Basic building blocks (20-30 components)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Label/
│   │   ├── Icon/
│   │   ├── Avatar/
│   │   ├── Badge/
│   │   ├── Spinner/
│   │   ├── Typography/
│   │   │   ├── Heading.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Caption.tsx
│   │   │   └── index.ts
│   │   └── index.ts         # Barrel export
│   ├── molecules/           # Simple combinations (15-20 components)
│   │   ├── FormField/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormField.test.tsx
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── SearchBox/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Dropdown/
│   │   ├── Pagination/
│   │   ├── UserCard/
│   │   ├── StatusBadge/
│   │   ├── ActionMenu/
│   │   └── index.ts
│   ├── organisms/           # Complex combinations (10-15 components)
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   ├── components/
│   │   │   │   ├── UserMenu.tsx
│   │   │   │   └── NotificationBell.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useTable.ts
│   │   │   │   ├── useSorting.ts
│   │   │   │   └── useFiltering.ts
│   │   │   ├── components/
│   │   │   │   ├── TableHeader.tsx
│   │   │   │   ├── TableBody.tsx
│   │   │   │   ├── TableFooter.tsx
│   │   │   │   └── FilterControls.tsx
│   │   │   └── index.ts
│   │   ├── LoginForm/
│   │   ├── UserManagementTable/
│   │   ├── BookingManagementTable/
│   │   ├── DashboardStats/
│   │   ├── NavigationMenu/
│   │   └── index.ts
│   ├── templates/           # Page layouts (5-7 templates)
│   │   ├── AuthLayout/
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── AuthLayout.test.tsx
│   │   │   └── index.ts
│   │   ├── DashboardLayout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── components/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MainContent.tsx
│   │   │   └── index.ts
│   │   ├── FullPageLayout/
│   │   ├── ModalLayout/
│   │   └── index.ts
│   └── pages/              # Specific implementations (20+ pages)
│       ├── LoginPage/
│       │   ├── LoginPage.tsx
│       │   ├── LoginPage.test.tsx
│       │   └── index.ts
│       ├── DashboardPage/
│       ├── UserManagement/
│       │   ├── UserListPage.tsx
│       │   ├── UserDetailPage.tsx
│       │   ├── CreateUserPage.tsx
│       │   └── index.ts
│       ├── BookingManagement/
│       ├── PaymentManagement/
│       ├── ReviewManagement/
│       └── index.ts
├── hooks/                   # Custom React hooks (15-20 hooks)
│   ├── auth/
│   │   ├── useAuth.ts
│   │   ├── useLogin.ts
│   │   ├── useLogout.ts
│   │   └── usePermissions.ts
│   ├── api/
│   │   ├── useApi.ts
│   │   ├── useQuery.ts
│   │   ├── useMutation.ts
│   │   └── useInfiniteQuery.ts
│   ├── ui/
│   │   ├── useModal.ts
│   │   ├── useToast.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useClickOutside.ts
│   └── index.ts
├── services/               # API & External services
│   ├── api/
│   │   ├── client.ts       # Axios instance configuration
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── users.ts        # User management endpoints
│   │   ├── bookings.ts     # Booking management endpoints
│   │   ├── payments.ts     # Payment management endpoints
│   │   ├── reviews.ts      # Review management endpoints
│   │   ├── analytics.ts    # Analytics endpoints
│   │   └── index.ts
│   ├── storage.ts          # LocalStorage/SessionStorage wrapper
│   ├── notifications.ts    # Toast notifications service
│   ├── validation.ts       # Form validation schemas
│   └── index.ts
├── stores/                 # State management (Zustand)
│   ├── authStore.ts        # Authentication state
│   ├── userStore.ts        # User management state
│   ├── uiStore.ts          # UI state (modals, loading, etc.)
│   ├── settingsStore.ts    # App settings and preferences
│   └── index.ts
├── types/                  # TypeScript definitions
│   ├── auth.types.ts       # Authentication types
│   ├── user.types.ts       # User management types
│   ├── booking.types.ts    # Booking management types
│   ├── payment.types.ts    # Payment types
│   ├── api.types.ts        # API response types
│   ├── common.types.ts     # Shared types
│   ├── component.types.ts  # Component prop types
│   └── index.ts
├── utils/                  # Utility functions
│   ├── formatters/
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   ├── number.ts
│   │   └── index.ts
│   ├── validators/
│   │   ├── auth.ts
│   │   ├── forms.ts
│   │   └── index.ts
│   ├── helpers/
│   │   ├── array.ts
│   │   ├── object.ts
│   │   ├── string.ts
│   │   └── index.ts
│   └── index.ts
├── constants/              # App constants (CRITICAL - API endpoints)
│   ├── api.ts             # API endpoint constants (NO MAGIC STRINGS)
│   ├── routes.ts          # Frontend route constants
│   ├── permissions.ts     # Permission constants for RBAC
│   ├── theme.ts           # Design tokens and theme constants
│   ├── validation.ts      # Validation error messages
│   └── index.ts           # Barrel exports
│   ├── helpers/
│   │   ├── array.ts
│   │   ├── object.ts
│   │   ├── string.ts
│   │   └── index.ts
│   └── index.ts
├── styles/                 # Global styles & themes
│   ├── globals.css         # Global CSS styles
│   ├── components.css      # Component-specific styles
│   ├── tailwind.css        # Tailwind imports
│   ├── theme.ts            # Theme configuration
│   └── tokens.ts           # Design tokens
└── __tests__/             # Test files
    ├── components/
    ├── hooks/
    ├── utils/
    ├── services/
    ├── __mocks__/
    ├── fixtures/
    └── setup.ts
```

---

## ✅ **Development Standards Checklist**

### **🎨 Atomic Design Implementation**

#### **1. Atoms (Basic Building Blocks)**
- [ ] **Button Component**
  - [ ] Variants: primary, secondary, outline, ghost, link, danger
  - [ ] Sizes: xs, sm, md, lg, xl
  - [ ] States: default, hover, active, disabled, loading
  - [ ] Icons support (left, right, only)
  - [ ] TypeScript props interface
  - [ ] Accessibility attributes (ARIA)
  - [ ] Unit tests (>90% coverage)
  - [ ] Storybook documentation

- [ ] **Input Components**
  - [ ] Text input with validation states
  - [ ] Password input with visibility toggle
  - [ ] Search input with clear functionality
  - [ ] Textarea with character count
  - [ ] Select dropdown with search
  - [ ] Checkbox and radio components
  - [ ] Date picker integration
  - [ ] File upload with drag & drop

- [ ] **Typography Components**
  - [ ] Heading (h1, h2, h3, h4, h5, h6)
  - [ ] Text (body, caption, small)
  - [ ] Link with external/internal variants
  - [ ] Code and pre-formatted text
  - [ ] Responsive font sizing
  - [ ] Consistent line heights

- [ ] **Visual Elements**
  - [ ] Avatar with fallback letters
  - [ ] Badge/Tag components
  - [ ] Icon component with library
  - [ ] Spinner/Loader with sizes
  - [ ] Progress bar component
  - [ ] Divider/Separator

#### **2. Molecules (Simple Combinations)**
- [ ] **Form Field**
  - [ ] Label + Input + Error message
  - [ ] Help text support
  - [ ] Required field indicator
  - [ ] Field validation integration
  - [ ] Accessible form associations

- [ ] **Search Box**
  - [ ] Input + Search icon + Clear button
  - [ ] Debounced search functionality
  - [ ] Keyboard navigation support
  - [ ] Recent searches dropdown

- [ ] **Card Component**
  - [ ] Header + Body + Footer structure
  - [ ] Action buttons integration
  - [ ] Expandable/collapsible variants
  - [ ] Loading state handling

- [ ] **Modal System**
  - [ ] Overlay + Content + Close button
  - [ ] Focus management and trapping
  - [ ] Escape key handling
  - [ ] Portal rendering
  - [ ] Size variants (sm, md, lg, xl, full)

#### **3. Organisms (Complex Components)**
- [ ] **Data Table**
  - [ ] Column sorting (asc, desc)
  - [ ] Row selection (single, multiple)
  - [ ] Pagination controls
  - [ ] Search and filtering
  - [ ] Column visibility toggle
  - [ ] Export functionality
  - [ ] Virtualization for large datasets
  - [ ] Responsive design

- [ ] **Navigation Components**
  - [ ] Main navigation menu
  - [ ] Breadcrumb navigation
  - [ ] User profile dropdown
  - [ ] Notification center
  - [ ] Quick search bar

- [ ] **Form Organisms**
  - [ ] Login form with validation
  - [ ] User creation/edit forms
  - [ ] Settings forms
  - [ ] Multi-step wizards
  - [ ] Dynamic form fields

#### **4. Templates (Layout Structures)**
- [ ] **Authentication Layout**
  - [ ] Centered form container
  - [ ] Background design
  - [ ] Responsive breakpoints
  - [ ] Loading states

- [ ] **Dashboard Layout**
  - [ ] Sidebar navigation
  - [ ] Header with user actions
  - [ ] Main content area
  - [ ] Mobile responsive

- [ ] **Modal Layout**
  - [ ] Overlay background
  - [ ] Centered content
  - [ ] Close actions

#### **5. Pages (Specific Implementations)**
- [ ] **Authentication Pages**
  - [ ] Login page
  - [ ] Forgot password page
  - [ ] Reset password page

- [ ] **Dashboard Pages**
  - [ ] Main dashboard overview
  - [ ] Analytics dashboard

- [ ] **Management Pages**
  - [ ] User management (list, detail, create, edit)
  - [ ] Booking management
  - [ ] Payment management
  - [ ] Review management

---

### **⚛️ Modern React Best Practices**

#### **Component Development**
- [ ] **Functional Components Only**
  - [ ] Use function declarations over arrow functions for components
  - [ ] TypeScript interfaces for all props
  - [ ] Default props using ES6 parameter defaults
  - [ ] Proper component naming (PascalCase)

- [ ] **Props & State Management**
  - [ ] Destructure props in function parameters
  - [ ] Use object destructuring for multiple state variables
  - [ ] Avoid prop drilling (max 2-3 levels)
  - [ ] Use composition over inheritance

- [ ] **Performance Optimization**
  - [ ] React.memo for pure components
  - [ ] useMemo for expensive calculations
  - [ ] useCallback for stable function references
  - [ ] Lazy loading for large components
  - [ ] Code splitting at route level

#### **Hook Implementation**
- [ ] **Custom Hooks Strategy**
  - [ ] Single responsibility principle
  - [ ] Reusable logic extraction
  - [ ] Proper naming convention (useXxx)
  - [ ] Return object destructuring

- [ ] **Effect Management**
  - [ ] Proper dependency arrays
  - [ ] Cleanup functions for subscriptions
  - [ ] Separate effects for different concerns
  - [ ] Error handling in effects

#### **State Management Architecture**
- [ ] **Zustand Store Design**
  - [ ] Slice pattern for large stores
  - [ ] Immer integration for immutability
  - [ ] DevTools integration
  - [ ] Persistence for user preferences

- [ ] **React Query Integration**
  - [ ] Query key factories
  - [ ] Error handling strategy
  - [ ] Optimistic updates
  - [ ] Background refetching
  - [ ] Cache invalidation patterns

---

### **📝 TypeScript Implementation**

#### **Configuration**
- [ ] **tsconfig.json Setup**
  - [ ] Strict mode enabled
  - [ ] Path mapping configured
  - [ ] Module resolution strategy
  - [ ] Build optimization settings

- [ ] **Type Definitions**
  - [ ] Props interfaces for all components
  - [ ] API response type definitions
  - [ ] Utility types usage (Pick, Omit, Partial)
  - [ ] Generic types for reusable components
  - [ ] Enum definitions for constants

#### **Code Organization**
- [ ] **Import/Export Strategy**
  - [ ] Barrel exports (index.ts files)
  - [ ] Type-only imports where applicable
  - [ ] Consistent import ordering
  - [ ] Absolute imports using path mapping

#### **Type Safety Enforcement**
- [ ] **Runtime Validation**
  - [ ] Zod schemas for form validation
  - [ ] API response validation
  - [ ] Environment variable validation
  - [ ] Props validation in development

---

### **🎯 Performance & Optimization**

#### **Bundle Optimization**
- [ ] **Code Splitting**
  - [ ] Route-based splitting
  - [ ] Component lazy loading
  - [ ] Dynamic imports for large libraries
  - [ ] Vendor chunk optimization

- [ ] **Tree Shaking**
  - [ ] ES modules usage
  - [ ] Side-effect free functions
  - [ ] Proper import strategies
  - [ ] Bundle analysis tools

#### **Runtime Performance**
- [ ] **List Optimization**
  - [ ] Virtual scrolling for large datasets
  - [ ] Infinite scrolling implementation
  - [ ] Memoized list items
  - [ ] Stable keys for React reconciliation

- [ ] **Image & Asset Optimization**
  - [ ] Lazy loading images
  - [ ] WebP format support
  - [ ] Responsive images
  - [ ] Asset compression

- [ ] **Network Optimization**
  - [ ] Request debouncing
  - [ ] Response caching
  - [ ] Request cancellation
  - [ ] Optimistic UI updates

---

### **🔒 Security Implementation**

#### **Authentication & Authorization**
- [ ] **JWT Management (CRITICAL - httpOnly Cookies ONLY)**
  - [ ] **httpOnly cookies MANDATORY** - Never use localStorage for tokens
  - [ ] **Secure flag enabled** in production environment
  - [ ] **SameSite=Strict** for CSRF protection
  - [ ] **Automatic token refresh** with refresh token rotation
  - [ ] **Token expiration handling** with user notification
  - [ ] **Secure logout** with server-side token invalidation
  - [ ] **No client-side token access** - tokens managed by browser

```typescript
// ❌ NEVER DO THIS - SECURITY VULNERABILITY
localStorage.setItem('token', jwtToken);
sessionStorage.setItem('token', jwtToken);

// ❌ NEVER DO THIS - EXPOSES TOKENS
const token = document.cookie.split('; ').find(row => row.startsWith('token='));

// ✅ CORRECT - httpOnly cookies managed by server
// Frontend only sends credentials: 'include'
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Automatically sends httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken, // CSRF protection
  },
  body: JSON.stringify({ email, password })
});

// ✅ CORRECT - All API calls include credentials
const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  withCredentials: true, // Include httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

- [ ] **Route Protection**
  - [ ] Protected route components
  - [ ] Role-based access control
  - [ ] Permission-based UI rendering
  - [ ] Redirect handling

#### **Data Security**
- [ ] **Input Validation & Sanitization**
  - [ ] Client-side validation (UX enhancement)
  - [ ] Server-side validation (Security enforcement)
  - [ ] XSS prevention with proper escaping
  - [ ] SQL injection prevention (parameterized queries)
  - [ ] File upload validation and scanning
  - [ ] Content Security Policy (CSP) headers

- [ ] **API Security Standards**
  - [ ] **HTTPS enforcement** - No HTTP in production
  - [ ] **Request signing** with HMAC where required
  - [ ] **Rate limiting** awareness and UI feedback
  - [ ] **Error message sanitization** - No sensitive data exposure
  - [ ] **CORS configuration** - Proper origin restrictions
  - [ ] **API versioning** - Consistent endpoint versioning

---

### **🎨 UI/UX Standards**

#### **Design System**
- [ ] **Color System**
  - [ ] Primary/secondary color palette
  - [ ] Semantic colors (success, warning, error)
  - [ ] Neutral gray scale
  - [ ] Color contrast ratios (WCAG AA)

- [ ] **Typography Scale**
  - [ ] Font family hierarchy
  - [ ] Font size scale (rem-based)
  - [ ] Line height ratios
  - [ ] Font weight variations

- [ ] **Spacing System**
  - [ ] 4px base unit
  - [ ] Consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64px)
  - [ ] Margin/padding utilities
  - [ ] Component spacing consistency

#### **Responsive Design**
- [ ] **Breakpoint Strategy**
  - [ ] Mobile-first approach
  - [ ] Breakpoints: 640px, 768px, 1024px, 1280px, 1536px
  - [ ] Flexible grid system
  - [ ] Container max-widths

- [ ] **Component Responsiveness**
  - [ ] Navigation collapse on mobile
  - [ ] Table horizontal scrolling
  - [ ] Modal full-screen on mobile
  - [ ] Touch-friendly interactive elements

#### **Accessibility (a11y)**
- [ ] **ARIA Implementation**
  - [ ] ARIA labels for interactive elements
  - [ ] ARIA roles for semantic meaning
  - [ ] ARIA states and properties
  - [ ] Screen reader compatibility

- [ ] **Keyboard Navigation**
  - [ ] Tab order management
  - [ ] Focus visible styles
  - [ ] Skip links implementation
  - [ ] Escape key handlers

- [ ] **Visual Accessibility**
  - [ ] Color contrast compliance (4.5:1)
  - [ ] Focus indicators
  - [ ] Text size scalability
  - [ ] Motion preferences respect

---

### **🧪 Testing Strategy**

#### **Unit Testing**
- [ ] **Component Testing**
  - [ ] React Testing Library setup
  - [ ] Props and state testing
  - [ ] Event handling testing
  - [ ] Accessibility testing
  - [ ] Snapshot testing for stable components

- [ ] **Hook Testing**
  - [ ] Custom hook testing with @testing-library/react-hooks
  - [ ] State transitions testing
  - [ ] Effect testing
  - [ ] Error handling testing

#### **Integration Testing**
- [ ] **User Flow Testing**
  - [ ] Authentication flow
  - [ ] CRUD operations
  - [ ] Form submissions
  - [ ] Navigation testing

- [ ] **API Integration**
  - [ ] Mock Service Worker (MSW) setup
  - [ ] API response mocking
  - [ ] Error state testing
  - [ ] Loading state testing

#### **End-to-End Testing**
- [ ] **Critical Path Testing**
  - [ ] User login/logout
  - [ ] User management workflows
  - [ ] Booking management workflows
  - [ ] Payment processing flows

#### **Performance Testing**
- [ ] **Lighthouse Audits**
  - [ ] Performance score >90
  - [ ] Accessibility score >95
  - [ ] Best practices score >95
  - [ ] SEO score >90 (if applicable)

---

### **📊 Code Quality & Tooling**

#### **Linting & Formatting**
- [ ] **ESLint Configuration**
  - [ ] React-specific rules
  - [ ] TypeScript rules
  - [ ] Accessibility rules (eslint-plugin-jsx-a11y)
  - [ ] React Hooks rules

- [ ] **Prettier Configuration**
  - [ ] Consistent code formatting
  - [ ] Integration with ESLint
  - [ ] Pre-commit formatting

#### **Git Workflow**
- [ ] **Commit Standards**
  - [ ] Conventional commit messages
  - [ ] Commit message validation
  - [ ] Pre-commit hooks (Husky)
  - [ ] Branch naming conventions

- [ ] **Code Review Process**
  - [ ] Pull request templates
  - [ ] Required reviewers
  - [ ] Status checks
  - [ ] Merge strategies

#### **Documentation**
- [ ] **Component Documentation**
  - [ ] Storybook integration
  - [ ] Props documentation
  - [ ] Usage examples
  - [ ] Design system documentation

- [ ] **Code Documentation**
  - [ ] JSDoc comments for complex functions
  - [ ] README files for modules
  - [ ] Architecture decision records
  - [ ] API documentation links

---

### **🚀 Build & Deployment**

#### **Build Configuration**
- [ ] **Vite Configuration**
  - [ ] Environment-specific builds
  - [ ] Asset optimization
  - [ ] Bundle analysis
  - [ ] Source maps for debugging

- [ ] **Environment Management**
  - [ ] Environment variables
  - [ ] Feature flags
  - [ ] API endpoint configuration
  - [ ] Build-time optimizations

#### **Deployment Pipeline**
- [ ] **CI/CD Setup**
  - [ ] Automated testing
  - [ ] Build verification
  - [ ] Deployment automation
  - [ ] Rollback capabilities

---

## 🎯 **Quality Gates**

### **Component Acceptance Criteria**
Each component must pass all of the following:

1. **✅ TypeScript Compilation**
   - No TypeScript errors
   - Strict mode compliance
   - Proper type definitions

2. **✅ Linting & Formatting**
   - ESLint: 0 errors, 0 warnings
   - Prettier: Consistent formatting
   - Import order compliance

3. **✅ Testing Requirements**
   - Unit tests: >90% coverage
   - Integration tests for complex components
   - Accessibility tests passing

4. **✅ Performance Benchmarks**
   - Bundle size impact analysis
   - Render performance testing
   - Memory leak detection

5. **✅ Accessibility Compliance**
   - WCAG 2.1 AA compliance
   - Screen reader testing
   - Keyboard navigation testing

6. **✅ Documentation Standards**
   - Storybook stories
   - Props documentation
   - Usage examples

7. **✅ Code Review Approval**
   - Peer review completion
   - Architecture review (for organisms+)
   - Security review (for auth components)

### **Module Acceptance Criteria**
Each feature module must pass:

1. **✅ Feature Completeness**
   - All user stories implemented
   - Error handling implemented
   - Loading states implemented

2. **✅ Integration Testing**
   - API integration verified
   - State management tested
   - Cross-component communication

3. **✅ Performance Validation**
   - Lighthouse scores met
   - Bundle size within limits
   - Runtime performance acceptable

4. **✅ Security Review**
   - Authentication tested
   - Authorization verified
   - Input validation confirmed

---

## 📈 **Metrics & KPIs**

### **Development Metrics**
- **Code Coverage:** >80% overall, >90% for critical components
- **Bundle Size:** <500KB main bundle, <100KB per lazy-loaded route
- **Build Time:** <2 minutes for full build
- **Test Execution:** <30 seconds for unit tests

### **Performance Metrics**
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Cumulative Layout Shift:** <0.1
- **Largest Contentful Paint:** <2.5s

### **Quality Metrics**
- **ESLint Errors:** 0 errors
- **TypeScript Errors:** 0 errors
- **Accessibility Violations:** 0 critical violations
- **Security Vulnerabilities:** 0 high/critical vulnerabilities

---

## 📅 **Implementation Timeline**

### **Phase 1: Foundation (Week 1)**
- [ ] Project setup and configuration
- [ ] Build system and tooling
- [ ] Design system tokens
- [ ] Basic atoms implementation
- [ ] Testing infrastructure

### **Phase 2: Core Components (Week 2)**
- [ ] Molecules implementation
- [ ] Form system
- [ ] Navigation components
- [ ] Layout templates

### **Phase 3: Feature Organisms (Week 3)**
- [ ] Data table organism
- [ ] Authentication organisms
- [ ] Dashboard organisms
- [ ] Management organisms

### **Phase 4: Page Implementation (Week 4-5)**
- [ ] Authentication pages
- [ ] Dashboard pages
- [ ] Management pages
- [ ] Integration testing

### **Phase 5: Polish & Optimization (Week 6)**
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Documentation completion
- [ ] Deployment preparation

---

## 🔍 **Review & Maintenance**

### **Weekly Reviews**
- [ ] Code quality metrics review
- [ ] Performance metrics analysis
- [ ] Security vulnerability scanning
- [ ] Documentation updates

### **Monthly Reviews**
- [ ] Dependency updates
- [ ] Architecture review
- [ ] User feedback integration
- [ ] Performance optimization

### **Quarterly Reviews**
- [ ] Technology stack evaluation
- [ ] Design system updates
- [ ] Accessibility audit
              - [ ] Security assessment

---

### **🔐 Enhanced Security Patterns**

#### **Advanced Input Validation & Sanitization**
```typescript
// utils/security-validation.ts
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Secure HTML sanitization
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link'],
  });
};

// Rate limiting for client-side protection
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  canMakeRequest(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}

// Secure file validation
export const validateSecureFile = z.object({
  file: z
    .instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File too large')
    .refine(file => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      return allowedTypes.includes(file.type);
    }, 'Invalid file type')
    .refine(async file => {
      // Additional security: Check file headers
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      return validateFileHeaders(uint8Array, file.type);
    }, 'File content does not match extension'),
});
```

### **📊 Performance & Monitoring Excellence**

#### **Advanced Performance Tracking**
```typescript
// hooks/usePerformanceMonitor.ts
export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Track performance metrics
      if (renderTime > 16) { // Flag slow renders (>1 frame)
        console.warn(`Slow render detected in ${componentName}:`, renderTime);
      }
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('component_performance', { componentName, renderTime });
      }
    };
  });
};

// Memory leak detection
export const useMemoryLeakDetection = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        const usage = (usedJSHeapSize / totalJSHeapSize) * 100;
        
        if (usage > 80) {
          console.warn('High memory usage detected:', usage);
        }
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
};
```

#### **Smart Error Boundary with Fallback UI**
```typescript
// components/SmartErrorBoundary.tsx
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

export class SmartErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    
    // Auto-retry for network errors
    if (this.isNetworkError(error) && this.retryCount < this.maxRetries) {
      setTimeout(() => {
        this.retryCount++;
        this.setState({ hasError: false, error: null });
      }, 1000 * this.retryCount); // Exponential backoff
    }
  }

  private isNetworkError = (error: Error): boolean => {
    return error.message.includes('fetch') || error.message.includes('network');
  };

  private retry = () => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} retry={this.retry} />;
    }
    
    return this.props.children;
  }
}
```

### **🚀 Advanced Development Patterns**

#### **Micro-Frontend Architecture Support**
```typescript
// utils/micro-frontend.ts
interface MicroFrontendConfig {
  name: string;
  url: string;
  scope: string;
  module: string;
}

export class MicroFrontendLoader {
  private static loadedModules = new Map<string, any>();

  static async loadMicroFrontend(config: MicroFrontendConfig) {
    if (this.loadedModules.has(config.name)) {
      return this.loadedModules.get(config.name);
    }

    // Dynamic import for micro-frontend
    const script = document.createElement('script');
    script.src = config.url;
    script.async = true;
    
    return new Promise((resolve, reject) => {
      script.onload = async () => {
        try {
          const container = (window as any)[config.scope];
          const factory = await container.get(config.module);
          const module = factory();
          
          this.loadedModules.set(config.name, module);
          resolve(module);
        } catch (error) {
          reject(error);
        }
      };
      
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
```

#### **Advanced Caching with Service Worker Integration**
```typescript
// utils/advanced-cache.ts
interface CacheStrategy {
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  ttl: number;
  maxEntries: number;
}

export class AdvancedCache {
  private static strategies = new Map<string, CacheStrategy>();

  static configure(pattern: string, strategy: CacheStrategy) {
    this.strategies.set(pattern, strategy);
  }

  static async get<T>(key: string): Promise<T | null> {
    if ('caches' in window) {
      const cache = await caches.open('maya-admin-v1');
      const response = await cache.match(key);
      
      if (response) {
        return response.json();
      }
    }
    
    // Fallback to localStorage
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  static async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const expiryTime = ttl ? Date.now() + ttl : undefined;
    const cacheData = { data, expiryTime };

    if ('caches' in window) {
      const cache = await caches.open('maya-admin-v1');
      const response = new Response(JSON.stringify(cacheData));
      await cache.put(key, response);
    } else {
      localStorage.setItem(key, JSON.stringify(cacheData));
    }
  }
}
```

---

### **📡 API Integration & Constants Management**

#### **API Constants Structure (MANDATORY - NO MAGIC STRINGS)**
```typescript
// constants/api.ts - Single source of truth for all API endpoints
export const API_BASE_URL = {
  DEVELOPMENT: 'http://localhost:8000',
  STAGING: 'https://api-staging.maya.com',
  PRODUCTION: 'https://api.maya.com',
} as const;

export const API_ENDPOINTS = {
  // Authentication & Authorization
  AUTH: {
    LOGIN: '/api/admin/v1/auth/login',
    LOGOUT: '/api/admin/v1/auth/logout',
    REFRESH: '/api/admin/v1/auth/refresh',
    PROFILE: '/api/admin/v1/auth/me',
    CHANGE_PASSWORD: '/api/admin/v1/auth/change-password',
    FORGOT_PASSWORD: '/api/admin/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/admin/v1/auth/reset-password',
  },
  
  // User Management
  USERS: {
    LIST: '/api/admin/v1/users',
    DETAIL: (id: string) => `/api/admin/v1/users/${id}`,
    CREATE: '/api/admin/v1/users',
    UPDATE: (id: string) => `/api/admin/v1/users/${id}`,
    DELETE: (id: string) => `/api/admin/v1/users/${id}`,
    BULK_ACTIONS: '/api/admin/v1/users/bulk',
    EXPORT: '/api/admin/v1/users/export',
    IMPORT: '/api/admin/v1/users/import',
    ACTIVATE: (id: string) => `/api/admin/v1/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/api/admin/v1/users/${id}/deactivate`,
  },
  
  // Booking Management
  BOOKINGS: {
    LIST: '/api/admin/v1/bookings',
    DETAIL: (id: string) => `/api/admin/v1/bookings/${id}`,
    CREATE: '/api/admin/v1/bookings',
    UPDATE: (id: string) => `/api/admin/v1/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/api/admin/v1/bookings/${id}/status`,
    CANCEL: (id: string) => `/api/admin/v1/bookings/${id}/cancel`,
    RESOLVE_DISPUTE: (id: string) => `/api/admin/v1/bookings/${id}/resolve-dispute`,
    EXPORT: '/api/admin/v1/bookings/export',
    CALENDAR: '/api/admin/v1/bookings/calendar',
  },
  
  // Payment Management
  PAYMENTS: {
    TRANSACTIONS: '/api/admin/v1/payment-management/transactions',
    TRANSACTION_DETAIL: (id: string) => `/api/admin/v1/payment-management/transactions/${id}`,
    WITHDRAWAL_REQUESTS: '/api/admin/v1/payment-management/withdrawal-requests',
    PROCESS_WITHDRAWAL: (id: string) => `/api/admin/v1/payment-management/withdrawals/${id}/process`,
    PAYMENT_METHODS: '/api/admin/v1/payment-management/payment-methods',
    REFUNDS: '/api/admin/v1/payment-management/refunds',
    PROCESS_REFUND: (id: string) => `/api/admin/v1/payment-management/refunds/${id}/process`,
  },
  
  // Review Management
  REVIEWS: {
    LIST: '/api/admin/v1/review-management/reviews',
    DETAIL: (id: string) => `/api/admin/v1/review-management/reviews/${id}`,
    MODERATE: (id: string) => `/api/admin/v1/review-management/reviews/${id}/moderate`,
    FLAGGED: '/api/admin/v1/review-management/reviews/flagged',
    APPROVE: (id: string) => `/api/admin/v1/review-management/reviews/${id}/approve`,
    REJECT: (id: string) => `/api/admin/v1/review-management/reviews/${id}/reject`,
  },
  
  // Analytics & Reporting
  ANALYTICS: {
    OVERVIEW: '/api/admin/v1/analytics/overview',
    USER_ANALYTICS: '/api/admin/v1/analytics/users',
    BOOKING_ANALYTICS: '/api/admin/v1/analytics/bookings',
    REVENUE_REPORTS: '/api/admin/v1/analytics/revenue',
    CUSTOM_REPORTS: '/api/admin/v1/analytics/custom-reports',
    EXPORT_REPORT: (reportId: string) => `/api/admin/v1/analytics/reports/${reportId}/export`,
  },
  
  // System Management
  SYSTEM: {
    HEALTH: '/api/admin/v1/system/health',
    SETTINGS: '/api/admin/v1/system/settings',
    LOGS: '/api/admin/v1/system/logs',
    NOTIFICATIONS: '/api/admin/v1/system/notifications',
    AUDIT_LOGS: '/api/admin/v1/system/audit-logs',
  },
} as const;

// Usage Examples - ALWAYS use constants, never magic strings
import { API_ENDPOINTS } from '@/constants/api';

// ❌ BAD - Magic strings are error-prone and unmaintainable
const response = await fetch('/api/admin/v1/users');
const userDetail = await fetch(`/api/admin/v1/users/${userId}`);

// ✅ GOOD - Type-safe, maintainable, and IDE-friendly
const response = await fetch(API_ENDPOINTS.USERS.LIST);
const userDetail = await fetch(API_ENDPOINTS.USERS.DETAIL(userId));
const bookingStatus = await fetch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(bookingId));
```

#### **Route Constants for Frontend Navigation**
```typescript
// constants/routes.ts
export const ROUTES = {
  // Authentication Routes
  AUTH: {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    CHANGE_PASSWORD: '/change-password',
  },
  
  // Dashboard Routes
  DASHBOARD: {
    HOME: '/dashboard',
    ANALYTICS: '/dashboard/analytics',
    OVERVIEW: '/dashboard/overview',
  },
  
  // User Management Routes
  USER_MANAGEMENT: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users/create',
    EDIT: (id: string) => `/users/${id}/edit`,
    PROFILE: (id: string) => `/users/${id}/profile`,
  },
  
  // Booking Management Routes
  BOOKING_MANAGEMENT: {
    LIST: '/bookings',
    DETAIL: (id: string) => `/bookings/${id}`,
    CALENDAR: '/bookings/calendar',
    DISPUTES: '/bookings/disputes',
  },
  
  // Payment Management Routes
  PAYMENT_MANAGEMENT: {
    TRANSACTIONS: '/payments/transactions',
    WITHDRAWALS: '/payments/withdrawals',
    REFUNDS: '/payments/refunds',
    REPORTS: '/payments/reports',
  },
  
  // Settings Routes
  SETTINGS: {
    PROFILE: '/settings/profile',
    PREFERENCES: '/settings/preferences',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
  },
} as const;
```

#### **Permission Constants for RBAC**
```typescript
// constants/permissions.ts
export const PERMISSIONS = {
  // User Management Permissions
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    EXPORT: 'users.export',
    IMPORT: 'users.import',
    ACTIVATE: 'users.activate',
    DEACTIVATE: 'users.deactivate',
  },
  
  // Booking Management Permissions
  BOOKINGS: {
    VIEW: 'bookings.view',
    CREATE: 'bookings.create',
    UPDATE: 'bookings.update',
    CANCEL: 'bookings.cancel',
    RESOLVE_DISPUTES: 'bookings.resolve_disputes',
    EXPORT: 'bookings.export',
  },
  
  // Payment Management Permissions
  PAYMENTS: {
    VIEW_TRANSACTIONS: 'payments.view_transactions',
    PROCESS_WITHDRAWALS: 'payments.process_withdrawals',
    PROCESS_REFUNDS: 'payments.process_refunds',
    VIEW_REPORTS: 'payments.view_reports',
  },
  
  // Analytics Permissions
  ANALYTICS: {
    VIEW: 'analytics.view',
    EXPORT: 'analytics.export',
    CUSTOM_REPORTS: 'analytics.custom_reports',
    SYSTEM_METRICS: 'analytics.system_metrics',
  },
  
  // System Administration
  SYSTEM: {
    MANAGE_SETTINGS: 'system.manage_settings',
    VIEW_LOGS: 'system.view_logs',
    MANAGE_NOTIFICATIONS: 'system.manage_notifications',
    VIEW_AUDIT_LOGS: 'system.view_audit_logs',
  },
} as const;

// Type-safe permission checking
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];
```

#### **API Client Configuration with Security**
```typescript
// services/api/client.ts - Secure API client setup
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/constants/api';

// Create secure axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // CRITICAL: Enables httpOnly cookies
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for security headers
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token if available (from meta tag or cookie)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Add correlation ID for request tracking
    config.headers['X-Correlation-ID'] = crypto.randomUUID();
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest) {
      try {
        // Attempt token refresh (httpOnly cookies handle this automatically)
        await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

#### **Environment Variable Security**
```typescript
// utils/config.ts - Secure configuration management
interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  csrfHeader: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

// ❌ NEVER expose sensitive data in frontend env vars
// const SECRET_KEY = import.meta.env.VITE_SECRET_KEY; // Would be exposed to client
// const DATABASE_URL = import.meta.env.VITE_DATABASE_URL; // Would be exposed to client

// ✅ Only expose necessary public configuration
export const appConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as AppConfig['environment'],
  csrfHeader: import.meta.env.VITE_CSRF_TOKEN_HEADER || 'X-CSRF-Token',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

// Validate configuration at startup
if (!appConfig.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required');
}
```

#### **Input Sanitization Utilities**
```typescript
// utils/security.ts - Security utility functions
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
  });
};

export const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  if (file.size > appConfig.maxFileSize) {
    return { valid: false, error: 'File size exceeds maximum allowed size' };
  }
  
  if (!appConfig.allowedFileTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  return { valid: true };
};

// Rate limiting utility for client-side protection
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  canMakeRequest(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}
```

---## 📚 **Resources & References**

### **Documentation**
- [React 18 Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### **Tools**
- [Storybook](https://storybook.js.org/) - Component documentation
- [Chromatic](https://www.chromatic.com/) - Visual testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [axe-core](https://github.com/dequelabs/axe-core) - Accessibility testing

### **Style Guides**
- [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Document Status:** ✅ Complete  
**Next Review Date:** December 14, 2025  
**Document Owner:** Maya Development Team  
**Approval:** Pending Architecture Review

---

*This document serves as the single source of truth for Maya Admin Dashboard frontend development standards. All team members must follow these guidelines to ensure consistent, high-quality code delivery.*