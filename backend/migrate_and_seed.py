import sqlite3
import random
import json

DB_PATH = "anomalyse.db"

def migrate_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if columns exist
    cursor.execute("PRAGMA table_info(transactions)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if "flag_type" not in columns:
        print("Adding flag_type column...")
        cursor.execute("ALTER TABLE transactions ADD COLUMN flag_type TEXT")
    
    if "flag_reason" not in columns:
        print("Adding flag_reason column...")
        cursor.execute("ALTER TABLE transactions ADD COLUMN flag_reason TEXT")
    
    conn.commit()
    conn.close()
    print("Migration complete.")

def seed_flags():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Seeding flag data...")
    
    # Get all transactions
    cursor.execute("SELECT id, status, amount, city FROM transactions")
    rows = cursor.fetchall()
    
    flag_types_def = ['Velocity', 'Amount', 'Location', 'Pattern', 'Device']
    reasons = {
        'Velocity': "Unusual frequency of transactions within a short time window.",
        'Amount': "Transaction amount significantly higher than user's historical average.",
        'Location': "Transaction originated from a location inconsistent with previous activity.",
        'Pattern': "Detected complex pattern matching known fraud vectors.",
        'Device': "Unrecognized device fingerprint or suspicious IP range."
    }
    
    for row in rows:
        txn_id, status, amount, city = row
        
        # Target Suspicious, Review, and Review Required
        if status in ['Suspicious', 'Review', 'Review Required']:
            # Determine how many flags to generate (1 to 3)
            # Review Required might be more complex, so give it at least 2 sometimes
            num_flags = random.randint(1, 3)
            if status == 'Review Required' and num_flags < 2:
                num_flags = 2
                
            selected_types = random.sample(flag_types_def, num_flags)
            
            # If amount is high, ensure Amount flag is present
            if amount > 1000 and 'Amount' not in selected_types:
                selected_types[0] = 'Amount'
            
            flags_list = []
            for f_type in selected_types:
                f_reason = reasons[f_type]
                
                # Add details
                if f_type == 'Amount':
                    f_reason += f" Amount: ${amount:.2f}"
                elif f_type == 'Location':
                    f_reason += f" Location: {city}"
                
                flags_list.append({
                    "type": f_type,
                    "reason": f_reason
                })
            
            # Store as JSON in flag_type column
            flags_json = json.dumps(flags_list)
            
            cursor.execute(
                "UPDATE transactions SET flag_type = ?, flag_reason = NULL WHERE id = ?",
                (flags_json, txn_id)
            )
        else:
            # Clear flags for safe transactions
            cursor.execute(
                "UPDATE transactions SET flag_type = NULL, flag_reason = NULL WHERE id = ?",
                (txn_id,)
            )
            
    conn.commit()
    conn.close()
    print("Seeding complete.")

if __name__ == "__main__":
    migrate_db()
    seed_flags()
