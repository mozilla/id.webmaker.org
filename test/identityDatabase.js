/* jshint esnext: true */

'use strict';

require('habitat').load('tests.env');

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var expect = require('code').expect;
// var sinon = require('sinon');

var IdentityDatabase = require('../lib/IdentityDatabase');

const POSTGRE_CONNECTION_STRING = process.env.POSTGRE_CONNECTION_STRING;
const RANDOM_BYTE_COUNT = process.env.RANDOM_BYTE_COUNT;
const RESET_EXPIRY_TIME = process.env.RESET_EXPIRY_TIME;
const POSTGRE_POOL_MIN = process.env.POSTGRE_POOL_MIN;
const POSTGRE_POOL_MAX = process.env.POSTGRE_POOL_MAX;
const BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS;
const TOKEN_SALT = process.env.TOKEN_SALT;
const SERVER_URI = 'http://IdentityDatabase.localhost';

const IDENTITY_DATABASE_VALID_SETTINGS = {
  POSTGRE_CONNECTION_STRING,
  RANDOM_BYTE_COUNT,
  RESET_EXPIRY_TIME,
  POSTGRE_POOL_MIN,
  POSTGRE_POOL_MAX,
  BCRYPT_ROUNDS,
  TOKEN_SALT,
  SERVER_URI
};

// const SIMULATED_ERR = new Error('Simulated error');

