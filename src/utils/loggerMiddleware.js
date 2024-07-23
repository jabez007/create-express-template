module.exports = (logger) => {
  return function (request, response, next) {
    request.logger = {
      debug: (message) => {
        logger.debug(`[${request.id}] ${message}`)
      },
      info: (message) => {
        logger.info(`[${request.id}] ${message}`)
      },
      warn: (message) => {
        logger.warn(`[${request.id}] ${message}`)
      },
      error: (message) => {
        logger.error(`[${request.id}] ${message}`)
      }
    }

    next()
  }
}
