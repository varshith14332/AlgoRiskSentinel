import Shipment from "../models/Shipment";

export const createShipment = async (req: any, res: any) => {
    try {
        console.log("Incoming shipment:", req.body);
        let shipmentData = req.body;
        if (!shipmentData.shipmentID) {
            shipmentData.shipmentID = "SHP" + Math.floor(Math.random() * 1000000);
        }
        const shipment = new Shipment(shipmentData);
        await shipment.save();
        res.status(201).json(shipment);
    } catch (error) {
        console.error("Create shipment error:", error);
        res.status(500).json({ message: "Error creating shipment", error });
    }
};

export const getShipments = async (req: any, res: any) => {
    try {
        const shipments = await Shipment.find();
        res.json(shipments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching shipments" });
    }
};

const aiService = require("../../services/aiService");

export const analyzeShipmentController = async (req: any, res: any) => {
    try {
        const { shipmentID } = req.params;
        const shipment = await Shipment.findOne({ shipmentID });

        if (!shipment) {
            return res.status(404).json({ message: "Shipment not found" });
        }

        const analysis = await aiService.analyzeShipment(shipment);
        const alert = await aiService.createAlertFromAnalysis(analysis);

        res.json({ analysis, alert });
    } catch (error) {
        console.error("Analyze shipment error:", error);
        res.status(500).json({ message: "Analysis failed" });
    }
};
