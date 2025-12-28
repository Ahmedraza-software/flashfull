import sys
import os
print("=== Vercel function start ===")
print("Python version:", sys.version)
print("CWD:", os.getcwd())
print("Files:", os.listdir("."))
try:
    from app.main import app
    print("Imported app successfully")
except Exception as e:
    print("Failed to import app.main:", e)
    raise
