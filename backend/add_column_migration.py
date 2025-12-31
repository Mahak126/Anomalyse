import sqlite3

# Hardcoding DB name since it's the default in config.py and easy to target for migration
DB_NAME = "anomalyse.db"

def add_notification_column():
    print(f"Connecting to {DB_NAME}...")
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(transactions)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'notification_sent' not in columns:
            print("Adding 'notification_sent' column to transactions table...")
            cursor.execute("ALTER TABLE transactions ADD COLUMN notification_sent BOOLEAN DEFAULT 0")
            conn.commit()
            print("Column added successfully.")
        else:
            print("'notification_sent' column already exists.")
            
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    add_notification_column()
