from app.core.database import engine
from sqlalchemy import text

# Check if leave_periods table exists and has data
print("Checking leave_periods table...")

with engine.connect() as conn:
    # Check if table exists
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'leave_periods'
        )
    """))
    table_exists = result.fetchone()[0]
    print(f"Table exists: {table_exists}")
    
    if table_exists:
        # Check table structure
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'leave_periods'
            ORDER BY ordinal_position
        """))
        columns = result.fetchall()
        print("Table columns:")
        for col in columns:
            print(f"  {col[0]}: {col[1]}")
        
        # Check data
        result = conn.execute(text("SELECT COUNT(*) FROM leave_periods"))
        count = result.fetchone()[0]
        print(f"Total records: {count}")
        
        # Check sample data
        if count > 0:
            result = conn.execute(text("""
                SELECT employee_id, from_date, to_date, leave_type, reason 
                FROM leave_periods 
                LIMIT 3
            """))
            records = result.fetchall()
            print("Sample records:")
            for record in records:
                print(f"  {record}")
    else:
        print("Table does not exist")
