const Joi = require('joi');

const userValidationSchema = Joi.object({
    firstName: Joi.string().required(),  // Assurez-vous que ce champ est bien inclus
    lastName: Joi.string().required(),
    cin: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('student', 'admin', 'teacher').required(),
    situation: Joi.string().required(),
    password: Joi.string().required(),
});
