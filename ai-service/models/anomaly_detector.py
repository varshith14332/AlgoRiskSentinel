"""
Anomaly Detection Model
Uses Isolation Forest to detect unusual shipment behavior patterns.
"""
import numpy as np
from sklearn.ensemble import IsolationForest

_TRAFFIC_MAP = {"Low": 0, "Medium": 1, "High": 2}

# Train Isolation Forest on "normal" shipment data
np.random.seed(42)
n_normal = 400

_X_normal = np.column_stack([
    np.random.uniform(200, 1500, n_normal),      # distance
    np.random.uniform(1, 5, n_normal),            # expectedDeliveryDays
    np.random.uniform(1, 5, n_normal),            # actualDeliveryDays (similar)
    np.random.randint(0, 3, n_normal),            # trafficLevel
    np.random.uniform(15, 35, n_normal),          # temperature (normal range)
    np.random.uniform(100, 2000, n_normal),       # weight
])

_iso_forest = IsolationForest(
    n_estimators=100,
    contamination=0.1,
    random_state=42,
)
_iso_forest.fit(_X_normal)


def detect_anomaly(shipment_data) -> dict:
    """Detect anomalous shipment behavior using Isolation Forest."""
    traffic = _TRAFFIC_MAP.get(shipment_data.trafficLevel, 1)

    features = np.array([[
        shipment_data.distance,
        shipment_data.expectedDeliveryDays,
        shipment_data.actualDeliveryDays,
        traffic,
        shipment_data.temperature,
        shipment_data.weight,
    ]])

    # -1 = anomaly, 1 = normal
    prediction = _iso_forest.predict(features)[0]
    anomaly_score = -_iso_forest.score_samples(features)[0]  # Higher = more anomalous

    # Normalize to 0-100 risk score
    # Typical scores range from -0.1 (very normal) to 0.3+ (very anomalous)
    normalized = min(100, max(0, int((anomaly_score + 0.1) * 200)))

    if prediction == -1:
        normalized = max(normalized, 50)  # Ensure anomalies score at least 50

    return {
        "shipmentID": shipment_data.shipmentID,
        "riskScore": normalized,
        "riskType": "Anomaly",
        "confidence": round(min(0.95, 0.5 + anomaly_score), 2),
        "details": {
            "isAnomaly": bool(prediction == -1),
            "rawAnomalyScore": round(float(anomaly_score), 4),
        },
    }
