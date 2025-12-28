#!/usr/bin/env python3
"""
Script to create client test data and import it.
"""

import json
import requests

def create_clients_json():
    """Create the clients test JSON file."""
    clients = [
        {"#": "1", "Client Name": "Askari Bank Limited, Sector I-8 Markaz Branch, Islamabad."},
        {"#": "2", "Client Name": "Askari Bank Limited, (IBB) Khanna Pul Branch, Islamabad."},
        {"#": "3", "Client Name": "Askari Bank Limited, Desto Chattar, Islamabad."},
        {"#": "4", "Client Name": "Sinopec International Petroleum Service Corporation (Pakistan Branch) House No. 11, Street No. 49, Sector F-6/4, Islamabad."},
        {"#": "5", "Client Name": "Embassy of the State of Kuwait House No. 28, Margalla Road, Sector F-7/3, Islamabad."},
        {"#": "6", "Client Name": "Mr. Kazeem Tariq Khan House No. 29, Street No. 39, Sector F-6/1, Islamabad."},
        {"#": "7", "Client Name": "International Interiors (Pvt.) Ltd Rafique Centre, Plot 8-A, I & T Centre, Sector G-6, Islamabad."},
        {"#": "8", "Client Name": "Sarhad University Islamabad Campus T-Chowk, G.T Road, Islamabad."},
        {"#": "9", "Client Name": "Save the Children Pakistan Country Office, 1st Floor, North Wing, NTC Headquarters, Sector G-5/2, Islamabad."},
        {"#": "10", "Client Name": "Quaid Model School, Near Nirala Chowk, Mughalabad, Rawalpindi Cantt."}
    ]
    
    with open('clients_test.json', 'w') as f:
        json.dump(clients, f, indent=2)
    
    print("Created clients_test.json with 10 clients")
    return clients

def import_clients(clients_data, api_base_url="http://localhost:8000"):
    """Import clients to the API."""
    try:
        response = requests.post(
            f"{api_base_url}/api/client-management/import-bulk",
            json=clients_data,
            headers={"Content-Type": "application/json"}
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
    # Create the JSON file
    clients = create_clients_json()
    
    # Import the clients
    print("\nImporting clients...")
    import_clients(clients)
