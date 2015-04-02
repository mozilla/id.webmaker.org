var Boom = require('boom');
var crypto = require('crypto');
var Hoek = require('hoek');

var OAuthDB = function OAuthDB(clients, authorizations, tokens) {
  this.clients = {};
  this.authCodes = {};
  this.accessTokens = {};

  clients.forEach(function(client) {
    this.clients[client.client_id] = client;
  }, this);

  Object.keys(authorizations).forEach(function(auth) {
    this.authCodes[auth] = authorizations[auth];
  }, this);

  tokens.forEach(function(token) {
    this.accessTokens[token.access_token] = token;
  }, this);
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

OAuthDB.prototype.verifyAuthCode = function(authCode, clientId, callback) {
  if ( !this.authCodes[authCode] ) {
    return process.nextTick(function() {
      callback(Boom.forbidden('invalid auth code'));
    });
  }

  if ( this.authCodes[authCode].client_id !== clientId ) {
    return process.nextTick(function() {
      callback(Boom.forbidden('invalid client id'));
    });
  }

  if ( this.authCodes[authCode].expires_at <= Date.now() ) {
    return process.nextTick(function() {
      callback(Boom.forbidden('auth code expired'));
    });
  }

  callback(null, this.authCodes[authCode]);
};

OAuthDB.prototype.generateAccessToken = function(clientId, userId, scopes, expiresAt, callback) {
  crypto.randomBytes(32, function(err, random) {
    Hoek.assert(!err, err);

    var accessToken = random.toString('hex');

    this.accessTokens[accessToken] = {
      access_token: accessToken,
      client_id: clientId,
      user_id: userId,
      scopes: scopes,
      expires_at: expiresAt
    };

    callback(null, this.accessTokens[accessToken]);
  }.bind(this));
};

OAuthDB.prototype.lookupAccessToken = function(token, callback) {
  var accessToken = this.accessTokens[token];

  if ( !accessToken ) {
    return callback(Boom.unauthorized('Invalid Access Token'));
  }

  callback(null, accessToken);
};

module.exports = OAuthDB;
