const bcrypt = require('bcrypt')
const User = require('../models/user')
const { describe, test, beforeEach, before, after } = require('node:test')
const assert = require('node:assert')
const helper = require('./test_helper')
const config = require('../utils/config')
const app = require('../app')
const supertest = require('supertest')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer()
const mongoose = require('mongoose')
const { connectMongoDB } = require('../utils/mongodb')

const api = supertest(app)

describe('users', () => {
  before(async () => {
    await mongod.start()
    connectMongoDB(mongod.getUri())
    console.log('connected to MONGODB')
  })
  after(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
  })
  beforeEach(async () => {
    console.log('User', User)
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', config.SALT_ROUNDS)
    const user = new User({
      username: 'root',
      name: 'Admin',
      passwordHash
    })

    await user.save()
  })

  describe('post /api/users', async () => {
    test('creation success with a brand-new username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'ivanuria',
        name: 'Iván Uría',
        password: 'notyourbusiness'
      }

      const savedUser = await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const toBeSavedUser = {
        username: newUser.username,
        name: newUser.name,
        id: savedUser.body.id,
        notes: []
      }

      assert.deepStrictEqual(savedUser.body, toBeSavedUser)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      const usernames = usersAtEnd.map(user => user.username)
      assert(usernames.includes(newUser.username))
    })

    test('fails with proper statusCode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'I am ROOT',
        password: 'iamroot'
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      assert(result.body.error.includes('expected `username` to be unique'))

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })
})