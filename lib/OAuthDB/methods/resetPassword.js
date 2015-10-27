/* jshint esnext: true */

'use strict';

const hatchet = require('hatchet');

module.exports = function(code, uid, password, callback) {
  let fetchedUser;

  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      throw this.unauthorized('invalid request');
    }

    fetchedUser = user[0];
    return this.crypto.saltToken(code);
  })
  .then((saltedCode) => {
    return this.getResetCode(saltedCode);
  })
  .then((resetCode) => {
    resetCode = resetCode[0];
    if (!resetCode) {
      throw this.unauthorized('Invalid reset code');
    }

    if (resetCode.user_id !== fetchedUser.id) {
      throw this.unauthorized('Invalid reset code');
    }

    if (!resetCode.valid) {
      throw this.unauthorized('This code was used already');
    }

    if (resetCode.created_at <= Date.now() - this.RESET_EXPIRY_TIME) {
      throw this.unauthorized('Reset code has expired');
    }

    return this.invalidateUserResetCodes(fetchedUser.id);
  })
  .then(() => {
    return this.crypto.generateSalt();
  })
  .then((salt) => {
    return this.crypto.hash(password, salt);
  })
  .then((saltedHash) => {
    return this.setPassword(fetchedUser.id, saltedHash);
  })
  .then((user) => {
    hatchet.send('user-password-changed', {
      email: fetchedUser.email,
      username: fetchedUser.username,
      id: fetchedUser.id
    });
    callback(null, user[0]);
  })
  .catch(callback);
};