experiment('IdentityDatabase class', function() {
  test('Can be instantiated', function(done) {
    function instantiate() {
      var identityDatabase = new IdentityDatabase(IDENTITY_DATABASE_VALID_SETTINGS);
      expect(identityDatabase).to.exist();
      expect(identityDatabase.constructor).to.equal(IdentityDatabase);
    }

    expect(instantiate).to.not.throw();
    done();
  });

  test('throws without all required settings', function(done) {
    function noOptions() {
      new IdentityDatabase();
    }

    function noPGConnString() {
      new IdentityDatabase({
        RANDOM_BYTE_COUNT,
        RESET_EXPIRY_TIME,
        POSTGRE_POOL_MIN,
        POSTGRE_POOL_MAX,
        BCRYPT_ROUNDS,
        TOKEN_SALT,
        SERVER_URI
      });
    }

    function noByteCount() {
      new IdentityDatabase({
        POSTGRE_CONNECTION_STRING,
        RESET_EXPIRY_TIME,
        POSTGRE_POOL_MIN,
        POSTGRE_POOL_MAX,
        BCRYPT_ROUNDS,
        TOKEN_SALT,
        SERVER_URI
      });
    }

    function noResetExpiry() {
      new IdentityDatabase({
        POSTGRE_CONNECTION_STRING,
        RANDOM_BYTE_COUNT,
        POSTGRE_POOL_MIN,
        POSTGRE_POOL_MAX,
        BCRYPT_ROUNDS,
        TOKEN_SALT,
        SERVER_URI
      });
    }

    function noPoolMin() {
      new IdentityDatabase({
        POSTGRE_CONNECTION_STRING,
        RANDOM_BYTE_COUNT,
        RESET_EXPIRY_TIME,
        POSTGRE_POOL_MAX,
        BCRYPT_ROUNDS,
        TOKEN_SALT,
        SERVER_URI
      });
    }

    function noPoolMax() {
      new IdentityDatabase({
        POSTGRE_CONNECTION_STRING,
        RANDOM_BYTE_COUNT,
        RESET_EXPIRY_TIME,
        POSTGRE_POOL_MIN,
        BCRYPT_ROUNDS,
        TOKEN_SALT,
        SERVER_URI
      });
    }

    function noRounds() {
      new IdentityDatabase({
        POSTGRE_CONNECTION_STRING,
        RANDOM_BYTE_COUNT,
        RESET_EXPIRY_TIME,
        POSTGRE_POOL_MIN,
        POSTGRE_POOL_MAX,
        TOKEN_SALT,
        SERVER_URI
      });
    }

    function noTokenSalt() {
      new IdentityDatabase({
        POSTGRE_CONNECTION_STRING,
        RANDOM_BYTE_COUNT,
        RESET_EXPIRY_TIME,
        POSTGRE_POOL_MIN,
        POSTGRE_POOL_MAX,
        BCRYPT_ROUNDS,
        SERVER_URI
      });
    }

    function noServerURI() {
      new IdentityDatabase({
        POSTGRE_CONNECTION_STRING,
        RANDOM_BYTE_COUNT,
        RESET_EXPIRY_TIME,
        POSTGRE_POOL_MIN,
        POSTGRE_POOL_MAX,
        BCRYPT_ROUNDS,
        TOKEN_SALT
      });
    }

    expect(noOptions).to.throw();
    expect(noPGConnString).to.throw();
    expect(noByteCount).to.throw();
    expect(noResetExpiry).to.throw();
    expect(noPoolMin).to.throw();
    expect(noPoolMax).to.throw();
    expect(noRounds).to.throw();
    expect(noTokenSalt).to.throw();
    expect(noServerURI).to.throw();
    done();
  });

  test('Instantiated Object has expected functions', function(done) {
    var identityDatabase = new IdentityDatabase(IDENTITY_DATABASE_VALID_SETTINGS);

    expect(identityDatabase.unauthorized).to.be.a.function();
    expect(identityDatabase.generateResetEmailLink).to.be.a.function();
    expect(identityDatabase.getClient).to.be.a.function();
    expect(identityDatabase.getAuthCode).to.be.a.function();
    expect(identityDatabase.getAccessToken).to.be.a.function();
    expect(identityDatabase.insertAccessToken).to.be.a.function();
    expect(identityDatabase.deleteAuthCode).to.be.a.function();
    expect(identityDatabase.insertUser).to.be.a.function();
    expect(identityDatabase.getUserById).to.be.a.function();
    expect(identityDatabase.getUser).to.be.a.function();
    expect(identityDatabase.getResetCode).to.be.a.function();
    expect(identityDatabase.invalidateResetCode).to.be.a.function();
    expect(identityDatabase.setPassword).to.be.a.function();
    done();
  });

  experiment('identityDatabase.unauthorized', function(done) {
    var identityDatabase;

    before(function(done) {
      identityDatabase = new IdentityDatabase(IDENTITY_DATABASE_VALID_SETTINGS);
      done();
    });

    test('returns a boom object', function(done) {
      var boom = identityDatabase.unauthorized('test', { some: 'details' });

      expect(boom.isBoom).to.be.true();
      done();
    });
  });

  experiment('identityDatabase.generateResetEmailLink', function(done) {
    var identityDatabase;
    var url = require('url');

    before(function(done) {
      identityDatabase = new IdentityDatabase(IDENTITY_DATABASE_VALID_SETTINGS);
      done();
    });

    test('returns a boom object', function(done) {
      var link = identityDatabase.generateResetEmailLink(
        '/reset-path',
        {
          client_id: 'client-id',
          response_type: 'code',
          state: 'gVldfpGiqZz7UBt1cSKEjKLiBrXMwg6z',
          scopes: 'user email'
        },
        'webmaker',
        'PmXe8EEjSbVV5y4fX5zZAy2BsYA6zOD0L1Qc'
      );

      var parsed = url.parse(link, true);

      expect(link).to.be.a.string();
      expect(parsed.host).to.equal('identitydatabase.localhost');
      expect(parsed.pathname).to.equal('/reset-path');
      expect(parsed.query.client_id).to.equal('client-id');
      expect(parsed.query.response_type).to.equal('code');
      expect(parsed.query.state).to.equal('gVldfpGiqZz7UBt1cSKEjKLiBrXMwg6z');
      expect(parsed.query.scopes).to.equal('user email');
      expect(parsed.query.uid).to.equal('webmaker');
      expect(parsed.query.resetCode).to.equal('PmXe8EEjSbVV5y4fX5zZAy2BsYA6zOD0L1Qc');
      done();
    });
  });

  experiment('identityDatabase.getClient', function(done) {
    var identityDatabase;

    before(function(done) {
      identityDatabase = new IdentityDatabase(IDENTITY_DATABASE_VALID_SETTINGS);
      done();
    });

    test('returns a client object', function(done) {
      identityDatabase.getClient('test')
      .then(function(results) {
        expect(results.length).to.equal(1);
        expect(results[0].client_id).to.equal('test');
        expect(results[0].allowed_grants).to.include(['password', 'authorization_code']);
        expect(results[0].allowed_responses).to.include(['code', 'token']);
        expect(results[0].redirect_uri).to.equal('http://example.org/oauth_redirect');
        done();
      });
    });
  });

  experiment('identityDatabase.getAuthCode', function(done) {
    var identityDatabase;

    before(function(done) {
      identityDatabase = new IdentityDatabase(IDENTITY_DATABASE_VALID_SETTINGS);
      done();
    });

    test('returns an auth code', function(done) {
      identityDatabase.getAuthCode('5f44fbc4ef93be753889cd5a15080da4976adb7decf7fed27aed5310bb945a0b')
      .then(function(results) {
        expect(results.length).to.equal(1);
        expect(results[0].auth_code).to.equal('5f44fbc4ef93be753889cd5a15080da4976adb7decf7fed27aed5310bb945a0b');
        expect(results[0].client_id).to.equal('test');
        expect(results[0].user_id).to.equal('1');
        expect(results[0].scopes).to.include('user');
        done();
      });
    });
  });

  experiment('identityDatabase.getAccessToken', function(done) {
    var identityDatabase;

    before(function(done) {
      identityDatabase = new IdentityDatabase(IDENTITY_DATABASE_VALID_SETTINGS);
      done();
    });

    test('returns an auth code', function(done) {
      identityDatabase.getAccessToken('9cd559c6134517d260bb0c3b216d9c749d7c8904577f63b09bc0a9ed2f3edf1d')
      .then(function(results) {
        expect(results.length).to.equal(1);
        expect(results[0].access_token).to.equal('9cd559c6134517d260bb0c3b216d9c749d7c8904577f63b09bc0a9ed2f3edf1d');
        expect(results[0].client_id).to.equal('test');
        expect(results[0].user_id).to.equal('1');
        expect(results[0].scopes).to.include(['user', 'email']);
        done();
      });
    });
  });
});
