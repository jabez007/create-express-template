const morgan = require('morgan')

morgan.token('reqid', function (req, res) {
  return req.id
})

module.exports = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  ':method :url :reqid :status :res[content-length] - :response-time ms'
  // Options:
  // { stream, skip }
)
