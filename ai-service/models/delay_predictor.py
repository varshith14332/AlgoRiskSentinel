"""
Delay Prediction Model
Uses a trained Random Forest classifier to predict delivery delay probability.
Falls back to rule-based scoring if training data is insufficient.
"""
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Pre-trained model simulation with synthetic training data
_TRAFFIC_MAP = {"Low": 0, "Medium": 1, "High": 2}

# Generate synthetic training data for the model
np.random.seed(42)
n_samples = 500

_X_train = np.column_stack([
    np.random.uniform(100, 2000, n_samples),     # distance
    np.random.randint(1, 7, n_samples),           # expectedDeliveryDays
    np.random.randint(0, 3, n_samples),           # trafficLevel
    np.random.uniform(-5, 45, n_samples),         # temperature
    np.random.uniform(50, 3000, n_samples),       # weight
])

# Label: delayed if delivery factor is high
_delay_factor = (
    (_X_train[:, 0] / 500) +
    (_X_train[:, 2] * 1.5) +
    (np.abs(_X_train[:, 3] - 25) / 10) +
    (_X_train[:, 4] / 1000)
)
_y_train = ((_delay_factor + np.random.normal(0, 1, n_samples)) > 4).astype(int)

_model = RandomForestClassifier(n_estimators=50, random_state=42)
_model.fit(_X_train, _y_train)


def predict_delay(shipment_data) -> dict:
    """Predict delay probability for a shipment."""
    traffic = _TRAFFIC_MAP.get(shipment_data.trafficLevel, 1)

    features = np.array([[
        shipment_data.distance,
        shipment_data.expectedDeliveryDays,
        traffic,
        shipment_data.temperature,
        shipment_data.weight,
    ]])

    delay_proba = _model.predict_proba(features)[0][1]  # P(delayed)

    # Calculate risk score
    base_score = int(delay_proba * 70)

    # Boost if actually delayed
    delay_ratio = shipment_data.actualDeliveryDays / max(shipment_data.expectedDeliveryDays, 1)
    if delay_ratio > 1.5:
        base_score += 25
    elif delay_ratio > 1.0:
        base_score += 10

    risk_score = min(100, max(0, base_score))

    return {
        "shipmentID": shipment_data.shipmentID,
        "riskScore": risk_score,
        "riskType": "Delay",
        "confidence": round(float(max(delay_proba, 1 - delay_proba)), 2),
        "details": {
            "delayProbability": round(float(delay_proba), 3),
            "delayRatio": round(delay_ratio, 2),
        },
    }
