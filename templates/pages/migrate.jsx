var React = require('react');

var Header = require('../components/header/header.jsx');
var LoginNoPasswordForm = require('../components/login-no-pass-form.jsx');
var MigrateKeyForm = require('../components/migrate-key-form.jsx');
var SetPasswordMigrationForm = require('../components/set-password-migration-form.jsx');
var IconText = require('../components/icontext.jsx');

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
        <Header className="desktopHeader"/>
        <Header className="mobileHeader" redirectLabel="Signup" redirectPage="signup" mobile />
        {content}
      </div>
    );
  },
  handleLogin: function(error, data) {
    console.log("inside App we see:", error, data);
    if(!error) {
      this.setState({
        login: false,
        setKey: true
      });
    }
  },
  handleSetKey: function(error, data) {
    console.log("inside App we see:", error, data);
    if(!error) {
      this.setState({
        setKey: false,
        setPass: true
      });
    }
  },
  handleResetPassword: function(error, data) {
    console.log("inside App we see:", error, data);
    if(!error) {
      this.setState({
        setPass: false,
        success: true
      });
    }
  }
});

module.exports = UserMigration;
