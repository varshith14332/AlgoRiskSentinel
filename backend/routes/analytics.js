const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const totalShipments = await Shipment.countDocuments();
        const delayedShipments = await Shipment.countDocuments({ status: { $in: ['Delayed', 'At Risk'] } });
        const highRiskAlerts = await Alert.countDocuments({ severity: 'High' });

        const alerts = await Alert.find();
        const avgRiskScore = alerts.length > 0
            ? alerts.reduce((sum, a) => sum + a.riskScore, 0) / alerts.length
            : 0;

        // Count by type
        const alertsByType = {};
        alerts.forEach(a => {
            alertsByType[a.riskType] = (alertsByType[a.riskType] || 0) + 1;
        });

        const recentAlerts = await Alert.find().sort({ timestamp: -1 }).limit(10);

        res.json({
            totalShipments,
            delayedShipments,
            highRiskShipments: highRiskAlerts,
            averageRiskScore: Math.round(avgRiskScore * 10) / 10,
            alertsByType,
            recentAlerts,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
