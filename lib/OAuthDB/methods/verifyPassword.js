/* jshint esnext: true */

const Boom = require('boom');

function forbidden() {
  return Boom.forbidden('Not Authorized');
}

module.exports = function(password, uid, callback) {
  let userData;

  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      return callback(forbidden());
    }

    userData = user[0];

    return this.crypto.compare(password, userData.salted_hash);
  })
  .then((isMatch) => {
    if (!isMatch) {
      return callback(forbidden());
    }

    callback(null, userData);
  })
  .catch(callback);
};
