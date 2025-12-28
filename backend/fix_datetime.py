from app.core.database import engine
from sqlalchemy import text

# Fix NULL datetime values in employees2 table
print("Fixing NULL datetime values in employees2 table...")

with engine.connect() as conn:
    # Update NULL created_at to current timestamp
    result = conn.execute(text("""
        UPDATE employees2 
        SET created_at = NOW() 
        WHERE created_at IS NULL
    """))
    print(f"Updated {result.rowcount} rows with NULL created_at")
    
    # Update NULL updated_at to current timestamp
    result = conn.execute(text("""
        UPDATE employees2 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL
    """))
    print(f"Updated {result.rowcount} rows with NULL updated_at")
    
    conn.commit()
    print("DateTime fixes completed!")

# Verify the fix
with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM employees2 WHERE created_at IS NULL OR updated_at IS NULL"))
    null_count = result.fetchone()[0]
    print(f"Remaining NULL datetime values: {null_count}")
