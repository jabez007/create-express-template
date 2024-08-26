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
        res.send('hello world')
      }
    }
  ]
})
