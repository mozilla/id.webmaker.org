/* jshint esnext: true */

'use strict';
module.exports = function(authCode, clientId, callback) {
  this.crypto.saltToken(authCode)
  .then((saltedCode) => {
    return this.getAuthCode(saltedCode);
  })
  .then((code) => {
    if (!code.length) {
      throw this.unauthorized('Invalid auth code');
    }

    code = code[0];

    if ( code.client_id !== clientId ) {
      throw this.unauthorized('Invalid client id');
    }

    if ( code.expires_at <= Date.now() ) {
      throw this.unauthorized('Auth code has expired');
    }

    return this.deleteAuthCode(code.auth_code);
  })
  .then((deletedRecord) => {
    callback(null, deletedRecord[0]);
  })
  .catch(callback);
};
