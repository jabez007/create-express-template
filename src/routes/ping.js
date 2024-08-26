const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  req.logger.debug(`Ping ${JSON.stringify(req.query, null, 2)}`)
  /*
   * Do something here to check if this service is functioning properly
   * If this service should be seen a unavailable,
   * then the returned HTTP status code should be 5xx
   */
  res.json({
    appName: process.env.npm_package_name,
    appVersion: '', // API version?
    assetVersion: process.env.npm_package_version,
    appStatus: 'RUNNING', // or UNAVAILABLE
    timestamp: (new Date()).toISOString(),
    ...(req.query.verbose !== undefined) && { env: process.env }
  })
})

module.exports = router
