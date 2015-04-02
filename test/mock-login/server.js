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
    },
    {
      method: 'POST',
      path: '/api/v2/user/request-reset-code',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker') {
          return reply({
            status: 'created'
          })
          .type('application/json');
        }

        if ( payload.uid === 'invalidResponse' ) {
          return reply('not json');
        }

        reply(Boom.badImplementation('Login API failure'));
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/reset-password',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker' ) {
          if ( payload.resetCode !== 'resetCode' ) {
            return reply(Boom.unauthorized('invalid code'));
          }

          return reply({
            status: 'success'
          })
          .type('application/json');
        }

        if ( payload.uid === 'badRequest' ) {
          return reply(Boom.badRequest('bad request'));
        }

        if ( payload.uid === 'invalidResponse' ) {
          return reply('not json');
        }

        reply(Boom.badImplementation('Login API failure'));
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/create',
      handler: function(request, reply) {
        var payload = request.payload;
        if ( payload.user.username === 'webmaker') {
          return reply({
            user: {
              username: 'webmaker',
              email: 'webmaker@example.com'
            }
          })
          .type('application/json');
        }

        if ( payload.user.username === 'invalidResponse' ) {
          return reply('not json');
        }

        reply(Boom.badImplementation('login API failure'));
      }
    },
    {
      method: 'GET',
      path: '/user/username/{username}',
      handler: function(request, reply) {
        var username = request.params.username;
        if ( username === 'test') {
          return reply({
            user: {
              username: 'test',
              email: 'test@example.com'
            }
          })
          .type('application/json');
        }

        reply(Boom.badImplementation('login API failure'));
      }
    }
  ]);

  return server;
};
