import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/mongodb";

import shipmentRoutes from "./routes/shipmentRoutes";
import alertRoutes from "./routes/alertRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import paymentRoutes from "./routes/paymentRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/shipments", shipmentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", paymentRoutes);

app.get("/", (req, res) => {
    res.send("AlgoRisk API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
