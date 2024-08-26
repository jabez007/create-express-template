const express = require('express')
const morgan = require('~utils/morgan.js')

const app = express()

app.use(morgan)

app.get('/', (req, res) => {
  res.send('Hello World')
})

module.exports = app
