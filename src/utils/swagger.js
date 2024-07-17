const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hello World',
      version: '1.0.0'
    }
  },
  apis: [ // files containing Swagger/OpenAPI annotations in JSDoc comments
    './src/routes/**/*.js'
  ]
}

module.exports = swaggerJsdoc(options)
