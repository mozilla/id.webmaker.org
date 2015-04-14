var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');
var Router = require('react-router');

var API = require('../lib/api.jsx');

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
  mixins: [
    Router.Navigation,
    Router.State,
    API
  ],
  render: function() {
    var username = this.getQuery().username;
    return (
      <div className="requestPassword innerForm centerDiv">
        <Form defaultUsername={username}
              onInputBlur={this.handleBlur}
              origin="Reset Password"
              ref="userform"
              fields={fields}
              validators={fieldsValidators}
        />
        <button onClick={this.processFormData} className="btn btn-awsm">Set a new password</button>
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
    form.processFormData(this.props.submitForm);
  }
});

module.exports = RequestResetPassword;
