import type { Alert } from '../types';

interface AlertsTableProps {
    alerts: Alert[];
    onVerify?: (alert: Alert) => void;
    onPayForAccess?: (shipmentID: string) => void;
}

function severityBadge(severity: string) {
    const colors: Record<string, string> = {
        Low: 'bg-risk-low/20 text-risk-low',
        Medium: 'bg-risk-medium/20 text-risk-medium',
        High: 'bg-risk-high/20 text-risk-high',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[severity] || 'bg-sentinel-600 text-white'}`}>
            {severity}
        </span>
    );
}

export default function AlertsTable({ alerts, onVerify, onPayForAccess }: AlertsTableProps) {
    if (alerts.length === 0) {
        return (
            <div className="text-center py-12 text-sentinel-400">
                <p className="text-4xl mb-3"></p>
                <p className="text-sm">No risk alerts detected</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-sentinel-400 uppercase tracking-wider border-b border-sentinel-700">
                        <th className="pb-3 pr-4">Shipment</th>
                        <th className="pb-3 pr-4">Risk Type</th>
                        <th className="pb-3 pr-4">Score</th>
                        <th className="pb-3 pr-4">Severity</th>
                        <th className="pb-3 pr-4">Blockchain Tx</th>
                        <th className="pb-3 pr-4">Time</th>
                        <th className="pb-3">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-sentinel-700/50">
                    {alerts.map((alert) => (
                        <tr key={alert._id || alert.alertHash} className="hover:bg-sentinel-800/50 transition">
                            <td className="py-3 pr-4 font-mono text-accent text-xs">{alert.shipmentID}</td>
                            <td className="py-3 pr-4">{alert.riskType}</td>
                            <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-1.5 rounded-full bg-sentinel-700 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${alert.riskScore >= 70 ? 'bg-risk-high' : alert.riskScore >= 40 ? 'bg-risk-medium' : 'bg-risk-low'
                                                }`}
                                            style={{ width: `${alert.riskScore}%` }}
                                        />
                                    </div>
                                    <span className="text-xs">{alert.riskScore}</span>
                                </div>
                            </td>
                            <td className="py-3 pr-4">{severityBadge(alert.severity)}</td>
                            <td className="py-3 pr-4">
                                {alert.blockchainTx ? (
                                    <a
                                        href={`https://testnet.algoexplorer.io/tx/${alert.blockchainTx}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-algo-teal hover:underline font-mono"
                                    >
                                        {alert.blockchainTx.slice(0, 8)}...
                                    </a>
                                ) : (
                                    <span className="text-xs text-sentinel-500">Pending</span>
                                )}
                            </td>
                            <td className="py-3 pr-4 text-xs text-sentinel-400">
                                {new Date(alert.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3 flex gap-2">
                                {onVerify && alert.blockchainTx && (
                                    <button
                                        onClick={() => onVerify(alert)}
                                        className="text-xs bg-algo-teal/20 text-algo-teal px-2.5 py-1 rounded-lg hover:bg-algo-teal/30 transition"
                                    >
                                        Verify
                                    </button>
                                )}
                                {onPayForAccess && alert.isPremium && (
                                    <button
                                        onClick={() => onPayForAccess(alert.shipmentID)}
                                        className="text-xs bg-accent/20 text-accent px-2.5 py-1 rounded-lg hover:bg-accent/30 transition"
                                    >
                                        Unlock
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
