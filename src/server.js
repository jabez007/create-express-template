const express = require('express')
const requestId = require('~utils/request-id')
const { requestMorgan, responseMorgan } = require('~utils/morgan.js')

const app = express()

app.use(requestId())

app.use(requestMorgan)
app.use(responseMorgan)

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app
