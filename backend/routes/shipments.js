const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const { analyzeShipment, createAlertFromAnalysis } = require('../services/aiService');
const { logAlertOnChain } = require('../services/blockchainService');

// GET /api/shipments - Get all shipments
router.get('/', async (req, res) => {
    try {
        const shipments = await Shipment.find().sort({ createdAt: -1 });
        res.json(shipments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/shipments/:id - Get single shipment
router.get('/:id', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ shipmentID: req.params.id });
        if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
        res.json(shipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/shipments - Create new shipment
router.post('/', async (req, res) => {
    try {
        const count = await Shipment.countDocuments();
        const shipmentID = req.body.shipmentID || `SHP${(count + 101).toString().padStart(3, '0')}`;
        const shipment = new Shipment({ ...req.body, shipmentID });
        await shipment.save();
        res.status(201).json(shipment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/shipments/:id/analyze - Analyze shipment with AI
router.post('/:id/analyze', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ shipmentID: req.params.id });
        if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

        // 1. Analyze with AI
        const analysis = await analyzeShipment(shipment);

        // 2. Create alert if risk score > threshold
        if (analysis.riskScore > 30) {
            const alert = await createAlertFromAnalysis(analysis);

            // 3. Log on blockchain
            const { txId } = await logAlertOnChain(alert);
            alert.blockchainTx = txId;
            await alert.save();

            // 4. Update shipment status
            if (analysis.riskScore >= 70) shipment.status = 'At Risk';
            else if (analysis.riskScore >= 40) shipment.status = 'Delayed';
            await shipment.save();

            return res.json({ ...analysis, blockchainTx: txId, alertId: alert._id });
        }

        res.json(analysis);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
