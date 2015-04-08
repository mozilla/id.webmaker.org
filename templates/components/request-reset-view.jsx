var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');

var fields = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username'
    }
  }
];

var fieldsValidators = validators.getValidatorSet(fields);

var RequestResetPassword = React.createClass({
  render: function() {
    return (
      <div className="requestPassword innerForm centerDiv">
        <Form origin="Reset Password" ref="userform" fields={fields} validators={fieldsValidators} />
        <button onClick={this.processFormData} className="btn btn-awsm">Set a new password</button>
      </div>
    );
  },
  processFormData: function() {
    var form = this.refs.userform;
    form.processFormData(this.props.submitForm);
  }
});

module.exports = RequestResetPassword;
