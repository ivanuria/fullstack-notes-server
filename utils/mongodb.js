const logger = require('./logger')
const mongoose = require('mongoose')

const connectMongoDB = (uri) => {
  logger.info('Connecting to', uri)

  mongoose.set('strictQuery', false)
  mongoose
    .connect(uri)
    .then(() => {
      logger.info('Connected to MongoDB')
    })
    .catch(error => {
      logger.error('Error connecting to MongoDB:', error.message)
    })
}

module.exports = {
  connectMongoDB
}