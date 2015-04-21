var cookiejs = require('cookie-js');

require('isomorphic-fetch');

var csrfToken = cookiejs.parse(document.cookie).crumb;
module.exports = {
  checkUsername: function(username, callback) {
    fetch('/check-username', {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        uid: username
      })
    }).then((response) => {
      return response.json();
    }).then((json) => {
      return callback(json);
    }).catch((ex) => {
      console.error("Request failed", ex);
    });
  },
  checkEmail: function(email, callback) {
    this.setFormState({field: 'email'});
    fetch('/check-username', {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        uid: email
      })
    }).then((response) => {
      return response.json();
    }).then((json) => {
      return callback(json);
    }).catch((ex) => {
      console.error("Request failed", ex);
    });
  }
};
