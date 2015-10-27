require('habitat').load();
require('newrelic');

var Hoek = require('hoek');

var options = {
  host: process.env.HOST,
  port: process.env.PORT,
  uri: process.env.URI,
  cookieSecret: process.env.COOKIE_SECRET,
  secureCookies: process.env.SECURE_COOKIES === 'true',
  enableCSRF: process.env.ENABLE_CSRF !== 'false',
  logging: process.env.LOGGING === 'true',
  logLevel: process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info',
  redisUrl: process.env.REDIS_URL,
  pgConnString: process.env.POSTGRE_CONNECTION_STRING,
  pgPoolMin: process.env.POSTGRE_POOL_MIN,
  pgPoolMax: process.env.POSTGRE_POOL_MAX,
  bcryptRounds: process.env.BCRYPT_ROUNDS,
  tokenSalt: process.env.TOKEN_SALT,
  randomByteCount: process.env.RANDOM_BYTE_COUNT,
  resetExpiryTime: process.env.RESET_EXPIRY_TIME
};

var server = require('./server')(options);

server.start(function(error) {
  Hoek.assert(!error, error);

  console.log('Server running at: %s', server.info.uri);
});
