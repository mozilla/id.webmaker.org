var regex = require('./regex/regex.js');

var fieldValidators = {
  username: {
    type: 'string',
    label: 'Username',
    pattern: regex.username,
    invalidMessage: 'Invalid username'
  },
  uid: {
    oneOf: [{
      type: 'string',
      pattern: regex.username
    }, {
      type: 'string',
      pattern: regex.email
    }],
    label: 'Username or Email',
    invalidMessage: 'Invalid username or email'
  },
  password: {
    type: 'string',
    label: 'Password',
    pattern: /^\S{8,128}$/,
    invalidMessage: 'Invalid password'
  },
  email: {
    type: 'string',
    label: 'Email',
    pattern: regex.email,
    invalidMessage: 'Invalid email'
  },
  feedback: {
    type: 'boolean',
    label: 'Feedback'
  }
};

module.exports = {
  getValidatorSet: function (fieldValues) {
    var validators = {
      type: 'object',
      properties: {}
    };
    fieldValues.forEach(function(entry) {
      var isDisabled = entry[Object.keys(entry)].disabled;
      Object.keys(entry).forEach(function(name) {
        if (!isDisabled && fieldValidators[name]) {
          validators.properties[name] = fieldValidators[name];

          if (name === 'feedback') {
            validators.required = ['feedback'];
          }
        }
      });
    });
    return validators;
  }
};
