// ============================================================
// MongoDB connection helper
// ============================================================
// Connects with mongoose using the URI from config. Exits the
// process on initial connection failure (in production) so that
// container orchestrators can restart cleanly.
// ============================================================

const mongoose = require('mongoose')
const config = require('../config')
const logger = require('../utils/logger')

mongoose.set('strictQuery', true)

async function connectDB() {
  try {
    await mongoose.connect(config.mongo.uri, {
      serverSelectionTimeoutMS: 8000
    })
    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`)
  } catch (err) {
    logger.error('❌ MongoDB connection error:', err.message)
    if (config.isProd) process.exit(1)
    // In dev, keep the process alive so devs can fix .env without restarting.
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected')
  })
  mongoose.connection.on('reconnected', () => {
    logger.info('🔄 MongoDB reconnected')
  })
}

module.exports = { connectDB }
