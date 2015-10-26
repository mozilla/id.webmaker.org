/* jshint esnext: true */

'use strict';

const Boom = require('boom');

module.exports = function(clientId, callback) {
  this.getClient(clientId)
  .then((client) => {
    if (!client.length) {
      return callback(Boom.badRequest('invalid client_id'));
    }
    callback(null, client[0]);
  })
  .catch(callback);
};
