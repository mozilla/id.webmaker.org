/* jshint esnext: true */

'use strict';

module.exports = function(password, uid, callback) {
  let userData;

  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      throw this.unauthorized('Not Authorized');
    }

    userData = user[0];

    return this.crypto.compare(password, userData.salted_hash);
  })
  .then((isMatch) => {
    if (!isMatch) {
      throw this.unauthorized('Not Authorized');
    }

    callback(null, userData);
  })
  .catch(callback);
};
