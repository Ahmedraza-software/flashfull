from app.core.database import engine
from sqlalchemy import text

# Check what's happening in the attendance_records table that might cause issues
print("Checking attendance_records table...")

with engine.connect() as conn:
    # Check if table exists
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'attendance_records'
        )
    """))
    table_exists = result.fetchone()[0]
    print(f"Attendance records table exists: {table_exists}")
    
    if table_exists:
        # Check table structure
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'attendance_records'
            ORDER BY ordinal_position
        """))
        columns = result.fetchall()
        print("Table columns:")
        for col in columns:
            print(f"  {col[0]}: {col[1]}")
        
        # Check data count
        result = conn.execute(text("SELECT COUNT(*) FROM attendance_records"))
        count = result.fetchone()[0]
        print(f"Total records: {count}")
        
        # Check for any problematic data
        if count > 0:
            result = conn.execute(text("""
                SELECT employee_id, date, status 
                FROM attendance_records 
                LIMIT 5
            """))
            records = result.fetchall()
            print("Sample records:")
            for record in records:
                print(f"  {record}")
    else:
        print("Table does not exist - this might cause the EXISTS query to fail")
        
        # Check if there are any other attendance-related tables
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name LIKE '%attendance%'
        """))
        tables = result.fetchall()
        print(f"Attendance-related tables: {[t[0] for t in tables]}")
