const svcAgent = require('~utils/axios')

const swapiClient = svcAgent({
  axiosConfig: {
    baseURL: 'https://swapi.dev/api'
  }
})

module.exports = {
  getUser: async (req) => {
    if (process.env.NODE_ENV === 'test') {
      return {
        birth_year: '19 BBY',
        eye_color: 'Blue',
        gender: 'Male',
        hair_color: 'Blond',
        height: '172',
        mass: '77',
        name: 'Luke Skywalker',
        skin_color: 'Fair',
        created: '2014-12-09T13:50:51.644000Z',
        edited: '2014-12-10T13:52:43.172000Z'
      }
    }
    return (await swapiClient(req).get(`/people/${req.params.userId}`)).data
  }
}
