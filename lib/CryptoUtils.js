/* jshint esnext: true */

'use strict';

var bcrypt = require('bcrypt');
var crypto = require('crypto');

class CryptoUtils {
  constructor(settings) {
    Object.assign(this, settings);
  }

  generateSalt() {
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(this.BCRYPT_ROUNDS, function(err, salt) {
        if (err) {
          return reject(err);
        }

        resolve(salt);
      });
    });
  }

  hash(password, salt) {
    return new Promise(function(resolve, reject) {
      bcrypt.hash(password, salt, function(err, hash) {
        if (err) {
          reject(err);
        }

        resolve(hash);
      });
    });
  }

  compare(password, hash) {
    return new Promise(function(resolve, reject) {
      bcrypt.compare(password, hash, function(err, isMatch) {
        if (err) {
          return reject(err);
        }

        return resolve(isMatch);
      });
    });
  }

  generateToken() {
    return new Promise(function(resolve, reject) {
      crypto.randomBytes(this.RANDOM_BYTE_COUNT, function(err, random) {
        if (err) {
          return reject(err);
        }

        resolve(random.toString('hex'));
      });
    });
  }

  saltToken(token) {
    return new Promise(function(resolve) {
      var saltedToken = crypto.createHmac('sha256', this.TOKEN_SALT)
        .update(token)
        .digest('hex');

      resolve(saltedToken);
    });
  }
}

module.exports = CryptoUtils;
