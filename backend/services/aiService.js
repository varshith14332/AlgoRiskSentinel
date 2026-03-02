const crypto = require('crypto');
const axios = require('axios');
const Alert = require('../src/models/Alert').default || require('../src/models/Alert');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

function generateAlertHash(shipmentID, riskScore, timestamp) {
    return crypto.createHash('sha256').update(`${shipmentID}${riskScore}${timestamp}`).digest('hex');
}

function classifySeverity(score) {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
}

async function analyzeShipment(shipment) {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
            shipmentID: shipment.shipmentID,
            distance: shipment.distance,
            expectedDeliveryDays: shipment.expectedDeliveryDays,
            actualDeliveryDays: shipment.actualDeliveryDays,
            trafficLevel: shipment.trafficLevel,
            temperature: shipment.temperature,
            weight: shipment.weight,
            carrier: shipment.carrier,
            routeCoordinates: shipment.routeCoordinates,
            actualRouteCoordinates: shipment.actualRouteCoordinates,
        });
        return response.data;
    } catch (error) {
        console.warn('AI service unavailable, using fallback scoring');
        return fallbackAnalysis(shipment);
    }
}

function fallbackAnalysis(shipment) {
    let riskScore = 0;
    let riskType = 'Delay';

    // Simple rule-based fallback
    const delayRatio = shipment.actualDeliveryDays / Math.max(shipment.expectedDeliveryDays, 1);
    if (delayRatio > 1.5) riskScore += 40;
    else if (delayRatio > 1.0) riskScore += 20;

    if (shipment.trafficLevel === 'High') riskScore += 15;
    if (shipment.temperature > 35 || shipment.temperature < 0) riskScore += 15;
    if (shipment.weight > 1500) riskScore += 10;

    riskScore = Math.min(100, Math.max(0, riskScore));

    if (riskScore >= 50 && shipment.temperature > 38) riskType = 'Anomaly';
    if (delayRatio > 2) riskType = 'Delay';

    return {
        shipmentID: shipment.shipmentID,
        riskScore,
        riskType,
        severity: classifySeverity(riskScore),
        confidence: 0.65,
    };
}

async function createAlertFromAnalysis(analysis) {
    const timestamp = new Date().toISOString();
    const alertHash = generateAlertHash(analysis.shipmentID, analysis.riskScore, timestamp);

    const alert = new Alert({
        shipmentID: analysis.shipmentID,
        riskScore: analysis.riskScore,
        riskType: analysis.riskType,
        severity: analysis.severity || classifySeverity(analysis.riskScore),
        confidence: analysis.confidence,
        alertHash,
        isPremium: analysis.riskScore >= 70,
        timestamp,
    });

    await alert.save();
    return alert;
}

module.exports = { analyzeShipment, createAlertFromAnalysis, generateAlertHash, classifySeverity };
