import sqlite3

conn = sqlite3.connect('flash_erp.db')
cursor = conn.cursor()

# Get all tables
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()

print('SQLite tables:')
for table in tables:
    print(f'  - {table[0]}')

# Get row counts for each table
print('\nRow counts:')
for table in tables:
    cursor.execute(f'SELECT COUNT(*) FROM {table[0]}')
    count = cursor.fetchone()[0]
    print(f'  {table[0]}: {count} rows')

conn.close()
