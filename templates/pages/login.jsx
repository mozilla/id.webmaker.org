var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Form = require('../components/form/form.jsx');
var Header = require('../components/header/header.jsx');
var Url = require('url');
var ga = require('react-ga');
var API = require('../lib/api.jsx');

require('whatwg-fetch');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
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
  mixins: [
    Router.Navigation,
    Router.State,
    API
  ],
  getInitialState: function() {
    return {
      usernameError: null
    };
  },
  componentDidMount: function() {
    document.title = "Webmaker Login - Login";
  },
  render: function() {
    var username = this.getQuery().username;
    // FIXME: totally not localized yet!
    var buttonText = "Log In";
    var queryObj = Url.parse(window.location.href, true).query;

    return (
      <div>
        <Header origin="Login" className="desktopHeader" redirectQuery={queryObj} />
        <Header origin="Login" className="mobileHeader" redirectLabel="Signup" redirectPage="signup" redirectQuery={queryObj} mobile />

        <div className="loginPage innerForm centerDiv">
          <Form usernameError={this.state.usernameError} defaultUsername={username} ref="userform" fields={fieldValues} validators={fieldValidators} origin="Login" onInputBlur={this.handleBlur} />
          <button onClick={this.processFormData} className="btn btn-awsm">{buttonText}</button>
          <Link onClick={this.handleGA.bind(this, 'Forgot your password')} to="reset-password" query={queryObj} className="need-help">Forgot your password?</Link>
        </div>
      </div>
    );
  },
  handleBlur: function(fieldName, value) {
    if ( fieldName === 'username' && value ) {
      this.checkUsername(value);
    }
  },
  processFormData: function() {
    var form = this.refs.userform;
    ga.event({category: 'Login', action: 'Start login'});
    form.processFormData(this.handleFormData);
  },
  handleGA: function(name) {
    ga.event({category: 'Login', action: 'Clicked on ' + name + ' link.'});
  },
  handleFormData: function(error, data) {
    if ( error ) {
      ga.event({category: 'Login', action: 'Error during form validation'})
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
        ga.event({category: 'Login', action: 'Logged in'});
        window.location = Url.format(redirectObj);
      }
      // handle errors!
    }).catch(function(ex) {
      ga.event({category: 'Login', action: 'Error', label: 'Error with the server'});
      console.error('Error parsing response', ex);
    });
  }
});

module.exports = Login;
