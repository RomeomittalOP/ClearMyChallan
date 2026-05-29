# API Reference

All endpoints are mounted under `/api`. JSON only. The response envelope is:

```json
{ "success": true|false, "message": "string", "data": {} }
```

Auth: send `Authorization: Bearer <token>` header for protected routes.

---

## Health

```
GET /api/health
```
Returns `200` with `{ success, message, db, uptime }` when MongoDB is connected,
or `503` (`message: "degraded"`) when it isn't — suitable for platform health checks.

---

## Auth (`/api/auth`)

| Method | Path | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| POST | `/signup` | – | `{ name, email, password, phone? }` | Create account. Returns `{ token, user }`. |
| POST | `/login` | – | `{ email, password }` | Returns `{ token, user }`. |
| GET | `/me` | ✅ | – | Current user profile. |
| PATCH | `/me` | ✅ | `{ name?, phone?, vehicles? }` | Update profile. |

`vehicles` is an array of `{ number, nickname }`.

---

## Challans (`/api/challans`)

| Method | Path | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| POST | `/lookup` | optional | `{ vehicleNumber, chassis? }` | Fetch challans (provider → mock fallback). |
| GET | `/:id` | – | – | Single cached challan. |

Response `data`:
```json
{
  "source": "mock | mock-fallback | <provider>",
  "vehicleNumber": "DL10CA1234",
  "count": 4,
  "challans": [
    {
      "id": "65f0…",
      "externalId": "MOCK-DL10CA1234-1000",
      "vehicleNumber": "DL10CA1234",
      "violation": "Over-speeding",
      "fineAmount": 1000,
      "legalFee": 600,
      "resolutionFee": 600,
      "totalPayable": 600,
      "pricingType": "flat_percent",
      "pricingDescription": "Flat 60% of the fine amount",
      "savings": 400,
      "city": "DELHI",
      "region": "Delhi",
      "status": "Pending",
      "date": "06 May 2026",
      "location": "Outer Ring Road, Delhi",
      "authority": "Delhi Traffic Police"
    }
  ]
}
```

> `totalPayable` is the all-inclusive amount the user pays. `legalFee` is kept
> as an alias of `resolutionFee` for backward compatibility.

---

## Pricing (`/api/pricing`)

City-based resolution pricing. Public (marketing) endpoints.

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | `/` | – | Full pricing table + supported cities. |
| POST | `/calculate` | `{ city, challanAmount }` | Resolution fee for one challan. |

`POST /calculate` response `data`:
```json
{
  "city": "GURUGRAM",
  "region": "Faridabad / Palwal / Gurugram",
  "challanAmount": 6000,
  "pricingType": "flat_percent",   // | "fine_plus_fee" | "default_estimate"
  "percent": 80,
  "serviceFee": null,
  "fee": 4800,
  "totalPayable": 4800,
  "savings": 1200,
  "matched": true,
  "description": "Flat 80% of the fine amount"
}
```

**Rules** (see `backend/services/pricingCalculator.js` — single source of truth):

| Region | Rule |
| --- | --- |
| Delhi | Flat 60% |
| Faridabad / Palwal / Gurugram | < ₹2000: fine + ₹500 · > ₹5000: flat 80% |
| Noida | Flat 50% |
| Ghaziabad | Flat 50% |
| Mathura / Agra / Aligarh | < ₹2000: fine + ₹500 · ≥ ₹2000: flat 70% |
| Bulandshahr / Shamli / Meerut | < ₹2000: fine + ₹500 · ≥ ₹2000: flat 65% |
| Lucknow / Kanpur | < ₹2000: fine + ₹500 · ≥ ₹2000: flat 65% |

---

## Resolution Requests (`/api/resolutions`) — auth required

| Method | Path | Body | Auth | Description |
| --- | --- | --- | --- | --- |
| POST | `/` | `{ vehicleNumber, challanIds[] }` | user | Create a resolution request. |
| GET | `/me` | – | user | All requests for the current user. |
| GET | `/:id` | – | owner/admin | Single request. |
| POST | `/:id/notes` | `{ message }` | user | Append a note. |
| GET | `/assigned` | – | advocate/admin | Cases assigned to the advocate. |
| PATCH | `/:id/status` | `{ status, note? }` | advocate/admin | Update case status. |

**Statuses:** `pending → in_review → processing → resolved | rejected`.

---

## Payments (`/api/payments`)

| Method | Path | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| GET | `/config` | – | – | Returns `{ razorpayConfigured, keyId }`. |
| POST | `/order` | ✅ | `{ resolutionRequestId }` | Create Razorpay order. |
| POST | `/verify` | ✅ | `{ orderId, paymentId, signature }` | Confirm after Checkout. |
| GET | `/me` | ✅ | – | List your payments. |
| POST | `/webhook` | – | Razorpay event | HMAC-verified webhook ingest. |

Frontend payment flow:
```
POST /payments/order  ──► Razorpay Checkout  ──► POST /payments/verify
                                       └── webhook fires in parallel
```

---

## Contact (`/api/contact`)

| Method | Path | Body |
| --- | --- | --- |
| POST | `/` | `{ name, phone, email?, message, channel? }` |

`channel` ∈ `whatsapp | call | email | web` (default `web`).

---

## Admin (`/api/admin`) — auth + `role=admin`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/summary` | Counts + revenue + status breakdown. |
| GET | `/users?page=&limit=&role=` | Paginated user list. |
| GET | `/advocates` | Users who can be assigned to cases. |
| GET | `/requests?status=&page=&limit=` | Paginated resolution requests. |
| PATCH | `/requests/:id/status` | `{ status, note? }` |
| PATCH | `/requests/:id/assign` | `{ advocateId }` — assign an advocate. |
| GET | `/payments?status=&page=&limit=` | Paginated payments. |
| GET | `/contacts?status=` | Contact submissions. |
| PATCH | `/contacts/:id` | `{ status }` |

---

## Error format

All errors return:
```json
{
  "success": false,
  "message": "Validation failed",
  "error": [ { "msg": "...", "path": "email" } ]
}
```

Common status codes:

| Code | Meaning |
| --- | --- |
| 400 | Bad request / signature mismatch |
| 401 | Missing / invalid token |
| 403 | Insufficient role |
| 404 | Not found |
| 409 | Duplicate (e.g. existing email) |
| 422 | Validation failed |
| 429 | Rate-limited |
| 500 | Server error |
