const { v4 } = require('uuid')

function generateV4UUID (_request) {
  return v4()
}

const ATTRIBUTE_NAME = 'id'

/**
 * Create an Express middleware function to inject an "id" in to each incoming request
 * @param {Object} param0
 * @param {function(ExpressRequest): string} param0.generator - A function to generate the unique Id for the incoming request
 * @param {string} param0.headerName - Which header to look for in the incoming request for a unique Id
 * @param {boolean} param0.setHeader - Should the outgoing response include the header for the unique Id?
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNextFunction): void} - The middleware function to be passed to Express
 */
module.exports = function requestId ({
  generator = generateV4UUID,
  headerName = 'X-Request-Id',
  setHeader = true
} = {}) {
  return function (request, response, next) {
    const oldValue = request.get(headerName)
    const id = oldValue === undefined ? generator(request) : oldValue

    if (setHeader) {
      response.set(headerName, id)
    }

    request[ATTRIBUTE_NAME] = id

    next()
  }
}
