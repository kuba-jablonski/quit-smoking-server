require('express-async-errors');
const Joi = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);
const config = require('config');
const mongoose = require('mongoose');
const express = require('express');
const users = require('./routes/users');
const auth = require('./routes/auth');
const error = require('./middleware/error');

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1)
}

const app = express();

mongoose.connect('mongodb://localhost/stop_smoking')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

app.use(express.json());
app.use('/users', users);
app.use('/auth', auth);
app.use(error)

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
