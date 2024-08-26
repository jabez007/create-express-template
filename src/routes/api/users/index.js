const User = require('~models/user')

module.exports = require('~utils/MITchyM')({
  dirname: __dirname,
  methods: [
    {
      /**
       * @openapi
       * /api/users:
       *   get:
       *     description: Search for specified User records
       *     parameters:
       *       - in: query
       *         name: name
       *         schema:
       *           type: string
       *         example: Skywalker
       *     responses:
       *       200:
       *         description: Returns JSON object for the found User records
       */
      name: ' GET ',
      path: '/',
      callbacks: async (req, res) => {
        req.logger.debug('User search query', { query: req.query })

        try {
          res.json({
            found: await User.search(req)
          })
        } catch (err) {
          req.logger.error(err)
          res
            .status(err.response?.status || 500)
            .json(err.response?.data || err)
        }
      }
    },
    {
      /**
       * @openapi
       * /api/users/{userId}:
       *   parameters:
       *     - $ref: '#/components/parameters/userId'
       *   get:
       *     description: Fetches record of specified User
       *     responses:
       *       200:
       *         description: Returns JSON object for specified User record
       *         content:
       *           application/json:
       *             schema:
       *               $ref: '#/components/schemas/User'
       */
      name: ' GET ',
      path: '/:userId([0-9]{1,2})',
      callbacks: async (req, res) => {
        req.logger.debug(`Requested User: ${req.params.userId}`)

        try {
          res.json(
            await User.get(req)
          )
        } catch (err) {
          req.logger.error(err)
          res
            .status(err.response?.status || 500)
            .json(err.response?.data || err)
        }
      }
    }
  ]
})

/**
 * @openapi
 * components:
 *   parameters:
 *     userId:
 *       in: path
 *       name: userId
 *       required: true
 *       schema:
 *         type: integer
 *         format: int32
 *       example: 13
 */
