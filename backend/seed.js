require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Shipment = require('./models/Shipment');
const Alert = require('./models/Alert');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/algorisk-sentinel';

const shipments = [
    {
        shipmentID: 'SHP101', origin: 'Mumbai', destination: 'Delhi', distance: 1400,
        originCoords: { lat: 19.076, lng: 72.8777 }, destinationCoords: { lat: 28.6139, lng: 77.209 },
        expectedDeliveryDays: 3, actualDeliveryDays: 3, trafficLevel: 'Medium',
        temperature: 28, carrier: 'FastFreight', weight: 1200, status: 'Delivered',
        routeCoordinates: [{ lat: 19.076, lng: 72.877 }, { lat: 22.0, lng: 75.0 }, { lat: 26.0, lng: 76.5 }, { lat: 28.614, lng: 77.209 }],
    },
    {
        shipmentID: 'SHP102', origin: 'Chennai', destination: 'Kolkata', distance: 1660,
        originCoords: { lat: 13.0827, lng: 80.2707 }, destinationCoords: { lat: 22.5726, lng: 88.3639 },
        expectedDeliveryDays: 4, actualDeliveryDays: 7, trafficLevel: 'High',
        temperature: 35, carrier: 'SpeedLogistics', weight: 800, status: 'Delayed',
        routeCoordinates: [{ lat: 13.082, lng: 80.270 }, { lat: 16.0, lng: 82.0 }, { lat: 19.0, lng: 84.0 }, { lat: 22.572, lng: 88.363 }],
        actualRouteCoordinates: [{ lat: 13.082, lng: 80.270 }, { lat: 15.5, lng: 79.5 }, { lat: 18.0, lng: 81.0 }, { lat: 20.5, lng: 85.0 }, { lat: 22.572, lng: 88.363 }],
    },
    {
        shipmentID: 'SHP103', origin: 'Bangalore', destination: 'Hyderabad', distance: 570,
        originCoords: { lat: 12.9716, lng: 77.5946 }, destinationCoords: { lat: 17.385, lng: 78.4867 },
        expectedDeliveryDays: 2, actualDeliveryDays: 2, trafficLevel: 'Low',
        temperature: 26, carrier: 'ReliableCargo', weight: 500, status: 'Delivered',
        routeCoordinates: [{ lat: 12.971, lng: 77.594 }, { lat: 15.0, lng: 78.0 }, { lat: 17.385, lng: 78.486 }],
    },
    {
        shipmentID: 'SHP104', origin: 'Pune', destination: 'Ahmedabad', distance: 660,
        originCoords: { lat: 18.5204, lng: 73.8567 }, destinationCoords: { lat: 23.0225, lng: 72.5714 },
        expectedDeliveryDays: 2, actualDeliveryDays: 4, trafficLevel: 'High',
        temperature: 40, carrier: 'ExpressHaul', weight: 2000, status: 'At Risk',
        routeCoordinates: [{ lat: 18.520, lng: 73.856 }, { lat: 20.0, lng: 73.0 }, { lat: 23.022, lng: 72.571 }],
    },
    {
        shipmentID: 'SHP105', origin: 'Jaipur', destination: 'Lucknow', distance: 580,
        originCoords: { lat: 26.9124, lng: 75.7873 }, destinationCoords: { lat: 26.8467, lng: 80.9462 },
        expectedDeliveryDays: 2, actualDeliveryDays: 2, trafficLevel: 'Low',
        temperature: 22, carrier: 'FastFreight', weight: 350, status: 'Delivered',
        routeCoordinates: [{ lat: 26.912, lng: 75.787 }, { lat: 26.88, lng: 78.5 }, { lat: 26.846, lng: 80.946 }],
    },
    {
        shipmentID: 'SHP106', origin: 'Kochi', destination: 'Goa', distance: 890,
        originCoords: { lat: 9.9312, lng: 76.2673 }, destinationCoords: { lat: 15.2993, lng: 74.124 },
        expectedDeliveryDays: 3, actualDeliveryDays: 5, trafficLevel: 'Medium',
        temperature: 32, carrier: 'CoastalShipping', weight: 1500, status: 'Delayed',
        routeCoordinates: [{ lat: 9.931, lng: 76.267 }, { lat: 12.0, lng: 75.0 }, { lat: 15.299, lng: 74.124 }],
        actualRouteCoordinates: [{ lat: 9.931, lng: 76.267 }, { lat: 11.0, lng: 76.5 }, { lat: 13.0, lng: 76.0 }, { lat: 15.299, lng: 74.124 }],
    },
];

const alerts = [
    { shipmentID: 'SHP102', riskScore: 84, riskType: 'Delay', severity: 'High', confidence: 0.88, isPremium: false },
    { shipmentID: 'SHP104', riskScore: 76, riskType: 'Anomaly', severity: 'High', confidence: 0.82, isPremium: true },
    { shipmentID: 'SHP102', riskScore: 71, riskType: 'Route Deviation', severity: 'High', confidence: 0.79, isPremium: false },
    { shipmentID: 'SHP106', riskScore: 62, riskType: 'Delay', severity: 'Medium', confidence: 0.74, isPremium: false },
    { shipmentID: 'SHP104', riskScore: 55, riskType: 'Fraud', severity: 'Medium', confidence: 0.68, isPremium: true },
    { shipmentID: 'SHP101', riskScore: 28, riskType: 'Delay', severity: 'Low', confidence: 0.91, isPremium: false },
];

async function seed() {
    await mongoose.connect(MONGO_URI);

    await Shipment.deleteMany({});
    await Alert.deleteMany({});

    await Shipment.insertMany(shipments);

    const alertDocs = alerts.map((a, i) => {
        const ts = new Date(Date.now() - i * 3600000).toISOString();
        return {
            ...a,
            alertHash: crypto.createHash('sha256').update(`${a.shipmentID}${a.riskScore}${ts}`).digest('hex'),
            blockchainTx: `DEMO_TX_${String(i + 1).padStart(3, '0')}`,
            timestamp: ts,
        };
    });
    await Alert.insertMany(alertDocs);

    console.log(`✅ Seeded ${shipments.length} shipments and ${alertDocs.length} alerts`);
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
