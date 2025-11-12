#!/usr/bin/env python3
"""
Debug script to check environment variables in the container.
"""
import os

print("=== DEBUG: Environment Variables ===")
for key, value in os.environ.items():
    if key.upper().startswith(('PROJECT', 'API', 'JWT', 'SECRET', 'POSTGRES', 'REDIS', 'MONGODB')):
        print(f"{key}={value}")

print("\n=== All environment variables count ===")
print(f"Total environment variables: {len(os.environ)}")

print("\n=== Looking for specific variables ===")
required_vars = [
    'PROJECT_NAME', 'PROJECT_VERSION', 'API_HOST', 'API_PORT', 'API_V1_STR', 
    'JWT_SECRET_KEY', 'SECRET_KEY', 'POSTGRES_SERVER', 'POSTGRES_USER'
]

for var in required_vars:
    value = os.environ.get(var, "NOT SET")
    print(f"{var}: {value}")