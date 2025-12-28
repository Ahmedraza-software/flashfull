import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
from datetime import datetime

# SQLite connection
sqlite_conn = sqlite3.connect('flash_erp.db')
sqlite_cursor = sqlite_conn.cursor()

# PostgreSQL connection
pg_conn = psycopg2.connect('postgresql://postgres:admin%40123@localhost:5432/postgres')
pg_cursor = pg_conn.cursor()

def migrate_table_safe(table_name):
    print(f"Migrating {table_name}...")
    
    # Get data from SQLite
    sqlite_cursor.execute(f'SELECT * FROM {table_name}')
    rows = sqlite_cursor.fetchall()
    
    if not rows:
        print(f"  No data in {table_name}")
        return
    
    # Get column names
    sqlite_cursor.execute(f'PRAGMA table_info({table_name})')
    columns_info = sqlite_cursor.fetchall()
    column_names = [col[1] for col in columns_info]
    
    # Skip alembic_version table
    if table_name == 'alembic_version':
        print(f"  Skipping {table_name}")
        return
    
    try:
        # Clear existing data in PostgreSQL table
        pg_cursor.execute(f'DELETE FROM {table_name}')
        
        # Insert data into PostgreSQL with individual commits for each row
        for i, row in enumerate(rows):
            # Handle None values and convert to proper format
            processed_row = []
            for value in row:
                if value is None:
                    processed_row.append(None)
                elif isinstance(value, str):
                    processed_row.append(value)
                elif isinstance(value, (int, float)):
                    processed_row.append(value)
                elif isinstance(value, datetime):
                    processed_row.append(value)
                else:
                    processed_row.append(str(value))
            
            # Create placeholders for INSERT
            placeholders = ', '.join(['%s'] * len(processed_row))
            query = f'INSERT INTO {table_name} VALUES ({placeholders})'
            
            try:
                pg_cursor.execute(query, processed_row)
                pg_conn.commit()  # Commit each row individually
            except Exception as e:
                print(f"    Error inserting row {i+1}: {e}")
                pg_conn.rollback()  # Rollback this row only
                continue
        
        print(f"  Successfully migrated rows from {table_name}")
        
    except Exception as e:
        print(f"  Error migrating {table_name}: {e}")
        pg_conn.rollback()

# Focus on tables that didn't migrate properly
failed_tables = ['vehicles', 'employees', 'attendance_records', 'employees2', 'payroll_sheet_entries']

print("Starting targeted migration for failed tables...")
print("=" * 50)

for table_name in failed_tables:
    migrate_table_safe(table_name)

print("=" * 50)
print("Targeted migration completed!")

# Close connections
sqlite_conn.close()
pg_conn.close()
