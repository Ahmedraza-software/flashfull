from app.core.database import engine
from sqlalchemy import text

print(str(engine.url))
print(engine.url.database)

with engine.connect() as conn:
    tables = [r[0] for r in conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")).fetchall()]
    print(f"tables={len(tables)}")
    for t in tables[:20]:
        print(t)

    for table in ("employees", "employees2"):
        try:
            c = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
            print(f"{table}={c}")
        except Exception as e:
            print(f"{table}=ERROR:{e}")
