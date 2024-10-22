const crypto = require('crypto');
const { v4 } = require('uuid')

function generateV4UUID (_request) {
  return v4()
}

function generateHash(_request) {
	const hash = crypto.createHash('sha1');
	hash.update(v4(_request));
	return hash.digest('hex');
}

const CORRELATION_ATTRIBUTE_NAME = 'correlationId'
const TRACE_ATTRIBUTE_NAME = 'traceId'
const SPAN_ATTRIBUTE_NAME = 'spanId'

/**
 * Creates an Express middleware function to inject an "id" in to each incoming request
 * @param {Object} param0
 * @param {Object} param0.trace - An object for configuring how traceId is passed around.
 * @param {function(ExpressRequest): string} param0.trace.generator - A function to generate the Trace Id if missing from an incoming request
 * @param {string} param0.trace.headerName - Which header to look for in the incoming request for the Trace Id
 * @param {boolean} param0.trace.setHeader - Should the outgoing response include the header for the Trace Id?
 * @param {Object} param0.span - An object for configuring how spanId is passed around.
 * @param {string} param0.span.headerName - Which header to look for in the incoming request for the Span Id
 * @param {boolean} param0.span.setHeader - Should the outgoing response include the header for the Span Id?
 * @returns {function(ExpressRequest, ExpressResponse, ExpressNextFunction): void} - The middleware function to be passed to Express
 */
module.exports = function requestId ({
  correlation = {
		generator: generateHash,
		headerName: 'X-Correlation-Id',
		setHeader: true
	},
  trace = {
    generator: generateV4UUID,
    headerName: 'X-Request-Id',
    setHeader: true
  },
  span = {
    headerName: 'X-svc2svc-Id',
    setHeader: true
  }
} = {}) {
  return function (request, response, next) {
    /*
		 * Correlation Id
		 */
		const incomingCorrelationId = request.get(correlation.headerName)
    const correlationId = incomingCorrelationId === undefined ? correlation.generator(request) : incomingCorrelationId

		if (correlation.setHeader) {
			response.set(correlation.headerName, correlationId)
		}

		request[CORRELATION_ATTRIBUTE_NAME] = correlationId
		/* END Correlation Id */
    
    /*
     * Trace Id
     */
    const incomingTraceId = request.get(trace.headerName)
    const traceId = incomingTraceId === undefined ? trace.generator(request) : incomingTraceId

    if (trace.setHeader) {
      response.set(trace.headerName, traceId)
    }

    request[TRACE_ATTRIBUTE_NAME] = traceId
    /* END Trace Id */

    /*
     * Span Id
     */
    const incomingSpanId = request.get(span.headerName)

    if (incomingSpanId) {
      request[SPAN_ATTRIBUTE_NAME] = incomingSpanId

      if (span.setHeader) {
        response.set(span.headerName, incomingSpanId)
      }
    }
    /* END Span Id */

    next()
  }
}
