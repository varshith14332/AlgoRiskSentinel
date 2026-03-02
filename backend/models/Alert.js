const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    shipmentID: { type: String, required: true, index: true },
    riskScore: { type: Number, required: true },
    riskType: { type: String, enum: ['Delay', 'Anomaly', 'Fraud', 'Route Deviation'], required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    confidence: { type: Number, required: true },
    alertHash: { type: String, required: true, unique: true },
    blockchainTx: { type: String, default: '' },
    nftAssetId: { type: Number, default: null },
    isPremium: { type: Boolean, default: false },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
