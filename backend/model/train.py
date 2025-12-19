import pandas as pd
import joblib
from pathlib import Path
import sys
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score

from .preprocessing import preprocess_data

# Define paths
BASE_DIR = Path(__file__).parent
PIPELINE_PATH = BASE_DIR / "pipeline.pkl"

def train_model(input_csv: Path):
    print(f"Loading data from {input_csv}...")
    df = pd.read_csv(input_csv)
    
    # Basic validation
    required_cols = ['Timestamp', 'UserID', 'Amount', 'City', 'Category', 'Fraud_Type']
    missing_cols = [c for c in required_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    print("Preprocessing data and engineering features...")
    df_processed = preprocess_data(df)
    
    # Define features
    numerical_features = [
        'Amount',
        'User_Mean_Amount',
        'User_Std_Amount',
        'Time_Since_Last_TXN_Sec',
        'Time_Since_Last_TXN_Hrs',
        'Amount_Z_Score',
        'Geo_Velocity_Check',
        'Txn_Count_30_Min',
        'Category_Usage_Score'
    ]
    
    categorical_features = ['City', 'Category']
    
    # Prepare X and y
    X = df_processed[numerical_features + categorical_features]
    y = df_processed['Fraud_Type']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Building pipeline...")
    # Create Preprocessing Pipeline
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    # Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1,
        # Using some reasonable defaults based on notebook grid search (simplified)
        max_depth=10,
        min_samples_leaf=5,
        min_samples_split=10
    )
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', rf)
    ])
    
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    try:
        y_pred_proba = pipeline.predict_proba(X_test)
        auc = roc_auc_score(y_test, y_pred_proba, multi_class='ovr', average='weighted')
        print(f"Weighted Multi-Class AUC-ROC: {auc:.4f}")
    except Exception as e:
        print(f"Could not calculate AUC-ROC: {e}")
    
    print(f"Saving pipeline to {PIPELINE_PATH}...")
    joblib.dump(pipeline, PIPELINE_PATH)
    print("Training complete.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python train_model.py <path_to_training_csv>")
        sys.exit(1)
        
    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"File not found: {input_path}")
        sys.exit(1)
        
    train_model(input_path)
