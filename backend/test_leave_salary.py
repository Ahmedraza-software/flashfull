from app.core.database import engine
from sqlalchemy import text

# Test creating a leave period and check attendance records
print("Testing leave period creation with attendance tracking...")

with engine.connect() as conn:
    # Check current attendance records for test employee
    employee_id = "SEC-0002"
    test_date = "2025-12-31"
    
    result = conn.execute(text("""
        SELECT date, status, leave_type 
        FROM attendance_records 
        WHERE employee_id = :emp_id 
        AND date >= '2025-12-29'
        ORDER BY date
    """), {"emp_id": employee_id})
    
    existing_records = result.fetchall()
    print(f"Existing attendance records for {employee_id}:")
    for record in existing_records:
        print(f"  {record[0]}: {record[1]} ({record[2]})")
    
    # Create a test leave period
    print("\nCreating test leave period...")
    conn.execute(text("""
        INSERT INTO leave_periods (employee_id, from_date, to_date, leave_type, reason)
        VALUES (:emp_id, :from_date, :to_date, :leave_type, :reason)
    """), {
        "emp_id": employee_id,
        "from_date": "2025-12-31",
        "to_date": "2025-12-31",
        "leave_type": "paid",
        "reason": "Test leave for salary calculation"
    })
    
    conn.commit()
    
    # Check attendance records after leave creation
    result = conn.execute(text("""
        SELECT date, status, leave_type 
        FROM attendance_records 
        WHERE employee_id = :emp_id 
        AND date >= '2025-12-29'
        ORDER BY date
    """), {"emp_id": employee_id})
    
    updated_records = result.fetchall()
    print(f"\nUpdated attendance records for {employee_id}:")
    for record in updated_records:
        print(f"  {record[0]}: {record[1]} ({record[2]})")
    
    # Check employee salary for calculation
    result = conn.execute(text("""
        SELECT salary 
        FROM employees2 
        WHERE name LIKE :name_pattern OR employee_id = :emp_id
        LIMIT 1
    """), {"name_pattern": "%SEC-0002%", "emp_id": employee_id})
    
    salary_info = result.fetchone()
    if salary_info:
        print(f"\nEmployee salary: {salary_info[0]}")
        daily_salary = float(salary_info[0]) / 30 if salary_info[0] else 0
        print(f"Daily salary (approx): {daily_salary:.2f}")
        print(f"Leave days pay (1 day): {daily_salary:.2f}")
    else:
        print("\nSalary information not found")
