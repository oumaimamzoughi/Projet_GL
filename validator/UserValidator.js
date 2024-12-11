const Joi = require('joi');

const userValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  cin: Joi.string().length(8).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('teacher', 'student', 'admin').required(),
  situation: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = userValidationSchema;
