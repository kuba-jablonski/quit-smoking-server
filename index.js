const Joi = require('joi');
const express = require('express');
const app = express()

app.use(express.json());

// const users = [
//   {
//     id: 1,
//     email: 'asdf',
//     password: 'asf',
//     profile: {
//       username: 'Vyz',
//       filename: 'abc',
//       fileSrc: 'some file'
//     },
//     settings: {
//       cigsPerDay: 20,
//       cigsInPack: 20,
//       packCost: 15,
//       quitDate: '2018-06-30T14:46:53.988Z'
//     }
//   }
// ]

// app.post('/users/:id')

// function validateGenre(genre) {
//   const schema = {
//     name: Joi.string().min(3).required()
//   };

//   return Joi.validate(genre, schema);
// }

const port = process.env.PORT || 3000;
app.listen(port);
