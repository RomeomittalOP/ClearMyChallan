const cloudinary = require('cloudinary').v2
const config = require('../config')
const logger = require('../utils/logger')
const { ApiError } = require('../utils/apiResponse')

let _initialized = false

function ensureClient() {
  if (!config.cloudinaryConfigured) {
    throw new ApiError('Document storage is not configured. Set CLOUDINARY_* env vars.', 503)
  }
  if (!_initialized) {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true
    })
    _initialized = true
    logger.info('☁️  Cloudinary client initialized')
  }
  return cloudinary
}

function uploadBuffer(buffer, { filename, mimetype, folder, tag } = {}) {
  ensureClient()
  const baseFolder = config.cloudinary.folder
  const fullFolder = folder ? `${baseFolder}/${folder}` : baseFolder

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: fullFolder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      tags: tag ? [tag] : undefined
    }, (err, result) => {
      if (err) {
        logger.error('Cloudinary upload failed:', err.message || err)
        return reject(new ApiError(`Document upload failed: ${err.message || 'unknown error'}`, 502))
      }
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        mimeType: mimetype,
        bytes: result.bytes,
        originalName: filename || ''
      })
    })
    stream.end(buffer)
  })
}

async function destroy(publicId, resourceType = 'image') {
  if (!publicId) return
  try {
    ensureClient()
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (err) {
    logger.warn(`Cloudinary destroy failed for ${publicId}: ${err.message}`)
  }
}

module.exports = { uploadBuffer, destroy }
