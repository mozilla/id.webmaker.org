var Joi = require('joi');

var fieldValidators = {
  usernameEmail:    Joi.alternatives().try(
                    Joi.string().alphanum().min(1).required(),
                    Joi.string().email().required())
                  .label('Username or email'),
  username:            Joi.string().alphanum().min(1).required().label('Username'),
  password:       Joi.string().regex(/^\S{8,16}$/).label('Password'),
  verifyPassword: Joi.any().valid(Joi.ref('password')).required().label('Password Confirmation'),
  email:          Joi.string().email().required().label('Email'),
  key:            Joi.string().alphanum().min(1).required().label('Key')
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
