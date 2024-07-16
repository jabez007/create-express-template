const morgan = require('morgan')
const Logger = require('~utils/winston')

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream = {
  // Use the http severity
  write: (message) => Logger.http(message) // this has a "bug" where it writes an extra newline
}

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told to the logger that it should print
// only warning and error messages in production.
const skip = () => {
  const env = process.env.NODE_ENV || 'development'
  return env !== 'development'
}

morgan.token('reqid', function (req, res) {
  return req.id
})

module.exports = {
  requestMorgan: morgan(
    // Define message format string.
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    '[:reqid] :method :url',
    // Options:
    {
      stream,
      immediate: true,
      skip
    }
  ),
  responseMorgan: morgan(
    // Define message format string (this is the default one).
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    '[:reqid] :status :res[content-length] - :response-time ms',
    // Options:
    {
      stream,
      skip
    }
  )
}
