var Router = require('react-router');
var WebmakerActions = require('./webmaker-actions.jsx');

require('es6-promise').polyfill();
require('isomorphic-fetch');

module.exports = {
  checkUsername: function(id, username) {
    fetch('/check-username', {
      method: 'post',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        uid: username
      })
    }).then((response) => {
      return response.json();
    }).then((json) => {
      var query;
      var currentPath = this.getPathname().replace(/\/$/, "");
      query = this.getQuery();
      query.username = username;
      if(json.statusCode === 404 && currentPath !== '/signup') {
        // user not found do something here!
        WebmakerActions.displayError({'field': 'username', 'message': 'Whoops! We can\'t find an account with that username!'});

      } else if (json.exists && currentPath === '/signup') {
        WebmakerActions.displayError({'field': 'username', 'message': 'Username is taken!'});

      } else if (!json.exists) {
        WebmakerActions.validField({'field': 'username', 'message': 'Available'});

      } else if ( json.usePasswordLogin && currentPath !== '/login'
                                        && currentPath !== '/reset-password'
                                        && currentPath !== '/signup') {
        this.transitionTo('/login', '', query );

      } else if ( !json.usePasswordLogin ) {
        this.transitionTo('/migrate', '', query );

      } else if (currentPath === '/login'){
        WebmakerActions.validField({'field': 'username', 'message': 'Available'});
      }

    }).catch((ex) => {
      console.error("Request failed", ex);
    });
  }
};
