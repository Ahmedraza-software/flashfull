from app.core.database import engine
from sqlalchemy import text

# Check for any database connection issues or invalid data
print("Checking for database issues...")

with engine.connect() as conn:
    # Check for any invalid dates or data issues
    try:
        result = conn.execute(text("""
            SELECT id, employee_id, from_date, to_date, leave_type, reason
            FROM leave_periods
            ORDER BY id
        """))
        records = result.fetchall()
        
        print("All leave period records:")
        for record in records:
            print(f"  ID: {record[0]}, Employee: {record[1]}, From: {record[2]}, To: {record[3]}, Type: {record[4]}, Reason: {record[5]}")
        
        # Check if there are any attendance records that might be causing issues
        result = conn.execute(text("""
            SELECT COUNT(*) FROM attendance_records
        """))
        attendance_count = result.fetchone()[0]
        print(f"\nTotal attendance records: {attendance_count}")
        
        # Check the specific query that might be causing issues
        print("\nTesting the alerts query directly:")
        result = conn.execute(text("""
            SELECT 
                lp.id,
                lp.employee_id,
                lp.from_date,
                lp.to_date,
                lp.leave_type,
                lp.reason,
                lp.to_date as last_day
            FROM leave_periods lp
            WHERE lp.to_date < '2025-12-28'
            ORDER BY lp.to_date DESC
        """))
        periods = result.fetchall()
        
        print(f"Periods ending before 2025-12-28: {len(periods)}")
        for period in periods:
            print(f"  {period}")
            
    except Exception as e:
        print(f"Database error: {e}")
        print("This might be causing the JSON parsing issue")
