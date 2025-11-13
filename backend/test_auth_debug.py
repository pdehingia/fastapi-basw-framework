"""Test support management endpoints to verify auth token format."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_support_endpoints():
    """Test support endpoints to see how auth works."""
    
    headers = {"Authorization": "Bearer admin-token-123"}
    
    # Test support endpoint (we know this works)
    response = client.get("/api/admin/v1/support/tickets", headers=headers)
    
    print(f"Support tickets status: {response.status_code}")
    if response.status_code == 401:
        print("❌ Support also returns 401 - this is the expected behavior")
        print(f"Response: {response.text}")
    elif response.status_code == 200:
        print("✅ Support works with this token!")
        print("Analytics should also work - something else is wrong")
    else:
        print(f"⚠️  Unexpected status: {response.text}")

if __name__ == "__main__":
    test_support_endpoints()