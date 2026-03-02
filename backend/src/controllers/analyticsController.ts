import Shipment from "../models/Shipment";
import Alert from "../models/Alert";

export const getDashboardStats = async (req: any, res: any) => {
    try {
        const totalShipments = await Shipment.countDocuments();
        const shipments = await Shipment.find();

        let delayedShipments = 0;
        shipments.forEach(s => {
            if (s.actualDeliveryDays && s.expectedDeliveryDays && s.actualDeliveryDays > s.expectedDeliveryDays) {
                delayedShipments++;
            }
        });

        const highRiskAlerts = await Alert.countDocuments({ severity: 'High' });

        // Calculate average risk score
        const alerts = await Alert.find();
        let totalScore = 0;
        let count = 0;

        alerts.forEach(a => {
            if (a.riskScore) {
                totalScore += a.riskScore;
                count++;
            }
        });

        const averageRiskScore = count > 0 ? totalScore / count : 0;

        // Count alerts by type
        const alertsByType: Record<string, number> = {};
        alerts.forEach(a => {
            if (a.riskType) {
                alertsByType[a.riskType] = (alertsByType[a.riskType] || 0) + 1;
            }
        });

        // Get 5 most recent alerts
        const recentAlerts = await Alert.find().sort({ timestamp: -1 }).limit(5);

        res.json({
            totalShipments,
            delayedShipments,
            highRiskShipments: highRiskAlerts,
            averageRiskScore,
            alertsByType,
            recentAlerts
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
};
