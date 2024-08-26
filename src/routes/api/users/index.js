module.exports = require('~utils/MITchyM')({
  dirname: __dirname,
  methods: [
    {
      /**
       * @openapi
       * /users:
       *   get:
       *     description: Welcome to swagger-jsdoc!
       *     responses:
       *       200:
       *         description: Returns a mysterious string.
       */
      name: ' GET ',
      path: '/',
      callbacks: (req, res) => {
        req.logger.error('This is an error log')
        req.logger.warn('This is a warn log')
        req.logger.info('This is a info log')
        req.logger.debug('This is a debug log')

        res.send('hello world')
      }
    }
  ]
})
