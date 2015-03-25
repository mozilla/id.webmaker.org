var Joi = require('joi');

var fieldValidators = {
  username:       Joi.string().alphanum().min(1).required().label('Username'),
  password:       Joi.string().min(8).required().label('Password'),
  verifyPassword: Joi.any().valid(Joi.ref('password')).required().label('Password Confirmation'),
  email:          Joi.string().email().required().label('Email')
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
