from app.core.database import engine
from sqlalchemy import text

# Check what the frontend is actually receiving for attendance data
print("Checking frontend attendance data structure...")

with engine.connect() as conn:
    # Check the exact structure of attendance records
    result = conn.execute(text("""
        SELECT employee_id, date, status, leave_type 
        FROM attendance_records 
        WHERE date >= '2025-12-28' 
        AND leave_type IS NOT NULL
        ORDER BY employee_id, date
        LIMIT 3
    """))
    
    records = result.fetchall()
    print("Sample attendance records from database:")
    for record in records:
        print(f"  employee_id: '{record[0]}', date: '{record[1]}', status: '{record[2]}', leave_type: '{record[3]}'")
        print(f"    -> status == 'present': {record[2] == 'present'}")
        print(f"    -> !!leave_type: {bool(record[3])}")
        print(f"    -> isOnLeave: {record[2] == 'present' and bool(record[3])}")
        print()
    
    # Check if there might be different status values
    result = conn.execute(text("""
        SELECT DISTINCT status, leave_type, COUNT(*) 
        FROM attendance_records 
        WHERE date >= '2025-12-28'
        GROUP BY status, leave_type
        ORDER BY status, leave_type
    """))
    
    status_combinations = result.fetchall()
    print("All status/leave_type combinations:")
    for combo in status_combinations:
        print(f"  status: '{combo[0]}', leave_type: '{combo[1]}', count: {combo[2]}")
    
    # Check if frontend might be getting different data
    print("\nPossible issues:")
    print("1. Frontend might be getting cached data")
    print("2. The attendance row structure might be different")
    print("3. The condition might not be matching due to data types")
    print("4. Need to refresh the frontend page")
