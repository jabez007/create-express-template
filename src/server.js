const express = require('express')
const morgan = require('~lib/morgan.js')

const app = express()

app.use(morgan)

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app
