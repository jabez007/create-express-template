const { join } = require('path')
const router = require('express').Router()
const { existsSync, readFileSync } = require('fs')
const openapiSpecification = require('@utils/swagger')

const VERSION_PATH = join(__dirname, '..', 'version.log')

let assetVersion = process.env.npm_package_version
if (existsSync(VERSION_PATH)) {
  assetVersion = JSON.parse(readFileSync(VERSION_PATH)).short || process.env.npm_package_version
}

router.get('/', (req, res) => {
  req.logger.debug('Ping', { queryParams: req.query })
  /*
   * Do something here to check if this service is functioning properly
   * If this service should be seen a unavailable,
   * then the returned HTTP status code should be 5xx
   */
  res.json({
    appName: process.env.npm_package_name,
    appVersion: openapiSpecification.info?.version || process.env.npm_package_version,
    assetVersion,
    appStatus: 'RUNNING', // or UNAVAILABLE
    timestamp: (new Date()).toISOString(),
    ...(req.query.verbose !== undefined) && { env: process.env }
  })
})

module.exports = router
