import os
from sqlalchemy import create_engine, text

# Force Neon URL
NEON_URL = "postgresql://neondb_owner:npg_4NSEdZDARsV7@ep-broad-resonance-a4rn7uze-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
engine = create_engine(NEON_URL)

# Get table names from metadata (import models to register)
from app.core.database import Base
from app.models import *  # Import all models

with engine.begin() as conn:
    # Truncate tables in reverse dependency order
    for table in reversed(Base.metadata.sorted_tables):
        try:
            conn.execute(text(f"TRUNCATE TABLE {table.name} RESTART IDENTITY CASCADE;"))
            print(f"Cleared table: {table.name}")
        except Exception as e:
            print(f"Failed to clear {table.name}: {e}")

print("All Neon tables cleared.")

print("All Neon tables cleared.")
