import axios from 'axios';
import type { Shipment, Alert, DashboardStats, AlertCertificate, RiskAnalysis } from '../types';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach wallet address to every request
api.interceptors.request.use((config) => {
    const wallet = localStorage.getItem('walletAddress');
    if (wallet) config.headers['x-wallet-address'] = wallet;
    return config;
});

// ── Shipments ──
export const getShipments = () => api.get<Shipment[]>('/shipments').then(r => r.data);
export const getShipment = (id: string) => api.get<Shipment>(`/shipments/${id}`).then(r => r.data);
export const createShipment = (data: Partial<Shipment>) => api.post<Shipment>('/shipments', data).then(r => r.data);

// ── Alerts ──
export const getAlerts = () => api.get<Alert[]>('/alerts').then(r => r.data);
export const getAlert = (shipmentID: string, key?: string) => {
    const params = key ? { key } : {};
    return api.get<Alert | Alert[]>(`/alerts/${shipmentID}`, { params }).then(r => r.data);
};

// ── Analytics / Dashboard ──
export const getDashboardStats = () => api.get<DashboardStats>('/analytics/dashboard').then(r => r.data);

// ── AI / Risk Analysis ──
export const analyzeShipment = (shipmentID: string) => api.post<{ analysis: RiskAnalysis, alert: Alert }>(`/shipments/${shipmentID}/analyze`).then(r => r.data.analysis);

// ── Blockchain verification ──
export const verifyCertificate = (shipmentID: string) => api.get<AlertCertificate>(`/verify/${shipmentID}`).then(r => r.data);
export const verifyTxHash = (txHash: string) => api.get<Record<string, unknown>>(`/verify/tx/${txHash}`).then(r => r.data);

// ── Micropayments ──
export const submitPayment = (shipmentID: string, transactionHash: string) =>
    api.post<{ accessKey: string }>('/payments/verify', { shipmentID, transactionHash }).then(r => r.data);

export default api;
