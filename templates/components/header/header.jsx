var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Header = React.createClass({
  render: function() {
    return (
      <div className="navbar">
        <img src="/assets/img/webmaker-horizontal.svg" alt="Mozilla Webmaker" className="wordmark" />
        <div className="redirect">{this.props.redirectText} <Link to={this.props.redirectPage} className="underline">{this.props.redirectLabel}</Link></div>
      </div>
    );
  }
});

module.exports = Header;
