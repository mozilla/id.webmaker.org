/* jshint esnext: true */

'use strict';

var url = require('url');
var knex = require('knex');
var Boom = require('boom');
var Hoek = require('hoek');
var CryptoUtils = require('./CryptoUtils');

class IdentityDatabase {
  constructor(options) {
    Hoek.assert(
      options && typeof options === 'object',
      'IdentityDatabase constructor must be called with an options object'
    );
    Hoek.assert(options.POSTGRE_CONNECTION_STRING, 'Options object must define a POSTGRE_CONNECTION_STRING');
    Hoek.assert(options.RANDOM_BYTE_COUNT, 'Options object must define a RANDOM_BYTE_COUNT');
    Hoek.assert(options.RESET_EXPIRY_TIME, 'Options object must define RESET_EXPIRY_TIME');
    Hoek.assert(options.POSTGRE_POOL_MIN, 'Options object must define POSTGRE_POOL_MIN');
    Hoek.assert(options.POSTGRE_POOL_MAX, 'Options object must define POSTGRE_POOL_MAX');
    Hoek.assert(options.BCRYPT_ROUNDS, 'Options object must define BCRYPT_ROUNDS');
    Hoek.assert(options.TOKEN_SALT, 'Options object must define TOKEN_SALT');
    Hoek.assert(options.SERVER_URI, 'Options object must define SERVER_URI');

    this.dbConnection = knex({
      client: 'pg',
      connection: options.POSTGRE_CONNECTION_STRING,
      pool: {
        min: options.POSTGRE_POOL_MIN,
        max: options.POSTGRE_POOL_MAX
      }
    });

    this.crypto = new CryptoUtils({
      BCRYPT_ROUNDS: +options.BCRYPT_ROUNDS,
      TOKEN_SALT: options.TOKEN_SALT,
      RANDOM_BYTE_COUNT: +options.RANDOM_BYTE_COUNT
    });

    this.RESET_EXPIRY_TIME = options.RESET_EXPIRY_TIME;
    this.SERVER_URI = options.SERVER_URI;
  }

  unauthorized(reason, details) {
    return Boom.unauthorized(reason, details);
  }

  generateResetEmailLink(path, oauth, username, code) {
    var urlObj = url.parse(this.SERVER_URI + path, true);
    urlObj.search = null;
    urlObj.query = oauth;
    urlObj.query.uid = username;
    urlObj.query.resetCode = code;
    return url.format(urlObj);
  }

  getClient(id) {
    return this.dbConnection('clients')
      .select('client_id', 'client_secret', 'allowed_grants', 'allowed_responses', 'redirect_uri')
      .where('client_id', '=', id);
  }

  getAuthCode(code) {
    return this.dbConnection('auth_codes')
      .select('auth_code', 'client_id', 'user_id', 'scopes', 'created_at', 'expires_at')
      .where('auth_code', '=', code);
  }

  getAccessToken(accessToken) {
    return this.dbConnection('access_tokens')
      .select('access_token', 'client_id', 'user_id', 'scopes', 'created_at')
      .where('access_token', '=', accessToken);
  }

  insertAuthCode(auth_code, client_id, user_id, scopes, expires_at) {
    return this.dbConnection('auth_codes')
      .insert({
        auth_code,
        client_id,
        user_id,
        scopes,
        expires_at
      });
  }

  insertAccessToken(access_token, client_id, user_id, scopes) {
    return this.dbConnection('access_tokens')
      .insert({
        access_token,
        client_id,
        user_id,
        scopes
      });
  }

  deleteAuthCode(auth_code) {
    return this.dbConnection('auth_codes')
      .where('auth_code', '=', auth_code)
      .del()
      .returning(['auth_code', 'client_id', 'user_id', 'scopes', 'created_at', 'expires_at']);
  }

  insertUser(email, username, pref_locale, salted_hash) {
    return this.dbConnection('users')
      .insert({
        email,
        username,
        pref_locale,
        salted_hash
      })
      .returning(['id', 'username', 'email', 'pref_locale']);
  }

  getUserById(id) {
    return this.dbConnection('users')
      .select()
      .where('id', '=', id);
  }

  getUser(uid) {
    return this.dbConnection('users')
      .select()
      .where('email', '=', uid)
      .orWhere('username', '=', uid);
  }

  insertResetCode(code, user_id) {
    return this.dbConnection('reset_codes')
      .insert({
        code,
        user_id
      });
  }

  getResetCode(code) {
    return this.dbConnection('reset_codes')
      .select()
      .where('code', '=', code);
  }

  invalidateUserResetCodes(id) {
    return this.dbConnection('reset_codes')
      .where('user_id', '=', id)
      .andWhere('valid', '=', true)
      .update({
        valid: false
      });
  }

  setPassword(id, salted_hash) {
    return this.dbConnection('users')
      .where('id', '=', id)
      .update({
        salted_hash
      });
  }
}

module.exports = IdentityDatabase;
