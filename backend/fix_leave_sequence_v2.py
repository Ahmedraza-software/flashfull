from app.core.database import engine
from sqlalchemy import text

# Check the leave_periods table sequence and fix it
print("Checking leave_periods table sequence...")

with engine.connect() as conn:
    # Check current max ID
    result = conn.execute(text("SELECT MAX(id) FROM leave_periods"))
    max_id = result.fetchone()[0]
    print(f"Current max ID: {max_id}")
    
    # Check the sequence value (PostgreSQL sequence only has last_value)
    result = conn.execute(text("""
        SELECT last_value 
        FROM leave_periods_id_seq
    """))
    seq_info = result.fetchone()
    if seq_info:
        print(f"Sequence last_value: {seq_info[0]}")
    
    # Fix the sequence if needed
    if max_id is not None:
        new_seq_value = max_id + 1
        print(f"Setting sequence to: {new_seq_value}")
        
        conn.execute(text(f"""
            ALTER SEQUENCE leave_periods_id_seq RESTART WITH {new_seq_value}
        """))
        conn.commit()
        print("Sequence fixed!")
    else:
        print("No records found, sequence should be fine")
    
    # Verify the fix
    result = conn.execute(text("""
        SELECT last_value 
        FROM leave_periods_id_seq
    """))
    seq_info = result.fetchone()
    if seq_info:
        print(f"New sequence last_value: {seq_info[0]}")
