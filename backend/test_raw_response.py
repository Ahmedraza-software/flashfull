import requests
import json

# Test the raw API response to see if there's a JSON parsing issue
try:
    # Login to get token
    login_data = {
        "username": "superadmin",
        "password": "SuperAdmin@123"
    }
    
    response = requests.post("http://localhost:8000/api/auth/login", data=login_data)
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        
        # Test leave alerts endpoint with raw response
        headers = {"Authorization": f"Bearer {token}"}
        alerts_response = requests.get("http://localhost:8000/api/leave-periods/alerts?as_of=2025-12-28", headers=headers)
        
        print(f"Status: {alerts_response.status_code}")
        print(f"Headers: {dict(alerts_response.headers)}")
        print(f"Raw response text:")
        print(alerts_response.text[:500])
        
        # Try to parse JSON
        try:
            json_data = alerts_response.json()
            print(f"\nJSON parsed successfully!")
            print(f"Type: {type(json_data)}")
            if isinstance(json_data, list):
                print(f"List length: {len(json_data)}")
                if json_data:
                    print(f"First item type: {type(json_data[0])}")
        except json.JSONDecodeError as e:
            print(f"\nJSON parsing error: {e}")
            print(f"Response text that failed to parse:")
            print(alerts_response.text)
            
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
