# 🛡️ AlgoRisk Sentinel

**AI-Powered Supply Chain Risk Monitor on Algorand**

A hybrid AI + blockchain supply chain monitoring platform that analyzes logistics data, detects risks using machine learning, and records verified risk events on Algorand blockchain.

![Stack](https://img.shields.io/badge/React-TypeScript-blue) ![AI](https://img.shields.io/badge/AI-Scikit--learn-orange) ![Blockchain](https://img.shields.io/badge/Blockchain-Algorand-teal) ![License](https://img.shields.io/badge/License-MIT-green)

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API    │────▶│  AI Microservice│
│  React + TS     │     │  Express + Mongo │     │  FastAPI + ML   │
│  TailwindCSS    │     │  algosdk         │     │  Scikit-learn   │
│  Leaflet + Maps │     │                  │     │                 │
│  Pera Wallet    │     │                  │     │                 │
└─────────────────┘     └──────┬───────────┘     └─────────────────┘
                               │
                        ┌──────▼───────────┐
                        │  Algorand TestNet │
                        │  Smart Contracts  │
                        │  Alert Registry   │
                        │  Risk Alert NFTs  │
                        └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)

### 1. Frontend (port 5173)
```bash
npm install
npm run dev
```

### 2. Backend API (port 5000)
```bash
cd backend
cp .env.example .env    # Configure your env vars
npm install
npm run seed            # Seed demo data (requires MongoDB)
npm run dev
```

### 3. AI Microservice (port 8000)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### 4. Smart Contracts (optional)
```bash
cd smart-contracts
pip install -r requirements.txt
python alert_contract.py     # Compile to TEAL
python nft_contract.py       # Compile to TEAL
python deploy.py             # Deploy to TestNet
```

## 📁 Project Structure
```
algo-risk-sentinel/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # Reusable UI components
│   │   ├── StatCard.tsx
│   │   ├── AlertsTable.tsx
│   │   ├── RiskCharts.tsx
│   │   └── ShipmentMap.tsx
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Alerts.tsx
│   │   ├── Analytics.tsx
│   │   ├── MapView.tsx
│   │   ├── Shipments.tsx
│   │   └── Verify.tsx
│   ├── services/             # API & wallet services
│   ├── types/                # TypeScript definitions
│   └── data/                 # Demo data
├── backend/                  # Node.js API
│   ├── models/               # MongoDB schemas
│   ├── routes/               # Express routes
│   ├── services/             # Business logic
│   └── seed.js               # Demo data seeder
├── ai-service/               # Python ML service
│   ├── models/
│   │   ├── delay_predictor.py
│   │   ├── anomaly_detector.py
│   │   ├── fraud_detector.py
│   │   └── route_analyzer.py
│   └── main.py
└── smart-contracts/          # Algorand contracts
    ├── alert_contract.py
    ├── nft_contract.py
    └── deploy.py
```

## 🤖 AI Models

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Delay Predictor | Random Forest | Predict delivery delay probability |
| Anomaly Detector | Isolation Forest | Detect unusual shipment behavior |
| Fraud Detector | Rule + ML Hybrid | Flag suspicious patterns |
| Route Analyzer | Haversine Geospatial | Detect route deviations |

## ⛓️ Blockchain Features

- **Alert Registry**: On-chain logging of verified risk alerts
- **Risk Alert NFTs**: Immutable evidence for high-risk events
- **Public Verification**: Anyone can verify alerts via blockchain
- **Micropayments**: Pay 0.1 ALGO for premium risk intelligence

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shipments` | List all shipments |
| POST | `/api/shipments` | Create shipment |
| POST | `/api/shipments/:id/analyze` | AI risk analysis |
| GET | `/api/alerts` | List all alerts |
| GET | `/api/alerts/:id` | Get alert (402 for premium) |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| POST | `/api/payments/verify` | Verify micropayment |
| GET | `/api/verify/:id` | Public certificate |

## 🎨 Tech Stack

**Frontend**: Vite, React, TypeScript, TailwindCSS, Leaflet.js, Recharts, Pera Wallet  
**Backend**: Node.js, Express, MongoDB, algosdk  
**AI**: Python, FastAPI, Scikit-learn, Pandas, NumPy  
**Blockchain**: Algorand TestNet, PyTeal, algosdk, Algokit

## 📄 License

MIT
