# Architecture

## High-level view

```
┌─────────────────┐     HTTPS / JSON     ┌──────────────────────┐
│  React (Vite)   │ ───────────────────► │  Node + Express API  │
│  src/...        │ ◄─────────────────── │  backend/...         │
└────────┬────────┘                      └──────────┬───────────┘
         │                                          │
         │                                          ├──► MongoDB Atlas
         │                                          │
         │                                          ├──► Razorpay (UPI)
         │                                          │
         └──── Razorpay Checkout ◄─────────────────►├──► Challan provider
                                                          (Surepass / Signzy / …)
```

## Request lifecycle: "User clicks Proceed With Resolution"

```
React  ─► POST /api/challans/lookup        (or already cached)
       ─► POST /api/resolutions            { vehicleNumber, challanIds[] }
              ResolutionRequest created in Mongo (status=pending)
       ─► POST /api/payments/order         { resolutionRequestId }
              Server creates Razorpay order, persists Payment(status=created)
       ─► window.Razorpay({...}).open()
              User pays → Razorpay returns { orderId, paymentId, signature }
       ─► POST /api/payments/verify        HMAC-checked, Payment.status=paid,
                                           ResolutionRequest.status=in_review
       ─► (parallel) Razorpay webhook hits /api/payments/webhook
              Idempotently confirms the same state.
```

## Layered backend

```
HTTP    →  routes/         (URL → controller)
controllers/                (parse req, call service, format res)
services/                   (business logic, Mongoose, integrations)
integrations/               (external APIs — challan, razorpay)
models/                     (Mongoose schemas)
utils/, middleware/         (cross-cutting concerns)
```

Controllers are deliberately thin so we can later expose the same logic
over GraphQL, gRPC or background jobs without rewriting business rules.

## Data model

```
User ─┬─< ResolutionRequest >─┬─ Challan (many)
      │                        │
      │                        └─ Payment (1:1, optional)
      │
      └─< ContactRequest

Indexes:
  User.email                      unique
  Challan.{externalId,vehicle}    unique compound
  ResolutionRequest.user, .status
  Payment.user, .orderId, .status
```

## Security stance

* **Helmet** — sane HTTP security headers.
* **CORS** — explicit allowlist via `FRONTEND_URL`.
* **Rate limiting** — global + tighter `auth` + `payment` limiters.
* **JWT** — signed, 7-day expiry; auto-logout on 401 client-side.
* **Bcrypt** — 10 salt rounds, password never serialised (`select: false`).
* **express-validator** — body/param validation on every mutating route.
* **Razorpay HMAC** — payment + webhook signatures verified before any
  status mutation.
* **Mongoose `.toJSON`** — strips `passwordHash`, raw payloads, signatures.

## Plug-in points

| Concern | File |
| --- | --- |
| Challan provider mapping | `backend/integrations/challanProvider.js` (`mapResponse`) |
| Pricing rules (legal fee) | same file (`FEE_CALCULATOR`) |
| Payment provider | `backend/integrations/razorpayClient.js` |
| Token storage strategy | `src/services/api.js` (`tokenStore`) |
| Toast styling | `src/App.jsx` (`<Toaster>`) |
| Auth flows / signup UX | `src/context/AuthContext.jsx` |

Swap any of these without touching the rest of the system.
