var React = require('react');

var Form = require('../components/form.jsx');
var Header = require('../components/header.jsx');

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
    console.log("inside App we see:", error, data);
  }
});

module.exports = Login;