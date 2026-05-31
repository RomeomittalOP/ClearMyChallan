/* eslint-disable no-console */
// =====================================================================
// End-to-end integration test (no external services needed)
// ---------------------------------------------------------------------
// Spins up an in-memory MongoDB, boots the real Express app, and walks
// the full user journey: signup → login → pricing → challan lookup →
// resolution → payment gating → contact → admin → advocate workflow.
//
// Run:  npm run test:integration
//       (requires the optional dev dep `mongodb-memory-server`)
// =====================================================================

const PORT = 4111
let mongod

async function main() {
  // 1) In-memory Mongo (optional dep — skip cleanly if not installed)
  let MongoMemoryServer
  try {
    ;({ MongoMemoryServer } = require('mongodb-memory-server'))
  } catch {
    console.log(
      '\n⏭  Skipping integration test — install the dev dependency first:\n' +
        '   npm i -D mongodb-memory-server\n'
    )
    process.exit(0)
  }

  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  // 2) Configure env BEFORE requiring the app (config reads env at load).
  process.env.NODE_ENV = 'test'
  process.env.MONGO_URI = uri
  process.env.PORT = String(PORT)
  process.env.JWT_SECRET = 'integration_test_secret_key_please_change'
  process.env.FRONTEND_URL = 'http://localhost:5173'
  process.env.RATE_LIMIT_MAX = '100000' // don't trip limiter during the run

  const axios = require('axios')
  require('../server.js') // boots: connect + listen
  const User = require('../models/User')

  const api = axios.create({
    baseURL: `http://localhost:${PORT}/api`,
    validateStatus: () => true // we assert on status ourselves
  })

  // 3) Wait for the server + DB to be ready.
  await waitFor(async () => {
    const r = await api.get('/health')
    return r.status === 200 && r.data.db === 'connected'
  }, 'server health')

  let passed = 0
  const check = (name, cond, extra = '') => {
    if (cond) {
      passed++
      console.log(`  ✓ ${name}`)
    } else {
      console.error(`  ✗ ${name} ${extra}`)
      throw new Error(`Assertion failed: ${name} ${extra}`)
    }
  }

  console.log('\n▶ Health & pricing')
  let r = await api.get('/health')
  check('health reports db connected', r.data.db === 'connected')

  r = await api.post('/pricing/calculate', { city: 'Delhi', challanAmount: 1000 })
  check('Delhi 1000 → flat 60% → ₹600', r.data.data.totalPayable === 600, JSON.stringify(r.data.data))

  r = await api.post('/pricing/calculate', { city: 'Mathura', challanAmount: 1800 })
  check('Mathura 1800 → fine+₹500 → ₹2300', r.data.data.totalPayable === 2300)

  r = await api.get('/pricing')
  check('pricing table has 7 regions', r.data.data.table.length === 7)

  console.log('\n▶ Auth')
  const email = `user_${Date.now()}@test.in`
  r = await api.post('/auth/signup', { name: 'Test User', email, password: 'Test@1234', phone: '9876543210' })
  check('signup returns token', r.status === 201 && !!r.data.data.token)
  const userToken = r.data.data.token

  r = await api.post('/auth/login', { email, password: 'Test@1234' })
  check('login returns token', r.status === 200 && !!r.data.data.token)

  r = await api.post('/auth/signup', { name: 'Dup', email, password: 'Test@1234' })
  check('duplicate email rejected (409)', r.status === 409)

  r = await api.post('/auth/login', { email, password: 'wrong' })
  check('wrong password rejected (401)', r.status === 401)

  const auth = (t) => ({ headers: { Authorization: `Bearer ${t}` } })
  r = await api.get('/auth/me', auth(userToken))
  check('GET /me returns the user', r.data.data.user.email === email)

  r = await api.get('/auth/me')
  check('GET /me without token → 401', r.status === 401)

  console.log('\n▶ Challan lookup')
  r = await api.post('/challans/lookup', { vehicleNumber: 'DL10CA1234' }, auth(userToken))
  check('lookup returns 4 challans', r.data.data.challans.length === 4, JSON.stringify(r.data).slice(0, 200))
  const challans = r.data.data.challans
  check('challans carry totalPayable', challans.every((c) => c.totalPayable > 0))
  check('challans carry mongo ids', challans.every((c) => /^[0-9a-fA-F]{24}$/.test(c.id)))
  check('Delhi challan priced at 60%', !!challans.find((c) => c.city === 'DELHI' && c.totalPayable === 0.6 * c.fineAmount))

  r = await api.post('/challans/lookup', { vehicleNumber: 'bad!' }, auth(userToken))
  check('invalid vehicle rejected (422)', r.status === 422)

  console.log('\n▶ Resolution')
  const ids = challans.map((c) => c.id)
  const expectedPayable = challans.reduce((s, c) => s + c.totalPayable, 0)
  r = await api.post('/resolutions', { vehicleNumber: 'DL10CA1234', challanIds: ids }, auth(userToken))
  check('resolution created (201)', r.status === 201)
  const reqId = r.data.data.request.id
  check('resolution totalPayable matches sum', r.data.data.request.totalPayable === expectedPayable, `${r.data.data.request.totalPayable} vs ${expectedPayable}`)

  r = await api.get('/resolutions/me', auth(userToken))
  check('user lists own resolutions', r.data.data.requests.length === 1)

  console.log('\n▶ Payments (Razorpay not configured → graceful)')
  r = await api.get('/payments/config')
  check('payment config public, not configured', r.data.data.razorpayConfigured === false)

  r = await api.post('/payments/order', { resolutionRequestId: reqId }, auth(userToken))
  check('order without Razorpay keys → 503', r.status === 503)

  console.log('\n▶ Contact')
  r = await api.post('/contact', { name: 'Caller', phone: '9000000000', message: 'Need help with challans', channel: 'web' })
  check('contact request created (201)', r.status === 201)

  console.log('\n▶ Admin + advocate workflow')
  // Promote a second user to admin and create an advocate directly in DB.
  const admin = new User({ name: 'Admin', email: `admin_${Date.now()}@test.in`, role: 'admin' })
  await admin.setPassword('Admin@1234')
  await admin.save()
  const advocate = new User({ name: 'Adv. Meera', email: `adv_${Date.now()}@test.in`, role: 'advocate' })
  await advocate.setPassword('Advocate@1234')
  await advocate.save()

  const adminLogin = await api.post('/auth/login', { email: admin.email, password: 'Admin@1234' })
  const adminToken = adminLogin.data.data.token

  r = await api.get('/admin/summary', auth(adminToken))
  check('admin summary works', r.data.data.requestCount >= 1 && typeof r.data.data.revenue === 'number')

  r = await api.get('/admin/summary', auth(userToken))
  check('non-admin blocked from admin (403)', r.status === 403)

  r = await api.get('/admin/advocates', auth(adminToken))
  check('admin lists advocates', r.data.data.items.some((a) => a.email === advocate.email))

  r = await api.patch(`/admin/requests/${reqId}/assign`, { advocateId: advocate.id }, auth(adminToken))
  check('advocate assigned → status processing', r.status === 200 && r.data.data.request.status === 'processing')

  const advLogin = await api.post('/auth/login', { email: advocate.email, password: 'Advocate@1234' })
  const advToken = advLogin.data.data.token

  r = await api.get('/resolutions/assigned', auth(advToken))
  check('advocate sees assigned case', r.data.data.requests.length === 1 && r.data.data.requests[0].id === reqId)

  r = await api.patch(`/resolutions/${reqId}/status`, { status: 'resolved', note: 'Disposed at court' }, auth(advToken))
  check('advocate marks case resolved', r.status === 200 && r.data.data.request.status === 'resolved')

  r = await api.get('/resolutions/assigned', auth(userToken))
  check('plain user blocked from advocate route (403)', r.status === 403)

  console.log(`\n✅ All ${passed} checks passed.\n`)
  await cleanup(0)
}

async function waitFor(fn, label, tries = 40, gap = 250) {
  for (let i = 0; i < tries; i++) {
    try {
      if (await fn()) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, gap))
  }
  throw new Error(`Timed out waiting for: ${label}`)
}

async function cleanup(code) {
  try {
    const mongoose = require('mongoose')
    await mongoose.connection.close(false)
  } catch {}
  try {
    if (mongod) await mongod.stop()
  } catch {}
  process.exit(code)
}

main().catch(async (err) => {
  console.error('\n💥 Integration test failed:\n', err.message)
  await cleanup(1)
})
