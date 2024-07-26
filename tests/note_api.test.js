const { test, after, before, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const config = require('../utils/config')
const Note = require('../models/note')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { connectMongoDB } = require('../utils/mongodb')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer()

const api = supertest(app)

describe('note_api', async () => {
  before(async () => {
    await mongod.start()
    connectMongoDB(mongod.getUri())
    const passwordHash = await bcrypt.hash('iamroot', config.SALT_ROUNDS)
    const user = new User({
      username: 'root',
      name: 'I am ROOT',
      passwordHash
    })
    await user.save()
  })

  beforeEach(async () => {
    await Note.deleteMany({})
    for (let note of helper.initialNotes) {
      let noteObject = new Note(note)
      await noteObject.save()
    }
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert(contents.includes('HTML is easy'))
  })

  test('a valid note can be added', async () => {

    const user = await User.findOne({ username: 'root' })

    const newNote = {
      content: 'async/await simplifies making async calls',
      important: true,
      userId: user._id.toString()
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const notesAtEnd = await helper.notesInDb()
    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

    const contents = notesAtEnd.map(note => note.content)
    assert(contents.includes(newNote.content))
  })

  test('note without content is not added', async () => {
    const newNote = {
      important: true
    }

    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const notesAtEnd = await helper.notesInDb()

    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
  })

  test('an individual note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultNote.body, noteToView)
  })

  test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204)

    const notesAtEnd = await helper.notesInDb()

    const contents = notesAtEnd.map(r => r.content)
    assert(!contents.includes(noteToDelete.content))

    assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
  })

  after(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
  })
})