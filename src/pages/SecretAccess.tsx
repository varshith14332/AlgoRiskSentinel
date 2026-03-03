import { useState, useEffect } from 'react';
import { peraWallet, getConnectedAddress, connectWallet } from '../services/walletService';
import algosdk from 'algosdk';

function copyToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        return Promise.resolve();
    }
}

export default function SecretAccess() {
    const [walletAddress, setWalletAddress] = useState<string | null>(getConnectedAddress());
    const [secret, setSecret] = useState('');
    const [txId, setTxId] = useState('');
    const [anomalySummary, setAnomalySummary] = useState('');
    const [shipmentId, setShipmentId] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'pending_payment' | 'paid' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const updateWallet = () => setWalletAddress(getConnectedAddress());
        window.addEventListener('storage', updateWallet);
        // Interval to catch local storage changes if event listener misses it
        const interval = setInterval(updateWallet, 2000);
        return () => {
            window.removeEventListener('storage', updateWallet);
            clearInterval(interval);
        };
    }, []);

    const generateSecret = () => {
        setSecret('');
        setTxId('');
        setAnomalySummary('');
        setShipmentId('');
        setStatus('idle');
        setErrorMessage('');
    };

    const handleCopy = async () => {
        if (!walletAddress) {
            setErrorMessage('Please connect wallet first');
            return;
        }

        if (status === 'generating' || status === 'pending_payment') {
            return;
        }

        setStatus('generating');
        try {
            let res = await fetch('/api/copy-secret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, txId: secret })
            });

            if (res.status === 402) {
                setStatus('pending_payment');
                setErrorMessage('Payment Requested! Please open your Pera Wallet mobile app to approve the 0.01 ALGO transaction.');

                // 1) Trigger payment
                const paymentTxId = await triggerPayment();
                if (!paymentTxId) {
                    setStatus('idle');
                    setErrorMessage('Payment aborted or Wallet app was minimized. Please try again.');
                    return; // Aborted by user
                }

                setStatus('generating'); // Reusing status for 'verifying' purely for the button loader UI
                setErrorMessage('Verifying payment on Algorand...');

                // WAIT for confirmation before sending the explicit validation step
                await new Promise(r => setTimeout(r, 4000));

                // 2) Send txId to backend for verification
                const verifyRes = await fetch("/api/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ walletAddress, txId: paymentTxId })
                });

                if (!verifyRes.ok) {
                    setStatus('error');
                    setErrorMessage('Payment verification failed on backend. Make sure the proxy/indexer caught it.');
                    return;
                }

                // Payment stored in DB, save txId to state
                setTxId(paymentTxId);

                // 3) Retry copy-secret after verification
                res = await fetch("/api/copy-secret", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ walletAddress })
                });
            }

            if (!res.ok) throw new Error("Access failed");

            // 4) Backend generates true secret hash securely
            const data = await res.json();
            if (!data.secret) throw new Error("No secret returned");

            setSecret(data.secret);
            setAnomalySummary(data.anomalySummary);
            setShipmentId(data.shipmentId);

            const combined = `Shipment ID: ${data.shipmentId}\nAnomaly: ${data.anomalySummary}\nHash Key: ${data.secret}\nTransaction ID: ${txId || 'N/A'}`;
            await copyToClipboard(combined);

            setStatus('paid');
            setErrorMessage('');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMessage('Copy failed');
        }
    };

    const triggerPayment = async (): Promise<string | null> => {
        try {
            if (!walletAddress) throw new Error("Wallet not connected");

            // Fetch latest anomaly hash from the database
            const alertRes = await fetch("/api/alerts/latest");
            if (!alertRes.ok) throw new Error("Failed to fetch latest anomaly hash");
            const alertData = await alertRes.json();
            const anomalyHash = alertData.alertHash;
            if (!anomalyHash) throw new Error("No anomaly hash found");

            // Encode the JSON payload into Uint8Array for the Algorand transaction note
            const payload = JSON.stringify({
                ship: alertData.shipmentID,
                risk: alertData.riskScore,
                hash: anomalyHash
            });
            const note = new TextEncoder().encode(payload);

            const algod = new algosdk.Algodv2('', "https://testnet-api.algonode.cloud", '');
            const params = await algod.getTransactionParams().do();

            // For demo purposes, we send the payment to a fixed sink address 
            // because Pera Wallet will often block self-transactions (sender === receiver)
            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: walletAddress,
                receiver: "2REZRAJJXTOT7JA72NNVTNDH6CWE6UOQZX4JHTWW2JU3GQ27LWFWSEIPVQ",
                amount: 10000, // 0.01 ALGO
                note: note, // 🔥 LINKING HASH TO BLOCKCHAIN
                suggestedParams: params
            });

            // Format Pera wallet expects: array of arrays of objects containing the transaction and optional signers
            const singleTxGroup = [{ txn: txn, signers: [walletAddress] }];

            const signedTxnsData = await peraWallet.signTransaction([singleTxGroup]);

            // Pera returns Uint8Arrays. Send the first transaction buffer to the network
            const signedTxnBytes = signedTxnsData[0];
            const tx = await algod.sendRawTransaction(signedTxnBytes).do();

            return tx.txid;
        } catch (error) {
            console.error(error);
            try {
                // If the session died silently, attempt to reconnect the bridge
                await peraWallet.reconnectSession();
            } catch (e) { /* ignore */ }

            setStatus('error');
            setErrorMessage('Payment request sent, but your wallet app may be closed or disconnected. Please open the Pera app and try again.');
            return null;
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Secret Copy (x402)</h1>
                <p className="text-sentinel-400">HTTP 402 Payment Required Implementation</p>
            </div>

            <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-6 space-y-5">

                {/* Generation Area */}
                <div>
                    <h3 className="text-sm font-medium text-white mb-3">Secret Key Generator</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={generateSecret}
                            className="bg-sentinel-700 hover:bg-sentinel-600 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                            Generate Hash Key
                        </button>
                    </div>
                </div>

                {/* Payment button area always visible after clicking generate until paid */}
                {(status !== 'idle' || secret === '') && status !== 'paid' && (
                    <div className="space-y-4 p-4 bg-sentinel-900/50 rounded-lg border border-sentinel-700">
                        <div className="flex flex-col items-center py-4 space-y-2 text-sentinel-400">
                            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <p className="text-sm">Secret Payload is Encrypted</p>
                        </div>
                        <button
                            onClick={() => handleCopy()}
                            disabled={status === 'generating' || status === 'pending_payment'}
                            className="w-full bg-gradient-to-r from-accent to-algo-teal text-sentinel-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {status === 'generating' ? 'Verifying access...' :
                                status === 'pending_payment' ? 'Awaiting Payment...' :
                                    'Purchase Secret (0.01 ALGO)'}
                        </button>
                    </div>
                )}

                {/* Securely Revealed Data Only After Payment */}
                {status === 'paid' && secret && (
                    <div className="space-y-4 p-4 bg-risk-low/10 rounded-lg border border-risk-low/30">
                        <div>
                            <p className="text-xs text-sentinel-400 mb-1">Shipment ID</p>
                            <p className="font-mono text-white text-sm">{shipmentId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-sentinel-400 mb-1">AI Anomaly Summary</p>
                            <p className="text-sm text-yellow-400 font-medium">{anomalySummary}</p>
                        </div>
                        <div>
                            <p className="text-xs text-sentinel-400 mb-1">Decrypted Hash Access Key</p>
                            <p className="font-mono text-accent text-sm break-all">{secret}</p>
                        </div>
                        <div>
                            <p className="text-xs text-sentinel-400 mb-1">Blockchain Receipt (TXID)</p>
                            <p className="font-mono text-algo-teal text-sm">{txId}</p>
                        </div>

                        <div className="text-xs text-risk-low text-center font-semibold pt-2 border-t border-risk-low/20">
                            Payload Copied to Clipboard! ✓
                        </div>
                    </div>
                )}
            </div>

            {/* Status Panel */}
            <div className="bg-sentinel-800 border border-sentinel-700 rounded-xl p-6">
                <h3 className="text-sm font-medium text-white mb-4">Payment Status</h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-sentinel-700/50">
                        <span className="text-sm text-sentinel-400">Wallet</span>
                        {walletAddress ? (
                            <span className="text-sm text-white font-mono bg-sentinel-700 px-2 py-1 rounded">
                                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                            </span>
                        ) : (
                            <button onClick={connectWallet} className="text-xs bg-algo-teal/20 text-algo-teal px-3 py-1.5 rounded hover:bg-algo-teal/30">Connect Pera</button>
                        )}
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-sentinel-700/50">
                        <span className="text-sm text-sentinel-400">Required</span>
                        <span className="text-sm text-accent font-bold">0.01 ALGO</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-sentinel-700/50">
                        <span className="text-sm text-sentinel-400">Status</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${status === 'paid' ? 'bg-risk-low/20 text-risk-low' :
                            status === 'pending_payment' ? 'bg-yellow-500/20 text-yellow-500' :
                                status === 'error' ? 'bg-risk-high/20 text-risk-high' :
                                    'bg-sentinel-700 text-sentinel-400'
                            }`}>
                            {status === 'paid' ? 'Paid' :
                                status === 'pending_payment' ? 'Pending Wallet App' :
                                    status === 'error' ? 'Failed' : 'Idle'}
                        </span>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-4 p-3 bg-risk-high/10 text-risk-high border border-risk-high/20 flex rounded-lg text-sm text-center">
                        {errorMessage}
                    </div>
                )}
            </div>

        </div>
    );
}
