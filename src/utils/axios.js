const axios = require('axios')
const { v4 } = require('uuid')

function generateV4UUID (_request) {
  return v4()
}

module.exports = function svcAgent ({
  headerName = 'X-Request-Id',
  svcIdHeader = 'X-svc2svc-Id',
  generator = generateV4UUID,
  axiosConfig = {}
} = {}) {
  return function ({
    expressRequest = {}
  } = {}) {
    const debug = process.env.NODE_ENV === 'test' ? () => {} : expressRequest.logger?.debug || console.log
    const error = process.env.NODE_ENV === 'test' ? () => {} : expressRequest.logger?.error || console.error

    const defaultHeaders = new axios.AxiosHeaders(axiosConfig.headers)
    defaultHeaders.set(headerName, expressRequest.id || generator(expressRequest))

    const client = axios.create({
      ...axiosConfig,
      ...{
        headers: defaultHeaders
      }
    })

    client.interceptors.request.use((req) => {
      req.headers.set(svcIdHeader, generator(expressRequest))
      debug(`${JSON.stringify(req, null, 2)}`)
      return req
    }, (err) => {
      error(err)
      return Promise.reject(err)
    })

    client.interceptors.response.use((res) => {
      debug(`${JSON.stringify({
            header: res.headers,
            data: res.data
            }, null, 2)}`)
      return res
    }, (err) => {
      error(err)
      return Promise.reject(err)
    })

    return client
  }
}
