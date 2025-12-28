from app.core.database import engine
from sqlalchemy import text

# Check current ordering and fix it
print("Checking and fixing employee serial number ordering...")

with engine.connect() as conn:
    # Get all employees ordered by current serial_no
    result = conn.execute(text("""
        SELECT id, serial_no, fss_no, name 
        FROM employees2 
        ORDER BY serial_no NULLS LAST, id
    """))
    
    employees = result.fetchall()
    print(f"Total employees: {len(employees)}")
    
    # Show first 20 employees current order
    print("\nCurrent order (first 20):")
    for i, emp in enumerate(employees[:20]):
        print(f"  {i+1:2d}. ID:{emp[0]:3d}, Serial:{emp[1]:5s}, FSS:{emp[2]:8s}, Name:{emp[3]}")
    
    # Check if serial_no is being treated as string vs number
    print("\nChecking serial_no data types and values:")
    result = conn.execute(text("""
        SELECT serial_no, COUNT(*) 
        FROM employees2 
        WHERE serial_no IS NOT NULL 
        GROUP BY serial_no 
        ORDER BY serial_no
        LIMIT 15
    """))
    
    serial_counts = result.fetchall()
    print("Serial number distribution:")
    for serial, count in serial_counts:
        print(f"  '{serial}': {count} employees")
    
    # Fix ordering by ensuring proper numeric sorting
    print("\nFixing serial number ordering...")
    
    # Update all serial numbers to ensure proper numeric ordering
    # First, set all NULL serial numbers to high numbers
    conn.execute(text("""
        UPDATE employees2 
        SET serial_no = '9999' 
        WHERE serial_no IS NULL OR serial_no = '' OR serial_no = '0'
    """))
    
    # Get all employees and reassign proper serial numbers
    result = conn.execute(text("""
        SELECT id, name, fss_no 
        FROM employees2 
        ORDER BY CAST(serial_no AS INTEGER), id
    """))
    
    all_employees = result.fetchall()
    
    # Reassign serial numbers 1-515 in proper order
    for i, (emp_id, name, fss_no) in enumerate(all_employees, 1):
        conn.execute(text("""
            UPDATE employees2 
            SET serial_no = :new_serial 
            WHERE id = :emp_id
        """), {"new_serial": str(i), "emp_id": emp_id})
    
    conn.commit()
    print("Reassigned serial numbers 1-515 in proper order")
    
    # Verify the fix
    print("\nVerified order (first 20):")
    result = conn.execute(text("""
        SELECT id, serial_no, fss_no, name 
        FROM employees2 
        ORDER BY CAST(serial_no AS INTEGER), id
        LIMIT 20
    """))
    
    fixed_employees = result.fetchall()
    for i, emp in enumerate(fixed_employees):
        print(f"  {i+1:2d}. ID:{emp[0]:3d}, Serial:{emp[1]:5s}, FSS:{emp[2]:8s}, Name:{emp[3]}")
