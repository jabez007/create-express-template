const userClient = require('~databases/swapi')

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

  static async get (req) {
    return new User(await userClient.getUser(req))
  }
}
