#!/usr/bin/env python3
"""
Validate the Maya Admin Panel Postman Collection.
Checks JSON structure, endpoint definitions, and variable consistency.
"""

import json
import sys
from pathlib import Path


def validate_collection():
    """Validate the Postman collection for common issues."""
    collection_path = Path(__file__).parent / "Maya_Admin_Panel_Postman_Collection_Clean.json"
    
    print("🔍 Validating Maya Admin Panel Postman Collection...")
    print(f"📄 File: {collection_path}")
    
    # Check if file exists
    if not collection_path.exists():
        print("❌ Collection file not found!")
        return False
    
    try:
        # Load and parse JSON
        with open(collection_path, 'r', encoding='utf-8') as f:
            collection = json.load(f)
        
        print("✅ JSON structure is valid")
        
        # Basic structure validation
        required_fields = ['info', 'item', 'variable']
        missing_fields = [field for field in required_fields if field not in collection]
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        
        print("✅ Required fields present")
        
        # Count endpoints
        total_endpoints = 0
        folder_count = 0
        
        def count_items(items, depth=0):
            nonlocal total_endpoints, folder_count
            for item in items:
                if 'item' in item:  # It's a folder
                    folder_count += 1
                    print(f"{'  ' * depth}📁 {item['name']} ({len(item['item'])} items)")
                    count_items(item['item'], depth + 1)
                else:  # It's an endpoint
                    total_endpoints += 1
                    print(f"{'  ' * depth}🔗 {item['name']}")
        
        print("\n📊 Collection Structure:")
        count_items(collection['item'])
        
        print(f"\n📈 Summary:")
        print(f"   📁 Folders: {folder_count}")
        print(f"   🔗 Endpoints: {total_endpoints}")
        print(f"   🔧 Variables: {len(collection.get('variable', []))}")
        
        # Check for authentication setup
        auth_endpoints = []
        def find_auth_endpoints(items):
            for item in items:
                if 'item' in item:
                    find_auth_endpoints(item['item'])
                else:
                    if 'login' in item['name'].lower() or 'auth' in item['name'].lower():
                        auth_endpoints.append(item['name'])
        
        find_auth_endpoints(collection['item'])
        
        if auth_endpoints:
            print(f"\n🔐 Authentication endpoints found: {len(auth_endpoints)}")
            for endpoint in auth_endpoints:
                print(f"   - {endpoint}")
        else:
            print("\n⚠️  No authentication endpoints found")
        
        # Check variables
        variables = collection.get('variable', [])
        var_names = [var['key'] for var in variables]
        
        print(f"\n🔧 Collection Variables:")
        for var in variables:
            value_preview = str(var.get('value', ''))[:30] + "..." if len(str(var.get('value', ''))) > 30 else str(var.get('value', ''))
            print(f"   - {var['key']}: {value_preview}")
        
        # Check for access_token variable
        if 'access_token' in var_names:
            print("✅ Access token variable found")
        else:
            print("⚠️  Access token variable not found")
        
        # Check for base_url variable
        if 'base_url' in var_names:
            print("✅ Base URL variable found")
        else:
            print("⚠️  Base URL variable not found")
        
        print(f"\n✅ Collection validation completed successfully!")
        print(f"📊 Total: {folder_count} folders, {total_endpoints} endpoints, {len(variables)} variables")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        return False
    except Exception as e:
        print(f"❌ Validation error: {e}")
        return False


if __name__ == "__main__":
    success = validate_collection()
    sys.exit(0 if success else 1)