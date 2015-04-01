var React = require('react');
var validators = require('../lib/validatorset');
var Form = require('./form/form.jsx');
var IconText = require('./icontext.jsx');

var fields = [
  {
    'key': {
      'placeholder': 'Paste your key here',
      'type': 'password',
      'validator': 'key',
      'errorMessage': 'Invalid key'
    }
  }
];

var fieldsValidators = validators.getValidatorSet(fields);

var MigrateKey = React.createClass({
  render: function() {
    return (
      <div className="migrateKeyContainer centerDiv">
        <IconText
          iconClass="emailSentIcon fa fa-envelope-o"
          className="emailSent arrow_box"
          header="Check your email"
          headerClass="emailSentHeader">
            <p>We've emailed your login key to the address you provided.</p>
        </IconText>
        <div className="migrateKey innerForm">
          <Form ref="userform" fields={fields} validators={fieldsValidators} />
          <button onClick={this.processFormData} className="btn btn-awsm">Login</button>
        </div>
      </div>
    );
  },
  processFormData: function() {
    var form = this.refs.userform;
    form.processFormData(this.props.submitForm);
  }
});

module.exports = MigrateKey;
