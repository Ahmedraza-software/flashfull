import requests
import json

# Test creating a leave period to see what's causing the 500 error
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
        
        # Test creating a leave period
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # Sample leave period data
        leave_data = {
            "employee_id": "SEC-0002",
            "from_date": "2025-12-29",
            "to_date": "2025-12-30",
            "leave_type": "paid",
            "reason": "Test leave"
        }
        
        print("Creating leave period...")
        print(f"Data: {json.dumps(leave_data, indent=2)}")
        
        response = requests.post("http://localhost:8000/api/leave-periods/", 
                               headers=headers, 
                               json=leave_data)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 500:
            print("500 Error - checking server logs...")
            print("This might be a database constraint or validation error")
            
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
