/* jshint esnext: true */

module.exports = function(code, uid, password, callback) {
  let fetchedUser;
  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      return callback(this.forbidden('Invalid user'));
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
      return callback(this.forbidden('Invalid reset code'));
    }

    if (resetCode.user_id !== fetchedUser.id) {
      return callback(this.forbidden( 'Invalid reset code '));
    }

    if (!resetCode.valid) {
      return callback(this.forbidden( 'This code was used already '));
    }

    if (resetCode.created_at <= Date.now() - this.RESET_EXPIRY_TIME) {
      return callback(this.forbidden( 'Reset code has expired '));
    }

    return this.invalidateUserResetCodes(uid);
  })
  .then(() => {
    return this.crypto.generateSalt();
  })
  .then((salt) => {
    return this.crypto.hash(password, salt);
  })
  .then((saltedHash) => {
    return this.setPassword(fetchedUser.email, saltedHash);
  })
  .then((user) => {
    callback();
  })
  .catch(callback);
};
