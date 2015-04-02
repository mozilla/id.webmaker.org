var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');

var fields = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username',
      'errorMessage': 'Invalid username'
    }
  }
];

var fieldsValidators = validators.getValidatorSet(fields);

var LoginNoPassword = React.createClass({
  render: function() {
    return (
      <div className="loginNoPass innerForm centerDiv">
        <Form origin="Migration" ref="userform" fields={fields} validators={fieldsValidators} />
        <button onClick={this.processFormData} className="btn btn-awsm">Log in</button>
      </div>
    );
  },
  processFormData: function() {
    var form = this.refs.userform;
    form.processFormData(this.props.submitForm);
  }
});

module.exports = LoginNoPassword;
