import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getShipments, createShipment, analyzeShipment } from '../services/api';
import type { Shipment } from '../types';
import { playAlertSound } from '../utils/audio';

interface ShipmentsProps {
    role: string;
}

// City coordinate lookup for auto-filling coordinates
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.076, lng: 72.877 },
    'Delhi': { lat: 28.613, lng: 77.209 },
    'Bangalore': { lat: 12.971, lng: 77.594 },
    'Chennai': { lat: 13.082, lng: 80.270 },
    'Kolkata': { lat: 22.572, lng: 88.363 },
    'Hyderabad': { lat: 17.385, lng: 78.486 },
    'Pune': { lat: 18.520, lng: 73.856 },
    'Ahmedabad': { lat: 23.022, lng: 72.571 },
    'Jaipur': { lat: 26.912, lng: 75.787 },
    'Lucknow': { lat: 26.846, lng: 80.946 },
    'Kochi': { lat: 9.931, lng: 76.267 },
    'Goa': { lat: 15.299, lng: 74.124 },
    'Chandigarh': { lat: 30.733, lng: 76.779 },
    'Indore': { lat: 22.719, lng: 75.857 },
    'Nagpur': { lat: 21.145, lng: 79.088 },
    'Visakhapatnam': { lat: 17.686, lng: 83.218 },
};

const CARRIERS = ['FastFreight', 'SpeedLogistics', 'ReliableCargo', 'ExpressHaul', 'CoastalShipping', 'SafeTransit'];

