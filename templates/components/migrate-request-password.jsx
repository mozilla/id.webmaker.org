var React = require('react');
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

var LoginNoPassword = React.createClass({
  mixins: [
    Router.Navigation,
    Router.State,
    API
  ],
  render: function() {
    return (
      <div className="migrateKeyContainer centerDiv loginNoPass">
        <IconText
                  iconClass="emailSentIcon fa fa-lock"
                  className="emailSent arrow_box fullHeight"
                  headerClass="emailSentHeader"
                  header="Uh oh. There isn't a password for that account yet.">
                </IconText>
                <div className="migrateKey innerForm fullHeight">

        <Form onInputBlur={this.handleBlur}
              origin="Request password migration"
              ref="userform"
              fields={fields}
              defaultUsername={this.props.username}
              handleSubmit={this.processFormData}
        />
        <button type="submit" onClick={this.processFormData} className="btn btn-awsm">Continue</button>
        </div>
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
      var query = this.getQuery();
      query.username = data.user.username;
      if ( data.userObj.usePasswordLogin ) {
        this.transitionTo('/login', '', query);
      } else if ( data.userObj.statusCode === 404 ) {
        WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! We can\'t find an account with that username!'}]);
      } else {
        this.props.submitForm(error, data);
      }
    });
  },
  handleBlur: function(e) {
    var fieldName = e.target.id,
        value = e.target.value,
        userform = this.refs.userform;

    if ( fieldName === 'username' ) {
      var query = this.getQuery();
      query.username = value;
      WebmakerActions.validField({'field': 'username'});
      userform.validateUsername(value, (error) => {
        if(!error) {
          userform.checkUsername(value, (json) => {
            if ( json.usePasswordLogin ) {
              this.transitionTo('/login', '', query);
            } else if ( json.statusCode === 404 ) {
              WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! We can\'t find an account with that username!'}]);
            } else if ( json.statusCode === 500 ){
              WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! Something went wrong. Please try again.'}]);
            }
          });
        } else {
          WebmakerActions.displayError(error);
        }
      });
    }
  }
});

module.exports = LoginNoPassword;
