import { useState, useEffect, useRef, useCallback } from 'react';
import AlertsTable from '../components/AlertsTable';
import { getAlerts, submitPayment } from '../services/api';
import type { Alert } from '../types';
import { playAlertSound } from '../utils/audio';

interface AlertsProps {
    walletAddress: string | null;
    role: string;
}

export default function Alerts({ walletAddress }: AlertsProps) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState('All');
    const [paymentModal, setPaymentModal] = useState<string | null>(null);
    const [txHash, setTxHash] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [accessKey, setAccessKey] = useState<string | null>(null);
    const [alertBanner, setAlertBanner] = useState<Alert | null>(null);
    const [loading, setLoading] = useState(true);
    const prevAlertCountRef = useRef(0);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            const data = await getAlerts();
            // Check if new high/critical alerts appeared
            const highAlerts = data.filter(a => a.severity === 'High');
            if (highAlerts.length > prevAlertCountRef.current && prevAlertCountRef.current > 0) {
                // NEW HIGH ALERT DETECTED — play sound and show banner
                const newAlert = highAlerts[0];
                playAlertSound();
                setAlertBanner(newAlert);
                setTimeout(() => setAlertBanner(null), 8000);
            }
            prevAlertCountRef.current = highAlerts.length;
            setAlerts(data);
        } catch {
            setAlerts([]);
            prevAlertCountRef.current = 0;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
        // Poll for new alerts every 10 seconds
        pollIntervalRef.current = setInterval(fetchAlerts, 10000);
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [fetchAlerts]);

    const filtered = filter === 'All' ? alerts : alerts.filter(a => a.severity === filter);

    const handlePayment = async () => {
        if (!paymentModal || !txHash) return;
        setPaymentStatus('verifying');
        try {
            const result = await submitPayment(paymentModal, txHash);
            setPaymentStatus('success');
            setAccessKey(result.accessKey);
            // Play success sound
            try {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523, ctx.currentTime);
                osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
            } catch { /* */ }
        } catch {
            setPaymentStatus('error');
        }
    };

    const closePaymentModal = () => {
        setPaymentModal(null);
        setTxHash('');
        setPaymentStatus('idle');
        setAccessKey(null);
    };

    // Simulate alert sound for demo
    const testAlertSound = () => {
        playAlertSound();
        setAlertBanner({
            shipmentID: 'SHP_DEMO',
            riskScore: 92,
            riskType: 'Anomaly',
            severity: 'High',
            confidence: 0.95,
            alertHash: 'demo_hash',
            isPremium: false,
            timestamp: new Date().toISOString(),
        });
        setTimeout(() => setAlertBanner(null), 8000);
    };

    return (
        <div className="space-y-6">
            {/* ANOMALY ALERT BANNER — pops up with sound */}
            {alertBanner && (
                <div className="fixed top-0 left-0 right-0 z-50 animate-pulse">
                    <div className="bg-gradient-to-r from-risk-high to-red-700 text-white px-6 py-4 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl animate-bounce">ALERT</span>
                            <div>
                                <p className="font-bold text-lg">ANOMALY DETECTED — {alertBanner.riskType.toUpperCase()}</p>
                                <p className="text-sm opacity-90">
                                    Shipment {alertBanner.shipmentID} • Risk Score: {alertBanner.riskScore}/100 • Severity: {alertBanner.severity}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setAlertBanner(null)} className="text-white/80 hover:text-white text-xl px-3">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Risk Alerts</h1>
                    <p className="text-sm text-sentinel-400 mt-1">AI-detected supply chain risk events • Live polling active</p>
                </div>
                <div className="flex gap-2 items-center">
                    <button onClick={testAlertSound}
                        className="text-xs bg-risk-high/10 text-risk-high px-3 py-1.5 rounded-lg hover:bg-risk-high/20 transition border border-risk-high/20"
                        title="Test alert sound">
                        Test Alert
                    </button>
                    {['All', 'High', 'Medium', 'Low'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`text-xs px-3 py-1.5 rounded-lg transition ${filter === s
                                ? 'bg-accent text-sentinel-900 font-semibold'
                                : 'bg-sentinel-700 text-sentinel-400 hover:text-white'
                                }`}
                        >
                            {s} {s !== 'All' && `(${alerts.filter(a => a.severity === s).length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-5">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <AlertsTable
                        alerts={filtered}
                        onVerify={(a) => window.open(`https://testnet.algoexplorer.io/tx/${a.blockchainTx}`, '_blank')}
                        onPayForAccess={(id) => setPaymentModal(id)}
                    />
                )}
            </div>

            {/* x402 Micropayment Modal */}
            {paymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-sentinel-800 border border-sentinel-700 rounded-2xl p-6 w-full max-w-md">
                        {paymentStatus === 'success' && accessKey ? (
                            <>
                                <div className="text-center mb-4">
                                    <span className="text-4xl">(Access)</span>
                                    <h3 className="text-lg font-bold text-risk-low mt-2">Access Granted!</h3>
                                    <p className="text-sm text-sentinel-400 mt-1">Payment verified on Algorand blockchain</p>
                                </div>
                                <div className="bg-sentinel-900 rounded-lg p-4 mb-4">
                                    <p className="text-xs text-sentinel-400 mb-1">Your Access Key (SHA256 hash)</p>
                                    <p className="text-xs text-accent font-mono break-all">{accessKey}</p>
                                </div>
                                <p className="text-xs text-sentinel-500 mb-4 text-center">
                                    Use this key to access premium alert data:<br />
                                    <code className="text-accent">GET /api/alerts/{paymentModal}?key={accessKey.slice(0, 12)}...</code>
                                </p>
                                <button onClick={closePaymentModal}
                                    className="w-full bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold py-2 rounded-lg text-sm hover:opacity-90 transition">
                                    Done
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl">(Payment)</span>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">HTTP 402 — Payment Required</h3>
                                        <p className="text-xs text-sentinel-400">Premium risk intelligence access</p>
                                    </div>
                                </div>

                                <div className="bg-risk-medium/10 border border-risk-medium/20 rounded-lg p-3 mb-4 text-xs text-risk-medium">
                                    Status 402: Micropayment required to access premium risk data for <span className="font-mono font-bold">{paymentModal}</span>
                                </div>

                                <div className="bg-sentinel-900 rounded-lg p-3 mb-4 text-xs space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sentinel-400">Amount</span>
                                        <span className="text-accent font-bold">0.1 ALGO</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sentinel-400">Network</span>
                                        <span className="text-white">Algorand TestNet</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sentinel-400">Purpose</span>
                                        <span className="text-white">Alert hash key generation</span>
                                    </div>
                                </div>

                                {walletAddress ? (
                                    <>
                                        <div className="bg-sentinel-900 rounded-lg p-3 mb-4 text-xs">
                                            <p className="text-sentinel-400 mb-1">Connected Wallet</p>
                                            <p className="text-white font-mono">{walletAddress.slice(0, 12)}...{walletAddress.slice(-6)}</p>
                                        </div>
                                        <label className="text-xs text-sentinel-400 block mb-1">Algorand Transaction Hash</label>
                                        <input
                                            value={txHash}
                                            onChange={(e) => setTxHash(e.target.value)}
                                            placeholder="Paste your Algorand tx hash after sending payment..."
                                            className="w-full bg-sentinel-900 border border-sentinel-600 rounded-lg px-3 py-2 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent mb-2"
                                        />
                                        <p className="text-[10px] text-sentinel-500 mb-4">
                                            accessKey = SHA256(transactionHash + shipmentID)
                                        </p>
                                        {paymentStatus === 'error' && (
                                            <div className="bg-risk-high/10 border border-risk-high/20 rounded-lg p-2 mb-3 text-xs text-risk-high text-center">
                                                Transaction verification failed. Please check your tx hash.
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handlePayment}
                                                disabled={!txHash || paymentStatus === 'verifying'}
                                                className="flex-1 bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold py-2 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
                                            >
                                                {paymentStatus === 'verifying' ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="w-3 h-3 border border-sentinel-900 border-t-transparent rounded-full animate-spin" />
                                                        Verifying on Algorand...
                                                    </span>
                                                ) : 'Verify Payment & Generate Key'}
                                            </button>
                                            <button onClick={closePaymentModal}
                                                className="px-4 py-2 bg-sentinel-700 text-sentinel-400 rounded-lg text-sm hover:text-white transition">
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sentinel-400 text-sm mb-3">Connect your Algorand wallet to make a micropayment</p>
                                        <button className="bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold px-6 py-2 rounded-lg text-sm">
                                            Connect Wallet
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
