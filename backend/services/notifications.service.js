// =====================================================================
// Notifications service — extension point for WhatsApp / Email / Slack.
// ---------------------------------------------------------------------
// For now this is an in-app stub: it logs and the admin dashboard reads
// `notifiedAdmin === false` for the unread count. Wire up Twilio
// (WhatsApp Business) / SendGrid / Resend here when those credentials
// arrive — the call sites already exist.
// =====================================================================

const logger = require('../utils/logger')

async function notifyNewCase(caseDoc) {
  logger.info(
    `🔔  New case ${caseDoc.caseId} from ${caseDoc.name} (${caseDoc.mobile}) — awaiting review`
  )
  // TODO (when credentials arrive):
  //   await sendWhatsApp(adminPhone, `New case ${caseDoc.caseId} ...`)
  //   await sendEmail({ to: opsEmail, subject: ..., text: ... })
  return { delivered: ['log'] }
}

async function notifyStatusChange(caseDoc, prevStatus) {
  logger.info(`🔄  Case ${caseDoc.caseId}: ${prevStatus} → ${caseDoc.status}`)
  // TODO: SMS / WhatsApp the customer on key transitions:
  //   "Price Quoted"      → send link with quoted price
  //   "Payment Received"  → ack + ETA
  //   "Completed"         → final confirmation
  return { delivered: ['log'] }
}

module.exports = { notifyNewCase, notifyStatusChange }
