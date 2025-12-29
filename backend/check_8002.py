import requests
import time

time.sleep(3)
try:
    response = requests.get("http://localhost:8002/openapi.json", timeout=2)
    print(f"Status code: {response.status_code}")
    if response.status_code != 200:
        print(response.text)
except Exception as e:
    print(f"Check failed: {e}")
