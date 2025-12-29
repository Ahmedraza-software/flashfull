import sqlite3
import os

db_path = r"C:/Users/ahmed/Desktop/newfolder/erp/flash_erp.db"

if not os.path.exists(db_path):
    print(f"Error: Database not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("--- Searching for SEC-0001 in employees2 serial_no or fss_no ---")
    rows = cursor.execute("SELECT id, serial_no, fss_no, name FROM employees2 WHERE serial_no LIKE '%SEC%' OR fss_no LIKE '%SEC%'").fetchall()
    for row in rows:
        print(dict(row))
        
    conn.close()
