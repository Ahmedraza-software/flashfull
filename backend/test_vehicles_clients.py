import requests

# Login to get token
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
        
        # Test vehicles endpoint
        headers = {"Authorization": f"Bearer {token}"}
        vehicles_response = requests.get("http://localhost:8000/api/vehicles", headers=headers)
        print(f"Vehicles API status: {vehicles_response.status_code}")
        
        if vehicles_response.status_code == 200:
            vehicles_data = vehicles_response.json()
            print(f"Vehicles count: {len(vehicles_data) if isinstance(vehicles_data, list) else 'Not a list'}")
        else:
            print(f"Vehicles error: {vehicles_response.text[:200]}")
        
        # Test clients endpoint
        clients_response = requests.get("http://localhost:8000/api/clients", headers=headers)
        print(f"Clients API status: {clients_response.status_code}")
        
        if clients_response.status_code == 200:
            clients_data = clients_response.json()
            print(f"Clients count: {len(clients_data) if isinstance(clients_data, list) else 'Not a list'}")
        else:
            print(f"Clients error: {clients_response.text[:200]}")
            
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
