const logger = require('../utils/logger')

async function notifyNewCase(caseDoc) {
  logger.info(
    `🔔  New case ${caseDoc.caseId} from ${caseDoc.name} (${caseDoc.mobile}) — awaiting review`
  )
  // TODO when creds arrive: sendWhatsApp(...), sendEmail(...)
  return { delivered: ['log'] }
}

async function notifyStatusChange(caseDoc, prevStatus) {
  logger.info(`🔄  Case ${caseDoc.caseId}: ${prevStatus} → ${caseDoc.status}`)
  return { delivered: ['log'] }
}

module.exports = { notifyNewCase, notifyStatusChange }
