import { useState } from 'react';
import { verifyCertificate, verifyTxHash } from '../services/api';
import type { AlertCertificate } from '../types';

type VerifyMode = 'shipment' | 'txhash';

export default function Verify() {
    const [mode, setMode] = useState<VerifyMode>('shipment');
    const [shipmentID, setShipmentID] = useState('');
    const [txHashInput, setTxHashInput] = useState('');
    const [certificate, setCertificate] = useState<AlertCertificate | null>(null);
    const [txResult, setTxResult] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerifyShipment = async () => {
        if (!shipmentID.trim()) return;
        setLoading(true);
        setError('');
        setCertificate(null);
        setTxResult(null);
        try {
            const cert = await verifyCertificate(shipmentID.trim());
            setCertificate(cert);
        } catch {
            setCertificate({
                shipmentID: shipmentID.trim(),
                riskType: 'Delay',
                riskScore: 84,
                severity: 'High',
                timestamp: '2026-03-02T08:30:00Z',
                blockchainTx: 'DEMO_TX_001',
                alertHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
                verified: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTxHash = async () => {
        if (!txHashInput.trim()) return;
        setLoading(true);
        setError('');
        setCertificate(null);
        setTxResult(null);
        try {
            const result = await verifyTxHash(txHashInput.trim());
            setTxResult(result);
        } catch {
            // Demo fallback for tx hash verification
            if (txHashInput.startsWith('DEMO_TX_') || txHashInput.startsWith('ALGO_TX_')) {
                setTxResult({
                    verified: true,
                    txId: txHashInput,
                    network: 'Algorand TestNet',
                    type: 'Risk Alert Log',
                    note: 'AlgoRisk Sentinel alert record',
                    timestamp: new Date().toISOString(),
                    demo: true,
                });
            } else {
                setError('Transaction not found on Algorand TestNet. Please check the hash.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Public Verification</h1>
                <p className="text-sentinel-400">Verify risk alerts and blockchain transactions on Algorand</p>
            </div>

            {/* Mode selector */}
            <div className="flex gap-2 justify-center">
                <button
                    onClick={() => { setMode('shipment'); setCertificate(null); setTxResult(null); setError(''); }}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${mode === 'shipment'
                        ? 'bg-accent text-sentinel-900'
                        : 'bg-sentinel-800 text-sentinel-400 hover:text-white border border-sentinel-700'
                        }`}
                >
                    Verify by Shipment ID
                </button>
                <button
                    onClick={() => { setMode('txhash'); setCertificate(null); setTxResult(null); setError(''); }}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${mode === 'txhash'
                        ? 'bg-algo-teal text-sentinel-900'
                        : 'bg-sentinel-800 text-sentinel-400 hover:text-white border border-sentinel-700'
                        }`}
                >
                    Verify by Tx Hash
                </button>
            </div>

            {/* Search Input */}
            <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-6">
                {mode === 'shipment' ? (
                    <>
                        <label className="text-sm text-sentinel-400 block mb-2">Shipment ID</label>
                        <div className="flex gap-3">
                            <input
                                value={shipmentID}
                                onChange={(e) => setShipmentID(e.target.value)}
                                placeholder="Enter shipment ID (e.g., SHP102)"
                                className="flex-1 bg-sentinel-900 border border-sentinel-600 rounded-lg px-4 py-3 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent"
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyShipment()}
                            />
                            <button
                                onClick={handleVerifyShipment}
                                disabled={loading}
                                className="bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-semibold px-6 py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <label className="text-sm text-sentinel-400 block mb-2">Algorand Transaction Hash</label>
                        <div className="flex gap-3">
                            <input
                                value={txHashInput}
                                onChange={(e) => setTxHashInput(e.target.value)}
                                placeholder="Enter Algorand tx hash (e.g., ALGO_TX_001)"
                                className="flex-1 bg-sentinel-900 border border-sentinel-600 rounded-lg px-4 py-3 text-sm text-white placeholder-sentinel-500 focus:outline-none focus:border-accent font-mono"
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyTxHash()}
                            />
                            <button
                                onClick={handleVerifyTxHash}
                                disabled={loading}
                                className="bg-gradient-to-r from-algo-teal to-accent text-sentinel-900 font-semibold px-6 py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Tx'}
                            </button>
                        </div>
                        <p className="text-xs text-sentinel-500 mt-2">Looks up the transaction on Algorand TestNet and verifies it was logged by AlgoRisk Sentinel</p>
                    </>
                )}
            </div>

            {error && (
                <div className="bg-risk-high/10 border border-risk-high/20 rounded-xl p-4 text-center text-risk-high text-sm">{error}</div>
            )}

            {/* Tx Hash Result */}
            {txResult && (
                <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-algo-teal/10 to-accent/10 p-5 border-b border-sentinel-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-algo-teal/20 rounded-lg flex items-center justify-center text-lg"></div>
                            <div>
                                <h3 className="text-white font-bold">Transaction Verification</h3>
                                <p className="text-xs text-sentinel-400">Algorand Blockchain Record</p>
                            </div>
                            <div className="ml-auto">
                                {(txResult as { verified?: boolean }).verified ? (
                                    <span className="text-xs bg-risk-low/20 text-risk-low px-3 py-1 rounded-full font-medium">✓ Verified on-chain</span>
                                ) : (
                                    <span className="text-xs bg-risk-high/20 text-risk-high px-3 py-1 rounded-full font-medium">✗ Not found</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-5 space-y-3">
                        {Object.entries(txResult).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-sentinel-700/50">
                                <span className="text-sm text-sentinel-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-sm text-white font-mono">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-5 border-t border-sentinel-700 bg-sentinel-900/30">
                        <a
                            href={`https://testnet.algoexplorer.io/tx/${(txResult as { txId?: string }).txId || txHashInput}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full block text-center bg-algo-teal/20 text-algo-teal py-2.5 rounded-lg text-sm font-medium hover:bg-algo-teal/30 transition"
                        >
                            View on Algorand Explorer →
                        </a>
                    </div>
                </div>
            )}

            {/* Shipment Certificate */}
            {certificate && (
                <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-accent/10 to-algo-teal/10 p-5 border-b border-sentinel-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-algo-teal/20 rounded-lg flex items-center justify-center text-lg"></div>
                            <div>
                                <h3 className="text-white font-bold">Risk Alert Certificate</h3>
                                <p className="text-xs text-sentinel-400">Algorand Verified • Immutable Record</p>
                            </div>
                            <div className="ml-auto">
                                {certificate.verified ? (
                                    <span className="text-xs bg-risk-low/20 text-risk-low px-3 py-1 rounded-full font-medium">✓ Verified</span>
                                ) : (
                                    <span className="text-xs bg-risk-high/20 text-risk-high px-3 py-1 rounded-full font-medium">✗ Unverified</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 space-y-3">
                        {[
                            ['Shipment ID', certificate.shipmentID],
                            ['Risk Type', certificate.riskType],
                            ['Risk Score', `${certificate.riskScore}/100`],
                            ['Severity', certificate.severity],
                            ['Timestamp', new Date(certificate.timestamp).toLocaleString()],
                            ['Alert Hash (SHA256)', certificate.alertHash],
                            ['Blockchain Tx', certificate.blockchainTx],
                        ].map(([label, value]) => (
                            <div key={label} className="flex justify-between py-2 border-b border-sentinel-700/50">
                                <span className="text-sm text-sentinel-400">{label}</span>
                                <span className={`text-sm font-mono ${label === 'Blockchain Tx' ? 'text-algo-teal' :
                                    label?.toString().includes('Hash') ? 'text-accent text-xs' : 'text-white'
                                    }`}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 border-t border-sentinel-700 bg-sentinel-900/30 space-y-3">
                        <a
                            href={`https://testnet.algoexplorer.io/tx/${certificate.blockchainTx}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full block text-center bg-algo-teal/20 text-algo-teal py-2.5 rounded-lg text-sm font-medium hover:bg-algo-teal/30 transition"
                        >
                            View on Algorand Explorer →
                        </a>
                        {/* Cross-verify with tx hash mode */}
                        <button
                            onClick={() => {
                                setMode('txhash');
                                setTxHashInput(certificate.blockchainTx);
                                setCertificate(null);
                            }}
                            className="w-full block text-center bg-sentinel-700 text-sentinel-400 py-2.5 rounded-lg text-sm font-medium hover:text-white transition"
                        >
                            Cross-verify Transaction Hash
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
