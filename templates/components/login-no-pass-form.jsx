var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');
var IconText = require('./icontext.jsx');

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

var LoginNoPassword = React.createClass({
  render: function() {
    return (
      <div className="migrateKeyContainer centerDiv loginNoPass">
        <IconText
                  iconClass="emailSentIcon fa fa-lock"
                  className="emailSent arrow_box fullHeight"
                  headerClass="emailSentHeader"
                  header="Set your password">
                    <p>Webmaker is using a new log in system using passwords to ensure your experience is simple and safe. To get started, verify your username below, and click the "Set Password" button.</p>
                </IconText>
                <div className="migrateKey innerForm fullHeight">

        <Form origin="Migration" ref="userform" fields={fields} validators={fieldsValidators} defaultUsername={this.props.username} />
        <button onClick={this.processFormData} className="btn btn-awsm">Set Password</button>
        </div>
      </div>
    );
  },
  processFormData: function() {
    var form = this.refs.userform;
    form.processFormData(this.props.submitForm);
  }
});

module.exports = LoginNoPassword;
