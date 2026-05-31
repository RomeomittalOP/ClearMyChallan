const multer = require('multer')
const config = require('../config')
const { fail } = require('../utils/apiResponse')

const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
  if (config.upload.allowedMimes.includes(file.mimetype)) return cb(null, true)
  const err = new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${config.upload.allowedMimes.join(', ')}`)
  err.code = 'UNSUPPORTED_MIME'
  cb(err, false)
}

const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxBytes, files: 2, fields: 20 }
})

const caseDocs = baseUpload.fields([
  { name: 'rc', maxCount: 1 },
  { name: 'challan', maxCount: 1 }
])

function uploadErrorHandler(err, _req, res, next) {
  if (!err) return next()
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return fail(res, `File too large. Max ${Math.round(config.upload.maxBytes / 1024 / 1024)} MB per file.`, 413)
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') return fail(res, `Unexpected file field: ${err.field}`, 400)
    return fail(res, `Upload error: ${err.message}`, 400)
  }
  if (err.code === 'UNSUPPORTED_MIME') return fail(res, err.message, 415)
  return next(err)
}

module.exports = { caseDocs, uploadErrorHandler }
