import sqlite3

def check_db():
    try:
        conn = sqlite3.connect('anomalyse.db')
        cursor = conn.cursor()
        
        # Check table info
        print("Table Info:")
        cursor.execute("PRAGMA table_info(transactions)")
        cols = cursor.fetchall()
        for c in cols:
            print(c)
            
        # Check a suspicious transaction
        print("\nSuspicious Transaction:")
        row = cursor.execute("SELECT id, status, flag_type, flag_reason FROM transactions WHERE status = 'Suspicious' LIMIT 1").fetchone()
        print(row)
        
        conn.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_db()
