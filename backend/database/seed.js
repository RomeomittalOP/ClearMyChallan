// =====================================================================
// Database seeder — `npm run seed`
// =====================================================================
// Creates an admin account from env vars and a sample test user.
// Safe to re-run (uses upserts).
// =====================================================================

const mongoose = require('mongoose')
const config = require('../config')
const { connectDB } = require('./connection')
const User = require('../models/User')
const logger = require('../utils/logger')

async function run() {
  await connectDB()

  if (config.admin.email && config.admin.password) {
    const existing = await User.findOne({ email: config.admin.email })
    if (existing) {
      logger.info(`Admin already exists: ${config.admin.email}`)
    } else {
      const admin = new User({
        name: config.admin.name,
        email: config.admin.email,
        role: 'admin'
      })
      await admin.setPassword(config.admin.password)
      await admin.save()
      logger.info(`✅ Admin created: ${admin.email}`)
    }
  } else {
    logger.warn(
      'Skipping admin seed — set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.'
    )
  }

  // A demo user for end-to-end testing.
  const demoEmail = 'demo@clearmychallan.co.in'
  const demo = await User.findOne({ email: demoEmail })
  if (!demo) {
    const u = new User({
      name: 'Demo User',
      email: demoEmail,
      phone: '9999999999',
      vehicles: [{ number: 'DL10CA1234', nickname: 'Daily Drive' }]
    })
    await u.setPassword('Demo@1234')
    await u.save()
    logger.info(`✅ Demo user created: ${demoEmail} / Demo@1234`)
  }

  // A demo advocate for the assignment workflow.
  const advEmail = 'advocate@clearmychallan.co.in'
  const adv = await User.findOne({ email: advEmail })
  if (!adv) {
    const a = new User({
      name: 'Adv. Meera Nair',
      email: advEmail,
      phone: '8888888888',
      role: 'advocate'
    })
    await a.setPassword('Advocate@1234')
    await a.save()
    logger.info(`✅ Advocate created: ${advEmail} / Advocate@1234`)
  }

  await mongoose.disconnect()
  logger.info('Seeder complete.')
}

run().catch((e) => {
  logger.error('Seeder error:', e)
  process.exit(1)
})
