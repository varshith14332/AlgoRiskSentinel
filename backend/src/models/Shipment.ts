import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
    {
        shipmentID: {
            type: String,
            required: true,
            unique: true,
        },
        origin: String,
        destination: String,
        distance: Number,
        weight: Number,
        expectedDeliveryDays: Number,
        actualDeliveryDays: Number,
        trafficLevel: String,
        temperature: Number,
        carrier: String,
        routeCoordinates: [
            {
                lat: Number,
                lng: Number,
            },
        ],
        actualRouteCoordinates: [
            {
                lat: Number,
                lng: Number,
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Shipment", shipmentSchema);
