var React = require('react');

// This wraps every view
var App = React.createClass({
  render: function() {
    return (
      <div>Hellaaao</div>
    );
  }
});

React.render( <App/>, document.body);
