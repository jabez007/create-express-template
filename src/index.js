const dotenv = require('dotenv')

dotenv.config()

const app = require('./server.js')

const port = process.env.PORT || 8888

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`)
})
