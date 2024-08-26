const axios = require('axios')
const assert = require('assert')
const svcAgent = require('~utils/axios')

describe('svcAgent Constructor', () => {
    let req

    beforeEach(() => {
        req = {
            id: 'foobar'
        }
    })

    it('injects the X-Request-Id header outbound', () => {
        const client = svcAgent()({ expressRequest: req })
        
        assert.equal(client.defaults.headers['X-Request-Id'], 'foobar')
    })

    it('does not overwrite passed in headers', () => {
        const client = svcAgent(
            {
                axiosConfig: { 
                    headers: {
                        'X-Custom-Header': "Hello World"
                    } 
                }
            }
        )({ expressRequest: req })
        
        assert.equal(client.defaults.headers['X-Custom-Header'], 'Hello World')
        assert.equal(client.defaults.headers['X-Request-Id'], 'foobar')
    })

    it('sets the baseURL of the returned instance', () => {
        const client = svcAgent(
            {
                axiosConfig: { 
                    baseURL: "https://some-domain.com/api/"
                }
            }
        )({ expressRequest: req })
        
        assert.equal(client.defaults.baseURL, 'https://some-domain.com/api/')
        assert.equal(client.defaults.headers['X-Request-Id'], 'foobar')
    })

    it('injects the X-svc2svc-Id header outbound', () => {
        const client = svcAgent()({ expressRequest: req })
        const axiosRequest = client.interceptors.request.handlers[0].fulfilled({
            headers: new axios.AxiosHeaders(client.defaults.headers)
        })

        assert.notEqual(axiosRequest.headers['X-svc2svc-Id'], undefined)
        assert.equal(client.defaults.headers['X-Request-Id'], 'foobar')
    })
})