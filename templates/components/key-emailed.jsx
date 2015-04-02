var React = require('react');
var IconText = require('./icontext.jsx');

var KeyEmailed = React.createClass({
  render: function() {
    var emailText = "We've emailed your login key to the address you provided.";
    return (
      <IconText
        iconClass="emailSentIcon fa fa-envelope-o"
        className="emailSent centerDiv"
        header="Check your email"
        headerClass="emailSentHeader">
          <p>{emailText}</p>
      </IconText>
    );
  }
});

module.exports = KeyEmailed;
