# ClearMyChallan — Backend API

Production Node.js + Express + MongoDB API for advocate-assisted vehicle
challan resolution. JWT auth, Razorpay UPI payments, a pluggable challan
provider, and city-based resolution pricing.

> Plug your real Challan + Razorpay keys into `.env` and it's live. With no
> keys it runs on realistic mock data so the full stack works in dev.

---

## Quick start

```bash
cp .env.example .env          # then set MONGO_URI + JWT_SECRET (minimum)
npm install
npm run dev                   # http://localhost:4000  (nodemon)
npm run seed                  # creates admin (from .env), a demo user + advocate
```

Health check: `GET http://localhost:4000/api/health`

### Seeded accounts (after `npm run seed`)
| Role | Email | Password |
| --- | --- | --- |
| User | `demo@clearmychallan.in` | `Demo@1234` |
| Advocate | `advocate@clearmychallan.in` | `Advocate@1234` |
| Admin | `ADMIN_EMAIL` (from `.env`) | `ADMIN_PASSWORD` |

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Production server (`node server.js`) |
| `npm run dev` | Dev server with reload (nodemon) |
| `npm run seed` | Seed admin / demo user / advocate |
| `npm run test:integration` | Full end-to-end test on an in-memory Mongo* |

\* Requires the optional dev dep: `npm i -D mongodb-memory-server`. The test
boots the real app and walks signup → lookup → resolution → payment gating →
admin → advocate workflow with **no external services**.

---

## Folder structure

```
backend/
├── config/          # Central env loader + feature flags
├── controllers/     # HTTP layer (thin)
├── routes/          # Route registration (mounted under /api)
├── services/        # Business logic incl. pricingCalculator.js
├── models/          # Mongoose schemas
├── middleware/      # auth / admin / validate / errorHandler / rateLimiter
├── integrations/    # challanProvider.js, razorpayClient.js
├── validators/      # express-validator chains
├── utils/           # jwt, apiResponse, asyncHandler, logger
├── database/        # connection.js, seed.js
├── test/            # integration.js
└── server.js        # Entry: security → routes → graceful shutdown
```

---

## Environment variables

See [`.env.example`](.env.example) for the full annotated list. Essentials:

| Var | Required | Notes |
| --- | --- | --- |
| `MONGO_URI` | ✅ | Local or Atlas connection string |
| `JWT_SECRET` | ✅ | `openssl rand -hex 64` |
| `FRONTEND_URL` | ✅ | CORS allowlist (comma-separated) |
| `CHALLAN_API_URL` / `CHALLAN_API_KEY` | optional | Blank → mock data |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | optional | Blank → payments return 503 |
| `RAZORPAY_WEBHOOK_SECRET` | optional | For verified webhooks |

---

## API surface

Full reference with request/response bodies: [`../docs/API.md`](../docs/API.md).

| Group | Base | Auth |
| --- | --- | --- |
| Auth | `/api/auth` | public + bearer |
| Challans | `/api/challans` | public lookup |
| Pricing | `/api/pricing` | public |
| Resolutions | `/api/resolutions` | bearer (user + advocate routes) |
| Payments | `/api/payments` | bearer (+ public `/config`, webhook) |
| Contact | `/api/contact` | public |
| Admin | `/api/admin` | bearer + `role=admin` |

---

## Going live

1. **Challan provider** — set `CHALLAN_API_URL` + `CHALLAN_API_KEY`, then adapt
   `mapResponse()` in `integrations/challanProvider.js` to your provider's shape.
2. **Razorpay** — set the three `RAZORPAY_*` vars and point a dashboard webhook
   at `/api/payments/webhook`.
3. **Pricing** — all rules live in one file: `services/pricingCalculator.js`.
4. **Deploy** — see [`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md) (Render + Atlas).

The server handles `SIGTERM`/`SIGINT` for zero-downtime deploys and exposes a
DB-aware `/api/health` for platform health checks.
