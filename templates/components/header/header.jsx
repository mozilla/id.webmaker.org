var React = require('react');
var ga = require('react-ga');
var Router = require('react-router');
var Link = Router.Link;

var Header = React.createClass({
  propTypes: {
    origin: React.PropTypes.string.isRequired
  },
  render: function() {
    var className = "navbar" + (this.props.className ? " " + this.props.className : "");
    var redirectText = !this.props.mobile ? this.props.redirectText || "Need an account?" : '';
    var redirectLabel = this.props.redirectLabel || "Sign up";
    var redirectPage = this.props.redirectPage || "signup";
    var redirectQuery = this.props.redirectQuery;
    var origin = this.props.origin;

    return (
      <div className={className}>
        <img src="/assets/img/mozilla-logo.svg" alt="Mozilla" className="wordmark" />
      </div>
    );
  },
  handleGA: function(name, origin) {
    ga.event({category: origin, action: 'Clicked on ' + name + ' link.'});
  }
});

module.exports = Header;
