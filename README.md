# RealCheck AI - Real vs. AI-Generated Image Forensic Detector

### XtraGrad Internship Program - Major Project Report & Live Platform
**Developers:**  
- **Pallavi Sowreddi** (Internship Major Project Lead)
- **Jitendra Kumar Nishad** (Internship Major Project Partner)

**Supervised by:** XtraGrad Mentorship Division  
**Academic Session:** 2025 - 2026

---

## 📌 Project Overview
**RealCheck AI** is a production-quality, full-stack image forensics web application. The platform classifies uploaded images as **REAL** (photographs from CIFAR-10) or **AI-GENERATED (FAKE)** (synthesized via Stable Diffusion v1.4), benchmarked on the 120,000 image **CIFAKE dataset**.

The application showcases both machine learning competency and full-stack engineering maturity:
1. **Explainable AI (Grad-CAM)**: Displays gradient-based activation mappings localizing the artifacts that triggered the network.
2. **Dual-Model Benchmark Architecture**: Compares custom shallow-to-medium CNNs against deep residual transfer-learned backbones (ResNet-50).
3. **Containerized Deployment**: Exposes a multi-tier client-server structure orchestrated using Docker Compose.

---

## 📂 Project Structure
```
realcheck-ai/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app setup, CORS, and routing endpoints
│   │   ├── config.py            # SQLite database environment configs
│   │   ├── database.py          # Session configuration & engine setups
│   │   ├── models.py            # SQLAlchemy database schemas (User, History)
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── auth.py              # JWT token and crypt hashing helpers
│   │   └── inference.py         # CNN/ResNet-50 inference and Grad-CAM backprop
│   ├── Dockerfile
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/          # NavBar, ThemeToggle
    │   ├── pages/               # LandingPage, ClassifyPage, BatchPage, HistoryPage, InsightsPage, AuthPages
    │   ├── App.tsx              # Master state orchestrator
    │   ├── main.tsx             # React entrypoint
    │   └── index.css            # Styles sheet
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    └── Dockerfile
```

---

## 🚀 Quick Start (Local Setup)

### Option 1: Launch via Docker Compose (Recommended)
Make sure you have Docker Desktop running, then execute in the root directory:
```bash
docker-compose up --build
```
This builds and launches:
- **FastAPI backend** running at [http://localhost:8000](http://localhost:8000)
- **Vite React frontend** running at [http://localhost:5173](http://localhost:5173)

---

### Option 2: Running Services Individually

#### 1. Backend Server Setup
Navigate to the `backend/` directory, set up your Python virtual environment, and launch uvicorn:
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
This starts the REST API server at [http://127.0.0.1:8000](http://127.0.0.1:8000). The auto-generated API docs are accessible at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

#### 2. Frontend App Setup
Open another terminal, navigate to the `frontend/` directory, install packages, and launch:
```bash
cd frontend
npm install
npm run dev
```
The React development server launches at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing and Verification

### Automated Tests
Run unit tests for classification, auth, and database endpoints:
```bash
cd backend
python -m unittest discover -s tests
```

### Manual Audit Checklist
1. **Guest Mode**: Open the dashboard, choose "Continue as Guest" and upload an image. Real-time classification verdict and Grad-CAM should render in under 1 second.
2. **JWT User Detections**: Register an account, log in, perform multiple scans, and verify that they populate correctly inside the **History Dashboard**.
3. **Model Insights**: Inspect the ROC curve and confusion matrix graphs on the public Insights tab.
4. **Theme Preference**: Toggle dark mode and refresh the page to ensure light/dark state persists in browser local storage.

---

## ☁️ Deployment (Vercel + Render)

### 1. Backend on Render (free tier works)
1. Push this repository to GitHub.
2. On [render.com](https://render.com) → **New → Blueprint** and select your repo (it auto-detects `render.yaml`), or create a **Web Service** manually:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables from `backend/.env.example` in the Render dashboard (`SECRET_KEY`, `SMTP_EMAIL`, `SMTP_PASSWORD`). Leave `DATABASE_URL` unset to use SQLite, or attach a free Render Postgres instance for persistent data.
4. Verify the service is live at `https://<your-service>.onrender.com/docs`.

> **Note:** `tensorflow-cpu` is commented out in `requirements.txt`. Uncomment it for real CNN inference — it requires a plan with ≥ 1 GB RAM (the 512 MB free tier will fall back to stub inference).

### 2. Frontend on Vercel
1. On [vercel.com](https://vercel.com) → **Add New → Project** and import the same repo.
2. Set **Root Directory** to `frontend` (Vite is auto-detected; build = `npm run build`, output = `dist`).
3. Add environment variable:
   - `VITE_API_URL` = `https://<your-service>.onrender.com`
4. Deploy. SPA routing on refresh is already handled by `frontend/vercel.json`.

### 3. Final wiring
- Update CORS in `backend/app/main.py` if you want to restrict `allow_origins` to your Vercel domain.
- Register/login against the deployed backend and run a scan end-to-end.
