import Alert from "../models/Alert";

export const createAlert = async (req: any, res: any) => {
    try {
        const alert = new Alert(req.body);
        await alert.save();
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: "Error creating alert" });
    }
};

export const getAlerts = async (req: any, res: any) => {
    try {
        const alerts = await Alert.find();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching alerts" });
    }
};

export const getLatestAlert = async (req: any, res: any) => {
    try {
        const alert = await Alert.findOne().sort({ timestamp: -1 });
        if (!alert) {
            return res.status(404).json({ message: "No alerts found" });
        }
        res.json(alert);
    } catch (error) {
        res.status(500).json({ message: "Error fetching latest alert" });
    }
};
