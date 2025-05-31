// backend/lambdas/createVehicle/validation.js
// TODO: import Joi from ‘joi’; // Or const Joi = require('joi');
const Joi = require('joi');

const schema = Joi.object({
  make: Joi.string().trim().min(1).max(50).required(),
  model: Joi.string().trim().min(1).max(50).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(), // Allow current year + 1
  mileage: Joi.number().integer().min(0).max(1000000).required(), // Max 1 million miles
  price: Joi.number().precision(2).min(0).max(10000000).required() // Max 10 million, 2 decimal places
});

module.exports = schema;
