var React = require('react');
var Form = require('./form/form.jsx');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

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

var ResetPassword = React.createClass({
  render: function() {
    return (
      <div className="resetPassword innerForm centerDiv">
        <Form ref="userform"
              fields={fields}
              origin="Set password"
              defaultUsername={this.props.username}
              onInputBlur={this.handleBlur}
              handleSubmit={this.processFormData}
        />
        <button type="submit" onClick={this.processFormData} className="btn btn-awsm">Save</button>
      </div>
    );
  },
  processFormData: function(e) {
    var form = this.refs.userform;
    form.processFormData(e, (error, data) => {
      if ( error ) {
        WebmakerActions.displayError(error);
        console.error('validation error', error);
        return;
      }
      this.props.submitForm(data);
    });
  },
  handleBlur: function(e) {
    var fieldName = e.target.id,
        value = e.target.value;

    var form = this.refs.userform;
    if( fieldName === 'password' ) {
      form.validatePassword(value, (json) => {
        if(json !== true) {
          WebmakerActions.displayError(json);
        }
      });
    }
  }
});

module.exports = ResetPassword;
