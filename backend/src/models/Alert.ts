import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
    {
        shipmentID: String,
        riskType: String,
        riskScore: Number,
        severity: String,
        summary: String,
        blockchainTx: String,
        alertHash: String,
        timestamp: Date,
    },
    { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
