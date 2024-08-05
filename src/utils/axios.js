const axios = require('axios')
const { v4 } = require('uuid')

function generateV4UUID (_request) {
  return v4()
}

/**
 * Gives a function for creating Axios instances specific to an Express request to facilitate tracing across interconnected microservices
 * @param {Object} param0
 * @param {string} param0.traceIdHeader - The header to include in all outgoing requests to connect all the microservices calls that were trigger by a single inbound request
 * @param {string} param0.spanIdHeader - The header to include in all outgoing requests to track the individual calls one microservice makes to another
 * @param {function(ExpressRequest): string} param0.generator - A function to generate the unique Id for the spanIdHeader
 * @param {AxiosConfig} param0.axiosConfig - An Axios config object to pass to axios.create
 * @returns {function(ExpressRequest): AxiosInstance} - A function to use in the Express route handlers to create any needed Axios instances
 */
module.exports = function svcAgent ({
  traceIdHeader = 'X-Request-Id',
  spanIdHeader = 'X-svc2svc-Id',
  generator = generateV4UUID,
  axiosConfig = {}
} = {}) {
  return function (expressRequest) {
    const debug = process.env.NODE_ENV === 'test' ? () => {} : expressRequest.logger?.debug || console.log
    const info = process.env.NODE_ENV === 'test' ? () => {} : expressRequest.logger?.info || console.log
    const error = process.env.NODE_ENV === 'test' ? () => {} : expressRequest.logger?.error || console.error

    const defaultHeaders = new axios.AxiosHeaders(axiosConfig.headers)
    defaultHeaders.set(traceIdHeader, expressRequest.traceId)

    const client = axios.create({
      ...axiosConfig,
      ...{
        headers: defaultHeaders
      }
    })

    client.interceptors.request.use((req) => {
      const spanId = generator(expressRequest)
      info(`sending request ${spanId}`)
      req.headers.set(spanIdHeader, spanId)
      debug('sending request', { axios: req })
      return req
    }, (err) => {
      error(err)
      return Promise.reject(err)
    })

    client.interceptors.response.use((res) => {
      debug('received response', {
        axios: {
          header: res.headers,
          data: res.data
        }
      })
      const spanId = res.headers[spanIdHeader]
      if (spanId) {
        info(`received response ${spanId}`)
      }
      return res
    }, (err) => {
      error(err)
      return Promise.reject(err)
    })

    return client
  }
}
