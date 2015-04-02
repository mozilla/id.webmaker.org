var React = require('react');

var Header = require('../components/header/header.jsx');
var IconText = require('../components/icontext.jsx');
var ResetView = require('../components/reset-password-view.jsx');
var RequestView = require('../components/request-reset-view.jsx');
var Router = require('react-router');


var Url = require('url');
var ga = require('react-ga');
require('whatwg-fetch');

// This wraps every view
var ResetPassword = React.createClass({
  getInitialState: function() {
    var queryObj = Url.parse(window.location.href, true).query;
    return {
      submitForm: false,
      email: queryObj.resetCode && queryObj.uid,
      queryObj: queryObj
    };
  },
  render: function() {
    var emailText = "We've emailed you instructions for creating a new password.";
    var linkQuery = {};
    linkQuery.client_id = this.state.queryObj.client_id;
    linkQuery.state = this.state.queryObj.state;
    linkQuery.scopes = this.state.queryObj.scopes;
    linkQuery.response_type = this.state.queryObj.response_type;
    return (
      <div>
        <Header origin="Reset Password" className="desktopHeader" redirectQuery={linkQuery} />
        <Header origin="Reset Password" className="mobileHeader" redirectLabel="Signup" redirectPage="signup" redirectQuery={linkQuery} mobile />

        <div className="resetPasswordPage">
            {!this.state.submitForm && !this.state.email ?
              <RequestView submitForm={this.handleResetPassword}/> : false
            }

            {this.state.submitForm ?
              <IconText
                iconClass="emailSentIcon fa fa-envelope-o"
                className="emailSent centerDiv"
                headerClass="emailSentHeader"
                header="Check your email">
                  <p>{emailText}</p>
              </IconText> : false}
            {this.state.email ?
              <ResetView username={this.state.queryObj.uid} submitForm={this.handleRequestPassword}/> : false
            }
        </div>
      </div>
    );
  },
  handleRequestPassword: function(error, data) {
    if ( error ) {
      ga.event({category: 'Reset Password', action: 'Error form validation on request password page'});
      console.error("validation error", error);
      return;
    }

    fetch('/reset-password', {
      method: 'post',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        uid: data.username,
        password: data.password,
        resetCode: this.state.queryObj.resetCode
      })
    }).then(function(response) {
      var queryObj,
        redirectObj;
      if ( response.status === 200 ) {
        queryObj = Url.parse(window.location.href, true).query;
        redirectObj = Url.parse('/login', true);
        redirectObj.query.client_id = queryObj.client_id;
        redirectObj.query.state = queryObj.state;
        redirectObj.query.response_type = queryObj.response_type;
        redirectObj.query.scopes = queryObj.scopes;
        ga.event({category: 'Reset Password', action: 'Successfully request new password'});
        window.location = Url.format(redirectObj);
        return;
      }
      // handle errors!
    }.bind(this)).catch(function(ex) {
      ga.event({category: 'Reset Password', action: 'Error parsing response from the server'});
      console.error('Error parsing response', ex);
    });
  },
  handleResetPassword: function(error, data) {
    if ( error ) {
      ga.event({category: 'Reset Password', action: 'Error form validation on reset password page'});
      console.error("validation error", error);
      return;
    }

    fetch('/request-reset', {
      method: 'post',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        uid: data.username,
        oauth: Url.parse(window.location.href, true).query
      })
    }).then(function(response) {
      if ( response.status === 200 ) {
        this.setState({
          submitForm: true
        });
        ga.event({category: 'Reset Password', action: 'Successfully request password reset'});

      } else if ( response.status === 400 ) {
        ga.event({category: 'Reset Password', action: 'Bad request for request password reset'});

        console.error("Bad Request", response.json());
      } else if ( response.status === 401 ) {
        ga.event({category: 'Reset Password', action: 'Unauthorized for request password reset'});

        console.error("Unauthorized", response.json());
      }

    }.bind(this)).catch(function(ex) {
      ga.event({category: 'Reset Password', action: 'Error parsing response from the server'});
      console.error('Error parsing response', ex);
    });
  }
});

module.exports = ResetPassword;
