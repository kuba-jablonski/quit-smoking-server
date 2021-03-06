const Joi = require('joi')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const { User } = require('../models/user')
const express = require('express')

const router = express.Router()

router.post('/', async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send({ msg: error.details[0].message })

  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send({ msg: 'Invalid email or password' })

  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).send({ msg: 'Invalid email or password' })

  const token = user.generateAuthToken()

  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'profile', 'settings']))
})

function validate (req) {
  const schema = {
    email: Joi.string().max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  }

  return Joi.validate(req, schema)
}

module.exports = router
