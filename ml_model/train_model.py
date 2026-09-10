import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
print("Loading normal sensor data...")
data = pd.read_csv("normal_data.csv")
features = [
    "tilt",
    "vibration",
    "displacement",
    "strain"
]
X = data[features]
print("Scaling sensor data...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
print("Creating Isolation Forest model...")
model = IsolationForest(
    contamination=0.05,
    random_state=42
)
print("Training AI/ML model...")
model.fit(X_scaled)
joblib.dump(model, "subsidence_model.pkl")
joblib.dump(scaler, "scaler.pkl")
print("Model trained successfully!")
print("Created: subsidence_model.pkl")
print("Created: scaler.pkl")