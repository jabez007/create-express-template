const svcAgent = require('~utils/axios')

const swapiClient = svcAgent({
  axiosConfig: {
    baseURL: 'https://swapi.dev/api'
  }
})

const mockUser = {
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

module.exports = {
  searchUsers: async (req) => {
    if (process.env.NODE_ENV === 'test') {
      return [mockUser]
    }

    let query = req.query.name ? ('?search=' + req.query.name) : ''
    const users = []
    while (query !== undefined) {
      const res = (await swapiClient(req).get(`/people${query}`)).data
      users.push(...res.results)
      query = res.next?.split('?').splice(-1)[0]
      if (query) query = `?${query}`
      console.log(query)
    }

    return users
  },

  getUser: async (req) => {
    if (process.env.NODE_ENV === 'test') {
      return mockUser
    }
    return (await swapiClient(req).get(`/people/${req.params.userId}`)).data
  }
}
