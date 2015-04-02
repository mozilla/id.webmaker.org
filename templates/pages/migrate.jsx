var React = require('react');

var Header = require('../components/header/header.jsx');
var LoginNoPasswordForm = require('../components/login-no-pass-form.jsx');
var MigrateKeyForm = require('../components/migrate-key-form.jsx');
var SetPasswordMigrationForm = require('../components/set-password-migration-form.jsx');
var IconText = require('../components/icontext.jsx');
var ga = require('react-ga');

var UserMigration = React.createClass({
  getInitialState: function() {
    return {
      login: false,
      setKey: false,
      setPass: false,
      success: false
    };
  },
  render: function() {
    var content = (<LoginNoPasswordForm submitForm={this.handleLogin}/>);
    if(this.state.setKey) {
      content = (<MigrateKeyForm submitForm={this.handleSetKey} />);
    } else if(this.state.setPass) {
      content = (<SetPasswordMigrationForm submitForm={this.handleResetPassword} />);
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
  handleLogin: function(error, data) {
    if(error) {
      console.log("inside App we see:", error, data);
      return;
    }
    this.setState({
      login: false,
      setKey: true
    });
    ga.event({category: 'Migration', action: 'Request password'});
    console.log({category: 'Migration', action: 'Request password'})
  },
  handleSetKey: function(error, data) {
    if(error) {
      console.log("inside App we see:", error, data);
      return;
    }
    this.setState({
      setKey: false,
      setPass: true
    });
    ga.event({category: 'Migration', action: 'Paste token from email'});
    console.log({category: 'Migration', action: 'Paste token from email'})
  },
  handleResetPassword: function(error, data) {
    if(error) {
      console.log("inside App we see:", error, data);
      return;
    }
    this.setState({
      setPass: false,
      success: true
    });
    ga.event({category: 'Migration', action: 'Set new password'});
    console.log({category: 'Migration', action: 'Set new password'});
  }
});

module.exports = UserMigration;
