import express from "express";
import {
    createAlert,
    getAlerts,
    getLatestAlert
} from "../controllers/alertController";

const router = express.Router();

router.get("/latest", getLatestAlert);
router.post("/", createAlert);
router.get("/", getAlerts);

export default router;
