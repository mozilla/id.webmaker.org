/* jshint esnext: true */

'use strict';

module.exports = function(clientId, userId, scopes, callback) {
  let generatedAccessToken;
  this.crypto.generateToken()
  .then((accessToken) => {
    generatedAccessToken = accessToken;
    return this.crypto.saltToken(accessToken);
  })
  .then((saltedToken) => {
    return this.insertAccessToken(
      saltedToken,
      clientId,
      userId,
      JSON.stringify(scopes)
    );
  })
  .then(function() {
    callback(null, generatedAccessToken);
  })
  .catch(callback);
};
