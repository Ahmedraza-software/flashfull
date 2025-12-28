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

def migrate_vehicles_fixed():
    print("Migrating vehicles with status conversion...")
    
    # Get data from SQLite
    sqlite_cursor.execute('SELECT * FROM vehicles')
    rows = sqlite_cursor.fetchall()
    
    if not rows:
        print("  No data in vehicles")
        return
    
    # Get column names
    sqlite_cursor.execute('PRAGMA table_info(vehicles)')
    columns_info = sqlite_cursor.fetchall()
    column_names = [col[1] for col in columns_info]
    
    try:
        # Clear existing data
        pg_cursor.execute('DELETE FROM vehicles')
        
        # Insert data with proper handling
        for i, row in enumerate(rows):
            processed_row = []
            for j, value in enumerate(row):
                # Convert status values (assuming status is the 6th column)
                if j == 5:  # status column position
                    if value == "Active":
                        processed_row.append(1)
                    elif value == "Inactive":
                        processed_row.append(0)
                    else:
                        processed_row.append(None)
                elif value is None:
                    processed_row.append(None)
                elif isinstance(value, str):
                    processed_row.append(value)
                elif isinstance(value, (int, float)):
                    processed_row.append(value)
                elif isinstance(value, datetime):
                    processed_row.append(value)
                else:
                    processed_row.append(str(value))
            
            placeholders = ', '.join(['%s'] * len(processed_row))
            query = f'INSERT INTO vehicles VALUES ({placeholders})'
            
            try:
                pg_cursor.execute(query, processed_row)
                pg_conn.commit()
            except Exception as e:
                print(f"    Error inserting vehicle {i+1}: {e}")
                pg_conn.rollback()
                continue
        
        print(f"  Successfully migrated vehicles")
        
    except Exception as e:
        print(f"  Error migrating vehicles: {e}")
        pg_conn.rollback()

# Execute migration
migrate_vehicles_fixed()

print("Vehicles migration completed!")

# Close connections
sqlite_conn.close()
pg_conn.close()
