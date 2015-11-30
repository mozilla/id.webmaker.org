/* jshint esnext: true */

'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var experiment = lab.experiment;
var test = lab.test;
var before = lab.before;
var expect = require('code').expect;
var sinon = require('sinon');
var nodeCrypto = require('crypto');

var bcrypt = require('bcryptjs');
var CryptoUtils = require('../lib/CryptoUtils');

const BCRYPT_ROUNDS = 5;
const RANDOM_BYTE_COUNT = 36;
const TOKEN_SALT = 'Sea Salt';

const CRYPTO_UTILS_VALID_SETTINGS = {
  BCRYPT_ROUNDS,
  RANDOM_BYTE_COUNT,
  TOKEN_SALT
};

const SIMULATED_ERR = new Error('Simulated error from bcryptjs');

experiment('CryptoUtils class', function() {
  test('Can be instantiated', function(done) {
    function instantiate() {
      var cryptoUtils = new CryptoUtils(CRYPTO_UTILS_VALID_SETTINGS);
      expect(cryptoUtils).to.exist();
    }

    expect(instantiate).to.not.throw();
    done();
  });

  test('throws without all required settings', function(done) {
    function noSettings() {
      new CryptoUtils();
    }

    function noTokenSalt() {
      new CryptoUtils({
        BCRYPT_ROUNDS,
        RANDOM_BYTE_COUNT
      });
    }

    function noRounds() {
      new CryptoUtils({
        RANDOM_BYTE_COUNT,
        TOKEN_SALT
      });
    }

    function noByteCount() {
      new CryptoUtils({
        BCRYPT_ROUNDS,
        TOKEN_SALT
      });
    }

    expect(noSettings).to.throw();
    expect(noTokenSalt).to.throw();
    expect(noRounds).to.throw();
    expect(noByteCount).to.throw();
    done();
  });

  test('Instantiated Object has expected functions', function(done) {
    var cryptoUtils = new CryptoUtils(CRYPTO_UTILS_VALID_SETTINGS);

    expect(cryptoUtils.constructor).to.equal(CryptoUtils);
    expect(cryptoUtils.generateSalt).to.be.a.function();
    expect(cryptoUtils.hash).to.be.a.function();
    expect(cryptoUtils.compare).to.be.a.function();
    expect(cryptoUtils.generateToken).to.be.a.function();
    expect(cryptoUtils.saltToken).to.be.a.function();
    done();
  });

  experiment('CryptoUtils.generateSalt', function() {
    var crypto;
    before(function(done) {
      crypto = new CryptoUtils(CRYPTO_UTILS_VALID_SETTINGS);
      done();
    });

    test('Generates a salt', function(done) {
      crypto.generateSalt()
      .then((salt) => {
        expect(salt).to.exist();
        expect(salt).to.be.a.string();
        done();
      })
      .catch((err) => {
        expect('This callback should not be called').to.be.false();
        done();
      });
    });

    test('Rejects the Promise if bcryptjs throws', function(done) {
      sinon.stub(bcrypt, 'genSalt')
      .callsArgWith(1, SIMULATED_ERR);

      crypto.generateSalt()
      .then(() => {
        bcrypt.genSalt.restore();
        throw new Error('This should not get called');
      })
      .catch((err) => {
        bcrypt.genSalt.restore();
        expect(err).to.equal(SIMULATED_ERR);
        done();
      });
    });
  });

  experiment('CryptoUtils.hash', function() {
    const PASS = 'secret';
    var crypto;
    var salt1;
    var salt2;

    before(function(done) {
      crypto = new CryptoUtils(CRYPTO_UTILS_VALID_SETTINGS);
      crypto.generateSalt()
      .then((genSalt) => {
        salt1 = genSalt;
        return crypto.generateSalt();
      })
      .then((genSalt) => {
        salt2 = genSalt;
        done();
      })
      .catch((err) => {
        throw new Error('This should not get called');
      });
    });

    test('Generates a hash', function(done) {
      crypto.hash(PASS, salt1)
      .then((hash) => {
        expect(hash).to.exist();
        expect(hash).to.be.a.string();
        done();
      })
      .catch((err) => {
        expect('This callback should not be called').to.be.false();
        done();
      });
    });

    test('Rejects the Promise if no password provided', function(done) {
      crypto.hash(undefined, salt1)
      .then(() => {
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        expect(err.message).to.equal('You must provide a password and a salt');
        done();
      });
    });

    test('Rejects the Promise if no salt provided', function(done) {
      crypto.hash(PASS, undefined)
      .then(() => {
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        expect(err.message).to.equal('You must provide a password and a salt');
        done();
      });
    });

    test('Rejects the Promise if bcryptjs throws', function(done) {
      sinon.stub(bcrypt, 'hash')
      .callsArgWith(2, SIMULATED_ERR);

      crypto.hash(PASS, salt1)
      .then(() => {
        bcrypt.hash.restore();
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        bcrypt.hash.restore();
        expect(err).to.equal(SIMULATED_ERR);
        done();
      });
    });
  });

  experiment('CryptoUtils.compare', function() {
    const PASS = 'secret';
    const INCORRECT_PASS = 'incorrect';
    var crypto;
    var salt1;
    var hash1;

    before(function(done) {
      crypto = new CryptoUtils(CRYPTO_UTILS_VALID_SETTINGS);
      crypto.generateSalt()
      .then((genSalt) => {
        salt1 = genSalt;
        return crypto.hash(PASS, salt1);
      })
      .then((genHash) => {
        hash1 = genHash;
        done();
      })
      .catch((err) => {
        throw new Error('This should not get called');
      });
    });

    test('Can successfully compare a password and a hash', function(done) {
      crypto.compare(PASS, hash1)
      .then((match) => {
        expect(match).to.be.true();
        done();
      })
      .catch((err) => {
        expect('This callback should not be called').to.be.false();
        done();
      });
    });

    test('returns false if a password does not match the hash', function(done) {
      crypto.compare(INCORRECT_PASS, hash1)
      .then((match) => {
        expect(match).to.be.false();
        done();
      })
      .catch((err) => {
        expect('This callback should not be called').to.be.false();
        done();
      });
    });

    test('Rejects the Promise if no password provided', function(done) {
      crypto.compare(undefined, hash1)
      .then(() => {
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        expect(err.message).to.equal('You must provide a password and a hash');
        done();
      });
    });

    test('Rejects the Promise if no hash provided', function(done) {
      crypto.compare(PASS, undefined)
      .then(() => {
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        expect(err.message).to.equal('You must provide a password and a hash');
        done();
      });
    });

    test('Rejects the Promise if bcryptjs throws', function(done) {
      sinon.stub(bcrypt, 'compare')
      .callsArgWith(2, SIMULATED_ERR);

      crypto.compare(PASS, hash1)
      .then(() => {
        bcrypt.compare.restore();
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        bcrypt.compare.restore();
        expect(err).to.equal(SIMULATED_ERR);
        done();
      });
    });
  });

  experiment('CryptoUtils.generateToken', function() {
    var crypto;

    before(function(done) {
      crypto = new CryptoUtils(CRYPTO_UTILS_VALID_SETTINGS);
      done();
    });

    test('Generates a token', function(done) {
      crypto.generateToken()
      .then((token) => {
        expect(token).to.exist();
        expect(token).to.be.a.string();
        done();
      })
      .catch((err) => {
        expect('This callback should not be called').to.be.false();
        done();
      });
    });

    test('Rejects the Promise if crypto.randomBytes throws', function(done) {
      sinon.stub(nodeCrypto, 'randomBytes')
      .callsArgWith(1, SIMULATED_ERR);

      crypto.generateToken()
      .then(() => {
        nodeCrypto.randomBytes.restore();
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        nodeCrypto.randomBytes.restore();
        expect(err).to.equal(SIMULATED_ERR);
        done();
      });
    });
  });

  experiment('CryptoUtils.saltToken', function() {
    var crypto;
    var token;

    before(function(done) {
      crypto = new CryptoUtils(CRYPTO_UTILS_VALID_SETTINGS);
      crypto.generateToken()
      .then((genTok) => {
        token = genTok;
        done();
      })
      .catch(() => {
        throw new Error('This should not get called');
      });
    });

    test('Salts a token', function(done) {
      crypto.saltToken(token)
      .then((saltedToken) => {
        expect(saltedToken).to.exist();
        expect(saltedToken).to.be.a.string();
        done();
      })
      .catch((err) => {
        expect('This callback should not be called').to.be.false();
        done();
      });
    });

    test('Rejects the Promise if no token provided', function(done) {
      crypto.saltToken(undefined)
      .then(() => {
        expect('This callback should not be called').to.be.false();
        done();
      })
      .catch((err) => {
        expect(err.message).to.equal('You must provide a token');
        done();
      });
    });
  });
});
