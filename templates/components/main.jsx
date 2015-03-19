var React = require('react');

// This wraps every view
var App = React.createClass({
  render: function() {
    return (
      <div>Hello World Cade is here!</div>
    );
  }
});

React.render( <App/>, document.body);
