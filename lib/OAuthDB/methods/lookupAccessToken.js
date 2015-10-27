/* jshint esnext: true */

'use strict';

module.exports = function(accessToken, callback) {
  this.crypto.saltToken(accessToken)
  .then((saltedToken) => {
    return this.getAccessToken(saltedToken);
  })
  .then((token) => {
    if ( !token.length ) {
      throw this.unauthorized('Invalid access token');
    }

    callback(null, token[0]);
  })
  .catch(callback);
};
