module.exports = class User {
  constructor ({
    birth_year, // eslint-disable-line camelcase
    eye_color, // eslint-disable-line camelcase
    gender,
    hair_color, // eslint-disable-line camelcase
    height,
    mass,
    name,
    skin_color, // eslint-disable-line camelcase
    created,
    edited
  }) {
    this.birthYear = birth_year // eslint-disable-line camelcase
    this.eyeColor = eye_color // eslint-disable-line camelcase
    this.gender = gender
    this.hairColor = hair_color // eslint-disable-line camelcase
    this.height = height
    this.mass = mass
    this.name = name
    this.skinColor = skin_color // eslint-disable-line camelcase
    this.created = new Date(created)
    this.edited = new Date(edited)
  }

  static get (userId) {
    return new User({
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
    })
  }
}
