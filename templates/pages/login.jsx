var React = require('react');

var Form = require('../components/form/form.jsx');
var Header = require('../components/header/header.jsx');
var Url = require('url');

require('whatwg-fetch');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validator': 'password'
    }
  }
];

var validators = require('../lib/validatorset');
var fieldValidators = validators.getValidatorSet(fieldValues);

// This wraps every view
var Login = React.createClass({
  render: function() {
    // FIXME: totally not localized yet!
    var buttonText = "Log In";
    return (
      <div>
        <Header redirectText="Need an account?" redirectLabel="Sign up" redirectPage="signup" />

        <div className="formContainer centerDiv">
          <div className="innerForm">
            <Form ref="userform" fields={fieldValues} validators={fieldValidators} />
            <button onClick={this.processFormData} className="btn btn-awsm">{buttonText}</button>
          </div>
        </div>
      </div>
    );
  },
  processFormData: function() {
    var form = this.refs.userform;
    form.processFormData(this.handleFormData);
  },
  handleFormData: function(error, data) {
    if ( error ) {
      console.error('validation error', error);
      return;
    }
    var queryObj = Url.parse(window.location.href, true).query;
    fetch('/login', {
      method: 'post',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        uid: data.username,
        password: data.password
      })
    }).then(function(response) {
      var redirectObj;
      if ( response.status === 200 ) {
        redirectObj = Url.parse('/login/oauth/authorize', true);
        redirectObj.query = queryObj;
        window.location = Url.format(redirectObj);
      }
      // handle errors!
    }).catch(function(ex) {
      console.error('Error parsing response', ex);
    });
  }
});

module.exports = Login;
