var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Header = React.createClass({
  render: function() {
    var className = "navbar" + (this.props.className ? " " + this.props.className : "");
    var redirectText = !this.props.mobile ? this.props.redirectText || "Need an account?" : '';
    var redirectLabel = this.props.redirectLabel || "Sign up";
    var redirectPage = this.props.redirectPage || "signup";
    var redirectQuery = this.props.redirectQuery;

    return (
      <div className={className}>
        <img src="/assets/img/webmaker-horizontal.svg" alt="Mozilla Webmaker" className="wordmark" />
        <div className="redirect"><span ref="text">{redirectText}</span> <Link to={redirectPage} query={redirectQuery} className="underline" ref="link">{redirectLabel}</Link></div>
      </div>
    );
  }
});

module.exports = Header;
