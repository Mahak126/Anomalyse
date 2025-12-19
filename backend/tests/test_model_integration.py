import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys
import os

# Add backend to sys.path
sys.path.append(str(Path(__file__).parent.parent))

from model.preprocessing import preprocess_data, haversine_distance
from main import app, get_db
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

client = TestClient(app)

def test_haversine_distance():
    # Distance between Mumbai and Delhi ~1148 km
    mumbai = (19.0760, 72.8777)
    delhi = (28.7041, 77.1025)
    dist = haversine_distance(mumbai, delhi)
    assert 1100 < dist < 1200

def test_preprocess_data():
    # Create sample dataframe
    data = {
        'Timestamp': pd.to_datetime(['2025-01-01 10:00:00', '2025-01-01 10:10:00', '2025-01-01 10:40:00']),
        'UserID': ['1', '1', '1'],
        'Amount': [100.0, 200.0, 500.0],
        'City': ['Mumbai', 'Mumbai', 'Delhi'],
        'Category': ['Food', 'Food', 'Travel']
    }
    df = pd.DataFrame(data)
    
    processed = preprocess_data(df)
    
    assert 'Time_Since_Last_TXN_Sec' in processed.columns
    assert 'Distance_Km' in processed.columns
    assert 'Txn_Count_30_Min' in processed.columns
    
    # Check values
    # Second txn: 10 mins after first. Txn count should include first? 
    # Logic: rolling(closed='left').count()
    # 10:00 -> count=0
    # 10:10 -> window [09:40, 10:10). Includes 10:00. count=1
    # 10:40 -> window [10:10, 10:40). Includes 10:10? 
    # rolling window depends on implementation details in ml_utils
    
    # Check distance for 3rd txn (Mumbai -> Delhi)
    assert processed.iloc[2]['Distance_Km'] > 1000

@patch('main.joblib.load')
@patch('main.MODEL_PATH')
def test_predict_endpoint(mock_path, mock_load):
    # Mock model
    mock_pipeline = MagicMock()
    mock_pipeline.predict.return_value = [0] # Safe
    mock_pipeline.predict_proba.return_value = [[0.9, 0.1]] # 90% Safe
    mock_pipeline.classes_ = [0, 1]
    mock_load.return_value = mock_pipeline
    mock_path.exists.return_value = True
    
    # Mock DB
    with patch('main.SessionLocal') as mock_db_cls:
        mock_db = MagicMock()
        mock_db_cls.return_value = mock_db
        # Mock scalars().all() to return empty list (no history)
        mock_db.scalars.return_value.all.return_value = []
        
        response = client.post("/predict", json={
            "timestamp": "2025-01-01 12:00:00",
            "amount": 150.0,
            "user_id": "test_user",
            "city": "Mumbai",
            "category": "Food"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'Safe'
        assert data['is_fraud'] == False
        
@patch('main.joblib.load')
@patch('main.MODEL_PATH')
def test_upload_endpoint(mock_path, mock_load):
    # Mock model
    mock_pipeline = MagicMock()
    # Mock predict for batch of 2 rows
    mock_pipeline.predict.return_value = [0, 1] 
    mock_pipeline.predict_proba.return_value = [[0.9, 0.1], [0.2, 0.8]]
    mock_pipeline.classes_ = [0, 1]
    mock_load.return_value = mock_pipeline
    mock_path.exists.return_value = True

    # Mock DB
    with patch('main.SessionLocal') as mock_db_cls:
        mock_db = MagicMock()
        mock_db_cls.return_value = mock_db
        
        # Mock auth token
        with patch('main.decode_token') as mock_decode:
            mock_decode.return_value = {'sub': 'test@example.com'}
            
            csv_content = "Timestamp,UserID,Amount,City,Category\n2025-01-01 10:00:00,1,100,Mumbai,Food\n2025-01-01 10:05:00,1,5000,Delhi,Travel"
            files = {'file': ('test.csv', csv_content, 'text/csv')}
            
            response = client.post(
                "/upload", 
                files=files,
                headers={"Authorization": "Bearer testtoken"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data['success'] == True
            assert data['rowsProcessed'] == 2
