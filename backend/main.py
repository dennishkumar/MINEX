import os
import sys
import sqlite3
from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel

# Get project folder paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(CURRENT_DIR)

ML_FOLDER = os.path.join(PROJECT_DIR, "ml_model")
DATABASE_FOLDER = os.path.join(PROJECT_DIR, "database")

# Allow backend to import predict.py
sys.path.append(ML_FOLDER)

from predict import predict_risk

# Create database folder automatically
os.makedirs(DATABASE_FOLDER, exist_ok=True)

DATABASE_PATH = os.path.join(
    DATABASE_FOLDER,
    "mine_monitoring.db"
)

# Create FastAPI application
app = FastAPI(title="Mine Subsidence Monitoring API")


# Expected sensor data
class SensorData(BaseModel):
    node_id: str = "NODE_01"
    tilt: float
    vibration: float
    displacement: float
    strain: float


# Create database table
def create_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            node_id TEXT,
            tilt REAL,
            vibration REAL,
            displacement REAL,
            strain REAL,
            anomaly INTEGER,
            risk_level TEXT
        )
    """)

    conn.commit()
    conn.close()


# Create database when backend starts
create_database()


# Test API
@app.get("/")
def home():
    return {
        "message": "Mine Subsidence Monitoring API is running"
    }


# Send data to AI, save result in database
@app.post("/predict")
def predict(data: SensorData):

    # AI/ML prediction
    result = predict_risk(
        data.tilt,
        data.vibration,
        data.displacement,
        data.strain
    )

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Save to database
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO sensor_data (
            timestamp,
            node_id,
            tilt,
            vibration,
            displacement,
            strain,
            anomaly,
            risk_level
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        timestamp,
        data.node_id,
        data.tilt,
        data.vibration,
        data.displacement,
        data.strain,
        1 if result["anomaly"] else 0,
        result["risk"]
    ))

    conn.commit()
    conn.close()

    return {
        "timestamp": timestamp,
        "node_id": data.node_id,
        "tilt": data.tilt,
        "vibration": data.vibration,
        "displacement": data.displacement,
        "strain": data.strain,
        "anomaly": result["anomaly"],
        "risk": result["risk"]
    }


# Get latest saved reading
@app.get("/latest")
def get_latest():

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM sensor_data
        ORDER BY id DESC
        LIMIT 1
    """)

    row = cursor.fetchone()
    conn.close()

    if row is None:
        return {"message": "No data available yet"}

    return {
        "id": row[0],
        "timestamp": row[1],
        "node_id": row[2],
        "tilt": row[3],
        "vibration": row[4],
        "displacement": row[5],
        "strain": row[6],
        "anomaly": bool(row[7]),
        "risk": row[8]
    }