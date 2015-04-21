var React = require('react');
var Form = require('./form/form.jsx');
var IconText = require('./icontext.jsx');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

var fields = [
  {
    'password': {
      'placeholder': 'Enter your new password',
      'type': 'password',
      'validator': 'password'
    }
  }
];


var SetPasswordMigration = React.createClass({
  render: function() {
    return (
      <div className="migrateKeyContainer centerDiv">
        <IconText
          iconClass="emailSentIcon fa fa-lock"
          className="emailSent arrow_box"
          headerClass="emailSentHeader"
          header="Set your password">
            <p>Please create a password for your account.</p>
        </IconText>
        <div className="migrateKey innerForm">
          <Form defaultUsername={this.props.username}
                origin="Set password migration"
                ref="userform"
                fields={fields}
                onInputBlur={this.handleBlur}
                handleSubmit={this.processFormData}
          />
          <button type="submit" onClick={this.processFormData} className="btn btn-awsm">Continue</button>
        </div>
      </div>
    );
  },
  processFormData: function(e) {
    var form = this.refs.userform;
    form.processFormData(e, (error, data) => {console.log(error, data)
      console.log(error)
      this.props.submitForm(error, data);
    });
  },
  handleBlur: function(e) {
    var fieldName = e.target.id,
        value = e.target.value,
        userform = this.refs.userform;

    if( fieldName === 'password' ) {
      userform.validatePassword(value, (error) => {
        if(error) {
          WebmakerActions.displayError(error);
        }
      });
    }
  }
});

module.exports = SetPasswordMigration;
