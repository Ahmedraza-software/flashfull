#!/usr/bin/env python3
"""
Script to import vehicles from JSON data.
"""

import json
import requests
import sys

def import_vehicles(json_file_path, api_base_url="http://localhost:8000", token=None):
    """Import vehicles from JSON file to the API."""
    
    # Read the JSON file
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Loaded {len(data)} records from {json_file_path}")
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    # Prepare headers
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    # Send to API
    try:
        response = requests.post(
            f"{api_base_url}/api/vehicles/import-bulk",
            json=data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"Import completed:")
            print(f"  Imported: {result.get('imported', 0)}")
            print(f"  Skipped: {result.get('skipped', 0)}")
            if result.get('errors'):
                print(f"  Errors: {len(result['errors'])}")
                for error in result['errors']:
                    print(f"    - {error}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage: python import_vehicles.py <json_file> [auth_token]")
        print("Example: python import_vehicles.py vehicles.json eyJhbGciOiJIUzI1NiIs...")
        sys.exit(1)
    
    json_file = sys.argv[1]
    token = sys.argv[2] if len(sys.argv) > 2 else None
    import_vehicles(json_file, token=token)
