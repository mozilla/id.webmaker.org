/* jshint esnext: true */

'use strict';

const Boom = require('boom');

module.exports = function(accessToken, callback) {
  this.utils.saltToken(accessToken)
  .then((saltedToken) => {
    return this.getAccessToken(saltedToken);
  })
  .then(function(token) {
    if ( !token.length ) {
      return callback(Boom.unauthorized('Invalid Access Token'));
    }

    callback(null, token[0]);
  })
  .catch(callback);
};
