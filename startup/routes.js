const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const cors = require('cors')
const users = require('../routes/users')
const auth = require('../routes/auth')
const error = require('../middleware/error')

module.exports = function (app) {
  app.all('*', cors())
  app.use(express.json())
  app.use(helmet())
  app.use(compression())
  app.use('/users', users)
  app.use('/auth', auth)
  app.use(error)
}