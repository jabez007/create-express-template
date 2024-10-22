module.exports = (logger) => {
  return function (request, response, next) {
    const reqId = {
      correlationId: request.correlationId,
      traceId: request.traceId,
      spanId: request.spanId
    }

    // .child is likely to be bugged
    request.logger = {
      debug: (message, metadata = {}) => logger.debug(message, {
        ...metadata,
        ...reqId
      }),
      info: (message, metadata = {}) => logger.info(message, {
        ...metadata,
        ...reqId
      }),
      warn: (message, metadata = {}) => logger.warn(message, {
        ...metadata,
        ...reqId
      }),
      error: (message, metadata = {}) => logger.error(message, {
        ...metadata,
        ...reqId
      })
    }

    next()
  }
}
