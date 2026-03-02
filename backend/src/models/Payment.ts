import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        walletAddress: String,
        shipmentID: String,
        txHash: String,
        accessKey: String,
        amount: Number,
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
