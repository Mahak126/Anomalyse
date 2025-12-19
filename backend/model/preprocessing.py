import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Constants
CITY_COORDS = {
    'Mumbai': (19.0760, 72.8777),
    'Delhi': (28.7041, 77.1025),
    'Bangalore': (12.9716, 77.5946),
    'Chennai': (13.0827, 80.2707),
    'Kolkata': (22.5726, 88.3639),
    'Pune': (18.5204, 73.8567),
    'Hyderabad': (17.3850, 78.4867),
    'Ahmedabad': (23.0225, 72.5714)
}

MAX_SPEED_KMH = 1000
MAX_SPEED_KMS = MAX_SPEED_KMH / 3600
WINDOW_SIZE = '30min'

def haversine_distance(coord1, coord2):
    R = 6371
    lat1, lon1 = np.radians(coord1)
    lat2, lon2 = np.radians(coord2)

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = np.sin(dlat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    distance = R * c
    return distance

def calculate_lookback_count_values(group):
    # Ensure group is sorted by timestamp
    group = group.sort_values('Timestamp')
    original_index = group.index
    group_indexed = group.set_index('Timestamp')
    result = group_indexed['Amount'].rolling(
        WINDOW_SIZE,
        closed='left'
    ).count().fillna(0)
    return pd.Series(result.values, index=original_index)

def calculate_category_score(group):
    # Ensure group is sorted by timestamp
    group = group.sort_values('Timestamp')
    
    cumulative_txn_count = pd.Series(range(len(group)), index=group.index).shift(1).fillna(0)

    # Create a copy to avoid SettingWithCopyWarning
    group = group.copy()
    group['Count'] = range(len(group))
    
    # This computes cumcount for each category within the user group
    group['Category_Count'] = group.groupby('Category')['Count'].cumcount()
    group['Past_Category_Count'] = group['Category_Count'].shift(1).fillna(0)

    epsilon = 1e-6
    ratio = group['Past_Category_Count'] / (cumulative_txn_count + epsilon)

    return ratio

def preprocess_data(df: pd.DataFrame, is_training=True) -> pd.DataFrame:
    """
    Applies all feature engineering steps to the DataFrame.
    Expects columns: Timestamp, UserID, Amount, City, Category
    """
    df = df.copy()
    
    # Convert Timestamp
    if not pd.api.types.is_datetime64_any_dtype(df['Timestamp']):
        df['Timestamp'] = pd.to_datetime(df['Timestamp'])
        
    # Sort by UserID and Timestamp
    df = df.sort_values(['UserID', 'Timestamp'])
    
    # 1. User Stats (Mean, Std)
    user_stats = df.groupby('UserID')['Amount'].agg(['mean', 'std']).reset_index()
    user_stats.columns = ['UserID', 'User_Mean_Amount', 'User_Std_Amount']
    df = df.merge(user_stats, on='UserID', how='left')
    df['User_Std_Amount'] = df['User_Std_Amount'].fillna(0) 
    
    # 2. Amount Z-Score
    epsilon = 1e-6
    df['Amount_Z_Score'] = (df['Amount'] - df['User_Mean_Amount']) / (df['User_Std_Amount'] + epsilon)
    
    # 3. Time Since Last Transaction
    df['Prev_Timestamp'] = df.groupby('UserID')['Timestamp'].shift(1)
    df['Time_Since_Last_TXN_Sec'] = (df['Timestamp'] - df['Prev_Timestamp']).dt.total_seconds().fillna(0)
    df['Time_Since_Last_TXN_Hrs'] = df['Time_Since_Last_TXN_Sec'] / 3600
    
    # 4. Geo Velocity
    df['Prev_City'] = df.groupby('UserID')['City'].shift(1)
    df['Prev_City'] = df['Prev_City'].fillna(df['City'])
    
    def get_distance(row):
        c1 = CITY_COORDS.get(row['Prev_City'], (0,0))
        c2 = CITY_COORDS.get(row['City'], (0,0))
        if c1 == (0,0) or c2 == (0,0): return 0
        return haversine_distance(c1, c2)

    df['Distance_Km'] = df.apply(get_distance, axis=1)
    df['Min_Travel_Time_Sec'] = df['Distance_Km'] / MAX_SPEED_KMS
    df['Geo_Velocity_Check'] = df['Min_Travel_Time_Sec'] / (df['Time_Since_Last_TXN_Sec'] + epsilon)
    
    # 5. Rolling Transaction Count (30 min)
    # Using explicit assignment to handle potential index mismatches if apply returns differently
    txn_counts = df.groupby('UserID', group_keys=False)[['Timestamp', 'Amount']].apply(calculate_lookback_count_values)
    
    # If apply returns a Series with MultiIndex or different index, we align it
    if isinstance(txn_counts, pd.DataFrame):
         txn_counts = txn_counts.iloc[:, 0] # Take first column if it became a DF
         
    # Align by index
    df['Txn_Count_30_Min'] = txn_counts
    df['Txn_Count_30_Min'] = df['Txn_Count_30_Min'].astype(float).fillna(0).astype(int)
    
    # 6. Category Usage Score
    cat_scores = df.groupby('UserID', group_keys=False)[['Timestamp', 'Category']].apply(calculate_category_score)
    
    if isinstance(cat_scores, pd.DataFrame):
        cat_scores = cat_scores.iloc[:, 0]
        
    df['Category_Usage_Score'] = cat_scores
    df['Category_Usage_Score'] = df['Category_Usage_Score'].clip(upper=1.0)
    
    # Drop intermediate columns
    drop_cols = ['Prev_Timestamp', 'Prev_City', 'Min_Travel_Time_Sec']
    df = df.drop(columns=drop_cols, errors='ignore')
    
    return df
