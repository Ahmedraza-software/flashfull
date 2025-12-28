import requests

# Test leave alerts endpoint
try:
    # Login to get token
    login_data = {
        "username": "superadmin",
        "password": "SuperAdmin@123"
    }
    
    response = requests.post("http://localhost:8000/api/auth/login", data=login_data)
    print("Login response:", response.status_code)
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        print("Token received:", token[:50] + "..." if token else "No token")
        
        # Test leave alerts endpoint
        headers = {"Authorization": f"Bearer {token}"}
        alerts_response = requests.get("http://localhost:8000/api/leave-periods/alerts?as_of=2025-12-28", headers=headers)
        print(f"Leave alerts API status: {alerts_response.status_code}")
        
        if alerts_response.status_code == 200:
            alerts_data = alerts_response.json()
            print(f"Alerts count: {len(alerts_data)}")
            if alerts_data:
                print("Sample alert:")
                print(alerts_data[0])
        else:
            print(f"Leave alerts error: {alerts_response.text}")
            
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
