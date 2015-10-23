/* jshint esnext: true */

const Boom = require('boom');

module.exports = function(uid, password, callback) {
  let fetchedUser;

  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      return callback(Boom.notFound('User not found'));
    }
    fetchedUser = user[0];
    return this.crypto.generateSalt();
  })
  .then((salt) => {
    return this.crypto.hash(password, salt);
  })
  .then((saltedHash) => {
    return this.setPassword(fetchedUser.id, password);
  })
  .then(() => {
    return callback(null, fetchedUser);
  })
  .catch(callback);
};
