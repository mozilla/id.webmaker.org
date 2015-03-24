var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Link = Router.Link;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var routes = (
  <Route>
    <Route name="reset-password" path="/reset-password/?" handler={require('../pages/reset-password.jsx')}/>
    <Route name="login"          path="/login/?"          handler={require('../pages/login.jsx')}/>
    <Route name="signup"          path="/signup/?"          handler={require('../pages/signup.jsx')}/>
    <NotFoundRoute handler={require('../pages/404.jsx')}/>
  </Route>
);

module.exports = {
  routes: routes,
  run: function(location, el) {
    Router.run(routes, location, function(Handler, state) {
      React.render(<Handler/>, el);
    });
  }
};
