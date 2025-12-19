import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_dummy_data(output_path='dummy_train.csv', n_samples=1000):
    np.random.seed(42)
    
    # Generate timestamps
    base_date = datetime(2025, 1, 1)
    dates = [base_date + timedelta(minutes=np.random.randint(0, 100000)) for _ in range(n_samples)]
    
    # Generate other fields
    user_ids = np.random.randint(1001, 1050, n_samples)
    amounts = np.random.exponential(scale=100, size=n_samples).round(2)
    cities = np.random.choice(['New York', 'London', 'Paris', 'Tokyo', 'Mumbai', 'Delhi', 'Bangalore'], n_samples)
    categories = np.random.choice(['Electronics', 'Grocery', 'Travel', 'Utilities', 'Entertainment'], n_samples)
    
    # Generate Fraud_Type (0: Normal, 1: High Amount, 2: Velocity, 3: Location)
    # Simple logic for dummy labels
    fraud_types = np.zeros(n_samples, dtype=int)
    
    # Inject some patterns
    # High amount fraud
    high_amount_idx = amounts > 500
    fraud_types[high_amount_idx] = 1
    
    # Random other frauds
    fraud_types[np.random.choice(n_samples, 50)] = 2
    fraud_types[np.random.choice(n_samples, 50)] = 3
    
    df = pd.DataFrame({
        'Timestamp': dates,
        'UserID': user_ids,
        'Amount': amounts,
        'City': cities,
        'Category': categories,
        'Fraud_Type': fraud_types
    })
    
    print(f"Generating dummy data with {n_samples} samples...")
    print(df['Fraud_Type'].value_counts())
    
    df.to_csv(output_path, index=False)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    generate_dummy_data()
