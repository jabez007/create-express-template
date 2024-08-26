const fs = require('fs')
const { join } = require('path')
const express = require('express')

/**
 * @callback MITchyM_Callback
 * @param {Object} req - Express Request
 * @param {Object} res - Express Response
 * @param {function(): void} next - Express Next function
 */

/**
 * Generate a MITchyM Router
 * @param {Object} param0
 * @param {Object[]} param0.methods - The methods, paths, and callbacks for this level of the router
 * @param {string} param0.methods[].name - The HTTP method (POST, GET, PUT, PATCH, DELETE) that will invoke the callbacks
 * @param {string} param0.methods[].path - A string, path pattern, or regular expression pattern representing a relative URI path
 * @param {MITchyM_Callback} param0.methods[].callbacks - Function to be invoked for this HTTP method and relative URI path combination
 * @returns {Object} Express Router
 */
module.exports = function ({
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
} = {}) {
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
        router.use(
          (paramsPath ? `/${paramsPath}` : '') + `/${subdir}`,
          require(join(dirname, subdir))
        )
      })
  }

  return router
}
