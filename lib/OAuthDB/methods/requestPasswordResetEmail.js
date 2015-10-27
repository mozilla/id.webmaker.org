/* jshint esnext: true */

'use strict';

const hatchet = require('hatchet');

module.exports = function(uid, oauth, path, callback) {
  let userData;
  let generatedCode;

  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      throw this.unauthorized('invalid request');
    }

    userData = user[0];

    return this.invalidateUserResetCodes(userData.id);
  })
  .then(() => {
    return this.crypto.generateToken();
  })
  .then((token) => {
    generatedCode = token;
    return this.crypto.saltToken(token);
  })
  .then((saltedToken) => {
    return this.insertResetCode(saltedToken, userData.id);
  })
  .then(() => {
    let emailLink = this.generateResetEmailLink(path, oauth, userData.username, generatedCode);
    hatchet.send('reset_code_created', {
      username: userData.username,
      email: userData.email,
      resetUrl: emailLink
    });

    callback();
  })
  .catch(callback);
};
