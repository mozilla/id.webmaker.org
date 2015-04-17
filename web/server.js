var Boom = require('boom');
var Hapi = require('hapi');
var Hoek = require('hoek');
var Joi = require('joi');
var Path = require('path');
var url = require('url');
var OAuthDB = require('../lib/oauth-db');
var Scopes = require('../lib/scopes');

var PassTest = require('pass-test');

var passTest = new PassTest({
  specialChars: {
    enabled: false
  },
  userValues: {
    enabled: true
  }
});

module.exports = function(options) {
  var server = new Hapi.Server({
    debug: options.debug
  });
  server.connection({
    host: options.host,
    port: options.port
  });

  server.register(require('hapi-auth-cookie'), function(err) {
    // MAYDAY, MAYDAY, MAYDAY!
    Hoek.assert(!err, err);

    server.auth.strategy('session', 'cookie', {
      password: options.cookieSecret,
      cookie: 'webmaker',
      ttl: 1000 * 60 * 60 * 24,
      isSecure: options.secureCookies,
      isHttpOnly: true
    });

    server.auth.default({
      strategy: 'session',
      mode: 'try'
    });
  });

  function skipCSRF(request, reply) {
    return true;
  }

  server.register({
    register: require('crumb'),
    options: {
      restful: true,
      skip: !options.enableCSRF ? skipCSRF : undefined
    }
  }, function(err) {
    Hoek.assert(!err, err);
  });

  var account = require('../lib/account')({
    loginAPI: options.loginAPI,
    uri: options.uri
  });

  var oauthDb = new OAuthDB(options.oauth_clients, options.authCodes, options.accessTokens);

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: function(request, reply) {
        reply.redirect('/signup');
      }
    },
    {
      method: 'GET',
      path: '/{params*}',
      handler: {
        file: {
          path: Path.join(__dirname, '../public/index.html')
        }
      }
    },
    {
      method: 'GET',
      path: '/assets/{param*}',
      handler: {
        directory: {
          path: Path.join(__dirname, '../public')
        }
      }
    },
    {
      method: 'GET',
      path: '/login/oauth/authorize',
      config: {
        pre: [
          {
            assign: 'user',
            method: function(request, reply) {
              if (request.auth.isAuthenticated) {
                return reply(request.auth.credentials);
              }

              var redirectUrl = '/login';
              if (request.query.action === 'signup') {
                redirectUrl = '/signup';
              }

              var redirect = url.parse(redirectUrl, true);
              redirect.query.client_id = request.query.client_id;
              redirect.query.response_type = request.query.response_type;
              redirect.query.state = request.query.state;
              redirect.query.scopes = request.query.scopes;

              reply().takeover().redirect(url.format(redirect));
            }
          },
          {
            assign: 'client',
            method: function(request, reply) {
              oauthDb.getClient(request.query.client_id, reply);
            }
          },
          {
            assign: 'auth_code',
            method: function(request, reply) {
              var scopes = request.query.scopes;
              var expiresAt = Date.now() + 60 * 1000;

              oauthDb.generateAuthCode(
                request.pre.client.client_id,
                request.pre.user.username,
                scopes,
                expiresAt,
                reply
              );
            }
          }
        ]
      },
      handler: function(request, reply) {
        var state = request.query.state;
        var redirectObj = url.parse(request.pre.client.redirect_uri, true);
        redirectObj.search = null;
        redirectObj.query.code = request.pre.auth_code;
        redirectObj.query.state = state;
        var redirectUri = url.format(redirectObj);

        reply.redirect(redirectUri);
      }
    },
    {
      method: 'POST',
      path: '/login/oauth/access_token',
      config: {
        validate: {
          payload: {
            code: Joi.string().required(),
            client_id: Joi.string().required(),
            client_secret: Joi.string().required(),
            grant_type: Joi.any().valid('authorization_code').required()
          },
          failAction: function(request, reply, source, error) {
            reply(Boom.badRequest('invalid ' + source + ': ' + error.data.details[0].path));
          }
        },
        auth: false,
        plugins: {
          crumb: false
        },
        pre: [
          {
            assign: 'client',
            method: function(request, reply) {
              oauthDb.getClient(request.payload.client_id, function(err, client) {
                if ( err ) {
                  return reply(err);
                }
                if ( client.client_secret !== request.payload.client_secret ) {
                  return reply(Boom.forbidden('Invalid Client Credentials'));
                }
                reply(client);
              });
            }
          },
          {
            assign: 'authCode',
            method: function(request, reply) {
              oauthDb.verifyAuthCode(request.payload.code, request.pre.client.client_id, reply);
            }
          },
          {
            assign: 'accessToken',
            method: function(request, reply) {
              oauthDb.generateAccessToken(
                request.pre.client.client_id,
                request.pre.authCode.user_id,
                request.pre.authCode.scopes,
                Date.now() + (1000 * 60 * 60 * 24),
                reply
              );
            }
          }
        ]
      },
      handler: function(request, reply) {
        var responseObj = {
          access_token: request.pre.accessToken.access_token,
          scopes: request.pre.accessToken.scopes,
          token_type: 'bearer'
        };

        reply(responseObj);
      }
    },
    {
      method: 'POST',
      path: '/login',
      config: {
        pre: [
          {
            assign: 'user',
            method: function(request, reply) {
              account.verifyPassword(request, function(err, json) {
                if ( err ) {
                  return reply(err);
                }

                reply(json.user);
              });
            }
          }
        ]
      },
      handler: function(request, reply) {
        request.auth.session.set(request.pre.user);
        reply({ status: 'Logged In' });
      }
    },
    {
      method: 'POST',
      path: '/request-reset',
      config:{
        auth: false
      },
      handler: function(request, reply) {
        account.requestReset(request, function(err, json) {
          if ( err ) {
            return reply(err);
          }

          reply(json);
        });
      }
    },
    {
      method: 'POST',
      path: '/reset-password',
      config:{
        auth: false
      },
      handler: function(request, reply) {
        account.resetPassword(request, function(err, json) {
          if ( err ) {
            return reply(err);
          }

          reply(json);
        });
      }
    },
    {
      method: 'POST',
      path: '/create-user',
      config: {
        auth: false,
        validate: {
          payload: {
            username: Joi.string().alphanum().min(1).max(20).required(),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^\S{8,128}$/).required(),
            feedback: Joi.boolean().required(),
            client_id: Joi.string().required()
          },
          failAction: function(request, reply, source, error) {
            reply(Boom.badRequest('invalid ' + source + ': ' + error.data.details[0].path));
          }
        },
        pre: [
          {
            assign: 'username',
            method: function(request, reply) {
              reply(request.payload.username);
            }
          },
          {
            assign: 'password',
            method: function(request, reply) {
              var password = request.payload.password;
              var result = passTest.test(password, [request.pre.username]);

              if ( !result.passed ) {
                var err = Boom.badRequest('Password not strong enough.', result);
                err.output.payload.details = err.data;
                return reply(err);
              }

              reply(password);
            }
          },
          {
            assign: 'client',
            method: function(request, reply) {
              oauthDb.getClient(request.payload.client_id, reply);
            }
          },
          {
            assign: 'isTeach',
            method: function(request, reply) {
              reply(!!request.pre.client.isTeach);
            }
          }
        ]
      },
      handler: function(request, reply) {
        account.createUser(request, function(err, json) {
          if ( err ) {
            err.output.payload.data = err.data;
            return reply(err);
          }
          if ( json.error ) {
            return reply(Boom.badRequest(json.error, json.login_error));
          }
          request.auth.session.set(json.user);
          reply(json.user);
        });
      }
    },
    {
      method: 'GET',
      path: '/logout',
      config: {
        auth: false,
        pre: [
          {
            assign: 'redirectUri',
            method: function(request, reply) {
              if ( !request.query.client_id ) {
                return reply('https://webmaker.org');
              }
              oauthDb.getClient(request.query.client_id, function(err, client) {
                if ( err ) {
                  return reply(err);
                }
                reply(client.redirect_uri);
              });
            }
          }
        ]
      },
      handler: function(request, reply) {
        request.auth.session.clear();

        var redirectObj = url.parse(request.pre.redirectUri, true);
        redirectObj.query.logout = true;
        reply.redirect(url.format(redirectObj))
          .header('cache-control', 'no-cache');
      }
    },
    {
      method: 'GET',
      path: '/user',
      config: {
        auth: false,
        pre: [
          {
            assign: 'requestToken',
            method: function(request, reply) {
              var tokenHeader = request.headers.authorization || '';
              tokenHeader = tokenHeader.split(' ');

              if ( tokenHeader[0] !== 'token' || !tokenHeader[1] ) {
                return reply(Boom.unauthorized('Missing or invalid authorization header'));
              }

              reply(tokenHeader[1]);
            }
          },
          {
            assign: 'token',
            method: function(request, reply) {
              oauthDb.lookupAccessToken(request.pre.requestToken, function(err, token) {
                if ( err ) {
                  return reply(err);
                }

                if ( token.expires_at <= Date.now() ) {
                  return reply(Boom.unauthorized('Expired token'));
                }

                var tokenScopes = token.scopes.split(' ');

                if ( tokenScopes.indexOf('user') === -1 && tokenScopes.indexOf('email') === -1 ) {
                  reply(Boom.unauthorized('The token does not have the required scopes'));
                }

                reply(token);
              });
            }
          },
          {
            assign: 'user',
            method: function(request, reply) {
              account.getUser(request.pre.token.user_id, function(err, json) {
                if ( err ) {
                  return reply(Boom.badImplementation(err));
                }
                reply(json.user);
              });
            }
          }
        ]
      },
      handler: function(request, reply) {
        var responseObj = Scopes.filterUserForScopes(
          request.pre.user,
          request.pre.token.scopes.split(' ')
        );

        reply(responseObj);
      }
    },
    {
      method: 'POST',
      path: '/request-migration-email',
      config: {
        auth: false
      },
      handler: function(request, reply) {
        account.requestMigrateEmail(request, function(err, json) {
          if ( err ) {
            return reply(Boom.badImplementation(err));
          }
          reply({ status: 'migration email sent' });
        });
      }
    },
    {
      method: 'POST',
      path: '/migrate-user',
      config: {
        auth: false,
        pre: [
          {
            assign: 'username',
            method: function(request, reply) {
              reply(request.payload.username);
            }
          },
          {
            assign: 'password',
            method: function(request, reply) {
              var password = request.payload.password;
              if ( !password ) {
                return reply(Boom.badRequest('No password provided'));
              }

              var result = passTest.test(password, [request.pre.username]);

              if ( !result.passed ) {
                return reply(Boom.badRequest('Password not strong enough'), result);
              }

              reply(password);
            }
          },
          {
            assign: 'isValidToken',
            method: function(request, reply) {
              account.verifyToken(request, function(err, json) {
                if ( err ) {
                  return reply(err);
                }

                reply(true);
              });
            }
          },
          {
            assign: 'user',
            method: function(request, reply) {
              account.setPassword(
                request,
                request.pre.username,
                request.pre.password,
                function(err, json) {
                  if ( err ) {
                    return reply(err);
                  }

                  reply(json.user);
                }
              );
            }
          }
        ]
      },
      handler: function(request, reply) {
        request.auth.session.set(request.pre.user);
        reply({ status: 'Logged in' });
      }
    },
    {
      method: 'POST',
      path: '/check-username',
      config: {
        auth: false
      },
      handler: function(request, reply) {
        account.checkUsername(request, function(err, json) {
          if ( err ) {
            return reply(err);
          }

          reply(json);
        });
      }
    }
  ]);

  return server;
};
