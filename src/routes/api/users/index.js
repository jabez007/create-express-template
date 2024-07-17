module.exports = require('~utils/MITchyM')({
  dirname: __dirname,
  methods: [
    {
      name: ' GET ',
      path: '/',
      callbacks: (req, res) => {
        res.send('hello world')
      }
    }
  ]
})
