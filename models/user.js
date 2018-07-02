const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

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
      type: Number
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

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

const validate = schema => obj => Joi.validate(obj, schema);

exports.User = User; 
exports.validateUser = validate({
  email: Joi.string().max(255).required().email(),
  password: Joi.string().min(5).max(255).required()
});
exports.validateProfile = validate({
  username: Joi.string().min(3).max(10),
  filename: Joi.string(),
  fileSrc: Joi.string()  
});
exports.validateSettings = validate({
  cigsPerDay: Joi.number(),
  cigsInPack: Joi.number(),
  packCost: Joi.number(),
  quitDate: Joi.string()
});
