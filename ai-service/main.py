"""
AlgoRisk Sentinel — AI Microservice
FastAPI server providing ML-powered risk analysis for supply chain shipments.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from models.delay_predictor import predict_delay
from models.anomaly_detector import detect_anomaly
from models.fraud_detector import detect_fraud
from models.route_analyzer import analyze_route_deviation
from models.catboost_predictor import predict_catboost_risk

app = FastAPI(
    title="AlgoRisk Sentinel AI Service",
    description="ML-powered supply chain risk analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Coordinate(BaseModel):
    lat: float
    lng: float


class ShipmentData(BaseModel):
    shipmentID: str
    distance: float
    expectedDeliveryDays: int
    actualDeliveryDays: int
    trafficLevel: str = "Medium"
    temperature: float = 25.0
    weight: float = 500.0
    carrier: str = "Unknown"
    routeCoordinates: Optional[list[Coordinate]] = None
    actualRouteCoordinates: Optional[list[Coordinate]] = None


class RiskResult(BaseModel):
    shipmentID: str
    riskScore: int
    riskType: str
    severity: str
    confidence: float
    details: Optional[dict] = None


def classify_severity(score: int) -> str:
    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    return "Low"


@app.get("/health")
def health():
    return {"status": "ok", "service": "AlgoRisk Sentinel AI", "models": ["delay", "anomaly", "fraud", "route"]}


@app.post("/analyze", response_model=RiskResult)
def analyze_shipment(data: ShipmentData):
    """
    Run all AI models on a shipment and return the highest-risk result.
    """
    results = []

    # 1. Delay prediction
    delay_result = predict_delay(data)
    results.append(delay_result)

    # 2. Anomaly detection
    anomaly_result = detect_anomaly(data)
    results.append(anomaly_result)

    # 3. Fraud detection
    fraud_result = detect_fraud(data)
    results.append(fraud_result)

    # 4. Route deviation (if coordinates available)
    if data.routeCoordinates and data.actualRouteCoordinates:
        route_result = analyze_route_deviation(data)
        results.append(route_result)

    # 5. ML Model (CatBoost)
    catboost_result = predict_catboost_risk(data)
    results.append(catboost_result)

    # Return highest risk score result
    best = max(results, key=lambda r: r["riskScore"])

    return RiskResult(
        shipmentID=data.shipmentID,
        riskScore=best["riskScore"],
        riskType=best["riskType"],
        severity=classify_severity(best["riskScore"]),
        confidence=best["confidence"],
        details={
            "allAnalyses": results,
            "modelsRun": len(results),
        },
    )


@app.post("/analyze/delay")
def analyze_delay(data: ShipmentData):
    result = predict_delay(data)
    return result


@app.post("/analyze/anomaly")
def analyze_anomaly_endpoint(data: ShipmentData):
    result = detect_anomaly(data)
    return result


@app.post("/analyze/fraud")
def analyze_fraud_endpoint(data: ShipmentData):
    result = detect_fraud(data)
    return result


@app.post("/analyze/route")
def analyze_route_endpoint(data: ShipmentData):
    if not data.routeCoordinates or not data.actualRouteCoordinates:
        return {"error": "Both routeCoordinates and actualRouteCoordinates are required"}
    result = analyze_route_deviation(data)
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
