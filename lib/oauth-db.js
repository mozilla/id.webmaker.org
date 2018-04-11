var Boom = require('boom');
var crypto = require('crypto');
var Hoek = require('hoek');
const { Pool } = require('pg');
var queries = require('./queries');
var connectionString = process.env.POSTGRE_CONNECTION_STRING;
var salt = process.env.TOKEN_SALT;

const pool = new Pool({
  connectionString
});

var OAuthDB = function OAuthDB() {
  Hoek.assert(connectionString, 'You must provide a connection string to a PostgreSQL database');
  Hoek.assert(salt, 'You must define a TOKEN_SALT for salting auth codes and access tokens');
};

function executeQuery(query, params, callback) {
  pool.connect(function(err, client, release) {
    if ( err ) {
      release();
      return callback(err);
    }

    client.query({
      text: query,
      values: params
    }, function(err, result) {
      release();
      if ( err ) {
        return callback(err);
      }

      callback(null, result.rows[0]);
    });
  });
}

OAuthDB.prototype.getClient = function(clientId) {
  return new Promise(function(resolve, reject) {
    executeQuery(queries.get.client, [clientId], function(err, client) {
      if ( err ) {
        return reject(err);
      }

      if (!client) {
        return reject(Boom.badRequest('invalid client_id'));
      }

      resolve(client);
    });
  });
};

OAuthDB.prototype.generateAuthCode = function(clientId, userId, scopes, expiresAt) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, function(err, random) {
      if (err) {
        return reject(err);
      }

      var authCode = random.toString('hex');

      var saltedCode = crypto.createHmac('sha256', salt)
        .update(authCode)
        .digest('hex');

      executeQuery(queries.create.authCode, [
        saltedCode,
        clientId,
        userId,
        JSON.stringify(scopes),
        expiresAt
      ], function(err) {
        if ( err ) {
          return reject(err);
        }

        resolve(authCode);
      });
    });
  });
};

OAuthDB.prototype.verifyAuthCode = function(authCode, clientId) {
  var saltedCode = crypto.createHmac('sha256', salt)
    .update(authCode)
    .digest('hex');

  return new Promise((resolve, reject) => {
    executeQuery(queries.get.authCode, [saltedCode], function(err, code) {
      if ( err ) {
        return reject(err);
      }

      if ( !code ) {
        return reject(Boom.forbidden('invalid auth code'));
      }

      if ( code.client_id !== clientId ) {
        return reject(Boom.forbidden('invalid client id'));
      }

      if ( code.expires_at <= Date.now() ) {
        return reject(Boom.forbidden('auth code expired'));
      }

      executeQuery(queries.remove.authCode, [saltedCode], function(err) {
        if ( err ) {
          return reject(err);
        }

        resolve(code);
      });
    });
  });
};

OAuthDB.prototype.generateAccessToken = function(clientId, userId, scopes) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, function(err, random) {
      if (err) {
        return reject(err);
      }

      var accessToken = random.toString('hex');

      var saltedToken = crypto.createHmac('sha256', salt)
        .update(accessToken)
        .digest('hex');

      executeQuery(queries.create.accessToken, [
        saltedToken,
        clientId,
        userId,
        JSON.stringify(scopes)
      ], function(err) {
        if ( err ) {
          return reject(err);
        }

        resolve(accessToken);
      });
    });
  });
};

OAuthDB.prototype.lookupAccessToken = function(accessToken) {
  var saltedToken = crypto.createHmac('sha256', salt)
    .update(accessToken)
    .digest('hex');

  return new Promise((resolve, reject) => {
    executeQuery(queries.get.accessToken, [saltedToken], function(err, token) {
      if ( err ) {
        return reject(err);
      }

      if ( !token ) {
        return reject(Boom.unauthorized('Invalid Access Token'));
      }

      resolve(token);
    });
  });
};

module.exports = OAuthDB;
