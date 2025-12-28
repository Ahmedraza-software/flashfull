import requests

# Login to get token (using form data)
login_data = {
    "username": "superadmin",
    "password": "SuperAdmin@123"
}

try:
    # Login with form data
    response = requests.post("http://localhost:8000/api/auth/login", data=login_data)
    print("Login response:", response.status_code)
    
    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get("access_token")
        print("Token received:", token[:50] + "..." if token else "No token")
        
        # Test employees2 endpoint with token
        headers = {"Authorization": f"Bearer {token}"}
        emp_response = requests.get("http://localhost:8000/api/employees2", headers=headers)
        print(f"Employees2 API status: {emp_response.status_code}")
        
        if emp_response.status_code == 200:
            data = emp_response.json()
            print(f"Employees2 data: {data}")
        else:
            print(f"Employees2 error: {emp_response.text}")
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
