# Deployment Guide

Recommended stack:

| Tier | Where |
| --- | --- |
| Frontend | **Vercel** (static + edge) |
| Backend | **Render** (Node web service) |
| Database | **MongoDB Atlas** (free M0 to start) |

---

## 1. MongoDB Atlas

1. https://cloud.mongodb.com → create a free cluster.
2. **Network Access** → allow `0.0.0.0/0` (or, better, the Render egress IPs).
3. **Database Access** → create a user, save the password.
4. **Database** → click *Connect → Drivers → Node.js* and copy the URI:
   ```
   mongodb+srv://<user>:<pass>@cluster.xxx.mongodb.net/challan_resolve?retryWrites=true&w=majority
   ```

---

## 2. Backend on Render

1. Push the repo to GitHub/GitLab.
2. https://dashboard.render.com → **New → Web Service**.
3. Settings:
   * **Root directory**: `backend`
   * **Build command**: `npm install`
   * **Start command**: `npm start`
   * **Node version**: 18
4. **Environment variables** — paste everything from `backend/.env.example`:
   ```
   NODE_ENV=production
   PORT=4000
   FRONTEND_URL=https://your-app.vercel.app
   MONGO_URI=<from Atlas>
   JWT_SECRET=<openssl rand -hex 64>
   CHALLAN_API_URL=...
   CHALLAN_API_KEY=...
   RAZORPAY_KEY_ID=rzp_live_xxx
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...
   ```
5. Deploy. Note the service URL (e.g. `https://challan-api.onrender.com`).

### Optional: Razorpay webhook
* Razorpay Dashboard → Settings → Webhooks → **Create**.
* URL: `https://challan-api.onrender.com/api/payments/webhook`
* Secret: same as `RAZORPAY_WEBHOOK_SECRET`.
* Events: `payment.captured`, `payment.failed`, `payment.authorized`.

### Optional: seed an admin once
On Render, run a **one-off shell** and execute:
```bash
node database/seed.js
```

---

## 3. Frontend on Vercel

1. https://vercel.com/new → import the repo.
2. Settings:
   * **Framework**: Vite
   * **Root directory**: `.` (the repo root)
   * **Build command**: `npm run build`
   * **Output directory**: `dist`
3. **Environment variables**:
   ```
   VITE_API_BASE_URL=https://challan-api.onrender.com/api
   VITE_BRAND_NAME=ClearMyChallan
   VITE_SUPPORT_PHONE=+91...
   VITE_WHATSAPP_NUMBER=91...
   # Optional — also fetched from /api/payments/config:
   VITE_RAZORPAY_KEY_ID=rzp_live_xxx
   ```
4. Deploy. Add the resulting `*.vercel.app` (and your custom domain) to
   `FRONTEND_URL` on Render.

---

## 4. Post-deploy checklist

- [ ] `https://api.../api/health` returns `200`.
- [ ] Hitting the frontend logs no CORS error in the browser console.
- [ ] Signup creates a row in the `users` collection.
- [ ] Razorpay test payment completes and a `Payment` doc shows `status=paid`.
- [ ] Admin login at `/admin` (when you add the admin UI) shows analytics.

---

## 5. Production hardening (recommended)

1. **JWT in httpOnly cookies** — swap `tokenStore` in `src/services/api.js`
   to use cookies + add `cookie-parser` server-side.
2. **Custom domain + HTTPS** — both Vercel and Render handle this in 2
   clicks; just add the CNAME / A record at your registrar.
3. **Sentry / log drain** — pipe stdout from Render to your log tool.
4. **Backups** — Atlas → Cluster → Backup → enable continuous snapshots.
5. **Rate limits** — bump or shrink via `RATE_LIMIT_*` env vars.
