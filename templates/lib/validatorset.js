var Joi = require('joi');
var regex = require('./regex/regex.js');

var fieldValidators = {
  username:       Joi.string().alphanum().min(1).max(20).required().label('Username'),
  password:       Joi.string().regex(/^\S{8,128}$/).label('Password'),
  email:          Joi.string().regex(regex.email).label('Email'),
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
