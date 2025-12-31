import pytest
from fastapi.testclient import TestClient
from main import app
from database import engine, SessionLocal
from models import Base
from sqlalchemy import text

# Create a test client
client = TestClient(app)

def test_health_db():
    response = client.get("/health/db")
    assert response.status_code == 200
    data = response.json()
    assert "dialect" in data
    assert "transactionsCount" in data

def test_login_success():
    # The default user is seeded at startup: analyst@anomalyse.bank / password123
    response = client.post("/auth/login", json={
        "email": "analyst@anomalyse.bank",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post("/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_transactions_unauthorized():
    response = client.get("/transactions")
    assert response.status_code == 401

def test_get_transactions_authorized():
    # Login first
    login_res = client.post("/auth/login", json={
        "email": "analyst@anomalyse.bank",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/transactions", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_metrics_authorized():
    # Login first
    login_res = client.post("/auth/login", json={
        "email": "analyst@anomalyse.bank",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    
    response = client.get("/dashboard/metrics", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert "totalTransactions" in data
    assert "overallRiskScore" in data
    # New metrics
    assert "topUsers" in data
    assert "avgAmountFraud" in data
    assert "avgAmountSafe" in data
    assert isinstance(data["topUsers"], list)
