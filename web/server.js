var Hapi = require('hapi');
var Hoek = require('hoek');

module.exports = function(options) {
  var server = new Hapi.Server();
  server.connection({
    host: options.host,
    port: options.port
  })

  return server;
};
