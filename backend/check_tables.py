from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\''))
    tables = result.fetchall()
    print('Tables in PostgreSQL database:')
    for table in tables:
        print(f'  - {table[0]}')
