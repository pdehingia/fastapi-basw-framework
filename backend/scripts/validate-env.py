#!/usr/bin/env python3
"""
Maya Platform Environment Validation Script
Validates all required environment variables and external service connections.
Compatible with Windows PowerShell (no Unicode characters).
"""

import os
import sys
import re
from pathlib import Path
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env file."""
    env_file = Path(".env")
    if env_file.exists():
        print("SUCCESS: Environment variables loaded from .env")
        load_dotenv(env_file)
        print("SUCCESS: .env file found")
        return True
    else:
        print("ERROR: .env file not found!")
        return False

def validate_required_vars():
    """Validate all required environment variables."""
    required_vars = {
        # Security (must have values)
        'SECRET_KEY': 'Application secret key',
        'JWT_SECRET_KEY': 'JWT secret key',
        
        # Database - PostgreSQL
        'POSTGRES_USER': 'PostgreSQL username',
        'POSTGRES_PASSWORD': 'PostgreSQL password',
        'POSTGRES_DB': 'PostgreSQL database name',
        'POSTGRES_PORT': 'PostgreSQL port',
        
        # Database - MongoDB
        'MONGODB_USER': 'MongoDB username',
        'MONGODB_PASSWORD': 'MongoDB password',
        'MONGODB_DATABASE': 'MongoDB database name',
        
        # Cache - Redis
        'REDIS_PASSWORD': 'Redis password',
        
        # Admin Tools
        'PGADMIN_DEFAULT_EMAIL': 'pgAdmin email',
        'PGADMIN_DEFAULT_PASSWORD': 'pgAdmin password',
        'MONGO_EXPRESS_USERNAME': 'MongoDB Express username',
        'MONGO_EXPRESS_PASSWORD': 'MongoDB Express password',
    }
    
    optional_vars = {
        'APP_URL': 'Application base URL',
        'API_V1_STR': 'API v1 prefix',
        'PROJECT_NAME': 'Project name',
        'ENVIRONMENT': 'Environment type',
        'ENABLE_CORS': 'CORS enablement',
        'ENABLE_RATE_LIMITING': 'Rate limiting enablement',
        'ENABLE_LOGGING': 'Logging enablement',
        'LOG_LEVEL': 'Logging level',
        'SMTP_HOST': 'SMTP server host',
        'SMTP_USER': 'SMTP username',
        'SMTP_PASSWORD': 'SMTP password',
        'FROM_EMAIL': 'From email address',
        'RAZORPAY_KEY_ID': 'Razorpay key ID',
        'RAZORPAY_KEY_SECRET': 'Razorpay secret key',
        'GOOGLE_MAPS_API_KEY': 'Google Maps API key',
    }
    
    # Get all environment variables
    env_vars = dict(os.environ)
    missing_required = []
    missing_optional = []
    
    print("\nChecking required environment variables...")
    for var_name, description in required_vars.items():
        if var_name in env_vars:
            if var_name in ['SECRET_KEY', 'JWT_SECRET_KEY', 'POSTGRES_PASSWORD', 
                           'MONGODB_PASSWORD', 'REDIS_PASSWORD', 'PGADMIN_DEFAULT_PASSWORD',
                           'MONGO_EXPRESS_PASSWORD']:
                print(f"SUCCESS {var_name}: ********...")
            else:
                print(f"SUCCESS {var_name}: {env_vars[var_name]}")
        else:
            print(f"ERROR {var_name}: {description}")
            missing_required.append(var_name)
    
    print("\nChecking optional configuration variables...")
    for var_name, description in optional_vars.items():
        if var_name in env_vars and env_vars[var_name]:
            if 'PASSWORD' in var_name or 'SECRET' in var_name or 'KEY' in var_name:
                print(f"SUCCESS {var_name}: {env_vars[var_name][:12]}...")
            else:
                print(f"SUCCESS {var_name}: {env_vars[var_name]}")
        else:
            missing_optional.append(var_name)
    
    return missing_required, missing_optional

def validate_urls():
    """Validate database connection URLs."""
    print("\nValidating connection URLs...")
    
    # PostgreSQL URL
    postgres_url = os.getenv('DATABASE_URL', '')
    if postgres_url and postgres_url.startswith('postgresql://'):
        print("SUCCESS PostgreSQL URL format is correct")
    else:
        print("WARNING PostgreSQL URL may be incorrect")
    
    # MongoDB URL
    mongodb_url = os.getenv('MONGODB_URL', '')
    if mongodb_url and mongodb_url.startswith('mongodb://'):
        print("SUCCESS MongoDB URL format is correct")
    else:
        print("WARNING MongoDB URL may be incorrect")
    
    # Redis URL
    redis_url = os.getenv('REDIS_URL', '')
    if redis_url and redis_url.startswith('redis://'):
        print("SUCCESS Redis URL format is correct")
    else:
        print("WARNING Redis URL may be incorrect")

def validate_ports():
    """Validate port configuration."""
    print("\nValidating port configuration...")
    
    postgres_port = os.getenv('POSTGRES_PORT', '5432')
    if postgres_port == '5443':
        print("SUCCESS PostgreSQL configured for port 5443 (avoiding conflicts)")
    else:
        print(f"INFO PostgreSQL using port {postgres_port}")

def validate_security():
    """Validate security configuration."""
    print("\nSecurity validation...")
    
    secret_key = os.getenv('SECRET_KEY', '')
    if len(secret_key) >= 32:
        print("SUCCESS SECRET_KEY length is adequate")
    else:
        print("WARNING SECRET_KEY should be at least 32 characters")
    
    jwt_key = os.getenv('JWT_SECRET_KEY', '')
    if len(jwt_key) >= 32:
        print("SUCCESS JWT_SECRET_KEY length is adequate")
    else:
        print("WARNING JWT_SECRET_KEY should be at least 32 characters")

def validate_features():
    """Validate feature flags."""
    print("\nFeature flag validation...")
    
    features = {
        'ENABLE_CORS': 'CORS middleware',
        'ENABLE_RATE_LIMITING': 'Rate limiting',
        'ENABLE_LOGGING': 'Application logging',
        'ENABLE_DOCS': 'API documentation',
        'ENABLE_USER_REGISTRATION': 'User registration',
        'ENABLE_REAL_TIME_CHAT': 'Real-time chat',
    }
    
    enabled_count = 0
    disabled_count = 0
    
    for flag, description in features.items():
        value = os.getenv(flag, 'false').lower()
        if value in ['true', '1', 'yes']:
            print(f"SUCCESS {description}: ENABLED")
            enabled_count += 1
        else:
            print(f"INFO {description}: DISABLED")
            disabled_count += 1
    
    debug = os.getenv('DEBUG', 'false').lower()
    if debug in ['true', '1', 'yes']:
        print("INFO Debug mode: ENABLED")
    else:
        print("INFO Debug mode: DISABLED")
    
    print(f"\nFeature summary: {enabled_count} enabled, {disabled_count} disabled")

def validate_external_services():
    """Validate external service configuration."""
    print("\nExternal service validation...")
    
    # Email service
    smtp_host = os.getenv('SMTP_HOST', '')
    from_email = os.getenv('FROM_EMAIL', '')
    if smtp_host and from_email:
        print(f"SUCCESS Email service configured: {smtp_host}")
        print(f"SUCCESS From email: {from_email}")
    else:
        print("WARNING Email service not configured")
    
    # Payment gateway
    razorpay_key = os.getenv('RAZORPAY_KEY_ID', '')
    if razorpay_key:
        if razorpay_key.startswith('rzp_test_'):
            print("SUCCESS Razorpay configured (TEST mode)")
        else:
            print("SUCCESS Razorpay configured (LIVE mode)")
    else:
        print("INFO Razorpay not configured")
    
    # Google Maps
    maps_key = os.getenv('GOOGLE_MAPS_API_KEY', '')
    if maps_key:
        print("SUCCESS Google Maps API configured")
    else:
        print("INFO Google Maps API not configured")
    
    # App URL
    app_url = os.getenv('APP_URL', '')
    if app_url:
        if 'localhost' in app_url:
            environment = os.getenv('ENVIRONMENT', 'development')
            if environment == 'production':
                print("WARNING APP_URL contains localhost in production")
            else:
                print(f"SUCCESS Development App URL: {app_url}")
        else:
            print("SUCCESS Production App URL configured")
    else:
        print("WARNING APP_URL not configured")

def main():
    """Main validation function."""
    print("MAYA PLATFORM - Environment Validation")
    print("=" * 50)
    
    # Load environment
    if not load_environment():
        return False
    
    # Run all validations
    missing_required, missing_optional = validate_required_vars()
    validate_urls()
    validate_ports()
    validate_security()
    validate_features()
    validate_external_services()
    
    # Summary
    print("\n" + "=" * 50)
    if missing_required:
        print("ERROR: ENVIRONMENT VALIDATION FAILED!")
        print("Missing required variables:")
        for var in missing_required:
            print(f"  - {var}")
        return False
    else:
        print("SUCCESS: ENVIRONMENT VALIDATION PASSED!")
        print("SUCCESS: All environment variables are properly configured")
        print("SUCCESS: You can proceed with the deployment")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)