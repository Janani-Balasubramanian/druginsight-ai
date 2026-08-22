# DrugInsight AI

**AI-Powered Drug Discovery and Drug Repurposing Using Explainable AI**

DrugInsight AI is an academic research prototype that helps researchers explore potential drug-repurposing opportunities and drug-target interactions using publicly available biomedical data and machine learning.

> **Disclaimer:** This is NOT a medical diagnosis or prescription system. All predictions are computational research results — not medical advice.

---

## Problem Statement

Drug discovery is slow, expensive, and has a high failure rate. Computational screening and repurposing can accelerate early-stage research by identifying promising drug-disease pairs for further experimental validation.

## Proposed Solution

An interactive full-stack platform combining:
- Biomedical data retrieval (PubChem, curated disease knowledge)
- Machine learning (Random Forest baseline)
- Explainable AI (SHAP feature importance)
- Research dashboard with history, comparison, and network visualization

## Features

- Landing page with research disclaimers
- JWT authentication (register, login, logout)
- Dashboard with charts and search
- Drug Search (PubChem integration)
- Disease Analysis
- Drug Repurposing Analysis (core ML pipeline)
- Drug-Target Analysis with React Flow network graph
- Explainable AI (SHAP)
- Compare Drugs (2–4 candidates)
- Prediction History (MongoDB)
- Methodology & Data Sources pages
- Model Performance metrics
- Demo Mode toggle

## Architecture

```
frontend/     → Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, Recharts, Framer Motion
backend/      → FastAPI, Pydantic, Motor (MongoDB), scikit-learn, SHAP
datasets/     → Research drug-disease pairs CSV
models/       → Trained model artifacts (generated on first run)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/drugs/search?q=` | Search drug |
| GET | `/api/diseases/search?q=` | Search disease |
| POST | `/api/predict` | ML prediction |
| POST | `/api/repurpose` | Repurposing analysis |
| POST | `/api/explain` | SHAP explanation |
| POST | `/api/compare` | Compare drugs |
| GET | `/api/history` | Prediction history |
| DELETE | `/api/history/:id` | Delete history item |
| GET | `/api/model/metrics` | Model evaluation metrics |

## Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB Atlas (or local MongoDB)

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `JWT_SECRET` | Secret for JWT signing |
| `CORS_ORIGINS` | Allowed frontend origins |
| `DEMO_MODE` | `true` for demo predictions |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (default: `http://localhost:8000`) |

## Database Setup

MongoDB collections:
- `users` — name, email, passwordHash, createdAt
- `predictions` — userId, drug, disease, prediction, score, confidence, target, explanation, createdAt
- `drugs` — cached drug records (optional)

## Model Training

The model auto-trains on first backend startup using `datasets/drug_disease_pairs.csv`.

Manual retraining:
```bash
cd backend
python train_model.py
```

## Deployment

- **Frontend:** Vercel (`frontend/`)
- **Backend:** Render, Railway, or Fly.io (`backend/`)
- **Database:** MongoDB Atlas

## Limitations

- AI predictions are computational, not clinical evidence
- Does not replace laboratory experiments
- Does not provide medical advice
- Small baseline dataset — expand for production research
- DrugBank requires separate licensing

## Future Scope

Multi-omics integration, Graph Neural Networks, generative molecule design, molecular docking, cloud-scale training.

## License

Academic research prototype — use responsibly.
