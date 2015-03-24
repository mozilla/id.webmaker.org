var Boom = require('boom');
var crypto = require('crypto');
var Hoek = require('hoek');

var OAuthDB = function OAuthDB(clients) {
  this.clients = {};
  clients.forEach(function(client) {
    this.clients[client.client_id] = client;
  }, this);
  this.auth_codes = {};
};

OAuthDB.prototype.get_client = function(client_id, callback) {
  if (!this.clients[client_id]) {
    return process.nextTick(function() {
      callback(Boom.badRequest('invalid client_id'));
    });
  }

  process.nextTick(function() {
    callback(null, this.clients[client_id]);
  }.bind(this));
};

OAuthDB.prototype.generate_auth_code = function(client_id, user_id, scopes, expires_at, callback) {
  crypto.randomBytes(32, function(err, random) {
    Hoek.assert(!err, err);

    var auth_code = random.toString('hex');

    this.auth_codes[auth_code] = {
      client_id: client_id,
      user_id: user_id,
      scopes: scopes,
      expires_at: expires_at
    };

    callback(null, auth_code);
  }.bind(this));
};

module.exports = OAuthDB;
