module.exports = (logger) => {
  return function (request, response, next) {
    request.logger = logger.child({
      traceId: request.traceId,
      spanId: request.spanId
    })

    next()
  }
}
