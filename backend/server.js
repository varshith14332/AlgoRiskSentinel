require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const shipmentRoutes = require('./routes/shipments');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');
const verifyRoutes = require('./routes/verify');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/shipments', shipmentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/verify', verifyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'AlgoRisk Sentinel API', timestamp: new Date().toISOString() });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/algorisk-sentinel';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        app.listen(PORT, () => console.log(`🚀 AlgoRisk Sentinel API running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        // Start server anyway for demo mode
        app.listen(PORT, () => console.log(`🚀 API running on port ${PORT} (no DB)`));
    });
