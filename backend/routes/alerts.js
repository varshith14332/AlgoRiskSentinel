const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Payment = require('../models/Payment');

// GET /api/alerts - Get all alerts
router.get('/', async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ timestamp: -1 });
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/alerts/:shipmentID - Get alerts for shipment (micropayment gated)
router.get('/:shipmentID', async (req, res) => {
    try {
        const { shipmentID } = req.params;
        const { key } = req.query;
        const alerts = await Alert.find({ shipmentID });

        if (alerts.length === 0) {
            return res.status(404).json({ error: 'No alerts found for this shipment' });
        }

        // Check if any alerts are premium and require payment
        const hasPremium = alerts.some(a => a.isPremium);
        if (hasPremium && !key) {
            // Return non-premium alerts + 402 notice for premium
            const freeAlerts = alerts.filter(a => !a.isPremium);
            return res.status(402).json({
                message: 'Micropayment required to access premium risk intelligence',
                freeAlerts,
                premiumCount: alerts.filter(a => a.isPremium).length,
                paymentAmount: '0.1 ALGO',
            });
        }

        // If key provided, verify payment
        if (key) {
            const payment = await Payment.findOne({ shipmentID, accessKey: key, verified: true });
            if (!payment) {
                return res.status(403).json({ error: 'Invalid access key' });
            }
        }

        res.json(alerts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
