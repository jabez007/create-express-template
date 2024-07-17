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

    it('injects id into Request object', () => {
        requestId()(mockRequest, mockResponse, nextFunction)
        assert.notEqual(mockRequest.id, undefined)
    })

    it('uses the value from the existing Request header', () => {
        mockRequest = createRequest({
            headers: {
                'X-Request-Id': 'foobar'
            }
        })
        requestId()(mockRequest, mockResponse, nextFunction)
        assert.equal(mockRequest.id, 'foobar')
    })

    it('includes the id in the Response headers', () => {
        requestId()(mockRequest, mockResponse, nextFunction)
        assert.notEqual(mockResponse.get('X-Request-Id'), undefined)
    })
})