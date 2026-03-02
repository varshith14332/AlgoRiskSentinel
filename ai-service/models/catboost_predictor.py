import os
import joblib
import pandas as pd
from catboost import CatBoostClassifier, CatBoostRegressor

# The user's provided feature list:
# 'Shipment Mode', 'Country', 'Vendor', 'Product Group', 
# 'Weight (Kilograms)', 'Line Item Quantity', 'Freight Cost (USD)', 
# 'delay_days', 'temperature_breach', 'route_deviation', 
# 'weather_delay', 'weight_mismatch', 'unscheduled_stops', 'priority_level'

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models_pkl", "powerful_supply_chain_catboost.pkl")
catboost_model = None
is_classifier = True

def load_model():
    global catboost_model, is_classifier
    if catboost_model is None and os.path.exists(MODEL_PATH):
        try:
            print("Loading catboost model via joblib...")
            catboost_model = joblib.load(MODEL_PATH)
            
            # Check if it has predict_proba
            if hasattr(catboost_model, "predict_proba"):
                is_classifier = True
            else:
                is_classifier = False
            print("Catboost loaded!")
        except Exception as e:
            print(f"Failed to load CatBoost model: {e}")

def predict_catboost_risk(data) -> dict:
    load_model()
    
    if catboost_model is None:
        return {
            "riskScore": 0,
            "riskType": "Model Not Found",
            "confidence": 0.0
        }

    # Derive features from the ShipmentData payload
    delay_days = max(0, data.actualDeliveryDays - data.expectedDeliveryDays)
    temperature_breach = 1 if data.temperature > 30 else 0
    route_deviation = 1 if data.trafficLevel == "High" else 0
    weather_delay = 1 if data.trafficLevel == "High" else 0
    
    # We map missing data strictly required by the model
    input_data = {
        'Shipment Mode': getattr(data, 'carrier', 'Air'),
        'Country': getattr(data, 'destination', 'Unknown'),
        'Vendor': 'Default Vendor',
        'Product Group': 'Logistics',
        'Weight (Kilograms)': data.weight if hasattr(data, 'weight') and data.weight else 500.0,
        'Line Item Quantity': 100,
        'Freight Cost (USD)': 500.0,
        'delay_days': delay_days,
        'temperature_breach': temperature_breach,
        'route_deviation': route_deviation,
        'weather_delay': weather_delay,
        'weight_mismatch': 0,
        'unscheduled_stops': 0,
        'priority_level': 1
    }

    df = pd.DataFrame([input_data])
    
    try:
        if is_classifier:
            # Assuming shape [prob_class_0, prob_class_1]
            probs = catboost_model.predict_proba(df)[0]
            if len(probs) >= 2:
                risk_score = int(probs[1] * 100)
                confidence = float(max(probs))
            else:
                risk_score = int(probs[0] * 100)
                confidence = float(probs[0])
            risk_type = "AI Risk Prediction"
        else:
            # Regressor usually predicts continuous risk score (e.g. 0-100)
            score = catboost_model.predict(df)[0]
            risk_score = min(max(int(score), 0), 100)
            confidence = 0.85
            risk_type = "AI Delay Regression"

        return {
            "riskScore": risk_score,
            "riskType": risk_type,
            "confidence": confidence
        }
    except Exception as e:
        print(f"CatBoost prediction error: {e}")
        return {
            "riskScore": 50,
            "riskType": "Prediction Error",
            "confidence": 0.5
        }
