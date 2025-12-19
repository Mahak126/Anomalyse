# Machine Learning Model Integration Documentation

## Overview
This document details the integration of the fraud detection machine learning model into the Anomalyse backend.

## 1. Model Architecture
- **Algorithm**: Random Forest Classifier
- **Features**:
  - `Amount`: Transaction amount
  - `User_Mean_Amount`: Historical mean amount for the user
  - `User_Std_Amount`: Historical standard deviation of amount for the user
  - `Time_Since_Last_TXN_Sec`: Seconds since the user's last transaction
  - `Amount_Z_Score`: Z-score of the current amount relative to user history
  - `Geo_Velocity_Check`: Ratio of minimum travel time to actual time difference (velocity check)
  - `Txn_Count_30_Min`: Number of transactions in the last 30 minutes
  - `Category_Usage_Score`: Frequency of category usage relative to total transactions
  - `City`, `Category`: One-Hot Encoded categorical features

## 2. API Endpoints

### 2.1 Predict Single Transaction
- **Endpoint**: `POST /predict`
- **Description**: Evaluates a single transaction for fraud risk.
- **Input Format** (JSON):
  ```json
  {
    "timestamp": "2025-01-30 18:25:56",
    "amount": 206.0,
    "user_id": "1000",
    "city": "Kolkata",
    "category": "Luxury"
  }
  ```
- **Output Structure** (JSON):
  ```json
  {
    "is_fraud": false,
    "risk_score": 5.0,
    "status": "Safe"
  }
  ```
  - `is_fraud`: Boolean indicating if the model flagged the transaction.
  - `risk_score`: Probability score (0-100) of fraud.
  - `status`: "Safe" or "Suspicious".

### 2.2 Bulk Upload & Predict
- **Endpoint**: `POST /upload`
- **Description**: Uploads a CSV file, processes it through the model, and stores results in the database.
- **Input Format** (CSV File):
  - Required columns: `Timestamp`, `UserID`, `Amount`, `City`, `Category`
- **Output Structure**:
  ```json
  {
    "success": true,
    "message": "File processed and transactions stored.",
    "rowsProcessed": 500
  }
  ```

## 3. Data Preprocessing
Preprocessing is handled automatically by the backend.
- **Date Parsing**: Timestamps are parsed to datetime objects.
- **Feature Engineering**:
  - Historical context (previous transaction, rolling windows) is fetched from the database for `/predict`.
  - For `/upload`, features are calculated within the CSV batch.
- **Handling Missing Values**: Imputation strategies (median for numeric, most_frequent for categorical) are applied within the pipeline.

## 4. Dependencies
- `scikit-learn`: For model pipeline and preprocessing.
- `pandas`: For data manipulation.
- `joblib`: For model serialization.
- `numpy`: For numerical operations.

## 5. Environment Requirements
- Python 3.8+
- The model file `pipeline.pkl` must be present in the `backend/model/` directory. Run `python model/train.py <path_to_data>` to generate it.
