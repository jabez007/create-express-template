module.exports = require('@utils/MITchyM')({
  dirname: __dirname,
  methods: [
    {
      name: ' GET ',
      path: '/',
      callbacks: (req, res) => {
        res.json({
          phone: '555-555-5555',
          email: 'foobar@example.com'
        })
      }
    }
  ]
})
