// =====================================================================
// Centralized configuration
// ---------------------------------------------------------------------
// All process.env access lives here. Other modules import `config` so
// we have ONE place to validate, document and override env vars.
// =====================================================================

require('dotenv').config()

const required = (key, fallback) => {
  const v = process.env[key]
  if (v === undefined || v === '') return fallback
  return v
}

const config = {
  env: required('NODE_ENV', 'development'),
  port: parseInt(required('PORT', '4000'), 10),
  frontendUrl: required('FRONTEND_URL', 'http://localhost:5173'),

  mongo: {
    uri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/challan_resolve')
  },

  jwt: {
    secret: required('JWT_SECRET', 'dev_secret_change_me'),
    expiresIn: required('JWT_EXPIRES_IN', '7d')
  },

  challan: {
    // External challan provider (Parivahan / Surepass / Signzy / Gridlines, etc.)
    provider: required('CHALLAN_API_PROVIDER', 'mock'),
    apiUrl: required('CHALLAN_API_URL', ''),
    apiKey: required('CHALLAN_API_KEY', '')
  },

  razorpay: {
    keyId: required('RAZORPAY_KEY_ID', ''),
    keySecret: required('RAZORPAY_KEY_SECRET', ''),
    webhookSecret: required('RAZORPAY_WEBHOOK_SECRET', '')
  },

  cloudinary: {
    cloudName: required('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: required('CLOUDINARY_API_KEY', ''),
    apiSecret: required('CLOUDINARY_API_SECRET', ''),
    folder: required('CLOUDINARY_UPLOAD_FOLDER', 'clearmychallan/cases')
  },

  upload: {
    maxBytes: parseInt(required('MAX_UPLOAD_BYTES', '20971520'), 10),
    allowedMimes: required(
      'ALLOWED_UPLOAD_MIMES',
      'image/jpeg,image/png,image/jpg,application/pdf'
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  },

  rateLimit: {
    windowMs: parseInt(required('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(required('RATE_LIMIT_MAX', '300'), 10)
  },

  admin: {
    email: required('ADMIN_EMAIL', ''),
    password: required('ADMIN_PASSWORD', ''),
    name: required('ADMIN_NAME', 'Admin')
  }
}

// Helpful runtime flags
config.isProd = config.env === 'production'
config.razorpayConfigured = Boolean(
  config.razorpay.keyId && config.razorpay.keySecret
)
config.challanProviderConfigured = Boolean(
  config.challan.apiUrl && config.challan.apiKey
)
config.cloudinaryConfigured = Boolean(
  config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
)

module.exports = config
