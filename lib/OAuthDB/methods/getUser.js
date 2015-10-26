/* jshint esnext: true */

'use strict';

const Boom = require('boom');

module.exports = function(id, callback) {
  this.getUserById(id)
  .then((user) => {
    if (!user.length) {
      return callback(Boom.notFound('User not found'));
    }
    callback(null, user[0]);
  })
  .catch(callback);
};
