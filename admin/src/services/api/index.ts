/**
 * API Services Index
 * Central export point for all API services
 */

// Core services with instances for immediate use
export { UserService, userService } from './users';
export { analyticsService } from './analytics';
export { AuthService, authService } from './auth';
export { ApiService, apiService } from './base';
export { BookingService, bookingService } from './bookings';
export { PaymentService, paymentService } from './payments';
export { AdminUserService, adminUserService } from './adminUsers';
export { SupportTicketService, supportTicketService } from './supportTickets';
export { SessionManagementService, sessionManagementService } from './sessions';
export { AcademyPerformanceService, academyPerformanceService } from './academy';
export { SystemConfigService, systemConfigService } from './systemConfig';
export { FinancialService, financialService } from './financial';
export { AuditLogsService, auditLogsService } from './auditLogs';
export { StudentsService, studentsService } from './students';
export { BusinessContentService, businessContentService } from './businessContent';
export { CampaignsService, campaignsService } from './campaigns';
export { SubscriptionsService, subscriptionsService } from './subscriptions';
export { AddressesService, addressesService } from './addresses';
export { FeatureFlagsService, featureFlagsService } from './featureFlags';
export { RolesPermissionsService, rolesPermissionsService } from './rolesPermissions';
export { OTPManagementService, otpManagementService } from './otpManagement';

// Legacy/Class-based services for compatibility
export { DashboardService } from './dashboard';  
export { default as SettingsService } from './settings';
export { NotificationService } from './notifications';
export { marketingService } from './marketing';

// Client utilities
export { apiClient, handleApiResponse, handleApiError } from './client';

// Convenience re-exports
export * from './auth';

// Import service instances for the services object
import { userService } from './users';
import { analyticsService } from './analytics';
import { authService } from './auth';
import { apiService } from './base';
import { bookingService } from './bookings';
import { paymentService } from './payments';
import { adminUserService } from './adminUsers';
import { supportTicketService } from './supportTickets';
import { sessionManagementService } from './sessions';
import { marketingService } from './marketing';
import { academyPerformanceService } from './academy';
import { systemConfigService } from './systemConfig';
import { financialService } from './financial';
import { auditLogsService } from './auditLogs';
import { studentsService } from './students';
import { businessContentService } from './businessContent';
import { campaignsService } from './campaigns';
import { subscriptionsService } from './subscriptions';
import { addressesService } from './addresses';
import { featureFlagsService } from './featureFlags';
import { rolesPermissionsService } from './rolesPermissions';
import { otpManagementService } from './otpManagement';

// Service instances for direct import (recommended pattern)
export const services = {
  user: userService,
  analytics: analyticsService,
  auth: authService,
  api: apiService,
  booking: bookingService,
  payment: paymentService,
  adminUser: adminUserService,
  supportTicket: supportTicketService,
  sessionManagement: sessionManagementService,
  marketing: marketingService,
  academyPerformance: academyPerformanceService,
  systemConfig: systemConfigService,
  financial: financialService,
  auditLogs: auditLogsService,
  students: studentsService,
  businessContent: businessContentService,
  campaigns: campaignsService,
  subscriptions: subscriptionsService,
  addresses: addressesService,
  featureFlags: featureFlagsService,
  rolesPermissions: rolesPermissionsService,
  otpManagement: otpManagementService,
} as const;
