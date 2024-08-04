const userClient = require('~databases/swapi')

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         birthYear:
 *           type: string
 *           example: 19 BBY
 *         eyeColor:
 *           type: string
 *           example: Blue
 *         gender:
 *           type: string
 *           example: Male
 *         hairColor:
 *           type: string
 *           example: blonde
 *         height:
 *           type: string
 *           example: 172 cm
 *         mass:
 *           type: string
 *           example: 77 kg
 *         name:
 *           type: string
 *           example: Luke Skywalker
 *         skinColor:
 *           type: string
 *           example: fair
 *         created:
 *           type: string
 *           format: date-time
 *         edited:
 *           type: string
 *           format: date-time
 */
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
