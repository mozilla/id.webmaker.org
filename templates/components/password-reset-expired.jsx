var React = require('react');
var IconText = require('./icontext.jsx');

var PasswordResetExpired = React.createClass({
  render: function() {
    return (
      <IconText
        className="messageBox"
        iconClass="messageIcon fa fa-exclamation-triangle"
        header="The link in your email expired."
        headerClass="messageHeader">
          <p>
            Request a new link below to set your password
          </p>
      </IconText>
    );
  }
});

module.exports = PasswordResetExpired;
