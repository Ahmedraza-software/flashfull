import pymysql
from passlib.context import CryptContext

# Configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'password',
    'database': 'flash_erp',
    'port': 3306
}

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

USERS_TO_FIX = {
    "superadmin": "SuperAdmin@123",
    "employee_entry": "Employee@123",
    "attendance_manager": "Attendance@123",
    "hr_payroll": "HRPayroll@123",
    "clients_view": "Clients@123",
    "accounts_full": "Accounts@123",
    "hr_payroll_accounts": "HRPayrollAccounts@123"
}

def fix_hashes():
    try:
        connection = pymysql.connect(**DB_CONFIG)
        with connection.cursor() as cursor:
            print("Connected to database. Fixing hashes...")
            
            for username, password in USERS_TO_FIX.items():
                print(f"Updating hash for {username}...")
                new_hash = pwd_context.hash(password)
                sql = "UPDATE users SET hashed_password = %s WHERE username = %s"
                cursor.execute(sql, (new_hash, username))
            
            connection.commit()
            print("Successfully updated all hashes!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    fix_hashes()
