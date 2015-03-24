var Boom = require('boom');
var Hapi = require('hapi');

module.exports = function() {
  var server = new Hapi.Server({ debug: false });
  server.connection({
    host: 'localhost',
    port: 3232
  });

  server.route([
    {
      method: 'POST',
      path: '/api/v2/user/verify-password',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker' && payload.password === 'password' ) {
          return reply({
            user: {
              username: 'webmaker',
              email: 'webmaker@example.com'
            }
          })
          .type('application/json');
        }

        if ( payload.uid === 'invalidResponse' ) {
          return reply('not json');
        }

        reply(Boom.unauthorized('Invalid username/email or password'));
      }
    }
  ]);

  return server;
};
