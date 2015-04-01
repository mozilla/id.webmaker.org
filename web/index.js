var Hoek = require('hoek');

var options = {
  host: process.env.HOST,
  port: process.env.PORT,
  loginAPI: process.env.LOGINAPI,
  oauth_clients: process.env.OAUTH_DB ? JSON.parse(process.env.OAUTH_DB) : [],
  cookieSecret: process.env.COOKIE_SECRET,
  secureCookies: process.env.SECURE_COOKIES === 'true',
  uri: process.env.URI
};

var server = require('./server')(options);

server.start(function(error) {
  Hoek.assert(!error, error);

  console.log('Server running at: %s', server.info.uri);
});
