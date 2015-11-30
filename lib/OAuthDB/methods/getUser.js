/* jshint esnext: true */

'use strict';

module.exports = function(id, callback) {
  this.getUserById(id)
  .then((user) => callback(null, user[0]))
  .catch(callback);
};
