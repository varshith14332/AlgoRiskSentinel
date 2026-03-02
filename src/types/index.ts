// ============================================================
// AlgoRisk Sentinel — Type Definitions
// ============================================================

export interface Coordinate {
    lat: number;
    lng: number;
}

export interface Shipment {
    _id?: string;
    shipmentID: string;
    origin: string;
    destination: string;
    originCoords: Coordinate;
    destinationCoords: Coordinate;
    distance: number;
    expectedDeliveryDays: number;
    actualDeliveryDays: number;
    trafficLevel: 'Low' | 'Medium' | 'High';
    temperature: number;
    routeCoordinates: Coordinate[];
    actualRouteCoordinates?: Coordinate[];
    carrier: string;
    weight: number;
    status: 'In Transit' | 'Delivered' | 'Delayed' | 'At Risk';
    createdAt?: string;
    updatedAt?: string;
}

export interface Alert {
    _id?: string;
    shipmentID: string;
    riskScore: number;
    riskType: 'Delay' | 'Anomaly' | 'Fraud' | 'Route Deviation';
    severity: 'Low' | 'Medium' | 'High';
    confidence: number;
    alertHash: string;
    blockchainTx?: string;
    nftAssetId?: number;
    isPremium: boolean;
    details?: string;
    timestamp: string;
}

export interface RiskAnalysis {
    shipmentID: string;
    riskScore: number;
    riskType: string;
    severity: string;
    confidence: number;
    details?: Record<string, unknown>;
}

export interface User {
    _id?: string;
    walletAddress: string;
    role: 'supplier' | 'distributor' | 'analyst' | 'public';
    name?: string;
    accessKeys: string[];
}

export interface Payment {
    _id?: string;
    walletAddress: string;
    shipmentID: string;
    transactionHash: string;
    accessKey: string;
    amount: number;
    verified: boolean;
    createdAt?: string;
}

export interface DashboardStats {
    totalShipments: number;
    delayedShipments: number;
    highRiskShipments: number;
    averageRiskScore: number;
    alertsByType: Record<string, number>;
    recentAlerts: Alert[];
}

export interface AlertCertificate {
    shipmentID: string;
    riskType: string;
    riskScore: number;
    severity: string;
    timestamp: string;
    blockchainTx: string;
    alertHash: string;
    verified: boolean;
}

export type UserRole = 'supplier' | 'distributor' | 'analyst' | 'public';
