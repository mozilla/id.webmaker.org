var Boom = require('boom');
var Hapi = require('hapi');

module.exports = function() {
  var server = new Hapi.Server({
    debug: false,
    host: process.env.HOST,
    port: 3232
  });

  server.route([
    {
      method: 'POST',
      path: '/api/v2/user/verify-password',
      handler(request, h) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker' && payload.password === 'password' ) {
          return h.response({
            user: {
              username: 'webmaker',
              id: '1',
              email: 'webmaker@example.com'
            }
          })
          .type('application/json');
        }

        if ( payload.uid === 'invalidResponse' ) {
          return 'not json';
        }

        throw Boom.unauthorized('Invalid username/email or password');
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/request-reset-code',
      handler(request, h) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker') {
          return h.response({
            status: 'created'
          })
          .type('application/json');
        }

        if ( payload.uid === 'invalidResponse' ) {
          return 'not json';
        }

        throw Boom.badImplementation('Login API failure');
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/reset-password',
      handler(request, h) {
        var payload = request.payload;
        if ( payload.uid === 'webmaker' ) {
          if ( payload.resetCode !== 'resetCode' ) {
            throw Boom.unauthorized('invalid code');
          }

          return h.response({
            status: 'success'
          })
          .type('application/json');
        }

        if ( payload.uid === 'badRequest' ) {
          throw Boom.badRequest('bad request');
        }

        if ( payload.uid === 'invalidResponse' ) {
          return 'not json';
        }

        throw Boom.badImplementation('Login API failure');
      }
    },
    {
      method: 'POST',
      path: '/api/v2/user/create',
      handler(request, h) {
        var payload = request.payload;
        if ( payload.user.username === 'webmaker') {
          return h.response({
            user: {
              username: 'webmaker',
              email: 'webmaker@example.com',
              prefLocale: payload.user.prefLocale || 'en-US'
            }
          })
          .type('application/json');
        }

        if ( payload.user.username === 'invalidResponse' ) {
          return 'not json';
        }

        if ( payload.user.username === 'jsonError' ) {
          return {
            error: 'LoginAPI error'
          };
        }

        if ( payload.user.username === 'weakpass' ) {
          return h.response()
            .code(400);
        }

        throw Boom.badImplementation('login API failure');
      }
    },
    {
      method: 'GET',
      path: '/user/id/{id}',
      handler(request, h) {
        var id = request.params.id;
        if ( id === '1') {
          return h.response({
            user: {
              username: 'test',
              id: '1',
              email: 'test@example.com'
            }
          })
          .type('application/json');
        }

        if ( id === 'jsonError' ) {
          return {
            error: 'Login API error'
          };
        }

        throw Boom.badImplementation('login API failure');
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/request',
      handler(request) {
        var username = request.payload.uid;
        if ( username === 'test' ) {
          return {
            status: 'Login Token Sent'
          };
        }

        throw Boom.badImplementation('Login Database error');
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/authenticateToken',
      handler(request) {
        var username = request.payload.uid;
        var token = request.payload.token;
        if ( username === 'test' ) {
          if ( token === 'kakav-nufuk' ) {
            return true;
          }
        }

        throw Boom.unauthorized('invalid username/password combination');
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/enable-passwords',
      handler(request) {
        var username = request.payload.uid;
        var password = request.payload.password;
        if ( username === 'test' ) {
          if ( password === 'Super-Duper-Strong-Passphrase-9001' ) {
            // success
            return {
              user: {
                username: 'test'
              }
            };
          }
        }

        throw Boom.badImplementation('Error setting password');
      }
    },
    {
      method: 'post',
      path: '/api/v2/user/exists',
      handler(request) {
        if ( request.payload.uid === 'test' ) {
          return {
            exists: true,
            usePasswordLogin: true
          };
        }

        throw Boom.notFound('user does not exist');
      }
    }
  ]);

  return server;
};
