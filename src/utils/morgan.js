const morgan = require('morgan')

morgan.token('reqid', function (req, res) {
  return req.id
})

module.exports = {
  requestMorgan: morgan(
    // Define message format string.
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    ':reqid :method :url',
    // Options:
    // { stream, skip }
    {
      immediate: true
    }
  ),
  responseMorgan: morgan(
    // Define message format string (this is the default one).
    // The message format is made from tokens, and each token is
    // defined inside the Morgan library.
    // You can create your custom token to show what do you want from a request.
    ':reqid :status :res[content-length] - :response-time ms'
    // Options:
    // { stream, skip }
  )
}
