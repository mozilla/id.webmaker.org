/* jshint esnext: true */
'use strict';

module.exports = function(clientId, userId, scopes, expiresAt, callback) {
  let generatedAuthCode;
  this.crypto.generateToken()
  .then((authCode) => {
    generatedAuthCode = authCode;
    return this.crypto.saltToken(authCode);
  })
  .then((saltedCode) => {
    return this.insertAuthCode(
      saltedCode,
      clientId,
      userId,
      JSON.stringify(scopes),
      expiresAt
    );
  })
  .then(function() {
    callback(null, generatedAuthCode);
  })
  .catch(callback);
};
