var React = require('react');
var Router = require('react-router');
var Link = Router.Link;
var API = require('../lib/api.jsx');

var Form = require('../components/form/form.jsx');
var Header = require('../components/header/header.jsx');
var WebmakerActions = require('../lib/webmaker-actions.jsx');
var Url = require('url');
var ga = require('react-ga');
var cookiejs = require('cookie-js');
var WebmakerActions = require('../lib/webmaker-actions.jsx');

require('isomorphic-fetch');

var fieldValues = [
  {
    'username': {
      'placeholder': 'Username',
      'type': 'text'
    }
  },
  {
    'password': {
      'placeholder': 'Password',
      'type': 'password'
    }
  }
];

// This wraps every view
var Login = React.createClass({
  componentDidMount: function() {
    document.title = "Webmaker Login - Login";
  },
  mixins: [
    Router.Navigation,
    Router.State
  ],
  render: function() {
    // FIXME: totally not localized yet!
    var buttonText = "Log In";
    this.queryObj = Url.parse(window.location.href, true).query;
    return (
      <div>
        <Header origin="Login" className="desktopHeader" redirectQuery={this.queryObj} />
        <Header origin="Login" className="mobileHeader" redirectLabel="Signup" redirectPage="signup" redirectQuery={this.queryObj} mobile />

        <div className="loginPage innerForm centerDiv">
          <Form ref="userform"
                fields={fieldValues}
                origin="Login"
                onInputBlur={this.handleBlur}
                defaultUsername={this.queryObj.username}
                handleSubmit={this.processFormData}
          />
          <button onClick={this.processFormData} className="btn btn-awsm">{buttonText}</button>
          <Link onClick={this.handleGA} to="reset-password" query={this.queryObj} className="need-help">Forgot your password?</Link>
        </div>
      </div>
    );
  },
  processFormData: function(e) {
    e.preventDefault();
    var form = this.refs.userform;
    ga.event({category: 'Login', action: 'Start login'});
    form.processFormData(e, this.handleFormData);
  },
  checkUser: function(user, username, e) {
    if(e) e.preventDefault();
    this.queryObj.username = username;
    if ( user.usePasswordLogin === false && user.statusCode !== 404 ) {
      this.transitionTo('/migrate', '', this.queryObj);
    } else if ( user.statusCode === 404 ) {
      WebmakerActions.displayError([{'field': 'username', 'message': 'Whoops! We can\'t find an account with that username!'}]);
    } else if (user.exists) {
      WebmakerActions.validField({'field': 'username', 'message': 'Available'});
      return true;
    } else {
      WebmakerActions.displayError([{'field': 'username', 'message': 'Something went wrong! Please try again later.'}]);
    }
  },
  handleGA: function(e) {
    e.preventDefault();
    var url = Url.parse(e.target.href, true);
    var pathname = url.pathname;
    var query = url.query;
    var userform = this.refs.userform;

    userform.setFormState({field: 'username'});
    userform.validateUsername(userform.state.username, (error) => {
      if(!error) {
        userform.checkUsername(userform.state.username, (json) => {
          var available = this.checkUser(json, userform.state.username)
          if(available) {
            query.username = userform.state.username;
            this.transitionTo(pathname, '', query);
          }
        });
      } else {
        WebmakerActions.displayError(error);
      }
    });
    ga.event({category: 'Login', action: 'Clicked on Forgot your password link.'});
  },
  handleBlur: function(e) {
    var fieldName = e.target.id,
        value = e.target.value,
        userform = this.refs.userform;

    if( fieldName === 'username' ) {
      userform.setFormState({field: 'username'});
      userform.validateUsername(value, (error) => {
        if(!error) {
          userform.checkUsername(value, (json) => {
            this.checkUser(json, value)
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
        if(!value) {
          WebmakerActions.displayError(error);
        } else {
          WebmakerActions.displayError([{'field': 'password', 'message': 'Invalid password.'}]);
        }
      });
    }
  },
  handleFormData: function(error, data) {
    if ( error ) {
      WebmakerActions.displayError(error);
      ga.event({category: 'Login', action: 'Error during form validation'})
      console.error('validation error', error);
    }
    var user = data.user;
    var userform = this.refs.userform;

    if(user.username) {
      this.checkUser(data.userObj, user.username);
      return;
    }

    if(error) {
      if(error[0][0].field === 'password' && userform.state.password) {
        WebmakerActions.displayError([{field: 'password', message: 'Invalid password.'}]);
        return;
      }
      return;
    }
    var csrfToken = cookiejs.parse(document.cookie).crumb;
    var queryObj = Url.parse(window.location.href, true).query;
    fetch('/login', {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        uid: user.username,
        password: user.password
      })
    }).then(function(response) {
      var redirectObj;
      if ( response.status === 200 ) {
        WebmakerActions.validField({field: 'password'})
        redirectObj = Url.parse('/login/oauth/authorize', true);
        redirectObj.query = queryObj;
        ga.event({category: 'Login', action: 'Logged in'});
        window.location = Url.format(redirectObj);
      }
      if( response.status === 401 ) {
        WebmakerActions.displayError([{field: 'password', message: 'Invalid password.'}]);
      }
      // handle errors!
    }).catch(function(ex) {
      ga.event({category: 'Login', action: 'Error', label: 'Error with the server'});
      console.error('Error parsing response', ex);
    });
  }
});

module.exports = Login;
