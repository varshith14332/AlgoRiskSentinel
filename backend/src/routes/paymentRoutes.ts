import express from "express";
import algosdk from "algosdk";

import Payment from "../models/Payment";
import Alert from "../models/Alert";

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
                    if (!tx.note) {
                        console.log("❌ No note field found in payment transaction.");
                        return false;
                    }

                    const noteBuffer = Buffer.from(tx.note);
                    const noteDecoded = noteBuffer.toString('utf-8');

                    let hashToSearch = noteDecoded;
                    try {
                        const parsed = JSON.parse(noteDecoded);
                        if (parsed.hash) {
                            hashToSearch = parsed.hash;
                        }
                    } catch (e) {
                        // Not JSON, fallback to raw string
                    }

                    const anomaly = await Alert.findOne({ alertHash: hashToSearch });
                    if (!anomaly) {
                        console.log("❌ Transaction note does not match any known Anomaly Hash.");
                        return false;
                    }

                    console.log("✅ Payment verified on blockchain and linked to Anomaly:", anomaly.shipmentID);
                    return hashToSearch;
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

    const noteDecoded = await verifyPaymentOnChain(txId, walletAddress);

    if (!noteDecoded) {
        return res.status(400).json({ message: "Invalid payment transaction on blockchain or missing note" });
    }

    try {
        // Persist payment to database to prevent loops and double-charges
        await Payment.create({
            walletAddress,
            txHash: txId, // Using the existing model field 'txHash'
            amount: 100000,
            verified: true,
            anomalyHash: noteDecoded, // Store the linked anomaly hash
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

        const anomaly = await Alert.findOne({ alertHash: paidRecord.anomalyHash });
        if (!anomaly) {
            return res.status(404).json({ message: "Linked anomaly no longer exists" });
        }

        // Generate the consumption key server-side strictly AFTER verification
        const secretConsumptionKey = crypto.randomUUID();

        // Consume the payment record by attaching the consumption key
        paidRecord.accessKey = secretConsumptionKey;
        await paidRecord.save();

        res.json({
            secret: secretConsumptionKey,
            shipmentId: anomaly.shipmentID,
            anomalySummary: anomaly.summary,
            blockchainTx: paidRecord.txHash
        });
    } catch (e: any) {
        console.error("Database error finding payment:", e);
        return res.status(500).json({ message: "Internal server error checking payment route", error: e.message });
    }
});

export default router;
