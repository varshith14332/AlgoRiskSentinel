// Demo data for the frontend when backend is unavailable
import type { Shipment, Alert, DashboardStats } from '../types';

export const DEMO_SHIPMENTS: Shipment[] = [
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

export const DEMO_ALERTS: Alert[] = [
    { shipmentID: 'SHP102', riskScore: 84, riskType: 'Delay', severity: 'High', confidence: 0.88, alertHash: 'a1b2c3d4e5', blockchainTx: 'ALGO_TX_001', isPremium: false, timestamp: '2026-03-02T08:30:00Z' },
    { shipmentID: 'SHP104', riskScore: 76, riskType: 'Anomaly', severity: 'High', confidence: 0.82, alertHash: 'f6g7h8i9j0', blockchainTx: 'ALGO_TX_002', isPremium: true, timestamp: '2026-03-02T09:15:00Z' },
    { shipmentID: 'SHP102', riskScore: 71, riskType: 'Route Deviation', severity: 'High', confidence: 0.79, alertHash: 'k1l2m3n4o5', blockchainTx: 'ALGO_TX_003', isPremium: false, timestamp: '2026-03-02T09:45:00Z' },
    { shipmentID: 'SHP106', riskScore: 62, riskType: 'Delay', severity: 'Medium', confidence: 0.74, alertHash: 'p6q7r8s9t0', blockchainTx: 'ALGO_TX_004', isPremium: false, timestamp: '2026-03-02T10:00:00Z' },
    { shipmentID: 'SHP104', riskScore: 55, riskType: 'Fraud', severity: 'Medium', confidence: 0.68, alertHash: 'u1v2w3x4y5', blockchainTx: '', isPremium: true, timestamp: '2026-03-02T10:30:00Z' },
    { shipmentID: 'SHP101', riskScore: 28, riskType: 'Delay', severity: 'Low', confidence: 0.91, alertHash: 'z6a7b8c9d0', blockchainTx: 'ALGO_TX_005', isPremium: false, timestamp: '2026-03-02T11:00:00Z' },
];

export const DEMO_STATS: DashboardStats = {
    totalShipments: 6,
    delayedShipments: 2,
    highRiskShipments: 2,
    averageRiskScore: 62.7,
    alertsByType: { Delay: 3, Anomaly: 1, 'Route Deviation': 1, Fraud: 1 },
    recentAlerts: DEMO_ALERTS.slice(0, 5),
};

export const DEMO_RISK_DISTRIBUTION = [
    { range: '0-20', count: 0 },
    { range: '20-40', count: 1 },
    { range: '40-60', count: 1 },
    { range: '60-80', count: 3 },
    { range: '80-100', count: 1 },
];

export const DEMO_DELAY_TRENDS = [
    { date: 'Feb 24', delays: 1, onTime: 4 },
    { date: 'Feb 25', delays: 2, onTime: 3 },
    { date: 'Feb 26', delays: 1, onTime: 5 },
    { date: 'Feb 27', delays: 3, onTime: 2 },
    { date: 'Feb 28', delays: 2, onTime: 4 },
    { date: 'Mar 01', delays: 1, onTime: 5 },
    { date: 'Mar 02', delays: 2, onTime: 4 },
];

export const DEMO_CARRIER_PERFORMANCE = [
    { carrier: 'FastFreight', avgScore: 28, shipments: 2 },
    { carrier: 'SpeedLogistics', avgScore: 84, shipments: 1 },
    { carrier: 'ReliableCargo', avgScore: 15, shipments: 1 },
    { carrier: 'ExpressHaul', avgScore: 76, shipments: 1 },
    { carrier: 'CoastalShipping', avgScore: 62, shipments: 1 },
];

export const DEMO_ALERT_TYPES = [
    { name: 'Delay', value: 3 },
    { name: 'Anomaly', value: 1 },
    { name: 'Route Deviation', value: 1 },
    { name: 'Fraud', value: 1 },
];
