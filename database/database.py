import sqlite3
import os

# Get current folder path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database file path
DB_PATH = os.path.join(BASE_DIR, "mine_monitoring.db")


# ------------------------------------
# CREATE DATABASE AND TABLE
# ------------------------------------

def create_database():

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sensor_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            node_id TEXT NOT NULL,
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

    print("Database created successfully!")
    print("Database path:", DB_PATH)


# ------------------------------------
# SAVE SENSOR DATA
# ------------------------------------

def save_sensor_data(
    timestamp,
    node_id,
    tilt,
    vibration,
    displacement,
    strain,
    anomaly,
    risk_level
):

    conn = sqlite3.connect(DB_PATH)
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
        node_id,
        tilt,
        vibration,
        displacement,
        strain,
        anomaly,
        risk_level
    ))

    conn.commit()
    conn.close()


# ------------------------------------
# GET LATEST DATA
# ------------------------------------

def get_latest_data():

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM sensor_data
        ORDER BY id DESC
        LIMIT 1
    """)

    row = cursor.fetchone()

    conn.close()

    return row


# ------------------------------------
# RUN THIS FILE DIRECTLY
# ------------------------------------

if __name__ == "__main__":
    create_database()