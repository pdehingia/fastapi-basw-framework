#!/usr/bin/env python3
"""
Test admin login endpoint
"""

import requests

def test_login():
    url = "http://localhost:8000/api/admin/auth/login"
    data = {
        "username": "admin@maya.com",
        "password": "admin123"
    }

    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(response.json())
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()