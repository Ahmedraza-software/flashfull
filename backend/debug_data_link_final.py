import sqlite3
db_path = r'c:\Users\ahmed\Desktop\newfolder\erp\flash_erp.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Employees ---")
cursor.execute('SELECT id, serial_no, fss_no, name, salary FROM employees2 WHERE name LIKE "%Aamir%"')
empolyee_rows = cursor.fetchall()
for r in empolyee_rows:
    print(r)

print("\n--- Attendance (linked by ID / Serial) ---")
# Get potential IDs
ids = []
for r in empolyee_rows:
    # id (int), serial (str), fss (str)
    ids.append(str(r[0]))
    if r[1]: ids.append(str(r[1]))
    if r[2]: ids.append(str(r[2]))

print(f"Checking Attendance for IDs: {ids}")

placeholders = ','.join(['?'] * len(ids))
cursor.execute(f'SELECT id, employee_id, date, status FROM attendance_records WHERE employee_id IN ({placeholders}) AND date >= "2025-12-01"', ids)
att = cursor.fetchall()
print(f"Total Records Found: {len(att)}")
for r in att:
    print(r)

conn.close()
