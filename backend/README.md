# Anomalyse - Backend
The backend for Anomalyse is a FastAPI-powered REST API that integrates a Machine Learning model for real-time fraud detection.

## 🛠️ Tech Stack
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Database**: SQLite with [SQLAlchemy](https://www.sqlalchemy.org/)
- **Machine Learning**: [Scikit-learn](https://scikit-learn.org/) (Random Forest)
- **Data Processing**: [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)
- **Authentication**: JWT with [Python-jose](https://python-jose.readthedocs.io/) and [Bcrypt](https://passlib.readthedocs.io/)

## 🚀 Development Setup

### Prerequisites
- Python 3.8+
- Virtualenv

### Installation
1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows: .venv\Scripts\activate
   # Mac/Linux: source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database and seed data:
   ```bash
   python migrate_and_seed.py
   ```

### Running the API
```bash
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`. Documentation (Swagger) can be found at `http://localhost:8000/docs`.

## 📁 Project Structure
- `main.py`: Application entry point and route definitions.
- `models.py`: SQLAlchemy database models.
- `database.py`: Database connection and session management.
- `config.py`: Environment and application configuration.
- `auth_utils.py`: Security and JWT helpers.
- `model/`: Contains the ML pipeline (`pipeline.pkl`), training scripts, and preprocessing logic.

## 🤖 Machine Learning Model
The system uses a Random Forest Classifier to score transactions.
- **Key Features**: Amount, User History (mean/std), Geo-Velocity, and Transaction Frequency.
- **Training**: See `model/train.py` for the training pipeline.
- **Documentation**: Detailed model info in [MODEL_README.md](MODEL_README.md).

## 🧪 Testing
```bash
pytest
```
Runs the suite of API and integration tests.
