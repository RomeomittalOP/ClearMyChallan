// =====================================================================
// ClearMyChallan API server — entry point
// ---------------------------------------------------------------------
// Boot order:
//   1. Load env config
//   2. Connect to MongoDB
//   3. Set up Express middleware (helmet/cors/json/rate-limit/morgan)
//   4. Mount /api routes (with a special raw-body webhook route first)
//   5. Mount 404 + error handlers last
// =====================================================================

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const compression = require('compression')

const config = require('./config')
const logger = require('./utils/logger')
const { connectDB } = require('./database/connection')
const routes = require('./routes')
const { globalLimiter } = require('./middleware/rateLimiter')
const { notFound, errorHandler } = require('./middleware/errorHandler')
const paymentCtrl = require('./controllers/payment.controller')

const app = express()

// ---- Trust proxy when deployed behind Render / Vercel / nginx -------
if (config.isProd) app.set('trust proxy', 1)

// ---- Security & infra middleware ------------------------------------
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(compression())

const corsOrigins = config.frontendUrl
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        return cb(null, true)
      }
      return cb(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true
  })
)

// Razorpay webhook must read the RAW body to verify HMAC. Mount it BEFORE
// the json parser, with a verify hook that captures the raw buffer.
app.post(
  '/api/payments/webhook',
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf
    }
  }),
  paymentCtrl.webhook
)

// ---- Body parsers ---------------------------------------------------
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ---- Logger ---------------------------------------------------------
app.use(morgan(config.isProd ? 'combined' : 'dev'))

// ---- Rate limiter ---------------------------------------------------
app.use(globalLimiter)

// ---- Routes ---------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'challan-resolve-api',
    docs: '/api/health',
    env: config.env
  })
})
app.use('/api', routes)

// ---- 404 + error ----------------------------------------------------
app.use(notFound)
app.use(errorHandler)

// ---- Boot -----------------------------------------------------------
let server
;(async () => {
  await connectDB()
  server = app.listen(config.port, () => {
    logger.info(`🚀 API ready on http://localhost:${config.port}  (${config.env})`)
    logger.info(
      `Razorpay: ${config.razorpayConfigured ? 'configured ✅' : 'NOT configured ⚠️'}`
    )
    logger.info(
      `Challan provider: ${
        config.challanProviderConfigured
          ? `${config.challan.provider} ✅`
          : 'mock fallback ⚠️'
      }`
    )
  })
})()

// ---- Graceful shutdown (Render/Docker send SIGTERM on deploy) --------
const mongoose = require('mongoose')
let shuttingDown = false
async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  logger.warn(`${signal} received — shutting down gracefully…`)

  // Stop accepting new connections, then close DB.
  const forceExit = setTimeout(() => {
    logger.error('Forced exit after 10s timeout')
    process.exit(1)
  }, 10000)

  try {
    if (server) await new Promise((res) => server.close(res))
    await mongoose.connection.close(false)
    clearTimeout(forceExit)
    logger.info('Closed HTTP server and DB connection. Bye 👋')
    process.exit(0)
  } catch (err) {
    logger.error('Error during shutdown:', err)
    process.exit(1)
  }
}
;['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)))

// Crash guard
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason)
})
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err)
})

module.exports = app
