import pytest
from fastapi.testclient import TestClient
from main import app
from pathlib import Path
import os

client = TestClient(app)

def test_upload_csv_success():
    # Login first
    login_res = client.post("/auth/login", json={
        "email": "analyst@anomalyse.bank",
        "password": "password123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    
    # Create a dummy CSV with new format
    csv_content = "Timestamp,UserID,Amount,City,Category\n2024-01-01 10:00:00,User123,100.50,New York,Food\n"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    
    response = client.post("/upload", 
                           headers={"Authorization": f"Bearer {token}"},
                           files=files)
    
    if response.status_code != 200:
        print(f"Upload failed: {response.text}")

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["rowsProcessed"] == 1

def test_get_transactions_has_new_fields():
    # Login
    login_res = client.post("/auth/login", json={
        "email": "analyst@anomalyse.bank",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    
    # Fetch transactions (should have the one we just uploaded)
    response = client.get("/transactions", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    txns = response.json()
    assert len(txns) > 0
    txn = txns[0]
    
    # Check new fields
    assert "user_id" in txn
    assert "city" in txn
    assert "category" in txn
    assert txn["user_id"] == "User123"
    assert txn["city"] == "New York"
    assert txn["category"] == "Food"
