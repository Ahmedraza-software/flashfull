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
    print("Migrating vehicles with correct column mapping...")
    
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
    
    print(f"SQLite columns: {column_names}")
    
    try:
        # Clear existing data
        pg_cursor.execute('DELETE FROM vehicles')
        
        # Insert data with proper column mapping
        for i, row in enumerate(rows):
            # Map SQLite columns to PostgreSQL columns
            # SQLite: id, vehicle_id, vehicle_type, category, make_model, license_plate, asset_tag, year, status, compliance, government_permit, created_at, updated_at, chassis_number
            # PostgreSQL: id, vehicle_id, vehicle_type, category, make_model, license_plate, chassis_number, asset_tag, year, status, compliance, government_permit, created_at, updated_at
            
            processed_row = [
                row[0],  # id
                row[1],  # vehicle_id
                row[2],  # vehicle_type
                row[3],  # category
                row[4],  # make_model
                row[5],  # license_plate
                row[13], # chassis_number (moved to end in SQLite)
                row[6],  # asset_tag
                row[7],  # year
                row[8],  # status (already VARCHAR in PostgreSQL)
                row[9],  # compliance
                row[10], # government_permit
                row[11], # created_at
                row[12], # updated_at
            ]
            
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
