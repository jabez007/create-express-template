const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.npm_package_name,
      version: '1.0.0'
    }
  },
  apis: [ // files containing Swagger/OpenAPI annotations in JSDoc comments
    './src/routes/**/*.js',
    './src/models/**/*.js'
  ]
}

module.exports = swaggerJsdoc(options)
