from app.core.database import engine
from sqlalchemy import text

# Check row counts in PostgreSQL
tables_to_check = [
    'users', 'vehicles', 'employees', 'vehicle_maintenance', 'attendance_records',
    'clients', 'client_contacts', 'client_contracts', 'finance_accounts',
    'expenses', 'roles', 'permissions', 'user_roles', 'role_permissions',
    'employees2', 'payroll_sheet_entries'
]

print("PostgreSQL row counts after migration:")
print("=" * 40)

with engine.connect() as conn:
    for table in tables_to_check:
        try:
            result = conn.execute(text(f'SELECT COUNT(*) FROM {table}'))
            count = result.fetchone()[0]
            print(f'{table}: {count} rows')
        except Exception as e:
            print(f'{table}: Error - {e}')

print("=" * 40)
print("Migration verification completed!")
