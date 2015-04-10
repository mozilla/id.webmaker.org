var Router = require('react-router');
var webmakerActions = require('./webmaker-actions.jsx');

require('whatwg-fetch');

module.exports = {
  checkUsername: function(username) {
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
      query = this.getQuery();
      query.username = username;
      if(json.statusCode === 404) {console.log(json)
        // user not found do something here!
        webmakerActions.displayError({'field': 'username', 'message': 'Username doesn\'t exist'});
      } else if (!json.exists) {
        // do something here
      } else if ( json.usePasswordLogin && this.getPathname().replace(/\/$/, "") !== '/login'
                                        && this.getPathname().replace(/\/$/, "") !== '/reset-password') {
        this.transitionTo('/login', '', query );
      } else if ( !json.usePasswordLogin ) {
        this.transitionTo('/migrate', '', query );
      }
    }).catch((ex) => {
      console.error("Request failed", ex);
    });
  }
};
