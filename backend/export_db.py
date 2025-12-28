import sqlite3
import io
import os

db_path = 'flash_erp.db'
export_path = 'flash_erp_export.sql'

def dump_db():
    if not os.path.exists(db_path):
        print(f"Error: Database file {db_path} not found.")
        return

    try:
        print(f"Exporting {db_path} to {export_path}...")
        con = sqlite3.connect(db_path)
        with io.open(export_path, 'w', encoding='utf-8') as f:
            for line in con.iterdump():
                f.write('%s\n' % line)
        con.close()
        print(f"Database exported successfully to {export_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    dump_db()
