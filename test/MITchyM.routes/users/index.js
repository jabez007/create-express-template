module.exports = require('@utils/MITchyM')({
  dirname: __dirname,
  methods: [
    {
      name: ' GET ',
      path: '/',
      callbacks: (req, res) => {
        res.json({
          found: [
            {
              first: 'John',
              last: 'Doe'
            },
            {
              first: 'Jane',
              last: 'Doe'
            }
          ]
        })
      }
    },
    {
      name: ' GET ',
      path: '/:id',
      callbacks: (req, res) => {
        res.json({
          first: 'John',
          last: 'Doe'
        })
      }
    }
  ]
})
