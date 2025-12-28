from app.core.database import engine
from sqlalchemy import text

# Update serial numbers for specific employees
print("Updating employee serial numbers...")

updates = [
    (1, "MBD", "Aamir Saleem Jan"),
    (2, "Manager Admin", "Ahmad Sarmad"), 
    (352, "12511", "Ghulam Haider"),
    (60, "5507", "Asad Ullah"),
    (3, "Manager Accounts", "Muhammad Shafiq Kamal"),
    (4, "M.O", "Muhammad Azama Mazhar"),
    (5, "AM Marketing", "Ather Iqbal"),
    (6, "7459", "Faisal Zaman"),
    (7, "4708", "Ansar Abbas"),
    (8, "5644", "Muhammad Iftikhar Rao")
]

with engine.connect() as conn:
    for new_serial_no, fss_no, name in updates:
        # Find the employee by name and FSS number
        result = conn.execute(text("""
            SELECT id FROM employees2 
            WHERE name = :name AND (fss_no = :fss_no OR fss_no IS NULL)
        """), {"name": name, "fss_no": fss_no})
        
        employee = result.fetchone()
        if employee:
            employee_id = employee[0]
            # Update serial number
            conn.execute(text("""
                UPDATE employees2 
                SET serial_no = :new_serial_no 
                WHERE id = :employee_id
            """), {"new_serial_no": str(new_serial_no), "employee_id": employee_id})
            print(f"Updated {name} (ID: {employee_id}) to serial_no: {new_serial_no}")
        else:
            print(f"Employee not found: {name} ({fss_no})")
    
    conn.commit()
    print("Serial number updates completed!")

# Verify the updates
print("\nVerifying updated serial numbers:")
with engine.connect() as conn:
    for new_serial_no, fss_no, name in updates:
        result = conn.execute(text("""
            SELECT serial_no, fss_no, name FROM employees2 
            WHERE name = :name AND (fss_no = :fss_no OR fss_no IS NULL)
        """), {"name": name, "fss_no": fss_no})
        
        employee = result.fetchone()
        if employee:
            print(f"{name}: serial_no={employee[0]}, fss_no={employee[1]}")
        else:
            print(f"Not found: {name}")
