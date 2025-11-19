# Maya Admin API - Complete Endpoints Summary

**Base URL:** `http://localhost:8000/api/admin/v1`

## Module Structure (12 Unified Modules)

### 1. 🔐 Authentication (`/auth`)
- POST `/auth/login` - Admin login
- GET `/auth/me` - Get current admin profile
- POST `/auth/refresh` - Refresh access token
- POST `/auth/logout` - Logout

### 2. 👥 User Management (`/user-management`)

#### Admins (`/user-management/admins`)
- GET `/user-management/admins/dashboard` - Admin dashboard
- GET `/user-management/admins` - List all admin users
- POST `/user-management/admins` - Create admin user
- GET `/user-management/admins/{admin_user_id}` - Get admin details
- PUT `/user-management/admins/{admin_user_id}` - Update admin user
- DELETE `/user-management/admins/{admin_user_id}` - Delete admin user
- POST `/user-management/admins/{admin_user_id}/change-password` - Change password
- POST `/user-management/admins/{admin_user_id}/activate` - Activate admin
- POST `/user-management/admins/{admin_user_id}/deactivate` - Deactivate admin
- GET `/user-management/admins/{admin_user_id}/sessions` - Get admin sessions
- GET `/user-management/admins/{admin_user_id}/activity` - Get admin activity
- GET `/user-management/admins/roles/permissions` - List roles & permissions
- GET `/user-management/admins/sessions/active` - Get active sessions
- GET `/user-management/admins/audit/trail` - Get audit trail
- POST `/user-management/admins/permissions/assign` - Assign permissions
- POST `/user-management/admins/bulk-action` - Bulk actions
- GET `/user-management/admins/export/users` - Export admin users

#### Customers (`/user-management/customers`)
- GET `/user-management/customers` - List all customers
- POST `/user-management/customers` - Create customer
- GET `/user-management/customers/statistics` - Customer statistics
- GET `/user-management/customers/{customer_id}` - Get customer details
- PUT `/user-management/customers/{customer_id}` - Update customer
- DELETE `/user-management/customers/{customer_id}` - Delete customer
- PATCH `/user-management/customers/{customer_id}/status` - Update status
- PATCH `/user-management/customers/{customer_id}/verification` - Update verification
- GET `/user-management/customers/{customer_id}/sessions` - Get sessions
- GET `/user-management/customers/{customer_id}/activity` - Get activity
- POST `/user-management/customers/bulk-action` - Bulk actions

#### Providers (`/user-management/providers`)
- GET `/user-management/providers` - List all providers
- POST `/user-management/providers` - Create provider
- GET `/user-management/providers/statistics` - Provider statistics
- GET `/user-management/providers/search` - Search providers
- GET `/user-management/providers/{provider_id}` - Get provider details
- PUT `/user-management/providers/{provider_id}` - Update provider
- DELETE `/user-management/providers/{provider_id}` - Delete provider
- PATCH `/user-management/providers/{provider_id}/verification` - Update verification
- PATCH `/user-management/providers/{provider_id}/status` - Update status
- PATCH `/user-management/providers/{provider_id}/business-hours` - Update business hours

##### Salon Providers (`/user-management/providers/salon-providers`)
- POST `/user-management/providers/salon-providers` - Create salon provider
- GET `/user-management/providers/salon-providers` - List salon providers
- GET `/user-management/providers/salon-providers/{salon_id}` - Get salon details
- PUT `/user-management/providers/salon-providers/{salon_id}` - Update salon
- DELETE `/user-management/providers/salon-providers/{salon_id}` - Delete salon
- PATCH `/user-management/providers/salon-providers/{salon_id}/verification` - Verify salon
- GET `/user-management/providers/salon-providers/{salon_id}/analytics` - Salon analytics
- GET `/user-management/providers/salon-providers/stats/overview` - Overview stats

