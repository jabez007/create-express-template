const swaggerParser = require('swagger-parser')
const Ajv = require('ajv')
const ajvFormats = require('ajv-formats')
const { pathToRegexp } = require('path-to-regexp')

const OPENAPI_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']

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

// Preprocess the OpenAPI methods: merge path and method parameters
const preprocessMethods = (paths, methodsMap) => {
  Object.keys(paths).forEach((openApiPath) => {
    OPENAPI_METHODS.forEach((method) => {
      methodsMap[`${method}:${openApiPath}`] = mergeParameters(
        paths[openApiPath].parameters,
        paths[openApiPath][method]?.parameters
      )
    })
  })
}

// Extract path parameters from the match result
const extractParamsFromUri = (matchResult, keys) => {
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
      const params = extractParamsFromUri(matchResult, keys)
      debug('Parameters extracted from path', { params })
      // Check for specific regex validation
      if (keys.every((key) => !key.pattern || new RegExp(key.pattern).test(params[key.name]))) {
        return { path: openApiPath, params }
      }
    }
  }

  return null
}

const validateParameters = (specParameters, params, query, header, cookies, ajv) => {
  specParameters
    .forEach((parameter) => {
      const schema = parameter.schema || parameter
      let value
      // By default, OpenAPI treats all request parameters as optional
      // Note that path parameters must have required: true, because they are always required.
      switch (parameter.in) {
        case 'path':
          value = params[parameter.name]
          break
        case 'query':
          value = query[parameter.name]
          if (!value && !(parameter.required === true || parameter.required === 'true')) return
          break
        case 'header':
          value = header(parameter.name)
          if (!value && !(parameter.required === true || parameter.required === 'true')) return
          break
        case 'cookie':
          value = undefined // TODO
          if (!value && !(parameter.required === true || parameter.required === 'true')) return
          break
        default:
          value = undefined
      }

      const valid = ajv.validate(schema, value)
      if (!valid) {
        throw new Error(`Invalid ${parameter.in} parameter: ${parameter.name}`)
      }
    })
}

// Validate the request body
const validateRequestBody = (methodSpec, req, ajv) => {
  if (methodSpec.requestBody) {
    const contentType = req.headers['content-type'] || 'application/json'
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

module.exports = function createValidationMiddleware (_apiSpec) {
  const ajv = new Ajv({ allErrors: true, coerceTypes: true })
  ajvFormats(ajv)

  const pathsMap = []
  const methodsMap = {}

  // Validate the spec itself
  let apiSpec
  swaggerParser.validate(_apiSpec, (err, api) => {
    if (err) {
      throw new Error(`Invalid OpenAPI/Swagger spec: ${err.message}`)
    }
    apiSpec = api // dereferenced OpenAPI definitions - i.e. All $refs have been resolved

    // Preprocess paths: convert to Express notation and generate regex
    preprocessPaths(apiSpec.paths, pathsMap)

    // Preprocess methods: merge path and method parameters
    preprocessMethods(apiSpec.paths, methodsMap)
  })

  // Middleware function to validate requests
  return (req, res, next) => {
    const warn = process.env.NODE_ENV === 'test' ? () => {} : req.logger?.warn || console.error
    const debug = process.env.NODE_ENV === 'test' ? () => {} : req.logger?.debug || console.log

    if (req.originalUrl.startsWith('/api')) {
      const matchResult = matchRequestToOpenApiPath(req, pathsMap)
      if (!matchResult) {
        const message = `Path '${req.originalUrl}' not found in API spec`
        warn(message)
        return res.status(404).json({ message })
      }

      const { path: openApiPath, params } = matchResult
      const pathSpec = apiSpec.paths[openApiPath]
      const methodSpec = pathSpec[req.method.toLowerCase()]
      if (!methodSpec) {
        const message = `Method ${req.method.toUpperCase()} not allowed on path '${req.originalUrl}'`
        warn(message)
        return res.status(405).json({ message })
      }

      const openApiParams = methodsMap[`${req.method.toLowerCase()}:${openApiPath}`] // mergeParameters(pathSpec.parameters, methodSpec.parameters)
      try {
        debug('Attempting to validate parameters', { params, query: req.query, headers: req.headers })
        validateParameters(openApiParams, params, req.query, req.header, {}, ajv)
        //
        validateRequestBody(methodSpec, req, ajv)
      } catch (validationError) {
        warn(validationError.message, { details: validationError.errors })
        return res.status(400).json({ message: validationError.message, details: validationError.errors })
      }
    }

    next()
  }
}
