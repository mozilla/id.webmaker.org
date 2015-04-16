var Joi = require('joi');

var fieldValidators = {
  username:       Joi.string().alphanum().min(1).max(20).required().label('Username'),
  password:       Joi.string().regex(/^\S{8,128}$/).label('Password'),
  verifyPassword: Joi.any().valid(Joi.ref('password')).required().label('Password Confirmation'),
  email:          Joi.string().regex(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i).label('Email'),
  feedback:       Joi.boolean().required().label('Feedback')
};

module.exports = {
  getValidatorSet: function (fieldValues) {
    var validators = {};
    fieldValues.forEach(function(entry) {
      var isDisabled = entry[Object.keys(entry)].disabled;
      Object.keys(entry).forEach(function(name) {
        if (!isDisabled && fieldValidators[name]) {
          validators[name] = fieldValidators[name];
        }
      });
    });
    return validators;
  }
};
