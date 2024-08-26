/**
 * This file should be limited to building the Express server itself
 * i.e. Middleware and Routes
 */
const express = require('express')
const Logger = require('~utils/winston')
const requestId = require('~utils/request-id')
const swaggerUi = require('swagger-ui-express')
const openapiSpecification = require('~utils/swagger')
const loggerMiddleware = require('~utils/loggerMiddleware')
const { requestMorgan, responseMorgan } = require('~utils/morgan')(Logger)

const app = express()

/*
 * Middlewares
 */
app.use(requestId())

app.use(requestMorgan)
app.use(responseMorgan)

app.use(loggerMiddleware(Logger))
/* END Middlewares */

/*
 * Routes
 */
app.use('/api', require('~routes/api'))

app.use('/ping', require('~routes/ping'))
/* END Routes */

/*
 * Swagger
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification, {
  explorer: false
}))

app.use('/swagger.json', (req, res) => {
  res.json(openapiSpecification)
})
/* END Swagger */

module.exports = app
