const algosdk = require('algosdk');
const crypto = require('crypto');

const ALGORAND_SERVER = process.env.ALGORAND_SERVER || 'https://testnet-api.algonode.cloud';
const ALGORAND_INDEXER = process.env.ALGORAND_INDEXER || 'https://testnet-idx.algonode.cloud';
const ALGORAND_TOKEN = process.env.ALGORAND_TOKEN || '';

const algodClient = new algosdk.Algodv2(ALGORAND_TOKEN, ALGORAND_SERVER, '');
const indexerClient = new algosdk.Indexer(ALGORAND_TOKEN, ALGORAND_INDEXER, '');

/**
 * Log an alert on Algorand blockchain as a note transaction
 */
async function logAlertOnChain(alert) {
    try {
        const mnemonic = process.env.ALGORAND_MNEMONIC;
        if (!mnemonic) {
            console.warn('No ALGORAND_MNEMONIC set, skipping blockchain logging');
            return { txId: `DEMO_TX_${Date.now()}`, confirmed: false };
        }

        const account = algosdk.mnemonicToSecretKey(mnemonic);
        const suggestedParams = await algodClient.getTransactionParams().do();

        const noteData = JSON.stringify({
            app: 'AlgoRisk Sentinel',
            shipmentID: alert.shipmentID,
            riskScore: alert.riskScore,
            riskType: alert.riskType,
            severity: alert.severity,
            alertHash: alert.alertHash,
            timestamp: alert.timestamp,
        });

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: account.addr,
            receiver: account.addr,
            amount: 0,
            note: new TextEncoder().encode(noteData),
            suggestedParams,
        });

        const signedTxn = txn.signTxn(account.sk);
        const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
        await algosdk.waitForConfirmation(algodClient, txid, 4);

        return { txId: txid, confirmed: true };
    } catch (error) {
        console.error('Blockchain logging error:', error.message);
        return { txId: `DEMO_TX_${Date.now()}`, confirmed: false };
    }
}

/**
 * Verify a transaction on Algorand
 */
async function verifyTransaction(txId) {
    try {
        if (txId.startsWith('DEMO_TX_')) {
            return { verified: true, demo: true };
        }
        const txInfo = await indexerClient.lookupTransactionByID(txId).do();
        return { verified: true, transaction: txInfo };
    } catch (error) {
        return { verified: false, error: error.message };
    }
}

/**
 * Generate access key from transaction hash + shipment ID
 */
function generateAccessKey(transactionHash, shipmentID) {
    return crypto.createHash('sha256').update(`${transactionHash}${shipmentID}`).digest('hex');
}

module.exports = { logAlertOnChain, verifyTransaction, generateAccessKey, algodClient, indexerClient };
