"""
Route Deviation Detection
Compares planned route coordinates vs actual route using Haversine distance.
Generates Route Deviation Risk Alert when deviation exceeds threshold.
"""
import math


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two coordinates using Haversine formula."""
    R = 6371  # Earth radius in km
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


def point_to_segment_distance(point, seg_start, seg_end) -> float:
    """Calculate approximate distance from a point to a line segment (in km)."""
    d_total = haversine(seg_start["lat"], seg_start["lng"], seg_end["lat"], seg_end["lng"])
    if d_total == 0:
        return haversine(point["lat"], point["lng"], seg_start["lat"], seg_start["lng"])

    d1 = haversine(point["lat"], point["lng"], seg_start["lat"], seg_start["lng"])
    d2 = haversine(point["lat"], point["lng"], seg_end["lat"], seg_end["lng"])

    # Use triangle inequality for approximate perpendicular distance
    s = (d1 + d2 + d_total) / 2
    if s * (s - d1) * (s - d2) * (s - d_total) <= 0:
        return min(d1, d2)
    area = math.sqrt(s * (s - d1) * (s - d2) * (s - d_total))
    return (2 * area) / d_total


def calculate_route_deviation(planned: list, actual: list) -> dict:
    """
    Calculate deviation between planned and actual routes.
    Returns max deviation, average deviation, and deviation points.
    """
    if not planned or not actual:
        return {"maxDeviation": 0, "avgDeviation": 0, "deviationPoints": []}

    planned_dicts = [{"lat": c.lat, "lng": c.lng} if hasattr(c, "lat") else c for c in planned]
    actual_dicts = [{"lat": c.lat, "lng": c.lng} if hasattr(c, "lat") else c for c in actual]

    deviations = []

    for actual_point in actual_dicts:
        min_dist = float("inf")
        for i in range(len(planned_dicts) - 1):
            dist = point_to_segment_distance(actual_point, planned_dicts[i], planned_dicts[i + 1])
            min_dist = min(min_dist, dist)
        deviations.append({
            "point": actual_point,
            "deviation_km": round(min_dist, 2),
        })

    max_dev = max(d["deviation_km"] for d in deviations)
    avg_dev = sum(d["deviation_km"] for d in deviations) / len(deviations)

    return {
        "maxDeviation": round(max_dev, 2),
        "avgDeviation": round(avg_dev, 2),
        "deviationPoints": deviations,
    }


def analyze_route_deviation(shipment_data) -> dict:
    """Analyze route deviation and generate risk score."""
    DEVIATION_THRESHOLD_KM = 50  # 50km threshold for alert

    deviation_info = calculate_route_deviation(
        shipment_data.routeCoordinates,
        shipment_data.actualRouteCoordinates,
    )

    max_dev = deviation_info["maxDeviation"]
    avg_dev = deviation_info["avgDeviation"]

    # Score based on deviation
    if max_dev > 200:
        risk_score = 90
    elif max_dev > 100:
        risk_score = 75
    elif max_dev > DEVIATION_THRESHOLD_KM:
        risk_score = 60
    elif max_dev > 20:
        risk_score = 35
    else:
        risk_score = 10

    confidence = min(0.95, 0.6 + (max_dev / 500))

    return {
        "shipmentID": shipment_data.shipmentID,
        "riskScore": risk_score,
        "riskType": "Route Deviation",
        "confidence": round(confidence, 2),
        "details": {
            "maxDeviationKm": max_dev,
            "avgDeviationKm": avg_dev,
            "thresholdKm": DEVIATION_THRESHOLD_KM,
            "exceededThreshold": max_dev > DEVIATION_THRESHOLD_KM,
        },
    }
