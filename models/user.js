const Joi = require('joi')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('config')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  profile: {
    username: {
      type: String,
      minlength: 3,
      maxlength: 10
    },
    filename: {
      type: String
    },
    fileSrc: {
      type: String
    }
  },
  settings: {
    cigsPerDay: {
      type: Number,
      required: true
    },
    cigsInPack: {
      type: Number
    },
    packCost: {
      type: Number
    },
    quitDate: {
      type: String
    }
  }
})

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'))
  return token
}

const User = mongoose.model('User', userSchema)

const validate = schema => obj => Joi.validate(obj, schema)

const joiProfileSchema = {
  username: Joi.string().min(3).max(10),
  filename: Joi.string(),
  fileSrc: Joi.string()
}

const joiSettingsSchema = {
  cigsPerDay: Joi.number().required(),
  cigsInPack: Joi.number().required().min(1).max(100),
  packCost: Joi.number().required(),
  quitDate: Joi.string().required()
}

exports.User = User
exports.validateUser = validate({
  email: Joi.string().max(255).required().email(),
  password: Joi.string().min(5).max(255).required(),
  profile: joiProfileSchema,
  settings: Joi.object().required().keys(joiSettingsSchema)
})
exports.validateProfile = validate(joiProfileSchema)
exports.validateSettings = validate(joiSettingsSchema)
