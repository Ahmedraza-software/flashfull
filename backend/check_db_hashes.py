from sqlalchemy import create_engine, text
from app.core.config import settings

# Adjust the logic to use the database URL from settings or env
DATABASE_URL = "mysql+pymysql://user:password@localhost:3306/flash_erp"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("SELECT id, username, hashed_password FROM users"))
    print(f"{'ID':<5} | {'Username':<20} | {'Hash Prefix':<20} | {'Length':<10}")
    print("-" * 60)
    for row in result:
        h = row[2]
        prefix = h[:20] if h else "None"
        length = len(h) if h else 0
        print(f"{row[0]:<5} | {row[1]:<20} | {prefix:<20} | {length:<10}")
