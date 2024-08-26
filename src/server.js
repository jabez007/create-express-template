const express = require('express')
const requestId = require('~utils/request-id')
const openapiSpecification = require('~utils/swagger')
const loggerMiddleware = require('~utils/loggerMiddleware')
const { requestMorgan, responseMorgan } = require('~utils/morgan')

const app = express()

app.use(requestId())

app.use(requestMorgan)
app.use(responseMorgan)

app.use(loggerMiddleware)

app.get('/', (req, res) => {
  req.logger.error('This is an error log')
  req.logger.warn('This is a warn log')
  req.logger.info('This is a info log')
  req.logger.debug('This is a debug log')

  res.send('Hello World')
})

app.use('/api', require('~routes/api'))

app.use('/ping', require('~routes/ping'))

app.use('/swagger.json', (req, res) => {
  res.json(openapiSpecification)
})

module.exports = app
