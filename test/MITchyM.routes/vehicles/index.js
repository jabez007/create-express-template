module.exports = require('~utils/MITchyM')({
    dirname: __dirname,
    methods: [
      {
        name: ' GET ',
        path: '/',
        callbacks: (req, res) => {
          res.json([
            {
                make: "foobar",
                model: "foobar"
            }
          ])
        }
      },
    ]
  })
