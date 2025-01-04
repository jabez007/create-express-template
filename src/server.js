/**
 * This file should be limited to building the Express server itself
 * i.e. Middleware and Routes
 */
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const Logger = require('@mccann-hub/json-logger').default
const swaggerValidator = require('@utils/validator')
const openapiSpecification = require('@utils/swagger')
const { dexter, requestId, requestLogger } = require('@mccann-hub/express-log-smith')

const { requestMorgan, responseMorgan } = dexter(Logger())

const app = express()

/*
 * Middlewares
 */
app.use(requestId())

app.use(requestMorgan)
app.use(responseMorgan)

// body parser

app.use(requestLogger(Logger()))

app.use(swaggerValidator(openapiSpecification))
/* END Middlewares */

/*
 * Routes
 */
app.use('/api', require('@routes/api'))

app.use('/ping', require('@routes/ping'))
/* END Routes */

/*
 * Swagger
 */
app.use('/swagger.json', (req, res) => {
  res.json(openapiSpecification)
})

if (['local', 'dev', 'develop', 'development'].includes(process.env.NODE_ENV || 'development')) {
  const swaggerOptions = {
    swaggerOptions: {
      url: '/swagger.json',
      validatorUrl: 'localhost'
    }
  }

  app.use('/docs',
    swaggerUi.serveFiles(undefined, swaggerOptions),
    swaggerUi.setup(undefined, {
      ...swaggerOptions,
      explorer: false
    })
  )
}
/* END Swagger */

module.exports = app
