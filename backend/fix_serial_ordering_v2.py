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
        serial = emp[1] if emp[1] is not None else 'NULL'
        fss = emp[2] if emp[2] is not None else 'NULL'
        name = emp[3] if emp[3] is not None else 'NULL'
        print(f"  {i+1:2d}. ID:{emp[0]:3d}, Serial:{serial:5s}, FSS:{fss:8s}, Name:{name}")
    
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
    
    # Reassign serial numbers 1-517 in proper order
    for i, (emp_id, name, fss_no) in enumerate(all_employees, 1):
        conn.execute(text("""
            UPDATE employees2 
            SET serial_no = :new_serial 
            WHERE id = :emp_id
        """), {"new_serial": str(i), "emp_id": emp_id})
    
    conn.commit()
    print("Reassigned serial numbers 1-517 in proper order")
    
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
        serial = emp[1] if emp[1] is not None else 'NULL'
        fss = emp[2] if emp[2] is not None else 'NULL'
        name = emp[3] if emp[3] is not None else 'NULL'
        print(f"  {i+1:2d}. ID:{emp[0]:3d}, Serial:{serial:5s}, FSS:{fss:8s}, Name:{name}")
