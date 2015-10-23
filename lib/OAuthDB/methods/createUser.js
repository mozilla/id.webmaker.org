/* jshint esnext: true */

module.exports = function(email, username, pref_locale, password, callback) {
  this.crypto.generateSalt()
  .then((salt) => {
    return this.crypto.hash(password, salt);
  })
  .then((saltedHash) => {
    return this.insertUser(email, username, pref_locale, saltedHash);
  })
  .then((user) => {
    callback(null, user[0]);
  })
  .catch(callback);
};
