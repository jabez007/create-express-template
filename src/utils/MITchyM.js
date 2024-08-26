const fs = require('fs')
const { join } = require('path')
const express = require('express')

module.exports = ({
  methods = [
    {
      name: 'get',
      path: '/',
      callbacks: (req, res) => {
        res.json({
          message: 'hello world'
        })
      }
    }
  ],
  params = [],
  dirname
} = {}) => {
  const router = express.Router({ mergeParams: true })

  const pathParams = []

  methods
    .filter((m) => m.name.trim().match(/^(get|post|put|delete|patch)$/i))
    .forEach((m) => {
      /*
       * auto-add any parameters used in method paths
       * exclude the regex validation, for now,
       * from being passed on to nested routers
       */
      pathParams.push(...(m.path.match(/(:\w+)(?=\()?/g) || []))

      router[m.name.trim().toLowerCase()](m.path, ...([m.callbacks].flat()))
    })

  params
    .filter((p) => pathParams.includes(`:${p.name}`))
    .forEach((p) => {
      router.param(p.name, p)
    })

  if (dirname !== undefined) {
    const paramsPath = pathParams
      .filter((el, indx, arr) => indx === arr.indexOf(el))
      .join('/')

    fs.readdirSync(dirname)
      .filter((file) => fs.lstatSync(join(dirname, file)).isDirectory())
      .forEach((subdir) => {
        router.use(`/${paramsPath}/${subdir}`, require(join(dirname, subdir)))
      })
  }

  return router
}
