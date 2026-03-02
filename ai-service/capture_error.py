import requests
try:
    url = "http://127.0.0.1:8000/analyze"
    data = {"shipmentID": "SHP123", "distance": 500, "expectedDeliveryDays": 3, "actualDeliveryDays": 2, "temperature": 25, "weight": 100, "carrier": "Test"}
    resp = requests.post(url, json=data)
    print("STATUS:", resp.status_code)
    print("BODY:", resp.text)
except Exception as e:
    print("FAILED:", e)
