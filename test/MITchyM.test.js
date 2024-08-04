const assert = require('assert')
const express = require('express');
const request = require('supertest');
const MITchyM = require('./MITchyM.routes')

describe('MITchyM router', () => {
    const app = express();
    app.use('/', MITchyM)    

    beforeEach(() => {
        
    })
    
    it('handles basic route', async () => {
        const response = await request(app).get('/vehicles')

        assert(response.body[0].make, 'foobar')
    })

    it('handles route with URI params', async () => {
        const response = await request(app).get('/users/foobar')

        assert(response.body.first, 'John')
    })

    it('handles nested route with URI params', async () => {
        const response = await request(app).get('/users/foobar/contacts')

        assert(response.body.phone, '555-555-5555')
    })
})