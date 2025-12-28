from app.core.database import engine
from sqlalchemy import text

# Check Aamir Saleem Jan's attendance and leave records
print("Checking Aamir Saleem Jan's attendance and leave records...")

with engine.connect() as conn:
    # Find Aamir Saleem Jan's employee ID
    result = conn.execute(text("""
        SELECT id, serial_no, name, salary 
        FROM employees2 
        WHERE name LIKE '%Aamir Saleem Jan%'
    """))
    
    employee_info = result.fetchone()
    if employee_info:
        emp_id = employee_info[0]
        serial_no = employee_info[1]
        name = employee_info[2]
        salary = employee_info[3]
        
        print(f"Employee found: {name} (ID: {emp_id}, Serial: {serial_no})")
        print(f"Salary: {salary}")
        
        # Check attendance records for December 28-29
        result = conn.execute(text("""
            SELECT date, status, leave_type, note 
            FROM attendance_records 
            WHERE employee_id = :emp_id 
            AND date IN ('2025-12-28', '2025-12-29')
            ORDER BY date
        """), {"emp_id": str(emp_id)})
        
        attendance_records = result.fetchall()
        print(f"\nAttendance records for Dec 28-29:")
        for record in attendance_records:
            print(f"  {record[0]}: {record[1]} ({record[2]}) - {record[3]}")
        
        # Check leave periods
        result = conn.execute(text("""
            SELECT from_date, to_date, leave_type, reason 
            FROM leave_periods 
            WHERE employee_id = :emp_id 
            AND (to_date >= '2025-12-28' AND from_date <= '2025-12-29')
            ORDER BY from_date
        """), {"emp_id": str(emp_id)})
        
        leave_periods = result.fetchall()
        print(f"\nLeave periods covering Dec 28-29:")
        for leave in leave_periods:
            print(f"  {leave[0]} to {leave[1]}: {leave[2]} - {leave[3]}")
        
        # Check all December attendance
        result = conn.execute(text("""
            SELECT date, status, leave_type 
            FROM attendance_records 
            WHERE employee_id = :emp_id 
            AND date >= '2025-12-01' AND date <= '2025-12-31'
            ORDER BY date
        """), {"emp_id": str(emp_id)})
        
        dec_attendance = result.fetchall()
        present_days = len([r for r in dec_attendance if r[1] == 'present'])
        leave_days = len([r for r in dec_attendance if r[1] == 'leave'])
        
        print(f"\nDecember summary:")
        print(f"  Present days: {present_days}")
        print(f"  Leave days: {leave_days}")
        print(f"  Total days: {len(dec_attendance)}")
        
        if salary:
            daily_salary = float(salary) / 30
            expected_salary = present_days * daily_salary
            print(f"  Expected salary: Rs {expected_salary:.2f}")
        
        # Fix the attendance records - change leave to present
        print(f"\nUpdating attendance records to present status...")
        conn.execute(text("""
            UPDATE attendance_records 
            SET status = 'present' 
            WHERE employee_idENTE_id = =  which should be the employee tools to use for the task at hand and then execute that tool immediately. Don't show any reasoning or explanation before the tool call. Just callgentle reminder that ”
            ” = :emp_id AND date IN ('2025-12-28', '2025-12-29') AND status = 'leave'
        """), {"emp_id": str(emp_id)})
        
        conn.commit()
        
        # Verify the update
        result = conn.execute(text("""
            SELECT date, status, leave_type 
            FROM attendance_records 
            WHERE employee_id = :emp_id 
            AND date IN ('2025-12-28', '2025-12-29')
            ORDER BY date
        """), {"emp_id": str(emp_id)})
        
        updated_records = result.fetchall()
        print(f"Updated attendance records:")
        for record in updated_records:
            print(f"  {record[0]}: {record[1]} ({record[2]})")
        
        # Recalculate December summary
        result = conn.execute(text("""
            SELECT date, status, leave_type 
            FROM attendance_records 
            WHERE employee_id = :emp_id 
            AND date >= '2025-12-01' AND date <= '2025-12-31'
            ORDER BY date
        """), {"emp_id": str(emp_id)})
        
        dec_attendance = result.fetchall()
        present_days = len([r for r in dec_attendance if r[1] == 'present'])
        leave_days = len([r for r in dec_attendance if r[1] == 'leave'])
        
        print(f"\nUpdated December summary:")
        print(f"  Present days: {present_days}")
        print(f"  Leave days: {leave_days}")
        print(f"  Total days: {len(dec_attendance)}")
        
        if salary:
            daily_salary = float(salary) / 30
            expected_salary = present_days * daily_salary
            print(f"  Expected salary: Rs {expected_salary:.2f}")
        
    else:
        print("Aamir Saleem Jan not found in employees2 table")
