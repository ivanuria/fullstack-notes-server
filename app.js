const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const usersRoute = require('./controllers/users')
const middleware = require('./utils/middleware')
const { connectMongoDB } = require('./utils/mongodb')

if (config.NODE_ENV !== config.NODE_ENVS.TEST) {
  connectMongoDB(config.MONGODB_URI)
}

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter)
app.use('/api/users', usersRoute)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app