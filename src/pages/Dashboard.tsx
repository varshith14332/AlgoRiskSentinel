import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import AlertsTable from '../components/AlertsTable';
import { getDashboardStats, getAlerts } from '../services/api';
import type { DashboardStats, Alert } from '../types';

interface DashboardProps {
    role: string;
}

export default function Dashboard({ role }: DashboardProps) {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalShipments: 0,
        delayedShipments: 0,
        highRiskShipments: 0,
        averageRiskScore: 0,
        alertsByType: {},
        recentAlerts: []
    });
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsData, alertsData] = await Promise.all([
                    getDashboardStats(),
                    getAlerts(),
                ]);
                setStats(statsData);
                setAlerts(alertsData.slice(0, 10));
            } catch {
                setStats({
                    totalShipments: 0,
                    delayedShipments: 0,
                    highRiskShipments: 0,
                    averageRiskScore: 0,
                    alertsByType: {},
                    recentAlerts: []
                });
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
        // Auto-refresh every 15 seconds
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-sentinel-400 mt-1">Real-time supply chain risk intelligence</p>
                </div>
                <div className="flex items-center gap-4">
                    {(role === 'supplier' || role === 'distributor') && (
                        <button
                            onClick={() => navigate('/shipments?create=true')}
                            className="text-sm bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition"
                        >
                            + Create Shipment
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Shipments" value={stats.totalShipments} icon="" color="accent" trend="+12% this week" />
                <StatCard title="Delayed Shipments" value={stats.delayedShipments} icon="" color="yellow" trend={`${((stats.delayedShipments / Math.max(stats.totalShipments, 1)) * 100).toFixed(0)}% of total`} />
                <StatCard title="High Risk" value={stats.highRiskShipments} icon="🚨" color="red" trend="Requires attention" />
                <StatCard title="Avg Risk Score" value={stats.averageRiskScore.toFixed(1)} icon="📊" color="green" trend="Target: < 40" />
            </div>

            {/* Live Risk Feed */}
            <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-white">Recent Risk Alerts</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-risk-high rounded-full animate-pulse" />
                        <span className="text-xs text-sentinel-400">Live • auto-refresh</span>
                    </div>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <AlertsTable
                        alerts={alerts}
                        onVerify={(alert) => window.open(`https://testnet.algoexplorer.io/tx/${alert.blockchainTx}`, '_blank')}
                    />
                )}
            </div>

            {/* Algorand Integration Status */}
            <div className="bg-gradient-to-r from-algo-teal/10 to-accent/10 border border-algo-teal/20 rounded-xl p-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-algo-teal/20 rounded-lg flex items-center justify-center"></div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Algorand Blockchain Integration</h3>
                        <p className="text-xs text-sentinel-400 mt-0.5">
                            {alerts.filter(a => a.blockchainTx).length} alerts verified on Algorand TestNet •
                            SHA256 hashes stored immutably •
                            Micropayment access via x402
                        </p>
                    </div>
                    <div className="ml-auto">
                        <span className="text-xs bg-algo-teal/20 text-algo-teal px-3 py-1.5 rounded-lg">TestNet Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
