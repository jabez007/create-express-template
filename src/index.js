require('module-alias/register')

const app = require('./server.js')

const port = process.env.PORT || 8888

const server = app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received, closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})
