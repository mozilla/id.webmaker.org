/* jshint esnext: true */

'use strict';

module.exports = function(uid, callback) {
  this.getUser(uid)
  .then((user) => {
    if (!user.length) {
      return callback({
        exists: false
      });
    }

    user = user[0];

    // be careful with this line! if salted_hash is null for a user,
    // it indicates we must put them through the 'migrate flow'.
    let mustMigrate = !(user.salted_hash);

    callback(null, {
      exists: true,
      mustMigrate
    });
  })
  .catch(callback);
};
