var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Form = require('../components/form/form.jsx');
var Header = require('../components/header/header.jsx');
var Url = require('url');

require('whatwg-fetch');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username or email',
      'type': 'text',
      'validator': 'username',
      'errorMessage': 'Invalid username'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validator': 'password',
      'errorMessage': 'Invalid password'
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
    var queryObj = Url.parse(window.location.href, true).query;

    return (
      <div>
        <Header className="desktopHeader" redirectQuery={queryObj} />
        <Header className="mobileHeader" redirectLabel="Signup" redirectPage="signup" redirectQuery={queryObj} mobile />

        <div className="loginPage innerForm centerDiv">
          <Form ref="userform" fields={fieldValues} validators={fieldValidators} />
          <button onClick={this.processFormData} className="btn btn-awsm">{buttonText}</button>
          <Link to="reset-password" query={queryObj} className="need-help">Forgot your password?</Link>
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
