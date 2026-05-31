# Setup Guide

## 1. Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | 18 or newer |
| npm | 9+ |
| MongoDB | local install **or** an Atlas cluster |
| Git | any recent |

Optional (local dev only):

* **MongoDB Compass** – nice GUI to inspect collections.
* **Razorpay test account** – free, 5-minute signup, for end-to-end payment testing.

---

## 2. Clone & install

```bash
git clone <your-repo-url> challan-resolve
cd challan-resolve

# Frontend deps
npm install

# Backend deps
cd backend
npm install
cd ..
```

---

## 3. Environment variables

### 3.1 Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

| Variable | Required? | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | API port (default `4000`) |
| `FRONTEND_URL` | Yes | Comma-separated list of allowed origins (CORS) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | 64-char random string. Generate with `openssl rand -hex 64` |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `CHALLAN_API_URL` | No* | Provider endpoint. Blank → mock fallback. |
| `CHALLAN_API_KEY` | No* | Provider API key. |
| `CHALLAN_API_PROVIDER` | No | Free-form label (`surepass` etc.) |
| `RAZORPAY_KEY_ID` | No* | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | No* | Razorpay private key |
| `RAZORPAY_WEBHOOK_SECRET` | No | For verified webhooks |
| `RATE_LIMIT_WINDOW_MS` | No | Default `900000` (15 min) |
| `RATE_LIMIT_MAX` | No | Default `300` requests / window |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No | Used by `npm run seed` to create the first admin |

`*` Optional locally — without them the system runs against in-memory mocks.

### 3.2 Frontend (`.env.local`)

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | URL the browser will call (e.g. `https://api.clearmychallan.co.in/api`) |
| `VITE_RAZORPAY_KEY_ID` | Optional — pre-load Razorpay key. The frontend can also fetch it from `/api/payments/config`. |
| `VITE_BRAND_NAME` | Brand name shown on Razorpay Checkout |
| `VITE_SUPPORT_PHONE` / `VITE_WHATSAPP_NUMBER` | Click-to-call / chat numbers in the UI |

---

## 4. Run

```bash
# Terminal 1 — backend
cd backend
npm run dev                # nodemon, restarts on save

# Terminal 2 — frontend
npm run dev                # http://localhost:5173
```

### Seed an admin + demo user

```bash
cd backend
npm run seed
# → admin: ADMIN_EMAIL / ADMIN_PASSWORD (from .env)
# → demo:  demo@clearmychallan.co.in / Demo@1234
```

---

## 5. Smoke tests

### 5.1 Backend health
```bash
curl https://api.clearmychallan.co.in/api/health
# → {"success":true,"message":"ok","uptime":...}
```

### 5.2 Challan lookup (no auth)
```bash
curl -X POST https://api.clearmychallan.co.in/api/challans/lookup \
  -H "Content-Type: application/json" \
  -d '{"vehicleNumber":"DL10CA1234"}'
```

### 5.3 Signup → auth → resolve
```bash
# Signup
curl -X POST https://api.clearmychallan.co.in/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","password":"Test@1234"}'

# Use the returned token in subsequent calls:
curl https://api.clearmychallan.co.in/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## 6. Common issues

| Symptom | Fix |
| --- | --- |
| `MongoDB connection error` | Check `MONGO_URI`, whitelist IP in Atlas. |
| `CORS blocked` | Add the frontend origin to `FRONTEND_URL` (comma separated). |
| Frontend shows "offline demo data" | Backend not reachable — start `cd backend && npm run dev`. |
| `Payments are not configured` | Set `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`. |
| `Challan provider not configured` | Expected — leaves the system on mock data. Set `CHALLAN_API_URL` + `CHALLAN_API_KEY` to switch. |
