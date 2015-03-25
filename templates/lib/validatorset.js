var Joi = require('joi');

var fieldValidators = {
  username: Joi.string().min(1).required().label('Username'),
  password: Joi.string().min(3).required().label('Password'),
  email:    Joi.string().email().required().label('Email')
};

module.exports = {
  getValidatorSet: function (fieldValues) {
    var validators = {};
    fieldValues.forEach(function(entry) {
      Object.keys(entry).forEach(function(name) {
        if (fieldValidators[name]) {
          validators[name] = fieldValidators[name];
        }
      });
    });
    return validators;
  }
};
