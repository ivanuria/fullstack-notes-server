require('dotenv').config()

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS)
const MONGODB_URI = process.env.MONGODB_URI
const NODE_ENVS = {
  TEST: 'test',
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
}

module.exports = {
  MONGODB_URI,
  PORT,
  SALT_ROUNDS,
  NODE_ENV,
  NODE_ENVS
}