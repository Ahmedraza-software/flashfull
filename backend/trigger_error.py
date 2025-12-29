import requests
import time

time.sleep(2)
try:
    requests.get("http://localhost:8001/openapi.json", timeout=2)
except:
    pass
