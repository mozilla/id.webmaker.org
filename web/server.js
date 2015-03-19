var Hapi = require('hapi');
var Hoek = require('hoek');

module.exports = function(options) {
  var server = new Hapi.Server();
  server.connection({
    host: options.host,
    port: options.port
  })

  server.route([
    {
      method: 'GET',
      path: '/login/oauth/authorize',
      handler: function(request, reply) {
        reply('ok');
      }
    }, {
      method: 'POST',
      path: '/login/oauth/authorize',
      handler: function(request, reply) {
        reply('ok');
      }
    }, {
      method: 'POST',
      path: '/login/oauth/access_token',
      handler: function(request, reply) {
        reply('ok');
      }
    }
  ]);

  return server;
};
