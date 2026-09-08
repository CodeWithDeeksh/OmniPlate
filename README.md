# OmniPlate — City-wide Vehicle Intelligence Platform

A full-stack ANPR (Automatic Number Plate Recognition) surveillance and traffic analytics system. Built for real-time vehicle tracking, anomaly detection, and traffic intelligence across a city-wide camera network.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Stack](https://img.shields.io/badge/Frontend-React+TypeScript-3178C6?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)
![Stack](https://img.shields.io/badge/ANPR-YOLOv8+EasyOCR-EE4B28?style=flat-square)

---

## Features

- **Live ANPR pipeline** — YOLOv8n vehicle detection + EasyOCR plate reading
- **Vehicle trajectory reconstruction** — track any plate across the camera network
- **Anomaly detection** — blacklist matching, impossible travel, route deviation alerts
- **Traffic analytics** — density heatmaps, congestion monitoring, origin-destination flows
- **Role-based access** — Admin / Operator / Analyst with enforced permissions
- **Security-first** — rate limiting, session timeout, audit logging, CSP headers
- **Live dashboard** — real-time detection ticker, toast notifications, command palette (`⌘K`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Uvicorn |
| Database | PostgreSQL 14+ (psycopg3 driver) |
| ORM / Migrations | SQLAlchemy + Alembic |
| ANPR | YOLOv8n (Ultralytics) + EasyOCR + OpenCV |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Maps | Leaflet + react-leaflet |
| Charts | Recharts |
| Containerisation | Docker + docker-compose |

---

## Project Structure

```
omniplate/
├── backend/                  # FastAPI application
│   ├── api/                  # REST endpoints
│   ├── models/               # SQLAlchemy models + Pydantic schemas
│   ├── services/             # Analytics, trajectory, alert logic
│   ├── db/                   # Session management
│   └── main.py
├── frontend/                 # React + TypeScript dashboard
│   └── src/
│       ├── pages/            # Dashboard, Map, Search, Alerts, Analytics, SignIn
│       ├── components/       # UI primitives, layout, map markers
│       └── lib/              # API client, auth, security, toast, shortcuts
├── anpr/                     # ANPR detection pipeline
│   ├── pipeline.py           # Main entry point
│   ├── detector.py           # YOLOv8n + Haar cascade
│   ├── ocr.py                # EasyOCR
│   └── schema.py             # DetectionEvent contract
├── docs/                     # API contract, architecture, data contract
├── alembic/                  # Database migrations
├── docker-compose.yml        # PostgreSQL container
└── .env.example              # Environment variable template
```

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ **or** Docker

### 1. Clone

```bash
git clone https://github.com/your-username/omniplate.git
cd omniplate
```

### 2. Database

**Option A — Docker (recommended):**
```bash
docker-compose up -d
```

**Option B — Local PostgreSQL:**
```sql
CREATE USER omniplate WITH PASSWORD '123456';
CREATE DATABASE omniplate OWNER omniplate;
```

### 3. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example ../.env        # credentials already set for local dev
alembic upgrade head
uvicorn backend.main:app --reload --port 8000
```

Backend → **http://localhost:8000**
Swagger UI → **http://localhost:8000/docs**

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend → **http://localhost:5173**

### 5. Sign in

| Role | Username | Password |
|---|---|---|
| Administrator | `admin` | `Admin@2024!` |
| Operator | `operator` | `Oper@2024!` |
| Analyst | `viewer` | `View@2024!` |

> **Change these before any real deployment.** See [Authentication](#authentication).

---

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```env
# Required
DATABASE_URL=postgresql+psycopg://omniplate:123456@localhost:5432/omniplate

# Optional
REDIS_URL=                    # Leave blank — not used in current version
MAPBOX_TOKEN=                 # Not required — map uses free CARTO tiles
SEED_DATA=false               # Set to true to auto-insert 8 sample cameras on startup
```

Frontend env — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## ANPR Integration

The ANPR module (`/anpr`) is ready to use standalone or integrated into the backend.

### Standalone test

```bash
cd anpr
pip install -r requirements.txt
pytest test_pipeline.py -v
```

### Integrate into backend

1. Copy files to `backend/anpr/`
2. Add to `backend/requirements.txt`:
   ```
   opencv-python>=4.8.0
   ultralytics>=8.0.0
   easyocr>=1.7.0
   ```
3. Create endpoint `backend/api/anpr_endpoint.py`:
   ```python
   from fastapi import APIRouter, UploadFile
   from backend.anpr.pipeline import ANPRPipeline
   import numpy as np, cv2

   router = APIRouter()
   pipeline = ANPRPipeline()

   @router.post("/anpr/process-frame")
   async def process_frame(file: UploadFile, camera_id: str, latitude: float, longitude: float, direction: str):
       data = await file.read()
       frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
       events = pipeline.process_frame(frame, camera_id, latitude, longitude, direction)
       return [e.model_dump() for e in events]
   ```
4. Register in `backend/main.py`:
   ```python
   from backend.api.anpr_endpoint import router as anpr_router
   app.include_router(anpr_router, prefix="/api")
   ```

---

## Authentication

Current auth is **demo-mode only** (credentials hardcoded in `frontend/src/lib/auth.tsx`).

**Before any real deployment**, replace with JWT:

1. Add `POST /api/auth/login` to backend — verify against database, return a signed JWT
2. In `frontend/src/lib/auth.tsx`, replace the `DEMO_ACCOUNTS` block with:
   ```typescript
   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ username, password }),
   })
   const data = await res.json()
   if (!res.ok) return { ok: false, error: data.detail }
   localStorage.setItem('omniplate_token', data.access_token)
   return { ok: true }
   ```
3. Add the token to all API requests in `frontend/src/lib/api.ts` as `Authorization: Bearer <token>`

Security features already in place:
- 3-attempt lockout (30s cooldown) on sign-in
- 30-minute idle session timeout with countdown warning
- Audit log of all login/logout events (Admin-visible)
- Role-based access — viewer cannot see plate numbers on alerts/dashboard
- Runtime Content Security Policy headers
- Input sanitization + Indian plate format validation

---

## API Reference

Full contract in `docs/api_contract.md`. Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/cameras` | List all cameras |
| POST | `/api/detections` | Ingest a DetectionEvent from ANPR |
| GET | `/api/vehicles/{plate}` | Vehicle summary |
| GET | `/api/vehicles/{plate}/trajectory` | Reconstructed path |
| GET | `/api/analytics/density` | Traffic density by road |
| GET | `/api/analytics/congestion` | Corridor congestion |
| GET | `/api/analytics/od` | Origin-destination flows |
| GET | `/api/alerts` | Active alerts (filterable) |