##### Business Details (`/user-management/providers/business-details`)
- POST `/user-management/providers/business-details` - Create business detail
- GET `/user-management/providers/business-details` - List business details
- GET `/user-management/providers/business-details/{detail_id}` - Get detail
- PUT `/user-management/providers/business-details/{detail_id}` - Update detail
- DELETE `/user-management/providers/business-details/{detail_id}` - Delete detail
- POST `/user-management/providers/business-details/{detail_id}/verify` - Verify business
- PATCH `/user-management/providers/business-details/{detail_id}/status` - Update status
- POST `/user-management/providers/business-details/{detail_id}/documents` - Upload documents
- GET `/user-management/providers/business-details/{detail_id}/documents` - List documents
- GET `/user-management/providers/business-details/{detail_id}/verification-history` - Verification history
- PUT `/user-management/providers/business-details/{detail_id}/tax-info` - Update tax info
- DELETE `/user-management/providers/business-details/{detail_id}/documents/{doc_id}` - Delete document
- POST `/user-management/providers/business-details/bulk-verify` - Bulk verification
- GET `/user-management/providers/business-details/pending-verification` - Pending verifications
- GET `/user-management/providers/business-details/statistics` - Statistics

### 3. 💼 Business Operations (`/business-operations`)

#### Bookings (`/business-operations/bookings`)
- Available endpoints in booking_management module

#### Payments (`/business-operations/payments`)
- Available endpoints in payment_management module

#### Financial (`/business-operations/financial`)
- Available endpoints in financial_management module

#### Subscriptions (`/business-operations/subscriptions`)
- Available endpoints in subscription_management module

#### Addresses (`/business-operations/addresses`)
- Available endpoints in address_management module

### 4. 📝 Content Management (`/content-management`)

#### Courses (`/content-management/courses`)
- Available endpoints in course_management module

#### Businesses (`/content-management/businesses`)
- Available endpoints in business_management module

#### Reviews (`/content-management/reviews`)
- Available endpoints in review_management module

### 5. 📊 Analytics (`/analytics`)

#### Reports (`/analytics/reports`)
- Available endpoints in analytics_reports module

#### Platform (`/analytics/platform`)
- GET `/analytics/platform` - List platform analytics
- GET `/analytics/platform/summary` - Analytics summary
- GET `/analytics/platform/trends` - Analytics trends
- POST `/analytics/platform/calculate` - Calculate analytics
- DELETE `/analytics/platform/{analytics_id}` - Delete analytics record
- POST `/analytics/platform/export` - Export analytics data

### 6. 🎓 Academy Management (`/academy-management`)

#### Students (`/academy-management/students`)
- Available endpoints in academy_student_management module

#### Performance (`/academy-management/performance`)
- GET `/academy-management/performance` - List academy performance
- GET `/academy-management/performance/academy/{academy_id}` - Get academy performance
- GET `/academy-management/performance/academy/{academy_id}/trends` - Performance trends
- GET `/academy-management/performance/top-performers` - Top performing academies
- POST `/academy-management/performance/calculate` - Calculate performance
- POST `/academy-management/performance/export` - Export performance data

### 7. ⚙️ Services (`/services`)

#### Verification (`/services/verification`)
- Available endpoints in artist_verification module

#### Support (`/services/support`)
- Available endpoints in support_management module

#### Roles & Permissions (`/services/roles-permissions`)
- Available endpoints in roles_permissions module

### 8. 🔌 User Sessions (`/user-sessions`)

#### Admin Sessions (`/user-sessions/admins`)
- GET `/user-sessions/admins` - List admin sessions
- GET `/user-sessions/admins/stats` - Session statistics
- GET `/user-sessions/admins/active` - Active sessions
- GET `/user-sessions/admins/{session_id}` - Get session details
- POST `/user-sessions/admins/{session_id}/revoke` - Revoke session
- POST `/user-sessions/admins/user/{user_id}/revoke-all` - Revoke all user sessions

