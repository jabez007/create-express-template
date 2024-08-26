const morgan = require('morgan')

// Skip all the Morgan http log if the
// application is running in test mode.
// This method is not really needed here since
// we already told to the logger that it should
// print only error messages in test.
const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env === 'test'
}

morgan.token('reqId', function (req, res) {
  return req.id
})

module.exports = (logger) => {
  return {
    requestMorgan: morgan(
      // Define message format string.
      // The message format is made from tokens, and each token is
      // defined inside the Morgan library.
      // You can create your custom token to show what do you want from a request.
      // '[:reqid] :method :url',
      function (tokens, req, res) {
        return JSON.stringify({
          reqId: tokens.reqId(req, res),
          method: tokens.method(req, res),
          url: tokens.url(req, res)
        })
      },
      // Options:
      {
        // Override the stream method by telling
        // Morgan to use our custom logger instead of the console.log.
        stream: {
          // Use the http severity
          write: (message) => logger.http('incoming request', JSON.parse(message)) // this has a "bug" where it writes an extra newline
        },
        immediate: true,
        skip
      }
    ),
    responseMorgan: morgan(
      // Define message format string (this is the default one).
      // The message format is made from tokens, and each token is
      // defined inside the Morgan library.
      // You can create your custom token to show what do you want from a request.
      // '[:reqid] :status :res[content-length] - :response-time ms',
      function (tokens, req, res) {
        return JSON.stringify({
          reqId: tokens.reqId(req, res),
          status: Number.parseFloat(tokens.status(req, res)),
          contentLength: tokens.res(req, res, 'content-length'),
          responseTime: Number.parseFloat(tokens['response-time'](req, res))
        })
      },
      // Options:
      {
        // Override the stream method by telling
        // Morgan to use our custom logger instead of the console.log.
        stream: {
          // Use the http severity
          write: (message) => logger.http('outgoing response', JSON.parse(message)) // this has a "bug" where it writes an extra newline
        },
        skip
      }
    )
  }
}