---

## Deployment

### Free / Low-cost options

| Platform | What to deploy | Cost | Notes |
|---|---|---|---|
| **Railway** | Backend + PostgreSQL | Free tier / ~$5/mo | Easiest — one-click deploy, native Postgres |
| **Render** | Backend (web service) + PostgreSQL | Free tier (spins down) | Good for demos; paid tier for production |
| **Fly.io** | Backend | Free tier available | Better performance than Render free |
| **Supabase** | PostgreSQL only | Free tier (500MB) | Managed Postgres; connect any backend to it |
| **Vercel / Netlify** | Frontend only | Free | Static hosting; set `VITE_API_BASE_URL` to backend URL |
| **Cloudflare Pages** | Frontend only | Free | Fastest CDN; same setup as Vercel |

### Recommended setup (production)

```
Frontend  →  Vercel or Cloudflare Pages  (free)
Backend   →  Railway or Render           (~$5–7/mo)
Database  →  Railway Postgres or Supabase (free tier or ~$5/mo)
```

### Deploying frontend to Vercel

```bash
cd frontend
npm run build          # creates dist/
npx vercel --prod      # follow prompts; set VITE_API_BASE_URL env var in Vercel dashboard
```

### Deploying backend to Railway

1. Push code to GitHub
2. New project on [railway.app](https://railway.app) → Deploy from GitHub repo
3. Add PostgreSQL service
4. Set env var: `DATABASE_URL` (Railway auto-fills this when you link the Postgres service)
5. Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### Important deployment checklist

- [ ] Replace hardcoded demo credentials with real JWT auth (see [Authentication](#authentication))
- [ ] Set `VITE_API_BASE_URL` to your production backend URL
- [ ] Update `connect-src` in `frontend/src/lib/security.ts` CSP to your domain
- [ ] Enable HTTPS (automatic on Railway/Render/Vercel)
- [ ] Add CORS origin in `backend/main.py`:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(CORSMiddleware, allow_origins=["https://your-frontend.vercel.app"], allow_methods=["*"], allow_headers=["*"])
  ```
- [ ] Set strong DB password (not `123456`)
- [ ] Run `alembic upgrade head` on the production DB before first launch

### Restrictions to be aware of

| Service | Restriction |
|---|---|
| Render free tier | Spins down after 15 min inactivity; first request takes ~30s to wake up |
| Railway free tier | $5 credit/month; app sleeps if credit runs out |
| Vercel | Serverless only — backend must stay as a separate service |
| Supabase free | 500MB storage, pauses after 1 week of inactivity |
| ANPR / YOLOv8 | Needs a server with at least 2GB RAM; won't run on free-tier containers |
| Map tiles | CARTO tiles are free but require internet access; won't load offline |

---

## Development

### Adding a new API endpoint

```python
# backend/api/your_module.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/your-endpoint")
def your_endpoint():
    return {"data": "value"}
```

Register in `backend/main.py`:
```python
from backend.api.your_module import router as your_router
app.include_router(your_router, prefix="/api")
```

### Adding a new database migration

```bash
# After changing a model in backend/models/
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

### Adding a new frontend page

```typescript
// frontend/src/pages/YourPage.tsx
import { Shell } from '../components/layout/Shell'
export function YourPage() {
  return <Shell title="Your Page" subtitle="Description"><p>Content</p></Shell>
}
```

Register in `frontend/src/App.tsx`:
```typescript
const YourPage = lazy(() => import('./pages/YourPage').then(m => ({ default: m.YourPage })))
// Add inside <Routes>:
<Route path="/your-path" element={<YourPage />} />
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push and open a pull request

---

## License

MIT — use freely, attribution appreciated.
