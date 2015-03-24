var Boom = require("boom");
var Hapi = require('hapi');
var Hoek = require('hoek');
var OAuthDB = require('../lib/oauth-db');
var Path = require('path');
var url = require('url');

module.exports = function(options) {
  var server = new Hapi.Server({
    debug: options.debug
  });
  server.connection({
    host: options.host,
    port: options.port
  });

  var account = require("../lib/account")({
    loginAPI: options.loginAPI
  });

  var oauth_db = new OAuthDB(options.oauth_clients);

  server.route([
    {
        method: 'GET',
        path: '/{params*}',
        handler: {
          file: {
            path: Path.join(__dirname, '../public/index.html')
          }
        }
    }, {
        method: 'GET',
        path: '/assets/{param*}',
        handler: {
            directory: {
              path: Path.join(__dirname, '../public')
            }
        }
    }, {
      method: 'GET',
      path: '/login/oauth/authorize',
      handler: function(request, reply) {
        reply('ok');
      }
    }, {
      method: 'POST',
      path: '/login/oauth/authorize',
      config: {
        pre: [
          {
            assign: 'user',
            method: function(request, reply) {
              account.verifyPassword(request, function(err, user) {
                if ( err ) {
                  return reply(Boom.badImplementation(err));
                }
                if ( !user ) {
                  return reply(Boom.unauthorized("Invalid username/email or password"));
                }

                reply(user);
              });
            }
          },
          {
            assign: 'client',
            method: function(request, reply) {
              oauth_db.get_client(request.payload.client_id, reply);
            }
          },
          {
            assign: 'auth_code',
            method: function(request, reply) {
              var scopes = request.payload.scopes;
              var expires_at = Date.now() + 60 * 1000;

              oauth_db.generate_auth_code(request.pre.client.client_id, request.pre.user.username, scopes, expires_at, reply);
            }
          }
        ]
      },
      handler: function(request, reply) {
        var state = request.payload.state;
        var redirect_obj = url.parse(request.pre.client.redirect_uri, true);
        redirect_obj.search = null;
        redirect_obj.query.code = request.pre.auth_code;
        redirect_obj.query.state = state;
        var redirect_uri = url.format(redirect_obj);

        reply.redirect(redirect_uri);
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
