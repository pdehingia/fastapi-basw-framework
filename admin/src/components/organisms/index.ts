/**
 * Organisms Component Exports
 * Complex UI components composed of atoms and molecules
 */

export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as DashboardStats } from './DashboardStats';
export { default as NavigationMenu } from './NavigationMenu';
export { default as LoginForm } from './LoginForm';

// Data Table Components
export { default as DataTable } from './DataTable/DataTable';
export { default as EnhancedDataTable } from './EnhancedDataTable/EnhancedDataTable';

// Payment Management Components
export { default as PaymentManagement } from './PaymentManagement/PaymentManagement';
export { default as PaymentDetailPage } from './PaymentManagement/PaymentDetailPage';
export { default as PaymentDisputes } from './PaymentManagement/PaymentDisputes';

// Review Management Components
export { ReviewManagement } from './ReviewManagement/ReviewManagement';
export { default as ReviewDetailPage } from './ReviewManagement/ReviewDetailPage';
export { ReviewAnalyticsPage } from './ReviewManagement/ReviewAnalyticsPage';
export { FlaggedReviews } from './ReviewManagement/FlaggedReviews';

// Admin User Management Components
export { 
  AdminUsersListPage,
  AdminUserDetailPage, 
  AddAdminUserModal,
  AdminActivityLogs 
} from './AdminUserManagement';

// Support Management Components
export { 
  SupportTicketList,
  CreateTicketModal,
  TicketAssignment 
} from './SupportManagement';

// Marketing Management Components
export { 
  CampaignList,
  CreateCampaignForm,
  AnalyticsDashboard,
  CustomerSegmentation
} from './MarketingManagement';

// Settings Management Components
export { 
  SystemSettingsPage,
  EditSettingModal,
  SystemHealthWidget 
} from './SettingsManagement';

// Notification Management Components
export { 
  NotificationCenter,
  NotificationTemplateEditor 
} from './NotificationManagement';

// Content Management Components
export { 
  ContentManager
} from './ContentManagement';

// Note: ApiIntegrationManagement, AdvancedAnalytics components are .bak files - not exported
// TODO: Restore these components from .bak files if needed

// Export types
export type { HeaderProps } from './Header';
export type { SidebarProps } from './Sidebar';
export type { DashboardStatsProps, StatCard } from './DashboardStats';
export type { NavigationMenuProps, BreadcrumbItem, ActionButton } from './NavigationMenu';

// Data Table types
export type { DataTableProps } from './DataTable/DataTable';
export type { EnhancedDataTableProps } from './EnhancedDataTable/EnhancedDataTable';