import sqlite3
db_path = r'c:\Users\ahmed\Desktop\newfolder\erp\flash_erp.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute('SELECT id, name, created_at FROM employees2 WHERE name LIKE "%Aamir%"')
empolyee_rows = cursor.fetchall()
for r in empolyee_rows:
    print(r)
conn.close()
