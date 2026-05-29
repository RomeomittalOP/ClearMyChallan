// Tiny logger wrapper. Swap with pino/winston later if needed.
const ts = () => new Date().toISOString()

module.exports = {
  info: (...a) => console.log(`[${ts()}] [INFO ]`, ...a),
  warn: (...a) => console.warn(`[${ts()}] [WARN ]`, ...a),
  error: (...a) => console.error(`[${ts()}] [ERROR]`, ...a),
  debug: (...a) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${ts()}] [DEBUG]`, ...a)
    }
  }
}
