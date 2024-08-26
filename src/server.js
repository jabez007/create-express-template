/**
 * This file should be limited to building the Express server itself
 * i.e. Middleware and Routes
 */
const express = require('express')
const Logger = require('~utils/winston')
const requestId = require('~utils/request-id')
const openapiSpecification = require('~utils/swagger')
const loggerMiddleware = require('~utils/loggerMiddleware')
const { requestMorgan, responseMorgan } = require('~utils/morgan')(Logger)

const app = express()

app.use(requestId())

app.use(requestMorgan)
app.use(responseMorgan)

app.use(loggerMiddleware(Logger))

app.use('/api', require('~routes/api'))

app.use('/ping', require('~routes/ping'))

app.use('/swagger.json', (req, res) => {
  res.json(openapiSpecification)
})

module.exports = app