#### Provider Sessions (`/user-sessions/providers`)
- GET `/user-sessions/providers` - List provider sessions
- GET `/user-sessions/providers/stats` - Session statistics
- GET `/user-sessions/providers/active` - Active sessions
- GET `/user-sessions/providers/{session_id}` - Get session details
- POST `/user-sessions/providers/{session_id}/revoke` - Revoke session
- POST `/user-sessions/providers/user/{user_id}/revoke-all` - Revoke all user sessions

#### Customer Sessions (`/user-sessions/customers`)
- GET `/user-sessions/customers` - List customer sessions
- GET `/user-sessions/customers/stats` - Session statistics
- GET `/user-sessions/customers/active` - Active sessions
- GET `/user-sessions/customers/{session_id}` - Get session details
- POST `/user-sessions/customers/{session_id}/revoke` - Revoke session
- POST `/user-sessions/customers/user/{user_id}/revoke-all` - Revoke all user sessions

### 9. 📋 Audit Logs (`/audit-logs`)

#### Provider Logs (`/audit-logs/providers`)
- Available endpoints in provider_audit_logs module

#### Customer Logs (`/audit-logs/customers`)
- Available endpoints in customer_audit_logs module

#### Activity Logs (`/audit-logs/activity`)
- Available endpoints in user_activity_logs module

### 10. 📧 Campaigns (`/campaigns`)

#### Email Campaigns (`/campaigns/email`)
- POST `/campaigns/email` - Create email campaign
- GET `/campaigns/email` - List email campaigns
- GET `/campaigns/email/stats` - Campaign statistics
- GET `/campaigns/email/{campaign_id}` - Get campaign details
- PUT `/campaigns/email/{campaign_id}` - Update campaign
- DELETE `/campaigns/email/{campaign_id}` - Delete campaign
- POST `/campaigns/email/{campaign_id}/send` - Send campaign

#### SMS Campaigns (`/campaigns/sms`)
- POST `/campaigns/sms` - Create SMS campaign
- GET `/campaigns/sms` - List SMS campaigns
- GET `/campaigns/sms/stats` - Campaign statistics
- GET `/campaigns/sms/{campaign_id}` - Get campaign details
- PUT `/campaigns/sms/{campaign_id}` - Update campaign
- DELETE `/campaigns/sms/{campaign_id}` - Delete campaign
- POST `/campaigns/sms/{campaign_id}/send` - Send campaign

#### Email Templates (`/campaigns/templates`)
- POST `/campaigns/templates` - Create email template
- GET `/campaigns/templates` - List email templates
- GET `/campaigns/templates/categories` - Get template categories
- GET `/campaigns/templates/{template_id}` - Get template details
- PUT `/campaigns/templates/{template_id}` - Update template
- DELETE `/campaigns/templates/{template_id}` - Delete template
- POST `/campaigns/templates/{template_id}/clone` - Clone template
- POST `/campaigns/templates/{template_id}/preview` - Preview template

### 11. 📣 Marketing (`/marketing`)

#### Campaigns (`/marketing/campaigns`)
- Available endpoints in marketing_management module

#### PPC (`/marketing/ppc`)
- Available endpoints in ppc_campaigns module

#### Inquiries (`/marketing/inquiries`)
- Available endpoints in admission_inquiries module

#### Segments (`/marketing/segments`)
- Available endpoints in user_segments module

#### Promotions (`/marketing/promotions`)
- Available endpoints in promotions_marketing module

### 12. ⚙️ System (`/system`)

#### Configuration (`/system/configuration`)
- Available endpoints in system_configuration module

#### Notifications (`/system/notifications`)
- Available endpoints in system_notifications module

#### Feature Flags (`/system/feature-flags`)
- Available endpoints in feature_flags module

#### OTP (`/system/otp`)
- Available endpoints in otp_management module

---

## Authentication

All endpoints except `/auth/login` require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

## Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

## Total Endpoints: 150+

The collection has been consolidated from 32 modules into 12 unified modules for better organization and maintainability.
