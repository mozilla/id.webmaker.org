/* jshint esnext: true */

'use strict';

let url = require('url');
let knex = require('knex');
var Boom = require('boom');
let CryptoUtils = require('./CryptoUtils');
let usernameRegex = /^[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\-]{1,20}$/;

class IdentityDatabase {
  constructor(options) {
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
    let urlObj = url.parse(this.SERVER_URI + path, true);
    urlObj.search = null;
    urlObj.query = oauth;
    urlObj.query.uid = username;
    urlObj.query.resetCode = code;
    return url.format(urlObj);
  }

  getUIDType(uid) {
    if (usernameRegex.test(uid)) {
      return 'username';
    }
    return 'email';
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

  insertClient(client_id, client_secret, allowed_grants, allowed_responses, redirect_uri) {
    return this.dbConnection('clients')
      .insert({
        client_id,
        client_secret,
        allowed_grants,
        allowed_responses,
        redirect_uri
      });
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
