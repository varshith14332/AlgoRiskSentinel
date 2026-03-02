import express from "express";
import {
    createAlert,
    getAlerts,
} from "../controllers/alertController";

const router = express.Router();

router.post("/", createAlert);
router.get("/", getAlerts);

export default router;
