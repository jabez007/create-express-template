const assert = require('assert')
const winston = require('winston')
const { Writable } = require('stream')
const Logger = require('~utils/winston')
const loggerMiddleware = require('~utils/loggerMiddleware')
const { createRequest, createResponse } = require('node-mocks-http')

describe('logger Constructor', () => {
  let output
  let stream
  let transport

  beforeEach(() => {
    output = ''

    stream = new Writable()
    stream._write = (chunk, encoding, next) => {
      output = output += chunk.toString()
      next()
    }

    transport = new winston.transports.Stream({ stream })
  })

  it('writes logs in valid JSON', () => {
    const logger = Logger(transport)
    logger.error('test message')

    const logEvents = output.trim().split('\n')
    assert(JSON.parse(logEvents[0]).message, 'test message')
  })

  it('includes the call stack for errors in the JSON log', () => {
    const logger = Logger(transport)
    logger.error(new Error('test message'))

    const logEvents = output.trim().split('\n')
    const logObject = JSON.parse(logEvents[0])
    assert.equal(logObject.message, 'test message')
    assert.notEqual(logObject.stack, undefined)
  })

  it('handles the traceId in the Express Request object', () => {
    const mockRequest = createRequest()
    mockRequest.traceId = 'foobar'
    const mockResponse = createResponse()
    const nextFunction = () => {}

    const logger = Logger(transport)

    loggerMiddleware(logger)(mockRequest, mockResponse, nextFunction)

    mockRequest.logger.error(new Error('test message'))

    const logEvents = output.trim().split('\n')
    const logObject = JSON.parse(logEvents[0])
    assert.equal(logObject.message, 'test message')
    assert.notEqual(logObject.stack, undefined)
    assert.equal(logObject.traceId, 'foobar')
    assert.equal(logObject.spanId, undefined)
  })

  it('handles the spanId in the Express Request object', () => {
    const mockRequest = createRequest()
    mockRequest.traceId = 'foobar'
    mockRequest.spanId = 'hello-world'
    const mockResponse = createResponse()
    const nextFunction = () => {}

    const logger = Logger(transport)

    loggerMiddleware(logger)(mockRequest, mockResponse, nextFunction)

    mockRequest.logger.error(new Error('test message'))

    const logEvents = output.trim().split('\n')
    const logObject = JSON.parse(logEvents[0])
    assert.equal(logObject.message, 'test message')
    assert.notEqual(logObject.stack, undefined)
    assert.equal(logObject.traceId, 'foobar')
    assert.equal(logObject.spanId, 'hello-world')
  })
})
