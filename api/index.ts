import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "../backend/src/config/mongodb";

import shipmentRoutes from "../backend/src/routes/shipmentRoutes";
import alertRoutes from "../backend/src/routes/alertRoutes";
import analyticsRoutes from "../backend/src/routes/analyticsRoutes";
import paymentRoutes from "../backend/src/routes/paymentRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/shipments", shipmentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", paymentRoutes);

app.get("/api", (req: Request, res: Response) => {
    res.send("AlgoRisk Serverless API Running on Vercel");
});

export default app;
