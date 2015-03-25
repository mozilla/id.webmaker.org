var React = require('react');
var Form = require('../components/form.jsx');
var Header = require('../components/header.jsx');

var Joi = require('joi');
var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username'
    }
  },
  {
    'email': {
      'placeholder': 'Email',
      'type': 'email',
      'validator': 'email'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validator': 'password'
    }
  },
  {
    'feedback': {
      'label': 'Tell me about Mozilla news & events',
      'labelPosition': 'after',
      'type': 'checkbox'
    }
  }
];

var validators = require('../lib/validatorset');
var fieldValidators = validators.getValidatorSet(fieldValues);

var Signup = React.createClass({

  render: function() {
    return (
      <div className="signup-page">
        <Header wordmark redirectText="Already have an account?" redirectLabel="Log in" redirectPage="login" />
        <h1>Build the web. Learn new skills.</h1>
        <h2>Free and open source – forever.</h2>
        <Form ref="userform" fields={fieldValues} validators={fieldValidators}/>
        <div className="commit">
          <div className="agreement" />
          <div className="eula">By signing up, I agree to Webmaker's <a href="" className="underline">Terms of Service</a> and <a href="" className="underline">Privacy Policy</a>.</div>
          <div><button className="btn btn-awsm" onClick={this.processSignup}>SIGN UP</button></div>
        </div>
      </div>
    );
  },

  processSignup: function(evt) {
    this.refs.userform.processFormData(this.handleFormData);
  },

  handleFormData: function(error, data) {
    console.log("inside App we see:", error, data);
  }

});

module.exports = Signup;
