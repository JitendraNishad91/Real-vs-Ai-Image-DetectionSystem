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

## ☁️ Deployment (Railway)

Both services deploy from this single GitHub repo. `backend/railway.json` and `frontend/railway.json` are pre-configured for [Railway](https://railway.app).

> **Important:** Railway imports `railway.json` settings into the dashboard **once** at service creation. If you ever change the repo config afterwards, also fix **Settings → Deploy → Custom Start Command** in the Railway dashboard — the dashboard value overrides everything.

### 1. Backend service
1. Push the repo to GitHub → on [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
2. Service **Settings**:
   - **Root Directory** = `backend`
   - **Custom Start Command** = leave **empty** (the Dockerfile `CMD` runs `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`)
   - Remove any **Healthcheck Path** (or set it to `/docs` only after the service starts successfully)
3. Add environment variables (**Variables** tab):
   - `SECRET_KEY` — any long random string
   - `EMAIL_ADDRESS`, `EMAIL_PASSWORD` — Gmail SMTP for password-reset codes
   - Optional: create **Postgres** in the same project and it auto-links via `DATABASE_URL`; otherwise SQLite is used (resets on redeploy).
4. Verify in **Logs**: you must see `Uvicorn running on http://0.0.0.0:<port>`.
5. Generate a public domain (**Settings → Networking → Generate Domain**, target port `8000`). API docs live at `/docs`.

> **Note:** `tensorflow-cpu` is commented out in `requirements.txt`. Uncomment it for real CNN inference — it needs ≥ 1 GB RAM, so use a larger instance size than the default trial container.

### 2. Frontend service
1. In the **same Railway project**: **New → GitHub Repo** → select the same repo.
2. Service **Settings**:
   - **Root Directory** = `frontend`
   - **Custom Start Command** = leave **empty** (`frontend/railway.json` runs `npm run preview -- --port ${PORT:-3000} --host 0.0.0.0`)
3. Add environment variable (**Variables** tab):
   - `VITE_API_URL` = backend public URL from step 1 (e.g. `https://<service>.up.railway.app`) — this is a **build-time** variable.
4. Generate a public domain (target port `3000`) — your app is live.

### 3. Final wiring
- Redeploy the frontend after setting `VITE_API_URL` (build-time variable).
- Register/login against the deployed stack and run a scan end-to-end.
