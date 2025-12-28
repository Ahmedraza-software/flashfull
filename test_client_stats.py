#!/usr/bin/env python3
"""
Test script to get client statistics.
"""

import requests

def get_client_statistics(api_base_url="http://localhost:8000"):
    """Get client statistics."""
    try:
        response = requests.get(
            f"{api_base_url}/api/client-management/statistics",
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            stats = response.json()
            print("Client Statistics KPI Dashboard")
            print("=" * 40)
            print(f"Total Clients: {stats.get('total_clients', 0)}")
            print()
            
            print("By Status:")
            print(f"  Active: {stats['by_status'].get('active', 0)}")
            print(f"  Inactive: {stats['by_status'].get('inactive', 0)}")
            print()
            
            print("By Type:")
            print(f"  Corporate: {stats['by_type'].get('corporate', 0)}")
            print(f"  Government: {stats['by_type'].get('government', 0)}")
            print(f"  Individual: {stats['by_type'].get('individual', 0)}")
            print()
            
            print("By Location:")
            print(f"  Islamabad: {stats['by_location'].get('islamabad', 0)}")
            print(f"  Rawalpindi: {stats['by_location'].get('rawalpindi', 0)}")
            print(f"  Lahore: {stats['by_location'].get('lahore', 0)}")
            print(f"  Karachi: {stats['by_location'].get('karachi', 0)}")
            print(f"  Peshawar: {stats['by_location'].get('peshawar', 0)}")
            print()
            
            print("By Industry:")
            print(f"  Bank: {stats['by_industry'].get('bank', 0)}")
            print(f"  Commercial: {stats['by_industry'].get('commercial', 0)}")
            print(f"  Educational: {stats['by_industry'].get('educational', 0)}")
            print(f"  Hospital: {stats['by_industry'].get('hospital', 0)}")
            
        else:
            print(f"Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    get_client_statistics()
