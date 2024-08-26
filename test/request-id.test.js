const assert = require('assert')
const requestId = require('~utils/request-id')
const { createRequest, createResponse } = require('node-mocks-http')

describe('requestId Middleware', () => {
  let mockRequest
  let mockResponse
  const nextFunction = () => {}

  beforeEach(() => {
    mockRequest = createRequest()
    mockResponse = createResponse()
  })

  it('injects only traceId into Request object', () => {
    requestId()(mockRequest, mockResponse, nextFunction)
    assert.notEqual(mockRequest.traceId, undefined)
    assert.equal(mockRequest.spanId, undefined)
  })

  it('uses the value from the existing traceId Request header', () => {
    mockRequest = createRequest({
      headers: {
        'X-Request-Id': 'foobar'
      }
    })
    requestId()(mockRequest, mockResponse, nextFunction)
    assert.equal(mockRequest.traceId, 'foobar')
    assert.equal(mockRequest.spanId, undefined)
  })

  it('uses the value from the existing spanId Request header', () => {
    mockRequest = createRequest({
      headers: {
        'X-svc2svc-Id': 'foobar'
      }
    })
    requestId()(mockRequest, mockResponse, nextFunction)
    assert.notEqual(mockRequest.traceId, undefined)
    assert.equal(mockRequest.spanId, 'foobar')
  })

  it('includes only the traceId in the Response headers', () => {
    requestId()(mockRequest, mockResponse, nextFunction)
    assert.notEqual(mockResponse.get('X-Request-Id'), undefined)
    assert.equal(mockResponse.get('X-svc2svc-Id'), undefined)
  })

  it('includes the spanId in the Response headers', () => {
    mockRequest = createRequest({
      headers: {
        'X-svc2svc-Id': 'foobar'
      }
    })
    requestId()(mockRequest, mockResponse, nextFunction)
    assert.notEqual(mockResponse.get('X-Request-Id'), undefined)
    assert.equal(mockResponse.get('X-svc2svc-Id'), 'foobar')
  })
})
