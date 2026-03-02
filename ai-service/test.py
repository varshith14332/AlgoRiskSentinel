from models.catboost_predictor import predict_catboost_risk

class DummyData:
    shipmentID = "SHP123"
    distance = 500
    expectedDeliveryDays = 3
    actualDeliveryDays = 2
    temperature = 25
    weight = 100
    carrier = "Test"
    trafficLevel = "Medium"
    routeCoordinates = None
    actualRouteCoordinates = None

if __name__ == "__main__":
    try:
        data = DummyData()
        print(predict_catboost_risk(data))
    except Exception as e:
        import traceback
        traceback.print_exc()
