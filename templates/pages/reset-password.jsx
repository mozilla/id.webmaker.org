var React = require('react');

var Header = require('../components/header/header.jsx');
var IconText = require('../components/icontext.jsx');
var ResetView = require('../components/reset-password-view.jsx');
var RequestView = require('../components/request-reset-view.jsx');
var Router = require('react-router');

// This wraps every view
var ResetPassword = React.createClass({
  getInitialState: function() {
    return {
      submitForm: false,
      email: false
    };
  },
  render: function() {
    return (
      <div>
        <Header redirectText="Need an account?" redirectLabel="Sign up" redirectPage="signup" />

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
                  <p>We've emailed you instructions for creating a new password.</p>
              </IconText> : false}
            {this.state.email ?
              <ResetView username="" submitForm={this.handleRequestPassword}/> : false
            }
        </div>
      </div>
    );
  },
  handleRequestPassword: function(error, data) {
    console.log("inside App we see:", error, data);
  },
  handleResetPassword: function(error, data) {
    console.log("inside App we see:", error, data);
    this.setState({
      submitForm: !error
    });
  }
});

module.exports = ResetPassword;
