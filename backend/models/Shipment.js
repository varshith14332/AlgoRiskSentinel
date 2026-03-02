const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    shipmentID: { type: String, required: true, unique: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    originCoords: { lat: Number, lng: Number },
    destinationCoords: { lat: Number, lng: Number },
    distance: { type: Number, required: true },
    expectedDeliveryDays: { type: Number, required: true },
    actualDeliveryDays: { type: Number, default: 0 },
    trafficLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    temperature: { type: Number, default: 25 },
    routeCoordinates: [{ lat: Number, lng: Number }],
    actualRouteCoordinates: [{ lat: Number, lng: Number }],
    carrier: { type: String, required: true },
    weight: { type: Number, required: true },
    status: { type: String, enum: ['In Transit', 'Delivered', 'Delayed', 'At Risk'], default: 'In Transit' },
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
