var React = require('react');

var Form = require('../components/form/form.jsx');
var Header = require('../components/header/header.jsx');
var IconText = require('../components/icontext.jsx');
var Router = require('react-router');
var cookiejs = require('cookie-js');
var WebmakerActions = require('../lib/webmaker-actions.jsx');
var Url = require('url');
var ga = require('react-ga');
require('isomorphic-fetch');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text',
      'validator': 'username',
      'label': false,
      'tabIndex': '1'
    }
  },
  {
    'email': {
      'placeholder': 'Email',
      'type': 'email',
      'validator': 'email',
      'label': false,
      'tabIndex': '2'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password',
      'validator': 'password',
      'label': false,
      'tabIndex': '3'
    }
  },
  {
    'feedback': {
      'label': 'Tell me about Mozilla news & events',
      'labelPosition': 'after',
      'type': 'checkbox',
      'className': 'checkBox',
      'tabIndex': '4'
    }
  }
];

var Signup = React.createClass({
  componentDidMount: function() {
    document.title = "Webmaker Login - Sign Up";
    document.body.className = "signup-bg";
  },
  componentWillUnmount: function() {
    document.body.className = "";
  },
  render: function() {
    var queryObj = Url.parse(window.location.href, true).query;
    return (
      <div className="signup-page">
        <Header origin="Signup" className="desktopHeader" redirectText="Already have an account?" redirectLabel="Log in" redirectPage="login" redirectQuery={queryObj} />
        <Header origin="Signup" className="mobileHeader" redirectLabel="Log in" redirectPage="login" redirectQuery={queryObj} mobile />

        <h1>Build the web. Learn new skills.</h1>
        <h2>Free and open source – forever.</h2>
        <div className="innerForm">
          <Form ref="userform"
                fields={fieldValues}
                origin="Signup"
                onInputBlur={this.handleBlur}
                autoComplete="off"
                handleSubmit={this.processSignup}
          />
        </div>
        <div className="commit">
          <IconText iconClass="agreement" textClass="eula">
            By signing up, I agree to Webmaker&lsquo;s <a tabIndex="5" href="//webmaker.org/en-US/terms" className="underline">Terms of Service</a> and <a tabIndex="6" href="//webmaker.org/en-US/privacy" className="underline">Privacy Policy</a>.
          </IconText>
          <div className="signup-button"><button type="submit" tabIndex="7" className="btn btn-awsm" onClick={this.processSignup}>SIGN UP</button></div>
        </div>
      </div>
    );
  },
  processSignup: function(evt) {
    this.refs.userform.processFormData(evt, this.handleFormData);
  },
  handleBlur: function(e) {
    var fieldName = e.target.id,
        value = e.target.value,
        userform = this.refs.userform;

    if ( fieldName === 'email' ) {
      userform.validateEmail(value, (error) => {
        // if no error
        if(!error) {
          userform.checkEmail(value, (email) => {
            if (email.exists) {
              WebmakerActions.displayError([{'field': 'email', 'message': 'Email address already taken!'}]);
              return;
            } else if (!email.exists) {
              WebmakerActions.validField({'field': 'email', 'message': 'Available'});
            }
          });
        } else {
          WebmakerActions.displayError(error);
        }
      });
    }
    if( fieldName === 'username' ) {
      userform.setFormState({field: 'username'});
      userform.validateUsername(value, (error) => {
        if(!error) {
          userform.checkUsername(value, (json) => {
            if (json.exists) {
              WebmakerActions.displayError([{'field': 'username', 'message': 'Username is taken!'}]);
            } else if (json.exists === false) {
              WebmakerActions.validField({'field': 'username', 'message': 'Available'});
            } else {
              WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! Something went wrong. Please try again.'}]);
            }
          });
        } else {
          WebmakerActions.displayError(error);
        }
      });
    }
    if( fieldName === 'password' ) {
      userform.setFormState({field: 'password'});
      if(!userform.state.username) {
        WebmakerActions.displayError([{'field': 'username', 'message': 'Please specify a username.'}]);
      }
      userform.validatePassword(value, (error) => {
        if(!error) {
          userform.setFormState({field: 'password'});
          return;
        }
        WebmakerActions.displayError(error);
      });
    }
  },
  handleFormData: function(error, data) {
    var userform = this.refs.userform;
    var user = data.user;

    if ( error ) {
      WebmakerActions.displayError(error);
      ga.event({category: 'Signup', action: 'Error during form validation'});
      console.error("validation error", error);
    }

    if (data.userObj.exists) {
      // if this username is taken report an error and do early return
      WebmakerActions.displayError([{'field': 'username', 'message': 'Username is taken!'}]);
      return;
    } else if (!data.userObj.exists) {
      WebmakerActions.validField({'field': 'username', 'message': 'Available'});
    }
    // validate email once again in case they press the return key directly
    userform.validateEmail(userform.state.email, (emailError) => {
      // making sure the field is not empty and passed the validation field
      if(userform.state.email  && !emailError) {
        // check the email with the server for existance
        userform.checkEmail(userform.state.email, (email) => {
          if (email.exists) {
            // if this email is taken report an error and do early return
            WebmakerActions.displayError([{'field': 'email', 'message': 'Email address already taken!'}]);
            return;
          } else if (!email.exists) {
            WebmakerActions.validField({'field': 'email', 'message': 'Available'});
          }
          userform.validatePassword(userform.state.password, (passwordError) => {
            // there is an error on password validation
            if(passwordError) {
              WebmakerActions.displayError(passwordError);
              return;
            }
            // making sure the field is not empty and passed the validation field
            if(userform.state.password  && !passwordError) {
              // if there is an error on any field we shouldn't continue
              if(error) {
                return;
              }
              var csrfToken = cookiejs.parse(document.cookie).crumb;
              var queryObj = Url.parse(window.location.href, true).query;
              // fetch the /create-user post request
              fetch("/create-user", {
                method: "post",
                credentials: 'same-origin',
                headers: {
                  "Accept": "application/json; charset=utf-8",
                  "Content-Type": "application/json; charset=utf-8",
                  "X-CSRF-Token": csrfToken
                },
                body: JSON.stringify({
                  email: user.email,
                  username: user.username,
                  password: user.password,
                  feedback: user.feedback,
                  client_id: queryObj.client_id
                })
              }).then(function(response) {
                var redirectObj;
                // if we get status code 200 then everything should be okay
                if ( response.status === 200 ) {
                  redirectObj = Url.parse("/login/oauth/authorize", true);
                  redirectObj.query = queryObj;
                  ga.event({category: 'Signup', action: 'Successfully created an account'});
                  window.location = Url.format(redirectObj);
                }
                // should we handle anything other than status 200?
              }).catch(function(ex) {
                ga.event({category: 'Signup', action: 'Error', label: 'Error parsing response from the server'});
                console.error("Error parsing response", ex);
              });
            }
          });
        });
      }
    });
  }

});

module.exports = Signup;
