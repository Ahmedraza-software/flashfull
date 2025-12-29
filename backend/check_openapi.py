import requests
try:
    response = requests.get("http://localhost:8000/openapi.json", timeout=5)
    print(f"Status code: {response.status_code}")
    if response.status_code != 200:
        print(response.text)
except Exception as e:
    print(f"Check failed: {e}")
