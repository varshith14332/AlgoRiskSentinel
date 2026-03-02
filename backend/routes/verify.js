const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { verifyTransaction } = require('../services/blockchainService');

// GET /api/verify/:shipmentID - Public verification by shipment ID
router.get('/:shipmentID', async (req, res) => {
    try {
        const { shipmentID } = req.params;

        // Don't match tx hash pattern - route only handles shipment IDs
        if (shipmentID.startsWith('tx')) {
            return res.status(404).json({ error: 'Use /api/verify/tx/:txHash for transaction verification' });
        }

        const alert = await Alert.findOne({ shipmentID }).sort({ timestamp: -1 });

        if (!alert) {
            return res.status(404).json({ error: 'No verified alert found for this shipment' });
        }

        // Verify on blockchain if tx exists
        let blockchainVerified = false;
        if (alert.blockchainTx) {
            const { verified } = await verifyTransaction(alert.blockchainTx);
            blockchainVerified = verified;
        }

        res.json({
            shipmentID: alert.shipmentID,
            riskType: alert.riskType,
            riskScore: alert.riskScore,
            severity: alert.severity,
            timestamp: alert.timestamp,
            blockchainTx: alert.blockchainTx,
            alertHash: alert.alertHash,
            verified: blockchainVerified,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/verify/tx/:txHash - Verify by Algorand transaction hash
router.get('/tx/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params;

        // Look up the alert that has this transaction hash
        const alert = await Alert.findOne({ blockchainTx: txHash });

        // Verify on Algorand
        const { verified, transaction, demo } = await verifyTransaction(txHash);

        const result = {
            verified,
            txId: txHash,
            network: 'Algorand TestNet',
            timestamp: alert ? alert.timestamp : new Date().toISOString(),
            demo: demo || false,
        };

        if (alert) {
            // If we have an alert in our DB, include the alert details
            result.type = 'Risk Alert Log';
            result.shipmentID = alert.shipmentID;
            result.riskType = alert.riskType;
            result.riskScore = alert.riskScore;
            result.severity = alert.severity;
            result.alertHash = alert.alertHash;
            result.note = `AlgoRisk Sentinel alert: ${alert.riskType} (Score: ${alert.riskScore})`;
        } else {
            result.type = 'Unknown';
            result.note = 'Transaction found on Algorand but not linked to an AlgoRisk alert';
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
