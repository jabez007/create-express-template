const swaggerParser = require('swagger-parser')
// const Ajv = require('ajv')
// const ajvFormats = require('ajv-formats')
const { pathToRegexp } = require('path-to-regexp')

// Convert OpenAPI path notation to Express path notation
const convertOpenApiPathToExpress = (path) => {
  return path.replace(/{(.*?)}/g, ':$1')
}

// Preprocess the OpenAPI paths: convert to Express notation and create regex
const preprocessPaths = (paths, pathsMap) => {
  Object.keys(paths).forEach((openApiPath) => {
    const expressPath = convertOpenApiPathToExpress(openApiPath)
    const regexp = pathToRegexp(expressPath)
    const keys = regexp.keys
    pathsMap.push({ regexp, keys, openApiPath })
  })
}

// Extract path parameters from the match result
const extractParamsFromPath = (matchResult, keys) => {
  const values = matchResult.slice(1)
  const params = {}

  keys.forEach((key, index) => {
    params[key.name] = values[index]
  })

  return params
}

// Match the OpenAPI path to the actual Express route using path-to-regexp
const matchRequestToOpenApiPath = (req, pathsMap) => {
  const debug = process.env.NODE_ENV === 'test' ? () => {} : req.logger?.debug || console.log

  const incomingPath = req.originalUrl.split('?')[0] // Strip query string for matching
  debug(`Attempting to validate '${incomingPath}'`)

  for (const { regexp, keys, openApiPath } of pathsMap) {
    const matchResult = regexp.exec(incomingPath)

    if (matchResult) {
      debug(`Found match to '${openApiPath}'`)
      const params = extractParamsFromPath(matchResult, keys)
      debug('Parameters extracted from path', { params })
      // Check for specific regex validation
      if (keys.every((key) => !key.pattern || new RegExp(key.pattern).test(params[key.name]))) {
        return { path: openApiPath, params }
      }
    }
  }

  return null
}

// Merge parameters from path and method levels
// Method parameters override path parameters,
// but cannot remove path parameters
const mergeParameters = (pathParams = [], methodParams = []) => {
  const mapParamArrayToObject = (acc, param) => {
    acc[`${param.in}:${param.name}`] = param
    return acc
  }

  return Object.values({
    ...pathParams.reduce(mapParamArrayToObject, {}),
    ...methodParams.reduce(mapParamArrayToObject, {})
  })
}

module.exports = function createValidationMiddleware (_apiSpec) {
  // const ajv = new Ajv({ allErrors: true, coerceTypes: true })
  // ajvFormats(ajv)

  const pathsMap = []

  // Validate the spec itself
  let apiSpec
  swaggerParser.validate(_apiSpec, (err, api) => {
    if (err) {
      throw new Error(`Invalid OpenAPI/Swagger spec: ${err.message}`)
    }
    apiSpec = api // dereferenced OpenAPI definitions - i.e. All $refs have been resolved

    // Preprocess paths: convert to Express notation and generate regex
    preprocessPaths(apiSpec.paths, pathsMap)
  })

  // Middleware function to validate requests
  return (req, res, next) => {
    const error = process.env.NODE_ENV === 'test' ? () => {} : req.logger?.error || console.error // eslint-disable-line no-unused-vars
    const warn = process.env.NODE_ENV === 'test' ? () => {} : req.logger?.warn || console.error

    if (req.originalUrl.startsWith('/api')) {
      const matchResult = matchRequestToOpenApiPath(req, pathsMap)
      if (!matchResult) {
        const message = `Path '${req.originalUrl}' not found in API spec`
        warn(message)
        return res.status(404).json({ message })
      }

      const { path: openApiPath } = matchResult
      const pathSpec = apiSpec.paths[openApiPath]
      const methodSpec = pathSpec[req.method.toLowerCase()]
      if (!methodSpec) {
        const message = `Method ${req.method.toUpperCase()} not allowed on path '${req.originalUrl}'`
        warn(message)
        return res.status(405).json({ message })
      }

      const openApiParams = mergeParameters(pathSpec.parameters, methodSpec.parameters)
      console.log(openApiParams)
    }

    next()
    /*
    // Validate path parameters, query parameters, and request body
    try {
      validateParameters(req, params, methodSpec, ajv)
      validateRequestBody(req, methodSpec, ajv)
      next()
    } catch (validationError) {
      res.status(400).json({ error: validationError.message, details: validationError.errors })
    }
    */
  }
}
/*

// Validate parameters (path, query)
const validateParameters = (req, params, methodSpec, ajv) => {
  if (methodSpec.parameters) {
    methodSpec.parameters.forEach((param) => {
      const value = params[param.name] || getParameterValue(req, param)
      const schema = param.schema || param

      const valid = ajv.validate(schema, value)
      if (!valid) {
        throw new Error(`Invalid ${param.in} parameter: ${param.name}`)
      }
    })
  }
}

// Validate the request body
const validateRequestBody = (req, methodSpec, ajv) => {
  if (methodSpec.requestBody) {
    const contentType = req.headers['content-type']
    const requestBodySchema = methodSpec.requestBody.content[contentType]?.schema

    if (!requestBodySchema) {
      throw new Error(`Unsupported content type: ${contentType}`)
    }

    const valid = ajv.validate(requestBodySchema, req.body)
    if (!valid) {
      throw new Error('Invalid request body')
    }
  }
}

// Get the value of the parameter from the request
const getParameterValue = (req, param) => {
  switch (param.in) {
    case 'path':
      return req.params[param.name]
    case 'query':
      return req.query[param.name]
    case 'header':
      return req.headers[param.name.toLowerCase()]
    case 'cookie':
      return req.cookies[param.name]
    default:
      return undefined
  }
}
*/
