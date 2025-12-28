import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models import *  # Import all models so tables are known

# Paths
SQLITE_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "flash_erp.db"))
SQLITE_URL = f"sqlite:///{SQLITE_DB_PATH}"

# Engines
sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
NEON_URL = "postgresql://neondb_owner:npg_4NSEdZDARsV7@ep-broad-resonance-a4rn7uze-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
neon_engine = create_engine(NEON_URL)

# Session factories
SQLiteSession = sessionmaker(bind=sqlite_engine)
NeonSession = sessionmaker(bind=neon_engine)

# Ensure Neon schema exists (create tables)
from app.core.database import Base
Base.metadata.create_all(bind=neon_engine)
print("Neon tables ensured.")

# Helper to get table names from models
def get_model_table_names():
    # Import all model modules to register tables
    from app.models import (
        user, vehicle, vehicle_document, vehicle_image, fuel_entry,
        employee, employee_document, employee_warning, employee_warning_document,
        attendance, leave_period, vehicle_assignment, vehicle_maintenance,
        payroll_payment_status, payroll_sheet_entry, employee_advance,
        employee_advance_deduction, general_item, general_item_transaction,
        general_item_employee_balance, client, client_contact, client_address,
        client_site, client_contract, client_guard_requirement,
        client_site_guard_allocation, client_rate_card, client_invoice,
        client_document, restricted_item, restricted_item_image,
        restricted_item_serial_unit, restricted_item_transaction,
        restricted_item_employee_balance, finance_account,
        finance_journal_line, finance_journal_entry, expense, employee2,
    )
    # Return table names from the metadata
    return list(Base.metadata.tables.keys())

table_names = get_model_table_names()
print(f"Tables to migrate: {table_names}")

# Copy each table
sqlite_db = SQLiteSession()
neon_db = NeonSession()

try:
    for table in table_names:
        print(f"\nMigrating table: {table}")
        try:
            # Read all rows from SQLite
            rows = sqlite_db.execute(text(f"SELECT * FROM {table}")).fetchall()
            if not rows:
                print("  (no rows)")
                continue
            # Get column names
            cols = rows[0]._fields if rows else []
            # Build insert query
            placeholders = ", ".join([f":{col}" for col in cols])
            insert_sql = text(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders})")
            # Insert into Neon
            for row in rows:
                neon_db.execute(insert_sql, {col: getattr(row, col) for col in cols})
            neon_db.commit()
            print(f"  Migrated {len(rows)} rows")
        except Exception as e:
            print(f"  Error migrating {table}: {e}")
            neon_db.rollback()
finally:
    sqlite_db.close()
    neon_db.close()

print("\nMigration to Neon complete.")
