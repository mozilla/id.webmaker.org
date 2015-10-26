/* jshint esnext: true */

'use strict';

const hatchet = require('hatchet');
const Boom = require('boom');
const path = '/reset-password';

module.exports = function(uid, oauth, callback) {
  let userData;
  let generatedCode;

  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      return callback(Boom.noFound('User not found'));
    }

    userData = user[0];

    return this.invalidateUserResetCodes(userData.username);
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
    let emailLink = this.generateEmailLink(path, oauth, userData.username, generatedCode);
    hatchet.send('reset_code_created', {
      username: userData.username,
      email: userData.email,
      resetUrl: emailLink
    });
    callback(null, generatedCode);
  })
  .catch(callback);
};
