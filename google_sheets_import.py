#!/usr/bin/env python3
"""
Direct Google Sheets integration for client import.
Install: pip install gspread google-auth-oauthlib
"""

import gspread
from google.oauth2.service_account import Credentials
import requests

def get_clients_from_google_sheet(sheet_id='1CjnwLGU597E8Uw0YJfOA0GkhoTOprqZBpF0qI6ihoag'):
    """
    Read clients directly from Google Sheets.
    
    Setup:
    1. Create Google Cloud project and enable Sheets API
    2. Create service account and download credentials.json
    3. Share the Google Sheet with service account email
    4. Install: pip install gspread google-auth-oauthlib
    """
    try:
        scopes = ['https://www.googleapis.com/auth/spreadsheets']
        creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)
        client = gspread.authorize(creds)
        
        # Open the spreadsheet by ID
        spreadsheet = client.open_by_key(sheet_id)
        worksheet = spreadsheet.get_worksheet(0)  # First worksheet
        
        # Get all records (assumes first row is headers)
        records = worksheet.get_all_records()
        
        clients = []
        for row in records:
            if row.get('#') and row.get('Client Name'):
                # Clean up the data
                sr_no = str(row.get('#', '')).strip()
                client_name = str(row.get('Client Name', '')).strip()
                
                if sr_no and client_name and sr_no != '#' and client_name.lower() != 'client name':
                    clients.append({
                        '#': sr_no,
                        'Client Name': client_name
                    })
        
        print(f"Successfully read {len(clients)} clients from Google Sheets")
        return clients
        
    except FileNotFoundError:
        print("Error: credentials.json file not found")
        print("Please set up Google Sheets API credentials")
        return None
    except Exception as e:
        print(f"Error reading from Google Sheets: {e}")
        return None

def import_clients_to_api(clients, api_base_url="http://localhost:8000"):
    """Import clients to the API."""
    if not clients:
        print("No clients to import")
        return
    
    print(f"Importing {len(clients)} clients...")
    
    try:
        response = requests.post(
            f"{api_base_url}/api/client-management/import-bulk",
            json=clients,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nImport completed successfully!")
            print(f"  Total clients: {len(clients)}")
            print(f"  Imported: {result.get('imported', 0)}")
            print(f"  Skipped: {result.get('skipped', 0)}")
            if result.get('errors'):
                print(f"  Errors: {len(result['errors'])}")
                for error in result['errors'][:5]:  # Show first 5 errors
                    print(f"    - {error}")
                if len(result['errors']) > 5:
                    print(f"    ... and {len(result['errors']) - 5} more errors")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Error connecting to API: {e}")

def main():
    """Main function to import from Google Sheets."""
    print("Google Sheets Client Import")
    print("=" * 30)
    
    # Get clients from Google Sheets
    clients = get_clients_from_google_sheet()
    
    if clients:
        # Import to API
        import_clients_to_api(clients)
    else:
        print("\nTo set up Google Sheets integration:")
        print("1. Go to Google Cloud Console")
        print("2. Enable Google Sheets API")
        print("3. Create service account credentials")
        print("4. Download credentials.json to this directory")
        print("5. Share your Google Sheet with the service account email")
        print("6. Install: pip install gspread google-auth-oauthlib")

if __name__ == "__main__":
    main()
