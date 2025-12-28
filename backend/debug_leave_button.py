from app.core.database import engine
from sqlalchemy import text

# Check attendance records for employees with leave to see why red button isn't showing
print("Checking attendance records for leave status...")

with engine.connect() as conn:
    # Check recent attendance records with leave type
    result = conn.execute(text("""
        SELECT employee_id, date, status, leave_type 
        FROM attendance_records 
        WHERE date >= '2025-12-28' 
        AND leave_type IS NOT NULL
        ORDER BY employee_id, date
    """))
    
    leave_records = result.fetchall()
    print(f"Found {len(leave_records)} records with leave_type:")
    for record in leave_records:
        print(f"  {record[0]} - {record[1]}: {record[2]} ({record[3]})")
    
    # Check specific employee if any
    if leave_records:
        emp_id = leave_records[0][0]
        result = conn.execute(text("""
            SELECT employee_id, date, status, leave_type 
            FROM attendance_records 
            WHERE employee_id = :emp_id
            ORDER BY date DESC
            LIMIT 5
        """), {"emp_id": emp_id})
        
        emp_records = result.fetchall()
        print(f"\nRecent records for employee {emp_id}:")
        for record in emp_records:
            print(f"  {record[1]}: {record[2]} ({record[3]})")
    
    # Check the condition logic
    print(f"\nChecking condition logic:")
    for record in leave_records[:3]:  # Check first 3 records
        status = record[2]
        leave_type = record[3]
        is_on_leave = status == "present" and leave_type
        print(f"  {record[0]} - status: '{status}', leave_type: '{leave_type}' -> is_on_leave: {is_on_leave}")
        
        if not is_on_leave:
            print(f"    -> Condition failed: status == 'present' ({status == 'present'}) AND leave_type ({bool(leave_type)})")
