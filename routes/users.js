const _ = require('lodash');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require('express');
const { User, validateUser, validateProfile, validateSettings } = require('../models/user');
const auth = require('../middleware/auth')
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validateUser(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['username', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  
  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'username']));
});

router.get('/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id)

  res.send(_.pick(user, ['_id', 'profile', 'settings']));
})

router.put('/:id/profile', auth, async (req, res) => {
  const { error } = validateProfile(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const { profile } = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      profile: req.body
    }
  }, { new: true });

  res.send(profile);
})

router.put('/:id/settings', auth, async (req, res) => {
  const { error } = validateSettings(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const { settings } = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      settings: req.body
    }
  }, { new: true });

  res.send(settings);
})

module.exports = router;
