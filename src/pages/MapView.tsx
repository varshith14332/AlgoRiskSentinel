import { useState, useEffect } from 'react';
import ShipmentMap from '../components/ShipmentMap';
import { getShipments, getAlerts } from '../services/api';
import type { Shipment, Alert } from '../types';

export default function MapView() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([getShipments(), getAlerts()])
            .then(([s, a]) => { setShipments(s); setAlerts(a); })
            .catch(() => { setShipments([]); setAlerts([]); });
    }, []);

    const selectedShipment = selectedId ? shipments.find(s => s.shipmentID === selectedId) || null : null;

    return (
        <div className="space-y-4 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Geospatial Tracking</h1>
                    <p className="text-sm text-sentinel-400 mt-1">Live shipment routes and risk hotspots</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-risk-low" /> Safe</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-risk-medium" /> Medium</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-risk-high" /> High Risk</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-accent" /> Planned</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-risk-high" /> Deviated</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Shipment list sidebar */}
                <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-4 overflow-y-auto space-y-2">
                    <h3 className="text-xs text-sentinel-400 uppercase tracking-wider mb-3">Shipments ({shipments.length})</h3>
                    {shipments.map(s => {
                        const alert = alerts.find(a => a.shipmentID === s.shipmentID);
                        return (
                            <button
                                key={s.shipmentID}
                                onClick={() => setSelectedId(s.shipmentID)}
                                className={`w-full text-left p-3 rounded-lg transition text-xs ${selectedId === s.shipmentID ? 'bg-accent/10 border border-accent/20' : 'bg-sentinel-900/50 hover:bg-sentinel-700 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-accent font-medium">{s.shipmentID}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.status === 'Delivered' ? 'bg-risk-low/20 text-risk-low' :
                                        s.status === 'Delayed' ? 'bg-risk-medium/20 text-risk-medium' :
                                            'bg-risk-high/20 text-risk-high'
                                        }`}>{s.status}</span>
                                </div>
                                <p className="text-sentinel-400">{s.origin} → {s.destination}</p>
                                {alert && <p className="text-sentinel-500 mt-1">Risk: {alert.riskScore} ({alert.severity})</p>}
                            </button>
                        );
                    })}
                </div>

                {/* Map */}
                <div className="lg:col-span-3 rounded-xl overflow-hidden border border-sentinel-700">
                    <ShipmentMap shipments={shipments} alerts={alerts} selectedShipment={selectedShipment} />
                </div>
            </div>
        </div>
    );
}
