var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');
var IconText = require('./icontext.jsx');
var Router = require('react-router');
var API = require('../lib/api.jsx');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

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
  mixins: [
    Router.Navigation,
    Router.State,
    API
  ],
  componentWillMount: function() {
    WebmakerActions.addListener('FORM_VALIDATION', this.handleFormData);
  },
  componentWillUnmount: function() {
    WebmakerActions.deleteListener('FORM_VALIDATION', this.handleFormData);
  },
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

        <Form onInputBlur={this.handleBlur}
              origin="Request password migration"
              ref="userform"
              fields={fields}
              validators={fieldsValidators}
              defaultUsername={this.props.username}
        />
        <button type="submit" onClick={this.processFormData} className="btn btn-awsm">Set Password</button>
        </div>
      </div>
    );
  },
  handleFormData: function(data) {
    this.props.submitForm(data);
  },
  processFormData: function(e) {
    var form = this.refs.userform;
    form.processFormData(e);
  },
  handleBlur: function(fieldName, value) {
    if ( fieldName === 'username' && value ) {
      this.checkUsername(value);
    }
  }
});

module.exports = LoginNoPassword;
