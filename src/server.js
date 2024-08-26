const express = require('express')
const requestId = require('~utils/request-id')
const morgan = require('~utils/morgan.js')

const app = express()

app.use(requestId())

app.use(morgan)

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app
