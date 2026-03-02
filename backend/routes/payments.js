const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { verifyTransaction, generateAccessKey } = require('../services/blockchainService');

// POST /api/payments/verify - Verify micropayment and generate access key
router.post('/verify', async (req, res) => {
    try {
        const { shipmentID, transactionHash } = req.body;
        const walletAddress = req.headers['x-wallet-address'];

        if (!shipmentID || !transactionHash) {
            return res.status(400).json({ error: 'shipmentID and transactionHash are required' });
        }

        // Check if already verified
        const existing = await Payment.findOne({ transactionHash });
        if (existing) {
            return res.json({ accessKey: existing.accessKey, alreadyVerified: true });
        }

        // Verify transaction on Algorand
        const { verified } = await verifyTransaction(transactionHash);

        // Generate access key
        const accessKey = generateAccessKey(transactionHash, shipmentID);

        const payment = new Payment({
            walletAddress: walletAddress || 'unknown',
            shipmentID,
            transactionHash,
            accessKey,
            amount: 100000, // 0.1 ALGO in microAlgos
            verified,
        });

        await payment.save();

        res.json({ accessKey, verified });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
