import requests
import json

# Test the frontend leave alerts call specifically
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
        
        # Test the exact same call the frontend makes
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test with different date formats that might cause issues
        test_dates = ["2025-12-28", "2025-12-27", "2025-12-10"]
        
        for test_date in test_dates:
            print(f"\n=== Testing with as_of={test_date} ===")
            alerts_response = requests.get(f"http://localhost:8000/api/leave-periods/alerts?as_of={test_date}", headers=headers)
            
            print(f"Status: {alerts_response.status_code}")
            
            if alerts_response.status_code == 200:
                try:
                    json_data = alerts_response.json()
                    print(f"Success: {len(json_data)} alerts")
                    if json_data:
                        print(f"First alert: {json_data[0].get('employee_id', 'N/A')}")
                except json.JSONDecodeError as e:
                    print(f"JSON Error: {e}")
                    print(f"Response textTable exists: True
Table columns:
  : {alerts_response.text[:200]}...")
            else:
                print(f"Error: {alerts_response.text[:200]}")
                
        # Test without the as_of parameter
        print(f"\n=== Testing without as_of parameter ===")
        alerts_response = requests.get("http://localhost:8000/api/leave-periods/alerts", headers=headers)
        print(f"Status: {alerts_response.status_code}")
        
        if alerts_response.status_code == 200:
            try:
                json_data = alerts_response.json()
                print(f"Success: {len(json_data)} alerts")
            except json.JSONDecodeError as e:
                print(f"JSON Error: {e}")
                print(f"Response text: {alerts_response.text[:200]}...")
                
    else:
：" + str(e))
        print(f"Response text: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
