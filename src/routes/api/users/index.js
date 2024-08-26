const User = require('~models/user')

module.exports = require('~utils/MITchyM')({
  dirname: __dirname,
  methods: [
    {
      /**
       * @openapi
       * /users:
       *   get:
       *     description: Search for specified User records
       *     responses:
       *       200:
       *         description: Returns JSON object for the found User records
       */
      name: ' GET ',
      path: '/',
      callbacks: (req, res) => {
        req.logger.debug(`User Search Params: ${JSON.stringify(req.query, null, 2)}`)

        res.json({
          found: []
        })
      }
    },
    {
      /**
       * @openapi
       * /users/{userId}:
       *   get:
       *     description: Fetches record for specified User
       *     responses:
       *       200:
       *         description: Returns JSON object for specified User record
       */
      name: ' GET ',
      path: '/:userId',
      callbacks: async (req, res) => {
        req.logger.debug(`Requested User: ${req.params.userId}`)

        try {
          res.json(
            await User.get(req)
          )
        } catch (err) {
          req.logger.error(err)
          res
            .status(err.response.status)
            .json(err.response.data)
        }
      }
    }
  ]
})
