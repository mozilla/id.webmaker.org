var React = require('react');
var IconText = require('./icontext.jsx');

var KeyEmailed = React.createClass({
  render: function() {
    return (
      <IconText
        iconClass="emailSentIcon fa fa-envelope-o"
        className="emailSent centerDiv"
        header="Thanks!"
        headerClass="emailSentHeader">
          <tbody><p>We've just emailed you a link to create your password.</p></tbody>
      </IconText>
    );
  }
});

module.exports = KeyEmailed;
