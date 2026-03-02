import express from "express";
import { getDashboardStats } from "../controllers/analyticsController";

const router = express.Router();

router.get("/dashboard", getDashboardStats);

export default router;
