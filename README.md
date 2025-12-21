# Anomalyse - Fraud Detection System

Anomalyse is a comprehensive fraud detection system that integrates a FastAPI-driven Machine Learning backend with a React-based frontend. It provides real-time transaction monitoring, risk scoring, and analytical tools for fraud prevention.

## 🌐 Deployment
To deploy Anomalyse, you need to deploy the frontend and backend separately:

### 1. Backend (Recommended: Render/Railway)
- Set environment variables:
  - `DATABASE_URL`: Your PostgreSQL connection string (from Supabase/Neon).
  - `JWT_SECRET`: A secure random string.
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2. Frontend (Recommended: Vercel/Netlify)
- Set environment variables:
  - `VITE_API_URL`: The URL of your deployed backend.
- Build Command: `npm run build`
- Output Directory: `dist`

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts.
- **Backend**: FastAPI, Python, SQLAlchemy, Scikit-learn.
- **ML Model**: Random Forest Classifier with advanced feature engineering.

## 📁 Project Structure

```text
Anomalyse/
├── frontend/          # React + Vite application
├── backend/           # FastAPI + ML integration
└── TECHNICAL_SPECS.md # Detailed requirements & specifications
```

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.8+)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/anomalyse.git
   cd anomalyse
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv .venv
   # Activate venv:
   # Windows: .venv\Scripts\activate
   # Mac/Linux: source .venv/bin/activate
   pip install -r requirements.txt
   python migrate_and_seed.py
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```

## 🏃 Running the Application

### 1. Start the Backend
```bash
cd backend
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## 📚 Documentation
- [Technical Specifications](TECHNICAL_SPECS.md)
- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
