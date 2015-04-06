var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');

var fields = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username',
      'disabled': true,
      'checked': true
    }
  }, {
    'password': {
      'placeholder': 'Type your new password',
      'type': 'password',
      'validator': 'password',
      'errorMessage': 'Invalid password',
      'focus': true
    }
  }
];

var fieldsValidators = validators.getValidatorSet(fields);

var ResetPassword = React.createClass({
  render: function() {
    return (
      <div className="resetPassword innerForm centerDiv">
        <Form ref="userform" fields={fields} validators={fieldsValidators} defaultUsername={this.props.username}/>
        <button onClick={this.processFormData} className="btn btn-awsm">Save</button>
      </div>
    );
  },
  processFormData: function() {
    var form = this.refs.userform;
    form.processFormData(this.props.submitForm);
  }
});

module.exports = ResetPassword;
