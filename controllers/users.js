const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('notes', {
      content: 1,
      important: 1
    })
  response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const passwordHash = await bcrypt.hash(password, config.SALT_ROUNDS)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter