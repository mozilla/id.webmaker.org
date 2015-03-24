var Boom = require('boom');
var crypto = require('crypto');
var Hoek = require('hoek');

var OAuthDB = function OAuthDB(clients) {
  this.clients = {};
  clients.forEach(function(client) {
    this.clients[client.client_id] = client;
  }, this);
  this.authCodes = {};
};

OAuthDB.prototype.getClient = function(clientId, callback) {
  if (!this.clients[clientId]) {
    return process.nextTick(function() {
      callback(Boom.badRequest('invalid client_id'));
    });
  }

  process.nextTick(function() {
    callback(null, this.clients[clientId]);
  }.bind(this));
};

OAuthDB.prototype.generateAuthCode = function(clientId, userId, scopes, expiresAt, callback) {
  crypto.randomBytes(32, function(err, random) {
    Hoek.assert(!err, err);

    var authCode = random.toString('hex');

    this.authCodes[authCode] = {
      client_id: clientId,
      user_id: userId,
      scopes: scopes,
      expires_at: expiresAt
    };

    callback(null, authCode);
  }.bind(this));
};

module.exports = OAuthDB;
