require('module-alias/register')

const app = require('./server.js')

const port = process.env.PORT || 8888

const server = app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`)
})

const gracefulShutdown = () => {
  console.log('Gracefully closing HTTP server')
  server.close((err) => {
    if (err) {
      console.error(`Error closing HTTP server: ${err}`)
      process.exit(1)
    }
    console.log('HTTP server closed')
    process.exit(0)
  })
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
