const Joi = require('joi');

const periodSchema = Joi.object({
  
  start_date: Joi.date()
    .required()
    .custom((value, helpers) => {
      const now = new Date();
      const startDate = new Date(value);

      if (startDate < now) {
        return helpers.error('any.invalid', {
          message: 'The start date must not be in the past.',
        });
      }

      return value;
    })
    .messages({
      'any.invalid': 'The start date must not be in the past.',
    }),
  end_date: Joi.date()
    .required()
    .custom((value, helpers) => {
      const startDate = new Date(helpers.state.ancestors[0].start_date);
      const endDate = new Date(value);
      const now = new Date();

      if (endDate < startDate) {
        return helpers.error('any.invalid', {
          message: 'The end date must be greater than the start date.',
        });
      }

      if (endDate < now) {
        return helpers.error('any.invalid', {
          message: 'The end date must not be in the past.',
        });
      }

      return value;
    })
    .messages({
      'any.invalid': 'The end date must be valid and not in the past.',
    }),
  type: Joi.string()
    .valid('teacher_submission', 'internship_submission', 'pfa_choice_submission')
    .required(),
});

module.exports = periodSchema;
