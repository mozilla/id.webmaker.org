/* jshint esnext: true */

var Hoek = require('hoek');

var IdentityDatabase = require('../IdentityDatabase');

exports.register = function(server, options, done) {
  Hoek.assert(options.POSTGRE_CONNECTION_STRING, 'You must provide POSTGRE_CONNECTION_STRING');
  Hoek.assert(options.POSTGRE_POOL_MIN, 'You must provide POSTGRE_POOL_MIN');
  Hoek.assert(options.POSTGRE_POOL_MAX, 'You must provide POSTGRE_POOL_MAX');
  Hoek.assert(options.BCRYPT_ROUNDS, 'You must provide BCRYPT_ROUNDS');
  Hoek.assert(options.TOKEN_SALT, 'You must provide TOKEN_SALT');
  Hoek.assert(options.RANDOM_BYTE_COUNT, 'You must provide RANDOM_BYTE_COUNT');
  Hoek.assert(options.RESET_EXPIRY_TIME, 'You must provide RESET_EXPIRY_TIME');

  const POSTGRE_CONNECTION_STRING = options.POSTGRE_CONNECTION_STRING;
  const POSTGRE_POOL_MIN = +options.POSTGRE_POOL_MIN;
  const POSTGRE_POOL_MAX = +options.POSTGRE_POOL_MAX;
  const BCRYPT_ROUNDS = +options.BCRYPT_ROUNDS;
  const TOKEN_SALT = options.TOKEN_SALT;
  const RANDOM_BYTE_COUNT = +options.RANDOM_BYTE_COUNT;
  const SERVER_URI = server.info.uri;
  const RESET_EXPIRY_TIME = +options.RESET_EXPIRY_TIME;

  Hoek.assert(POSTGRE_POOL_MIN <= POSTGRE_POOL_MAX, 'POSTGRE_POOL_MIN must be less than or equal to POSTGRE_POOL_MAX');

  var identityDatabase = new IdentityDatabase({
    POSTGRE_CONNECTION_STRING,
    POSTGRE_POOL_MIN,
    POSTGRE_POOL_MAX,
    BCRYPT_ROUNDS,
    TOKEN_SALT,
    RANDOM_BYTE_COUNT,
    SERVER_URI,
    RESET_EXPIRY_TIME
  });

  const bindToIdentityDatabase = {
    bind: identityDatabase
  };

  server.method(
    'OAuthDB.getClient',
    require('./methods/getClient'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.generateAuthCode',
    require('./methods/generateAuthCode'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.verifyAuthCode',
    require('./methods/verifyAuthCode'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.generateAccessToken',
    require('./methods/generateAccessToken'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.lookupAccessToken',
    require('./methods/lookupAccessToken'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.createUser',
    require('./methods/createUser'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.verifyPassword',
    require('./methods/verifyPassword'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.requestPasswordResetEmail',
    require('./methods/requestPasswordResetEmail'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.resetPassword',
    require('./methods/resetPassword'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.getUser',
    require('./methods/getUser'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.requestMigrateToken',
    require('./methods/requestMigrateToken'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.verifyMigrateToken',
    require('./methods/verifyMigrateToken'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.setPassword',
    require('./methods/setPassword'),
    bindToIdentityDatabase
  );

  server.method(
    'OAuthDB.checkUsername',
    require('./methods/checkUsername'),
    bindToIdentityDatabase
  );

  done();
};

exports.register.attributes = {
  name: 'oauth-db'
};
