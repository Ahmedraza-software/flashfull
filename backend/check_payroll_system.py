from app.core.database import engine
from sqlalchemy import text

# Check payroll and salary calculation tables
print("Checking payroll related tables...")

with engine.connect() as conn:
    # Check payroll_sheet_entries table
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'payroll_sheet_entries'
        )
    """))
    payroll_exists = result.fetchone()[0]
    print(f"Payroll sheet entries table exists: {payroll_exists}")
    
    if payroll_exists:
        result = conn.execute(text("SELECT COUNT(*) FROM payroll_sheet_entries"))
        payroll_count = result.fetchone()[0]
        print(f"Total payroll entries: {payroll_count}")
        
        # Check structure
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'payroll_sheet_entries'
            ORDER BY ordinal_position
        """))
        columns = result.fetchall()
        print("Payroll sheet columns:")
        for col in columns:
            print(f"  {col[0]}: {col[1]}")
    
    # Check employees table for salary info
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'employees'
        )
    """))
    employees_exists = result.fetchone()[0]
    print(f"Employees table exists: {employees_exists}")
    
    if employees_exists:
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'employees'
            AND column_name LIKE '%salary%'
        """))
        salary_columns = result.fetchall()
        print("Salary-related columns in employees table:")
        for col in salary_columns:
            print(f"  {col[0]}: {col[1]}")
    
    # Check employees2 table for salary info
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'employees2'
        AND column_name LIKE '%salary%'
    """))
    salary_columns2 = result.fetchall()
    print("Salary-related columns in employees2 table:")
    for col in salary_columns2:
        print(f"  {col[0]}: {col[1]}")
    
    # Check a sample employee salary
    if salary_columns2:
        result = conn.execute(text("""
            SELECT serial_no, name, salary 
            FROM employees2 
            WHERE salary IS NOT NULL 
            LIMIT 5
        """))
        employees = result.fetchall()
        print("Sample employee salaries:")
        for emp in employees:
            print(f"  {emp[0]} - {emp[1]}: {emp[2]}")
