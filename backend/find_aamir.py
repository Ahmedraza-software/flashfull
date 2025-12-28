from app.core.database import engine
from sqlalchemy import text

# Find and update Aamir Saleem Jan with different search criteria
print("Searching for Aamir Saleem Jan...")

with engine.connect() as conn:
    # Search by name only
    result = conn.execute(text("""
        SELECT id, serial_no, fss_no, name FROM employees2 
        WHERE name LIKE '%Aamir%' AND name LIKE '%Saleem%'
    """))
    
    employees = result.fetchall()
    if employees:
        print("Found employees matching 'Aamir Saleem':")
        for emp in employees:
            print(f"  ID: {emp[0]}, Serial: {emp[1]}, FSS: {emp[2]}, Name: {emp[3]}")
        
        # Update the first match
        employee_id = employees[0][0]
        conn.execute(text("""
            UPDATE employees2 
            SET serial_no = '1' 
            WHERE id = :employee_id
        """), {"employee_id": employee_id})
        conn.commit()
        print(f"Updated Aamir Saleem Jan (ID: {employee_id}) to serial_no: 1")
    else:
        print("Aamir Saleem Jan not found")
        
        # Search for any employee with NULL or empty serial_no
        result = conn.execute(text("""
            SELECT id, serial_no, fss_no, name FROM employees2 
            WHERE serial_no IS NULL OR serial_no = '' OR serial_no = '0'
            ORDER BY id
            LIMIT 5
        """))
        
        null_serials = result.fetchall()
        if null_serials:
            print("Employees with NULL/empty serial numbers:")
            for emp in null_serials:
                print(f"  ID: {emp[0]}, Serial: {emp[1]}, FSS: {emp[2]}, Name: {emp[3]}")
        else:
            print("No employees with NULL serial numbers found")
