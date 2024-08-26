/* eslint no-undef: 0 */
const assert = require('assert')
const express = require('express')
const request = require('supertest')
const bodyParser = require('body-parser')
const apiSpec = require('./validator.openapi.json')
const createValidationMiddleware = require('@utils/validator')

describe('validator Middleware', () => {
  let app

  before(() => {
    app = express()
    app.use(bodyParser.json())

    app.use(createValidationMiddleware(apiSpec))

    app.get('/api/users', (req, res) => {
      res.status(200).json({ found: req.query.name })
    })

    app.get('/api/users/:userId([0-9]{1,3})', (req, res) => {
      res.status(200).json({ userId: req.params.userId })
    })
  })

  it('should match and validate without a query parameter', (done) => {
    request(app)
      .get('/api/users')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        assert.strictEqual(res.body.found, undefined)
        done()
      })
  })

  it('should match and validate query parameter successfully', (done) => {
    request(app)
      .get('/api/users?name=Luke')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        assert.strictEqual(res.body.found, 'Luke')
        done()
      })
  })

  it('should match but find invalid query parameter', (done) => {
    request(app)
      .get('/api/users?name=1234')
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        assert.strictEqual(res.body.message, 'Invalid query parameter: name')
        done()
      })
  })

  it('should match and validate numeric userId successfully', (done) => {
    request(app)
      .get('/api/users/099')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        assert.strictEqual(res.body.userId, '099')
        done()
      })
  })

  it('should match but find invalid numeric userId', (done) => {
    request(app)
      .get('/api/users/123')
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        assert.strictEqual(res.body.message, 'Invalid path parameter: userId')
        done()
      })
  })

  it('should return 404 for path not in OpenAPI spec', (done) => {
    request(app)
      .get('/api/unknown/123')
      .expect(404)
      .end((err, res) => {
        if (err) return done(err)
        assert.strictEqual(res.body.message, 'Path \'/api/unknown/123\' not found in API spec')
        done()
      })
  })

  it('should return 405 for method not allowed', (done) => {
    request(app)
      .post('/api/users/123')
      .send({})
      .expect(405)
      .end((err, res) => {
        if (err) return done(err)
        assert.strictEqual(res.body.message, 'Method POST not allowed on path \'/api/users/123\'')
        done()
      })
  })

  it('should return 400 for invalid numeric userId', (done) => {
    request(app)
      .get('/api/users/1234')
      .expect(400) // The route won't match because the regex is for 1-3 digits
      .end((err, res) => {
        if (err) return done(err)
        done()
      })
  })
})
