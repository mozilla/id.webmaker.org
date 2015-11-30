/* jshint esnext: true */

'use strict';

var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var Hoek = require('hoek');

class CryptoUtils {
  constructor(settings) {
    Hoek.assert(settings, 'Must call CryptoUtils Constructor with a settings object');
    Hoek.assert(settings.BCRYPT_ROUNDS, 'Settings object must define a BCRYPT_ROUNDS attribute');
    Hoek.assert(settings.RANDOM_BYTE_COUNT, 'Settings object must define a RANDOM_BYTE_COUNT attribute');
    Hoek.assert(settings.TOKEN_SALT, 'Settings object must define a TOKEN_SALT attribute');

    Object.assign(this, settings);
  }

  generateSalt() {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(this.BCRYPT_ROUNDS, (err, salt) => {
        if (err) {
          return reject(err);
        }

        resolve(salt);
      });
    });
  }

  hash(password, salt) {
    return new Promise((resolve, reject) => {
      if (!password || !salt) {
        return reject(new Error('You must provide a password and a salt'));
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return reject(err);
        }

        resolve(hash);
      });
    });
  }

  compare(password, hash) {
    return new Promise((resolve, reject) => {
      if (!password || !hash) {
        return reject(new Error('You must provide a password and a hash'));
      }

      bcrypt.compare(password, hash, (err, isMatch) => {
        if (err) {
          return reject(err);
        }

        return resolve(isMatch);
      });
    });
  }

  generateToken() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(this.RANDOM_BYTE_COUNT, (err, random) => {
        if (err) {
          return reject(err);
        }

        resolve(random.toString('hex'));
      });
    });
  }

  saltToken(token) {
    return new Promise((resolve, reject) => {
      if (!token) {
        return reject(new Error('You must provide a token'));
      }

      var saltedToken = crypto.createHmac('sha256', this.TOKEN_SALT)
        .update(token)
        .digest('hex');

      resolve(saltedToken);
    });
  }
}

module.exports = CryptoUtils;
