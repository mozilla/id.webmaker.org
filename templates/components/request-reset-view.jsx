var React = require('react');
var Form = require('./form/form.jsx');
var Router = require('react-router');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

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
              handleSubmit={this.processFormData}
        />
        <button type="submit" onClick={this.processFormData} className="btn btn-awsm">Set a new password</button>
      </div>
    );
  },
  checkUser: function(user, username) {
    if ( user.usePasswordLogin === false && user.statusCode !== 404 ) {
      var query = this.getQuery();
      query.username = username;
      this.transitionTo('/migrate', '', query);
    } else if ( user.statusCode === 404 ) {
      WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! We can\'t find an account with that username!'}]);
    } else if (user.exists) {
      this.props.submitForm({user: {username: username}});
    }
  },
  handleFormData: function(error, data) {
    if ( error ) {
      WebmakerActions.displayError(error);
      console.error('validation error', error);
    }
    var user = data.user;
    if(error) {
      return;
    }
    WebmakerActions.validField({field: 'username'});
    this.checkUser(data.userObj, user.username)
  },
  handleBlur: function(e) {
    var fieldName = e.target.id,
        value = e.target.value,
        userform = this.refs.userform;

    if ( fieldName === 'username' ) {
      var query = this.getQuery();
      query.username = value;
      // something has changed in username field.
      WebmakerActions.validField({'field': 'username'});
      userform.validateUsername(value, (error) => {
        if(!error) {
          this.checkUsername(value, (json) => {
            if ( json.usePasswordLogin === false && json.statusCode !== 404 ) {
              this.transitionTo('/migrate', '', query);
            } else if ( json.statusCode === 404 ) {
              WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! We can\'t find an account with that username!'}]);
            } else if ( json.statusCode === 500 ) {
              WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! Something went wrong. Please try again.'}]);
            }
          });
        } else {
          WebmakerActions.displayError(error);
        }
      });
    }
  },
  processFormData: function(e) {
    var form = this.refs.userform;
    form.processFormData(e, this.handleFormData);
  }
});

module.exports = RequestResetPassword;
