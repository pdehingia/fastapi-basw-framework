"""Simple test script to verify analytics endpoints are working."""

import httpx
import asyncio
from fastapi.testclient import TestClient
from app.main import app

# Create test client
client = TestClient(app)

def test_analytics_overview():
    """Test analytics overview endpoint."""
    
    # Headers with admin token (matching what other features expect)
    headers = {"Authorization": "Bearer admin-token-123"}
    
    # Test the overview endpoint - correct path is /api/admin/v1/analytics/...
    response = client.get("/api/admin/v1/analytics/overview", headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Analytics Overview endpoint working!")
        print(f"Dashboard stats found: {len(data.get('data', {}).get('dashboard_stats', {}))}")
        print(f"Sample stats keys: {list(data.get('data', {}).get('dashboard_stats', {}).keys())[:5]}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text}")

def test_user_analytics():
    """Test user analytics endpoint."""
    
    headers = {"Authorization": "Bearer admin-token-123"}
    response = client.get("/api/admin/v1/analytics/users", headers=headers)
    
    print(f"\nUser Analytics Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ User Analytics endpoint working!")
    else:
        print(f"❌ Error: {response.text}")

def test_booking_analytics():
    """Test booking analytics endpoint."""
    
    headers = {"Authorization": "Bearer admin-token-123"}
    response = client.get("/api/admin/v1/analytics/bookings", headers=headers)
    
    print(f"\nBooking Analytics Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Booking Analytics endpoint working!")
    else:
        print(f"❌ Error: {response.text}")

def test_financial_analytics():
    """Test financial analytics endpoint."""
    
    headers = {"Authorization": "Bearer admin-token-123"}
    response = client.get("/api/admin/v1/analytics/financial", headers=headers)
    
    print(f"\nFinancial Analytics Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Financial Analytics endpoint working!")
    else:
        print(f"❌ Error: {response.text}")

def test_platform_performance():
    """Test platform performance endpoint."""
    
    headers = {"Authorization": "Bearer admin-token-123"}
    response = client.get("/api/admin/v1/analytics/platform-performance", headers=headers)
    
    print(f"\nPlatform Performance Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Platform Performance endpoint working!")
    else:
        print(f"❌ Error: {response.text}")

if __name__ == "__main__":
    print("Testing Analytics & Reports Endpoints...")
    print("=" * 50)
    
    # Test all endpoints
    test_analytics_overview()
    test_user_analytics()
    test_booking_analytics()
    test_financial_analytics()
    test_platform_performance()
    
    print("\n" + "=" * 50)
    print("Analytics & Reports endpoint testing completed!")