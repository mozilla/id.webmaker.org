var React = require('react');

var Header = React.createClass({
  render: function() {
    return (
      <div className="navbar">
        <img src="/assets/img/logo.png" alt="logo" className="logo" />
        <div className="sign-up">Need an account? <a href="" className="underline">Sign up</a></div>
      </div>
    );
  }
});

module.exports = Header;
