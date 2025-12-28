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
        
        # Test client-management/clients endpoint
        headers = {"Authorization": f"Bearer {token}"}
        clients_response = requests.get("http://localhost:8000/api/client-management/clients", headers=headers)
        print(f"Clients API status: {clients_response.status_code}")
        
        if clients_response.status_code == 200:
            clients_data = clients_response.json()
            print(f"Clients count: {len(clients_data)}")
            if clients_data:
                print(f"First client: {clients_data[0].get('name', 'No name')}")
        else:
            print(f"Clients error: {clients_response.text[:200]}")
            
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
