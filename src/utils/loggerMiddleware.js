const Logger = require('~utils/winston')

module.exports = function (request, response, next) {
  request.logger = {
    debug: (message) => {
      Logger.debug(`[${request.id}] ${message}`)
    },
    info: (message) => {
      Logger.info(`[${request.id}] ${message}`)
    },
    warn: (message) => {
      Logger.warn(`[${request.id}] ${message}`)
    },
    error: (message) => {
      Logger.error(`[${request.id}] ${message}`)
    }
  }

  next()
}
