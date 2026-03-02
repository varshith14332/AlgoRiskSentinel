const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true },
    shipmentID: { type: String, required: true },
    transactionHash: { type: String, required: true, unique: true },
    accessKey: { type: String, required: true },
    amount: { type: Number, required: true },
    verified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
