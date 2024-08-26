module.exports = (logger) => {
  return function (request, response, next) {
    request.logger = logger.child({ reqId: request.id })

    next()
  }
}
