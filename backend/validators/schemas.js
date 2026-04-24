const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const clientSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
});

const invoiceSchema = Joi.object({
  clientId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required(),
    })
  ).required(),
  dueDate: Joi.date().required(),
  notes: Joi.string(),
  taxRate: Joi.number().min(0).max(100).default(10),
});

module.exports = { registerSchema, loginSchema, clientSchema, invoiceSchema };
