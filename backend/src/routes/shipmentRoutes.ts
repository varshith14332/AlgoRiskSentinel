import express from "express";
import {
    createShipment,
    getShipments,
    analyzeShipmentController
} from "../controllers/shipmentController";

const router = express.Router();

router.post("/", createShipment);
router.get("/", getShipments);
router.post("/:shipmentID/analyze", analyzeShipmentController);

export default router;
