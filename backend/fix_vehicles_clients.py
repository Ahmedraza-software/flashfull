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

def migrate_vehicles():
    print("Migrating vehicles...")
    
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

def migrate_clients():
    print("Migrating clients...")
    
    # Get data from SQLite
    sqlite_cursor.execute('SELECT * FROM clients')
    rows = sqlite_cursor.fetchall()
    
    if not rows:
        print("  No data in clients")
        return
    
    # Get column names
    sqlite_cursor.execute('PRAGMA table_info(clients)')
    columns_info = sqlite_cursor.fetchall()
    column_names = [col[1] for col in columns_info]
    
    try:
        # Clear existing data
        pg_cursor.execute('DELETE FROM clients')
        
        # Insert data with proper handling
        for i, row in enumerate(rows):
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
            
            placeholders = ', '.join(['%s'] * len(processed_row))
            query = f'INSERT INTO clients VALUES ({placeholders})'
            
            try:
                pg_cursor.execute(query, processed_row)
                pg_conn.commit()
            except Exception as e:
                print(f"    Error inserting client {i+1}: {e}")
                pg_conn.rollback()
                continue
        
        print(f"  Successfully migrated clients")
        
    except Exception as e:
        print(f"  Error migrating clients: {e}")
        pg_conn.rollback()

# Fix NULL datetime values in vehicles and clients
def fix_datetime_values():
    print("Fixing NULL datetime values...")
    
    with pg_conn.cursor() as cursor:
        # Fix vehicles
        cursor.execute("""
            UPDATE vehicles 
            SET created_at = NOW() 
            WHERE created_at IS NULL
        """)
        print(f"Updated {cursor.rowcount} vehicles with NULL created_at")
        
        cursor.execute("""
            UPDATE vehicles 
            SET updated_at = NOW() 
            WHERE updated_at IS NULL
        """)
        print(f"Updated {cursor.rowcount} vehicles with NULL updated_at")
        
        # Fix clients
        cursor.execute("""
            UPDATE clients 
            SET created_at = NOW() 
            WHERE created_at IS NULL
        """)
        print(f"Updated {cursor.rowcount} clients with NULL created_at")
        
        cursor.execute("""
            UPDATE clients 
            SET updated_at = NOW() 
            WHERE updated_at IS NULL
        """)
        print(f"Updated {cursor.rowcount} clients with NULL updated_at")
        
        pg_conn.commit()

# Execute migration
migrate_vehicles()
migrate_clients()
fix_datetime_values()

print("Migration completed!")

# Close connections
sqlite_conn.close()
pg_conn.close()
