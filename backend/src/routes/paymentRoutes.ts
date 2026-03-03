import express from "express";
import algosdk from "algosdk";

import Payment from "../models/Payment";

const router = express.Router();

const indexer = new algosdk.Indexer(
    "",
    "https://testnet-idx.algonode.cloud",
    ""
);

const RECEIVER_ADDRESS = "2REZRAJJXTOT7JA72NNVTNDH6CWE6UOQZX4JHTWW2JU3GQ27LWFWSEIPVQ";

async function verifyPaymentOnChain(txId: string, walletAddress: string) {
    const maxWaitTime = 15000; // 15 seconds
    const interval = 2000;     // check every 2 seconds
    const start = Date.now();

    console.log("====== VERIFY DEBUG ======");
    console.log("TXID:", txId);
    console.log("Frontend Wallet:", walletAddress);

    while (Date.now() - start < maxWaitTime) {
        try {
            const response = await indexer.lookupTransactionByID(txId).do();
            const tx = response.transaction;

            if (tx && tx.confirmedRound) {
                const paymentTxn = tx.paymentTransaction;
                if (!paymentTxn) {
                    console.log("❌ Not a payment transaction");
                    return false;
                }

                const valid =
                    tx.sender.toUpperCase() === walletAddress.toUpperCase() &&
                    paymentTxn.receiver === RECEIVER_ADDRESS &&
                    paymentTxn.amount >= 10000;

                if (valid) {
                    console.log("✅ Payment verified on blockchain");
                    return true;
                }

                return false;
            }

        } catch (e) {
            console.log("⏳ Transaction not indexed yet. Retrying in 2 seconds...");
        }

        // wait before retry
        await new Promise(res => setTimeout(res, interval));
    }

    console.log("❌ Payment not found after 15 seconds");
    return false;
}

router.post("/verify-payment", async (req, res) => {
    const { walletAddress, txId } = req.body;

    if (!walletAddress || !txId) {
        return res.status(400).json({ message: "Wallet address and txId are required" });
    }

    const valid = await verifyPaymentOnChain(txId, walletAddress);

    if (!valid) {
        return res.status(400).json({ message: "Invalid payment transaction on blockchain" });
    }

    try {
        // Persist payment to database to prevent loops and double-charges
        await Payment.create({
            walletAddress,
            txHash: txId, // Using the existing model field 'txHash'
            amount: 100000,
            verified: true,
            accessKey: "" // Mark as unused explicitly
        });

        res.json({ success: true });
    } catch (e: any) {
        console.error("Database error saving payment:", e);
        return res.status(500).json({ message: "Internal server error saving payment", error: e.message });
    }
});

router.post("/copy-secret", async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
    }

    try {
        // Check backend state instead of making stateless indexer calls
        // We only want Payments that have NOT been consumed yet
        const paidRecord = await Payment.findOne({
            walletAddress,
            verified: true,
            $or: [{ accessKey: "" }, { accessKey: { $exists: false } }]
        });

        if (!paidRecord) {
            return res.status(402).json({
                message: "Payment required to access secret"
            });
        }

        // Generate the true secret hash server-side strictly AFTER verification
        const secret = crypto.randomUUID();

        // Consume the payment record by attaching the generated secret
        paidRecord.accessKey = secret;
        await paidRecord.save();

        res.json({ secret });
    } catch (e: any) {
        console.error("Database error finding payment:", e);
        return res.status(500).json({ message: "Internal server error checking payment route", error: e.message });
    }
});

export default router;
