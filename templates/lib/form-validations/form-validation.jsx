var WebmakerActions = require('../webmaker-actions.jsx');
var regex = require('../regex/regex.js');

var MIN_PASSWORD_LEN = 8;
var MAX_PASSWORD_LEN = 128;

// polyfill String.contains - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/contains
if ( !String.prototype.contains ) {
  String.prototype.contains = function() {
    return String.prototype.indexOf.apply( this, arguments ) !== -1;
  };
}

module.exports = {
  validateAll: function(callback) {
    this.setState({errorMessage: {}});
    var arrayResults = { err: [] };
    var errored = false;
    var resultObj = (Object.keys(this.props.fields).map((i, k) => {
      var fieldName = Object.keys(this.props.fields[i])[0];
      if(fieldName === 'username') {
        this.validateUsername(this.state.username, (error) => {
          if(error) {
            errored = true;
            arrayResults.err.push(error);
          }
        });
      } else if (fieldName === 'email') {
        this.validateEmail(this.state.email, (error) => {
          if(error) {
            errored = true;
            arrayResults.err.push(error);
          }
        });
      } else if (fieldName === 'password') {
        this.validatePassword(this.state.password, (error) => {
          if(error) {
            errored = true;
            arrayResults.err.push(error);
          }
        });
      } else if (fieldName === 'feedback') {

      }
    }));
    if(errored) {
      return callback(arrayResults);
    } else {
      return callback(null);
    }
  },
  validateEmail: function(email, callback) {
    if(!email) {
      return callback([{'field': 'email', 'message': 'Please use a valid email address.'}]);
    }
    if(!email.match(regex.email)) {
      return callback([{'field': 'email', 'message': 'Please use a valid email address.'}]);
    }
    callback(null);
  },
  validateUsername: function(username, callback) {
    var result;
    var errored = false;
    if(!username) {
      return callback([{'field': 'username', 'message': 'Please specify a username.'}]);
    }
    if(this.state.password) {
      this.validatePassword(this.state.password, (error) => {
        if(!error) {
          WebmakerActions.validField({'field': 'password'});
        }
        if(!username.match(regex.username)) {
          errored = true;
          result.push({field: 'username', message: 'Must be 1-20 characters long and use only "-" and alphanumeric symbols.'});
        }
        if(errored) {
          return callback(result);
        }
      });
    } else {
      if(!username.match(regex.username)) {
        return callback([{field: 'username', message: 'Must be 1-20 characters long and use only "-" and alphanumeric symbols.'}]);
      }
    }

    callback(null);
  },
  validatePassword: function(password, callback) {
    var containsBothCases = regex.password.bothCases,
        containsDigit = regex.password.digit;
    var Url = require('url');
    var queryObj = Url.parse(window.location.href, true).query;

    var username = this.state.username || queryObj.uid;

    var tooShort = password.length < MIN_PASSWORD_LEN,
        tooLong = password.length > MAX_PASSWORD_LEN,
        caseValid = !! password.match(containsBothCases),
        digitValid = !! password.match(containsDigit);
    var errors = [];

    if (username) {
      var containUserValid = !password.toLowerCase().contains(username.toLowerCase())
      if(!containUserValid) {
        errors.push({'field': 'password', 'message': 'Password cannot contain your username.'});
      }
    }
    if (!password) {
      errors.push({'field': 'password', 'message': 'Please specify a password.'});
    }
    else if (!caseValid) {
      errors.push({'field': 'password', 'message': 'Password must contain at least one uppercase and lowercase letter.'});
    }
    else if (!digitValid) {
      errors.push({'field': 'password', 'message': 'Password must contain at least one number.'});
    }
    else if (tooShort) {
      errors.push({'field': 'password', 'message': 'Password must be at least eight characters long.'});
    }
    else if(tooLong) {
      errors.push({'field': 'password', 'message': 'Password cannot be more than 128 characters long.'});
    }
    if(caseValid && digitValid && containUserValid && !tooShort && !tooLong) {
      return callback(null);
    } else {
      return callback(errors);
    }
  }
}