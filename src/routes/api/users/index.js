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
        req.logger.debug(`Requested User: ${req.params.id}`)

        res.json({
          found: []
        })
      }
    },
    {
      /**
       * @openapi
       * /users/{id}:
       *   get:
       *     description: Fetches record for specified User
       *     responses:
       *       200:
       *         description: Returns JSON object for specified User record
       */
      name: ' GET ',
      path: '/:id',
      callbacks: (req, res) => {
        req.logger.debug(`Requested User: ${req.params.id}`)

        res.json(
          User.get(req.params.id)
        )
      }
    }
  ]
})
