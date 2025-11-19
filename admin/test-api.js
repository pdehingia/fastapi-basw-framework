/**
 * Simple API Test Script
 * Test Maya Admin Panel API endpoints
 */

const API_BASE = 'http://localhost:8000/api/admin/v1';

async function testAPI() {
  console.log('🧪 Testing Maya Admin API endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log(`   Response:`, data);
    }
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 2: Try accessing protected endpoint (should fail)
  try {
    console.log('2. Testing protected users endpoint (no auth - should fail)...');
    const usersResponse = await fetch(`${API_BASE}/users`);
    console.log(`   Status: ${usersResponse.status}`);
    if (!usersResponse.ok) {
      console.log(`   ✅ Correctly rejected unauthorized access`);
    }
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  // Test 3: Try login with dummy credentials
  try {
    console.log('3. Testing login endpoint...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=admin@maya.com&password=admin123',
    });
    console.log(`   Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Response:`, loginData);
    console.log();
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }

  console.log('🏁 API testing complete!');
}

testAPI();