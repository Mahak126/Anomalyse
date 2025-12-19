# Anomalyse - Technical Specifications & Requirements

## 1. Project Overview
Anomalyse is an end-to-end fraud detection system designed for financial institutions. It combines a robust Machine Learning backend with a modern React-based dashboard to identify, visualize, and manage suspicious transactions in real-time.

## 2. Functional Requirements

### 2.1 Transaction Monitoring
- **Real-time Feed**: Display a live or near-real-time feed of incoming transactions.
- **Risk Scoring**: Each transaction is assigned a risk score (0-100) by the ML model.
- **Anomaly Detection**: Flagging transactions based on velocity, location anomalies, and historical spending patterns.

### 2.2 Analysis Dashboard
- **Key Metrics**: Visualize Total Volume, Fraud Rate, and High-Risk Alerts.
- **Trend Analysis**: Graphical representation of transaction trends over time using Recharts.
- **Geographical Insights**: Identification of high-risk cities or regions.

### 2.3 Management Interface
- **Detailed Review**: Capability to inspect specific flags (e.g., "Device Fingerprint Mismatch", "High Velocity").
- **Actionable Guidance**: System-generated suggestions for analysts (e.g., "Immediate Review", "Verify Details").
- **Search & Filtering**: Filter transactions by amount, risk score, date, and specific flag types.

### 2.4 Data Integration
- **Bulk Upload**: Analysts can upload CSV files for batch processing and retrospective analysis.
- **API Integration**: RESTful endpoints for single transaction prediction.

## 3. Technical Specifications

### 3.1 Frontend Architecture
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS for utility-first responsive design.
- **Routing**: React Router 6 for single-page application navigation.
- **State Management**: React Hooks (useState, useEffect, useMemo).
- **Icons**: Lucide React.
- **Visualization**: Recharts.

### 3.2 Backend Architecture
- **Framework**: FastAPI (Python 3.8+).
- **Database**: SQLite (SQLAlchemy ORM) for transaction storage and user profiles.
- **Authentication**: JWT-based authentication (Python-jose) with Bcrypt password hashing.
- **Data Processing**: Pandas and NumPy.
- **Machine Learning**: Scikit-learn (Random Forest Classifier).

### 3.3 ML Model Features
- **Categorical**: One-Hot Encoded `City`, `Category`.
- **Numerical**: `Amount`, `User_Mean_Amount`, `Time_Since_Last_TXN`.
- **Engineered**: `Amount_Z_Score`, `Geo_Velocity_Check`, `Txn_Count_30_Min`.

## 4. System Dependencies

### 4.1 Frontend Dependencies
- Node.js >= 16.x
- npm or yarn

### 4.2 Backend Dependencies
- Python >= 3.8
- Virtual Environment (venv recommended)
- Dependencies listed in `backend/requirements.txt`.

## 5. Environment Setup

### 5.1 Local Development
1. **Clone Repository**
2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python migrate_and_seed.py  # Initialize DB
   ```
3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

## 6. Testing Procedures

### 6.1 Backend Testing
- **Framework**: Pytest.
- **Command**: `pytest` within the `backend/` directory.
- **Coverage**: API endpoints, database migrations, and model integration.

### 6.2 Frontend Testing
- **Framework**: Vitest.
- **Command**: `npm test` within the `frontend/` directory.

## 7. Deployment Guidelines

### 7.1 Backend Deployment
- **Server**: Uvicorn/Gunicorn.
- **Proxy**: Nginx recommended for SSL termination and reverse proxying.
- **Containerization**: Dockerfile provided for consistent environment.

### 7.2 Frontend Deployment
- **Build**: `npm run build`.
- **Hosting**: Static site hosting (Vercel, Netlify, or Nginx).

## 8. License & Contributions
- **License**: MIT
- **Contributions**: Pull requests are welcome. Ensure all tests pass before submitting.
