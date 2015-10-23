/* jshint esnext: true */

const Boom = require('boom');

module.exports = function(authCode, clientId, callback) {
  this.crypto.saltToken(authCode)
  .then((saltedCode) => {
    this.getAuthCode(saltedCode);
  })
  .then((code) => {
    if (!code) {
      return callback(Boom.forbidden('invalid auth code'));
    }

    if ( code.client_id !== clientId ) {
      return callback(Boom.forbidden('invalid client id'));
    }

    if ( code.expires_at <= Date.now() ) {
      return callback(Boom.forbidden('auth code expired'));
    }

    return this.deleteAuthCode(code.auth_code);
  })
  .then((deletedRecord) => {
    callback(null, deletedRecord);
  })
  .catch(callback);
};
