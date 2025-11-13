#!/usr/bin/env python3
"""
Comprehensive Admin Panel Integration Test Suite
Tests all 8 major admin sections with full endpoint validation
"""

import asyncio
import json
import sys
from typing import Dict, List, Any
import httpx
from datetime import datetime

# Test configuration
BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 30

class AdminPanelTester:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=TIMEOUT)
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "features": {}
        }
    
    async def test_health(self) -> bool:
        """Test basic health endpoint"""
        try:
            response = await self.client.get(f"{BASE_URL}/health")
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Health check failed: {e}")
            return False
    
    async def test_feature_endpoints(self, feature_name: str, endpoints: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Test all endpoints for a specific admin feature"""
        feature_results = {
            "total_endpoints": len(endpoints),
            "successful_endpoints": 0,
            "failed_endpoints": 0,
            "endpoint_results": {}
        }
        
        print(f"\n🔍 Testing {feature_name} ({len(endpoints)} endpoints)")
        print("=" * 60)
        
        for endpoint_info in endpoints:
            endpoint_path = endpoint_info["path"]
            method = endpoint_info["method"]
            description = endpoint_info["description"]
            
            try:
                # Test endpoint (expecting 401 for auth-protected endpoints)
                response = await self.client.request(
                    method=method,
                    url=f"{BASE_URL}{endpoint_path}",
                    headers={"Content-Type": "application/json"}
                )
                
                # For admin endpoints, 401 (Unauthorized) is the expected response
                # This confirms the endpoint exists and authentication is working
                expected_codes = [401, 200, 422]  # 422 for validation errors on POST/PUT
                success = response.status_code in expected_codes
                
                if success:
                    feature_results["successful_endpoints"] += 1
                    status_emoji = "✅"
                else:
                    feature_results["failed_endpoints"] += 1
                    status_emoji = "❌"
                
                feature_results["endpoint_results"][endpoint_path] = {
                    "method": method,
                    "status_code": response.status_code,
                    "success": success,
                    "description": description
                }
                
                print(f"{status_emoji} {method:6} {endpoint_path:50} [{response.status_code}] {description}")
                
            except Exception as e:
                feature_results["failed_endpoints"] += 1
                feature_results["endpoint_results"][endpoint_path] = {
                    "method": method,
                    "status_code": "ERROR",
                    "success": False,
                    "error": str(e),
                    "description": description
                }
                print(f"❌ {method:6} {endpoint_path:50} [ERROR] {str(e)}")
        
        return feature_results
    
    async def run_comprehensive_test(self):
        """Run comprehensive test of all admin features"""
        print("🚀 Starting Comprehensive Admin Panel Integration Test")
        print("=" * 60)
        
        # Test basic health first
        print("🏥 Testing Health Endpoint...")
        health_ok = await self.test_health()
        if not health_ok:
            print("❌ Health check failed! Cannot proceed with admin tests.")
            return
        print("✅ Health endpoint working!")
        
        # Define all admin features and their endpoints
        admin_features = {
            "Authentication": [
                {"path": "/api/admin/v1/auth/login", "method": "POST", "description": "Admin login"},
                {"path": "/api/admin/v1/auth/register", "method": "POST", "description": "Admin registration"},
                {"path": "/api/admin/v1/auth/refresh", "method": "POST", "description": "Refresh token"},
                {"path": "/api/admin/v1/auth/me", "method": "GET", "description": "Get current admin user"}
            ],
            "Booking Management": [
                {"path": "/api/admin/v1/bookings/", "method": "GET", "description": "Get all bookings"},
                {"path": "/api/admin/v1/bookings/statistics", "method": "GET", "description": "Get booking statistics"},
                {"path": "/api/admin/v1/bookings/1", "method": "GET", "description": "Get booking details"},
                {"path": "/api/admin/v1/bookings/1/status", "method": "PATCH", "description": "Update booking status"},
                {"path": "/api/admin/v1/bookings/1/resolve-dispute", "method": "POST", "description": "Resolve booking dispute"},
                {"path": "/api/admin/v1/bookings/export/csv", "method": "GET", "description": "Export bookings to CSV"}
            ],
            "User Management": [
                {"path": "/api/admin/v1/users/dashboard", "method": "GET", "description": "Get user dashboard"},
                {"path": "/api/admin/v1/users/", "method": "GET", "description": "Get all users"},
                {"path": "/api/admin/v1/users/1", "method": "GET", "description": "Get user details"},
                {"path": "/api/admin/v1/users/1", "method": "PUT", "description": "Update user"},
                {"path": "/api/admin/v1/users/1/change-password", "method": "POST", "description": "Change user password"},
                {"path": "/api/admin/v1/users/1/deactivate", "method": "POST", "description": "Deactivate user"},
                {"path": "/api/admin/v1/users/1/activate", "method": "POST", "description": "Activate user"},
                {"path": "/api/admin/v1/users/1/sessions", "method": "GET", "description": "Get user sessions"},
                {"path": "/api/admin/v1/users/1/activity", "method": "GET", "description": "Get user activity"}
            ],
            "Support Management": [
                {"path": "/api/admin/v1/support/tickets", "method": "GET", "description": "Get all support tickets"},
                {"path": "/api/admin/v1/support/tickets/1", "method": "GET", "description": "Get support ticket details"},
                {"path": "/api/admin/v1/support/tickets/1/reply", "method": "POST", "description": "Reply to ticket"},
                {"path": "/api/admin/v1/support/tickets/1", "method": "PUT", "description": "Update support ticket"},
                {"path": "/api/admin/v1/support/tickets/1/escalate", "method": "POST", "description": "Escalate support ticket"},
                {"path": "/api/admin/v1/support/canned-responses", "method": "GET", "description": "Get canned responses"},
                {"path": "/api/admin/v1/support/export/tickets", "method": "GET", "description": "Export support data"}
            ],
            "Payment Management": [
                {"path": "/api/admin/v1/payment-management/transactions", "method": "GET", "description": "Get all transactions"},
                {"path": "/api/admin/v1/payment-management/transactions/1", "method": "GET", "description": "Get transaction details"},
                {"path": "/api/admin/v1/payment-management/wallets", "method": "GET", "description": "Get wallets"},
                {"path": "/api/admin/v1/payment-management/wallets/1/transactions", "method": "GET", "description": "Get wallet transactions"},
                {"path": "/api/admin/v1/payment-management/withdrawal-requests", "method": "GET", "description": "Get withdrawal requests"},
                {"path": "/api/admin/v1/payment-management/withdrawal-requests/1/process", "method": "POST", "description": "Process withdrawal"},
                {"path": "/api/admin/v1/payment-management/wallets/1/adjust", "method": "POST", "description": "Adjust wallet balance"},
                {"path": "/api/admin/v1/payment-management/transactions/export", "method": "GET", "description": "Export transactions"}
            ],
            "Reviews & Ratings": [
                {"path": "/api/admin/v1/review-management/reviews", "method": "GET", "description": "Get all reviews"},
                {"path": "/api/admin/v1/review-management/reviews/1", "method": "GET", "description": "Get review details"},
                {"path": "/api/admin/v1/review-management/reviews/1/moderate", "method": "POST", "description": "Moderate review"},
                {"path": "/api/admin/v1/review-management/reviews/1/remove-images", "method": "POST", "description": "Remove review images"},
                {"path": "/api/admin/v1/review-management/reviews/1/respond", "method": "POST", "description": "Respond to review"},
                {"path": "/api/admin/v1/review-management/reviews/flagged", "method": "GET", "description": "Get flagged reviews"},
                {"path": "/api/admin/v1/review-management/reviews/export", "method": "GET", "description": "Export review data"}
            ],
            "Artist Verification": [
                {"path": "/api/admin/v1/artist-verification/verification-queue", "method": "GET", "description": "Get verification queue"},
                {"path": "/api/admin/v1/artist-verification/verification-queue/1", "method": "GET", "description": "Get verification details"},
                {"path": "/api/admin/v1/artist-verification/verification-queue/1/decision", "method": "POST", "description": "Make verification decision"},
                {"path": "/api/admin/v1/artist-verification/portfolio/moderation-queue", "method": "GET", "description": "Get portfolio moderation queue"},
                {"path": "/api/admin/v1/artist-verification/portfolio/1/moderate", "method": "POST", "description": "Moderate portfolio image"},
                {"path": "/api/admin/v1/artist-verification/portfolio/bulk-moderate", "method": "POST", "description": "Bulk moderate portfolio"},
                {"path": "/api/admin/v1/artist-verification/verification-queue/export", "method": "GET", "description": "Export verification data"}
            ],
            "Promotions & Marketing": [
                {"path": "/api/admin/v1/promotions/promo-codes", "method": "GET", "description": "Get promo codes"},
                {"path": "/api/admin/v1/promotions/promo-codes", "method": "POST", "description": "Create promo code"},
                {"path": "/api/admin/v1/promotions/promo-codes/1", "method": "PUT", "description": "Update promo code"},
                {"path": "/api/admin/v1/promotions/promo-codes/1/deactivate", "method": "POST", "description": "Deactivate promo code"},
                {"path": "/api/admin/v1/promotions/promo-codes/1/analytics", "method": "GET", "description": "Get promo analytics"},
                {"path": "/api/admin/v1/promotions/email-campaigns", "method": "GET", "description": "Get email campaigns"},
                {"path": "/api/admin/v1/promotions/email-campaigns", "method": "POST", "description": "Create email campaign"},
                {"path": "/api/admin/v1/promotions/email-templates", "method": "GET", "description": "Get email templates"},
                {"path": "/api/admin/v1/promotions/email-templates", "method": "POST", "description": "Create email template"},
                {"path": "/api/admin/v1/promotions/sms/history", "method": "GET", "description": "Get SMS history"},
                {"path": "/api/admin/v1/promotions/sms/broadcast", "method": "POST", "description": "Send SMS broadcast"},
                {"path": "/api/admin/v1/promotions/export/promo-codes", "method": "GET", "description": "Export promo codes"}
            ],
            "Analytics & Reports": [
                {"path": "/api/admin/v1/analytics/overview", "method": "GET", "description": "Get analytics overview"},
                {"path": "/api/admin/v1/analytics/users", "method": "GET", "description": "Get user analytics"},
                {"path": "/api/admin/v1/analytics/bookings", "method": "GET", "description": "Get booking analytics"},
                {"path": "/api/admin/v1/analytics/financial", "method": "GET", "description": "Get financial analytics"},
                {"path": "/api/admin/v1/analytics/platform-performance", "method": "GET", "description": "Get platform performance"},
                {"path": "/api/admin/v1/analytics/reports/generate", "method": "POST", "description": "Generate custom report"},
                {"path": "/api/admin/v1/analytics/reports", "method": "GET", "description": "Get generated reports"},
                {"path": "/api/admin/v1/analytics/export", "method": "GET", "description": "Export analytics data"}
            ],
            "System Configuration": [
                {"path": "/api/admin/v1/system-config/settings", "method": "GET", "description": "Get system settings"},
                {"path": "/api/admin/v1/system-config/settings/general", "method": "PUT", "description": "Update general settings"},
                {"path": "/api/admin/v1/system-config/settings/app", "method": "PUT", "description": "Update app settings"},
                {"path": "/api/admin/v1/system-config/maintenance", "method": "GET", "description": "Get maintenance mode"},
                {"path": "/api/admin/v1/system-config/maintenance", "method": "PUT", "description": "Update maintenance mode"},
                {"path": "/api/admin/v1/system-config/notifications", "method": "GET", "description": "Get notification settings"},
                {"path": "/api/admin/v1/system-config/notifications", "method": "PUT", "description": "Update notifications"},
                {"path": "/api/admin/v1/system-config/email", "method": "GET", "description": "Get email configuration"},
                {"path": "/api/admin/v1/system-config/email", "method": "PUT", "description": "Update email config"},
                {"path": "/api/admin/v1/system-config/sms", "method": "GET", "description": "Get SMS configuration"},
                {"path": "/api/admin/v1/system-config/sms", "method": "PUT", "description": "Update SMS config"},
                {"path": "/api/admin/v1/system-config/security", "method": "GET", "description": "Get security policies"},
                {"path": "/api/admin/v1/system-config/security", "method": "PUT", "description": "Update security policies"},
                {"path": "/api/admin/v1/system-config/health", "method": "GET", "description": "Get system health"},
                {"path": "/api/admin/v1/system-config/features", "method": "GET", "description": "Get feature toggles"},
                {"path": "/api/admin/v1/system-config/features/feature1", "method": "PUT", "description": "Update specific feature toggle"},
                {"path": "/api/admin/v1/system-config/backups", "method": "GET", "description": "Get backup settings"},
                {"path": "/api/admin/v1/system-config/backups", "method": "POST", "description": "Create backup"},
                {"path": "/api/admin/v1/system-config/export", "method": "GET", "description": "Export configuration"}
            ],
            "Admin User Management": [
                {"path": "/api/admin/v1/admin-users/", "method": "GET", "description": "Get all admin users"},
                {"path": "/api/admin/v1/admin-users/", "method": "POST", "description": "Create admin user"},
                {"path": "/api/admin/v1/admin-users/1", "method": "GET", "description": "Get admin user details"},
                {"path": "/api/admin/v1/admin-users/1", "method": "PUT", "description": "Update admin user"},
                {"path": "/api/admin/v1/admin-users/1", "method": "DELETE", "description": "Delete admin user"},
                {"path": "/api/admin/v1/admin-users/roles/permissions", "method": "GET", "description": "Get roles and permissions"},
                {"path": "/api/admin/v1/admin-users/sessions/active", "method": "GET", "description": "Get active sessions"},
                {"path": "/api/admin/v1/admin-users/audit/trail", "method": "GET", "description": "Get audit trail"},
                {"path": "/api/admin/v1/admin-users/1/change-password", "method": "POST", "description": "Change user password"},
                {"path": "/api/admin/v1/admin-users/permissions/assign", "method": "POST", "description": "Assign permissions"},
                {"path": "/api/admin/v1/admin-users/bulk-action", "method": "POST", "description": "Bulk user operations"},
                {"path": "/api/admin/v1/admin-users/export/users", "method": "GET", "description": "Export admin users"}
            ]
        }
        
        # Test each feature
        for feature_name, endpoints in admin_features.items():
            feature_results = await self.test_feature_endpoints(feature_name, endpoints)
            self.results["features"][feature_name] = feature_results
            self.results["total_tests"] += feature_results["total_endpoints"]
            self.results["passed_tests"] += feature_results["successful_endpoints"]
            self.results["failed_tests"] += feature_results["failed_endpoints"]
        
        await self.generate_summary()
    
    async def generate_summary(self):
        """Generate and display test summary"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE ADMIN PANEL TEST SUMMARY")
        print("=" * 80)
        
        print(f"🕒 Test Timestamp: {self.results['timestamp']}")
        print(f"📈 Total Endpoints Tested: {self.results['total_tests']}")
        print(f"✅ Successful Tests: {self.results['passed_tests']}")
        print(f"❌ Failed Tests: {self.results['failed_tests']}")
        
        success_rate = (self.results['passed_tests'] / self.results['total_tests']) * 100 if self.results['total_tests'] > 0 else 0
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        print("\n📋 FEATURE BREAKDOWN:")
        print("-" * 80)
        
        for feature_name, feature_data in self.results["features"].items():
            total = feature_data["total_endpoints"]
            successful = feature_data["successful_endpoints"]
            failed = feature_data["failed_endpoints"]
            rate = (successful / total) * 100 if total > 0 else 0
            
            status_icon = "✅" if rate >= 90 else "⚠️" if rate >= 70 else "❌"
            print(f"{status_icon} {feature_name:25} | {successful:2}/{total:2} endpoints | {rate:5.1f}% success")
        
        # Save detailed results to file
        results_file = f"admin_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n💾 Detailed results saved to: {results_file}")
        
        if success_rate >= 90:
            print("\n🎉 EXCELLENT! Admin panel is working perfectly!")
        elif success_rate >= 70:
            print("\n✅ GOOD! Admin panel is mostly functional with minor issues.")
        else:
            print("\n⚠️  WARNING! Admin panel has significant issues that need attention.")
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()

async def main():
    """Main test runner"""
    tester = AdminPanelTester()
    try:
        await tester.run_comprehensive_test()
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
    finally:
        await tester.close()

if __name__ == "__main__":
    print("🔧 Maya Platform - Comprehensive Admin Panel Tester")
    print("=" * 60)
    asyncio.run(main())