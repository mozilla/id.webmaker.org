var React = require('react');

var Header = require('../components/header/header.jsx');
var LoginNoPasswordForm = require('../components/login-no-pass-form.jsx');
var KeyEmailed = require('../components/key-emailed.jsx');
var SetPasswordMigrationForm = require('../components/set-password-migration-form.jsx');
var IconText = require('../components/icontext.jsx');
var ga = require('react-ga');
var State = require("react-router").State;
var url = require('url');

require('whatwg-fetch');

var UserMigration = React.createClass({
  mixins: [
    State
  ],
  componentDidMount: function() {
    document.title = "Webmaker Login - Set a Password";
  },
  getInitialState: function() {
    return {
      login: false,
      emailedKey: false,
      setPass: !!this.getQuery().token,
      success: false
    };
  },
  render: function() {
    var username = this.getQuery().username;
    var content = (<LoginNoPasswordForm submitForm={this.handleSendToken} username={username}/>);
    if(this.state.emailedKey) {
      content = (<KeyEmailed />);
    } else if(this.state.setPass) {
      content = (<SetPasswordMigrationForm submitForm={this.handleSetPassword} />);
    } else if(this.state.success) {
      content = (<div className="successBanner centerDiv"><IconText
          iconClass="successBannerIcon icon"
          className=""
          headerClass="successBannerHeader"
          header="Success!">
            <p>Thanks for setting your Webmaker password. From now on, use it to log in to your account.</p>
            <a className="continueLink" href="https://webmaker.org">Continue</a>
        </IconText></div>)
    }
    return (
      <div>
        <Header origin="Migration" className="desktopHeader"/>
        <Header origin="Migration" className="mobileHeader" redirectLabel="Signup" redirectPage="signup" mobile />
        {content}
      </div>
    );
  },
  handleSendToken: function(error, data) {
    if(error) {
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Send Token'});
      console.error("inside App we see:", error, data);
      return;
    }
    var query = this.getQuery();
    delete query.username;

    fetch('/request-migration-email', {
      method: "post",
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        username: data.username,
        oauth: query
      })
    }).then((response) => {
      if ( response.status !== 200 ) {
        console.error("Non 200 status recieved while attemting migration", response.statusText);
        ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Send Token'});
        return;
      }
      this.setState({
        login: false,
        emailedKey: true
      });
      ga.event({category: 'Migration', action: 'Request Token'});
    }).catch((ex) => {
      console.error("Exception requesting migration email", ex);
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Send Token'});
    });
  },
  handleSetPassword: function(error, data) {
    if(error) {
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Set Password'});
      console.error("inside App we see:", error, data);
      return;
    }

    var query = this.getQuery();

    fetch('/migrate-user', {
      method: "post",
      headers: {
        "Accept": "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        username: query.uid,
        token: query.token,
        password: data.password
      })
    }).then((response) => {
      if ( response.status !== 200 ) {
        console.error("Non 200 status recieved while attemting migration", response.statusText);
        ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Set Password'});
        return;
      }
      this.setState({
        setPass: false,
        success: true
      });
      ga.event({category: 'Migration', action: 'Set new password'});
      window.setTimeout(() => {
        var redirectObj = url.parse(window.location.href);
        redirectObj.pathname = '/login/oauth/authorize';
        redirectObj.search = redirectObj.path = null;
        redirectObj.query = this.getQuery();

        window.location = url.format(redirectObj);
      }, 5000);
    }).catch((ex) => {
      console.error("Exception Creating Password", ex);
      ga.event({category: 'Migration', action: 'Error', label: 'Error Handling Set Password'});
    });

  }
});

module.exports = UserMigration;
