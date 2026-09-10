import os
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))



print("Loading AI/ML model...")

model = joblib.load(
    os.path.join(BASE_DIR, "subsidence_model.pkl")
)

scaler = joblib.load(
    os.path.join(BASE_DIR, "scaler.pkl")
)



def predict_risk(tilt, vibration, displacement, strain):

    # Put one sensor reading into an array
    data = np.array([[
        tilt,
        vibration,
        displacement,
        strain
    ]])

    # Scale data using the SAME scaler
    data_scaled = scaler.transform(data)

    # AI prediction
    prediction = model.predict(data_scaled)[0]

    # AI anomaly score
    score = model.decision_function(data_scaled)[0]

    if prediction == 1:

        return {
            "anomaly": False,
            "risk": "SAFE",
            "anomaly_score": float(score)
        }


    if tilt > 8 or displacement > 30 or strain > 500:

        risk = "CRITICAL"

    elif tilt > 5 or displacement > 15 or strain > 350:

        risk = "HIGH RISK"

    else:

        risk = "WARNING"


    return {
        "anomaly": True,
        "risk": risk,
        "anomaly_score": float(score)
    }



if __name__ == "__main__":

    # Example sensor reading
    result = predict_risk(
        tilt=6.2,
        vibration=0.6,
        displacement=18,
        strain=400
    )

    print("\nAI/ML PREDICTION:")
    print(result)