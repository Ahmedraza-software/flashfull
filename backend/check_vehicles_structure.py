from app.core.database import engine
from sqlalchemy import text

# Check vehicles table structure
print("Checking vehicles table structure...")

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'vehicles'
        ORDER BY ordinal_position
    """))
    columns = result.fetchall()
    print("Vehicles table columns:")
    for col in columns:
        print(f"  {col[0]}: {col[1]}")
    
    # Check sample data from SQLite to understand the structure
    print("\nChecking SQLite vehicles data...")
    import sqlite3
    sqlite_conn = sqlite3.connect('flash_erp.db')
    sqlite_cursor = sqlite_conn.cursor()
    
    sqlite_cursor.execute('PRAGMA table_info(vehicles)')
    sqlite_columns = sqlite_cursor.fetchall()
    print("SQLite vehicles columns:")
    for col in sqlite_columns:
        print(f"  {col[1]}: {col[2]}")
    
    sqlite_cursor.execute('SELECT * FROM vehicles LIMIT 1')
    sample_row = sqlite_cursor.fetchone()
    if sample_row:
        print(f"\nSample row (length {len(sample_row)}):")
        for i, val in enumerate(sample_row):
            print(f"  Column {i}: {val}")
    
    sqlite_conn.close()