export default function Shipments({ role }: ShipmentsProps) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [form, setForm] = useState({
        origin: '',
        destination: '',
        distance: '',
        expectedDeliveryDays: '',
        actualDeliveryDays: '',
        carrier: '',
        weight: '',
        temperature: '',
        trafficLevel: 'Medium',
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const fetchShipments = useCallback(async () => {
        console.log("fetchShipments starting...");
        try {
            console.log("Calling getShipments API...");
            const data = await getShipments();
            console.log("getShipments returned data:", data);
            setShipments(data);
        } catch (error) {
            console.error("fetchShipments error:", error);
            setShipments([]);
        } finally {
            console.log("Setting loading to false");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShipments();
        if (searchParams.get('create') === 'true' && (role === 'supplier' || role === 'analyst' || role === 'distributor')) {
            setShowForm(true);
            // Remove the query param so it doesn't re-open on refresh
            setSearchParams({});
        }
    }, [fetchShipments, searchParams, role, setSearchParams]);

    const handleCreate = async () => {
        const originCoords = CITY_COORDS[form.origin] || { lat: 20.5, lng: 78.9 };
        const destCoords = CITY_COORDS[form.destination] || { lat: 22.0, lng: 80.0 };

        const shipmentData: Partial<Shipment> = {
            origin: form.origin,
            destination: form.destination,
            originCoords,
            destinationCoords: destCoords,
            distance: Number(form.distance) || 500,
            expectedDeliveryDays: Number(form.expectedDeliveryDays) || 3,
            actualDeliveryDays: Number(form.actualDeliveryDays) || 0,
            carrier: form.carrier || 'FastFreight',
            weight: Number(form.weight) || 500,
            temperature: Number(form.temperature) || 25,
            trafficLevel: form.trafficLevel as 'Low' | 'Medium' | 'High',
            routeCoordinates: [originCoords, destCoords],
            status: 'In Transit',
        };

        try {
            const created = await createShipment(shipmentData);
            setShipments(prev => [created, ...prev]);
            setShowForm(false);
            setForm({ origin: '', destination: '', distance: '', expectedDeliveryDays: '', actualDeliveryDays: '', carrier: '', weight: '', temperature: '', trafficLevel: 'Medium' });
            setNotification(`Shipment ${created.shipmentID} created successfully!`);
            setTimeout(() => setNotification(null), 4000);
        } catch (err) {
            setNotification('Failed to create shipment. Is the backend running?');
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const handleAnalyze = async (shipmentID: string) => {
        setAnalyzing(shipmentID);
        try {
            const result = await analyzeShipment(shipmentID);
            playAlertSound();
            setNotification(`${shipmentID}: Risk Score ${result.riskScore} (${result.riskType})`);
            await fetchShipments(); // refresh to get updated status
            setTimeout(() => {
                setNotification(null);
                navigate('/alerts');
            }, 2500);
        } catch {
            playAlertSound();
            setNotification(`Analysis failed for ${shipmentID}`);
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setAnalyzing(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notification toast */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 bg-sentinel-700 border border-sentinel-600 text-white px-5 py-3 rounded-xl shadow-2xl text-sm animate-pulse max-w-md">
                    {notification}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Shipments</h1>
                    <p className="text-sm text-sentinel-400 mt-1">Track and manage all supply chain shipments</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchShipments} className="text-sm bg-sentinel-700 text-sentinel-400 px-3 py-2 rounded-lg hover:text-white transition">
                        ↻ Refresh
                    </button>
                    {(role === 'supplier' || role === 'analyst' || role === 'distributor') && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-sm bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
                        >
                            + New Shipment
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {shipments.map(s => (
                        <div key={s.shipmentID} className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-5 hover:border-sentinel-600 transition group">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-mono text-accent text-sm font-medium">{s.shipmentID}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'Delivered' ? 'bg-risk-low/20 text-risk-low' :
                                    s.status === 'Delayed' ? 'bg-risk-medium/20 text-risk-medium' :
                                        s.status === 'At Risk' ? 'bg-risk-high/20 text-risk-high' :
                                            'bg-accent/20 text-accent'
                                    }`}>
                                    {s.status}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-sentinel-400">Route</span>
                                    <span className="text-white">{s.origin} → {s.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sentinel-400">Distance</span>
                                    <span className="text-white">{s.distance} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sentinel-400">Delivery</span>
                                    <span className={`${s.actualDeliveryDays > s.expectedDeliveryDays ? 'text-risk-high' : 'text-risk-low'}`}>
                                        {s.actualDeliveryDays}/{s.expectedDeliveryDays} days
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sentinel-400">Carrier</span>
                                    <span className="text-white">{s.carrier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sentinel-400">Weight</span>
                                    <span className="text-white">{s.weight} kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sentinel-400">Temperature</span>
                                    <span className="text-white">{s.temperature}°C</span>
                                </div>
                            </div>
                            {/* Analyze button */}
                            {(role === 'analyst' || role === 'distributor') && (
                                <button
                                    onClick={() => handleAnalyze(s.shipmentID)}
                                    disabled={analyzing === s.shipmentID}
                                    className="w-full mt-4 text-xs bg-accent/10 text-accent py-2 rounded-lg hover:bg-accent/20 transition disabled:opacity-50 border border-accent/20"
                                >
                                    {analyzing === s.shipmentID ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                                            Analyzing...
                                        </span>
                                    ) : 'Analyze Risk'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Shipment Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-sentinel-800 border border-sentinel-700 rounded-2xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold text-white mb-4">Create New Shipment</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Origin */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Origin City</label>
                                <select
                                    value={form.origin}
                                    onChange={(e) => setForm(f => ({ ...f, origin: e.target.value }))}
                                    className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                                >
                                    <option value="">Select city</option>
                                    {Object.keys(CITY_COORDS).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {/* Destination */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Destination City</label>
                                <select
                                    value={form.destination}
                                    onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))}
                                    className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                                >
                                    <option value="">Select city</option>
                                    {Object.keys(CITY_COORDS).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {/* Distance */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Distance (km)</label>
                                <input type="number" value={form.distance} onChange={(e) => setForm(f => ({ ...f, distance: e.target.value }))}
                                    placeholder="e.g. 1200" className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent" />
                            </div>
                            {/* Expected Delivery */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Expected Days</label>
                                <input type="number" value={form.expectedDeliveryDays} onChange={(e) => setForm(f => ({ ...f, expectedDeliveryDays: e.target.value }))}
                                    placeholder="e.g. 3" className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent" />
                            </div>
                            {/* Actual Delivery */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Actual Days</label>
                                <input type="number" value={form.actualDeliveryDays} onChange={(e) => setForm(f => ({ ...f, actualDeliveryDays: e.target.value }))}
                                    placeholder="e.g. 5 (0 if in transit)" className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent" />
                            </div>
                            {/* Carrier */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Carrier</label>
                                <select value={form.carrier} onChange={(e) => setForm(f => ({ ...f, carrier: e.target.value }))}
                                    className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
                                    <option value="">Select carrier</option>
                                    {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {/* Weight */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Weight (kg)</label>
                                <input type="number" value={form.weight} onChange={(e) => setForm(f => ({ ...f, weight: e.target.value }))}
                                    placeholder="e.g. 800" className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent" />
                            </div>
                            {/* Temperature */}
                            <div>
                                <label className="text-xs text-sentinel-400 block mb-1">Temperature (°C)</label>
                                <input type="number" value={form.temperature} onChange={(e) => setForm(f => ({ ...f, temperature: e.target.value }))}
                                    placeholder="e.g. 28" className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent" />
                            </div>
                            {/* Traffic Level */}
                            <div className="col-span-2">
                                <label className="text-xs text-sentinel-400 block mb-1">Traffic Level</label>
                                <div className="flex gap-2">
                                    {['Low', 'Medium', 'High'].map(level => (
                                        <button key={level} onClick={() => setForm(f => ({ ...f, trafficLevel: level }))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${form.trafficLevel === level
                                                ? level === 'Low' ? 'bg-risk-low/20 text-risk-low border border-risk-low/30'
                                                    : level === 'Medium' ? 'bg-risk-medium/20 text-risk-medium border border-risk-medium/30'
                                                        : 'bg-risk-high/20 text-risk-high border border-risk-high/30'
                                                : 'bg-sentinel-900 text-sentinel-400 border border-sentinel-600'
                                                }`}>
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={handleCreate}
                                disabled={!form.origin || !form.destination}
                                className="flex-1 bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold py-2 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50">
                                Create Shipment
                            </button>
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-sentinel-700 text-sentinel-400 rounded-lg text-sm hover:text-white transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
