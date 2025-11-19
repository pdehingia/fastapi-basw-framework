# Maya Admin Panel Postman Collection

This folder contains the complete, ready-to-use Postman collection for testing all Maya Platform Admin APIs.

## 📁 Files

- `Maya_Admin_Panel_Postman_Collection_Consolidated.json` - **NEW consolidated collection** (recommended)
- `Maya_Admin_Panel_Postman_Collection_Clean.json` - Previous collection (deprecated)

## 🚀 CONSOLIDATED & UPDATED!

**Major Update:** This collection has been updated to reflect the consolidated admin user management architecture:
- ✅ **Removed duplicate user_management endpoints** (was `/admin/v1/users/`)
- ✅ **Consolidated admin user management under `/admin-users/`**
- ✅ **All functionality preserved in single module** (15 endpoints total)
- ✅ **Eliminated architectural redundancy**

## 📋 Consolidation Changes

### Before (Duplicate Modules):
- `/admin/v1/users/*` - User management (11 endpoints)
- `/admin/v1/admin-users/*` - Admin user management (12 endpoints)
- **Issue**: Both modules managed the same `admin_users` database table

### After (Consolidated):
- `/admin/v1/admin-users/*` - **Single comprehensive module (15 endpoints)**
- **Benefits**: 
  - Single source of truth for admin user operations
  - Cleaner API structure
  - No more duplicate functionality

This collection is 100% self-contained with:
- ✅ **All environment variables** pre-configured in the collection
- ✅ **Realistic request bodies** with sample data for all POST/PUT endpoints  
- ✅ **Sample IDs** for testing GET/DELETE operations
- ✅ **Authentication flow** with automatic token management
- ✅ **No external files** or database setup required

## 🎯 Quick Start (30 seconds!)

1. **Import Consolidated Collection:**
   ```
   File → Import → Select Maya_Admin_Panel_Postman_Collection_Consolidated.json
   ```

2. **Start Testing:**
   - Run "Admin Login" request first (credentials already configured)
   - Access token will be automatically set for all other requests
   - Use `/admin/v1/admin-users/*` endpoints for all admin user management
   - Start testing any of the endpoints immediately!

## 🔐 Built-in Test Credentials

- **Admin Email**: admin@maya.com
- **Admin Password**: admin123
- **Sample User Email**: john.doe@example.com
- **Sample Phone**: +1-555-123-4567

## 📊 Pre-configured Sample Data

All POST/PUT requests include realistic examples:
- **👥 Admin User Management**: Admin creation with permissions, bulk actions, password changes
- **Booking Management**: Dispute handling, data export with filters
- **Payment Management**: Refund processing with detailed reasons
- **Review Management**: Bulk moderation with approval workflows  
- **Promotions**: Campaign creation with discount codes
- **Support**: Ticket replies with resolution details
- **Analytics**: Custom report generation with metrics

## 📚 Collection Structure (Consolidated)

- 🔐 **Authentication** (5 endpoints) - Login, logout, refresh, verify, sessions
- 👥 **👥 Consolidated Admin User Management** (15 endpoints) - **UPDATED**
  - Dashboard stats, CRUD operations, sessions, activity tracking
  - Password management, activation/deactivation
  - Audit trails, permissions, bulk actions, export
- 📅 **Booking Management** (7 endpoints) - View, update, disputes, exports
- 💳 **Payment Management** (10 endpoints) - Transactions, refunds, analytics  
- ⭐ **Review Management** (7 endpoints) - Moderation, responses, bulk actions
- 🎨 **Artist Verification** (6 endpoints) - Applications, approval workflows
- 🚀 **Promotions & Marketing** (12 endpoints) - Campaigns, coupons, email marketing
- 🎧 **Support Management** (15 endpoints) - Tickets, FAQ, knowledge base
- 📊 **Analytics & Reports** (8 endpoints) - Dashboards, custom reports, data export
- ⚙️ **System Configuration** (17 endpoints) - Settings, fees, templates, health checks
- 🏢 **Business Management** (12 endpoints) - Business operations
- 👤 **Customer Management** (8 endpoints) - Customer operations
- 🏪 **Provider Management** (7 endpoints) - Provider operations
- 💰 **Financial Management** (22 endpoints) - Financial operations

## 🎨 Sample Request Examples

### Admin User Creation:
```json
{
  "email": "new.admin@maya.com",
  "username": "newadmin", 
  "full_name": "New Admin User",
  "password": "SecurePassword123!",
  "role": "admin",
  "department": "Operations",
  "permissions": {
    "can_manage_users": true,
    "can_view_reports": true,
    "can_manage_system": false
  }
}
```

### Refund Processing:
```json
{
  "amount": 150.00,
  "reason": "Service cancellation due to provider illness",
  "refund_type": "full",
  "admin_notes": "Emergency cancellation - full refund approved",
  "processing_fee_waived": true
}
```

### Campaign Creation:
```json
{
  "name": "Holiday Makeup Special 2024",
  "discount_percentage": 25,
  "promo_code": "HOLIDAY25",
  "applicable_services": ["makeup", "hair-styling"]
}
```

## 🔧 Key Features

- ✅ **Bearer token authentication** with auto-management
- ✅ **Collection variables** for all sample IDs and credentials
- ✅ **Realistic test scenarios** with proper business logic
- ✅ **Error handling examples** with validation patterns
- ✅ **Comprehensive API coverage** across all admin functions
- ✅ **Production-ready examples** with proper data validation

## 💡 Testing Tips

1. **Start with Authentication**: Always run "Admin Login" first
2. **Use Sample IDs**: All endpoints use collection variables like `{{sample_admin_id}}`
3. **Admin User Management**: Use `/admin/v1/admin-users/*` for all admin user operations
4. **Realistic Workflows**: Follow logical sequences (create → update → delete)
5. **Error Testing**: Try invalid IDs to test error handling
6. **Bulk Operations**: Test bulk actions with multiple sample IDs

## 🔄 Migration from Old Collection

If you were using the previous collection with `/admin/v1/users/` endpoints:
1. **Import the new consolidated collection**
2. **Update any saved requests to use `/admin/v1/admin-users/`**
3. **All functionality remains the same, just different endpoint paths**

## 📝 Notes

- **Consolidated Architecture**: No more duplicate admin user modules
- **Self-Contained**: No external dependencies or setup required
- **Ready for Production**: All examples follow API best practices  
- **Extensible**: Easy to add new test cases or modify existing ones
- **Team Ready**: Share the single JSON file for instant team collaboration
- **Version Controlled**: All test data is embedded and tracked with the collection

## 🎯 Perfect for:

- **API Testing**: Comprehensive endpoint validation
- **Integration Testing**: Full workflow testing across services
- **Demo Purposes**: Realistic data for client demonstrations  
- **Development**: Quick API exploration and debugging
- **Team Collaboration**: Consistent test environment for all developers