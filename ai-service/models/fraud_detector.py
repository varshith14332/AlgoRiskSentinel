"""
Fraud Detection Model
Detects suspicious patterns: unrealistic travel times, weight inconsistencies,
abnormal temperature changes using rule-based + ML hybrid approach.
"""
import numpy as np


def detect_fraud(shipment_data) -> dict:
    """Detect fraudulent or suspicious shipment patterns."""
    flags = []
    risk_score = 0

    # 1. Unrealistic travel time
    # Expected speed: ~300-600 km/day for road freight
    if shipment_data.actualDeliveryDays > 0:
        speed = shipment_data.distance / shipment_data.actualDeliveryDays
        if speed > 800:  # Too fast — possibly falsified
            flags.append("unrealistic_speed_high")
            risk_score += 25
        elif speed < 100:  # Too slow — possibly diverted
            flags.append("unrealistic_speed_low")
            risk_score += 20

    # 2. Weight inconsistencies
    if shipment_data.weight <= 0:
        flags.append("invalid_weight")
        risk_score += 30
    elif shipment_data.weight > 2500:
        flags.append("excessive_weight")
        risk_score += 15

    # 3. Temperature anomalies
    if shipment_data.temperature > 45:
        flags.append("extreme_heat")
        risk_score += 20
    elif shipment_data.temperature < -10:
        flags.append("extreme_cold")
        risk_score += 20

    # 4. Delivery time manipulation
    delay_ratio = shipment_data.actualDeliveryDays / max(shipment_data.expectedDeliveryDays, 1)
    if delay_ratio > 2.5:
        flags.append("extreme_delay")
        risk_score += 15
    elif delay_ratio < 0.3:
        flags.append("suspiciously_fast")
        risk_score += 20

    # 5. Distance anomaly check
    if shipment_data.distance > 0:
        expected_days_for_distance = shipment_data.distance / 400  # ~400km/day standard
        if abs(shipment_data.expectedDeliveryDays - expected_days_for_distance) > 3:
            flags.append("distance_time_mismatch")
            risk_score += 10

    risk_score = min(100, max(0, risk_score))

    # Calculate confidence based on number of flags
    confidence = min(0.95, 0.4 + (len(flags) * 0.12))

    return {
        "shipmentID": shipment_data.shipmentID,
        "riskScore": risk_score,
        "riskType": "Fraud",
        "confidence": round(confidence, 2),
        "details": {
            "fraudFlags": flags,
            "flagCount": len(flags),
        },
    }
