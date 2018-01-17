var Boom = require('boom');
var Hapi = require('hapi');
var Joi = require('joi');
var Path = require('path');
var url = require('url');
var OAuthDB = require('../lib/oauth-db');
var Scopes = require('../lib/scopes');

var PassTest = require('pass-test');

var passTest = new PassTest({
  minLength: 8,
  maxLength: 256,
  minPhraseLength: 20,
  minOptionalTestsToPass: 2,
  allowPassphrases: true
});

module.exports = async function server(options) {
  var serverConfig = {
    debug: options.debug,
    routes: {
      security: true
    },
    host: options.host,
    port: options.port
  };

  if ( options.redisUrl ) {
    var redisUrl = require('redis-url').parse(options.redisUrl);
    serverConfig.cache = {
      engine: require('catbox-redis'),
      host: redisUrl.hostname,
      port: redisUrl.port,
      password: redisUrl.password
    };
  }

  var server = new Hapi.Server(serverConfig);

  if ( options.logging ) {
    await server.register({
      plugin: require('good'),
      options: {
        reporters: {
          bunyan: [{
            module: 'good-bunyan',
            args: [{
              response: '*',
              log: '*',
              error: '*',
              request: '*'
            }, {
              logger: require('bunyan').createLogger({
                name: 'id-webmaker-org',
                level: 'error'
              }),
              levels: {
                response: 'info',
                log: 'error',
                error: 'error',
                request: 'debug'
              }
            }]
          }]
        }
      }
    });
  }

  await server.register([
    require('hapi-auth-cookie'),
    require('inert'),
    require('scooter'),
    {
      plugin: require('blankie'),
      options: {
        defaultSrc: [
          '\'none\''
        ],
        styleSrc: [
          '\'self\'',
          'https://fonts.googleapis.com'
        ],
        imgSrc: [
          '\'self\'',
          'data:',
          'https://www.google-analytics.com',
          'http://www.google-analytics.com'
        ],
        scriptSrc: [
          '\'self\'',
          '\'unsafe-eval\'',
          'https://www.google-analytics.com',
          'http://www.google-analytics.com'
        ],
        fontSrc: [
          '\'self\'',
          'https://fonts.gstatic.com'
        ],
        generateNonces: false
      }
    }
  ]);

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

  function skipCSRF(request, h) { // eslint-disable-line no-unused-vars
    return true;
  }

  function isUniqueError(fieldName, err) {
    // SQLite and MariaDB/MySQL have conflicting error messages, and we don't know which DB the login server is using
    if (
      err &&
      // SQLite
      err.indexOf('Users.' + fieldName) !== -1 ||
      (
        // MariaDB/MySQL
        err.indexOf('ER_DUP_ENTRY') !== -1 &&
        err.indexOf(fieldName) !== -1
      )
    ) {
      return true;
    }
    return false;
  }

  await server.register({
    plugin: require('crumb'),
    options: {
      restful: true,
      skip: !options.enableCSRF ? skipCSRF : undefined,
      cookieOptions: {
        isSecure: options.secureCookies,
        isSameSite: false,
        isHttpOnly: false
      }
    }
  });

  await server.register({
    plugin: require('../lib/account'),
    options: {
      loginAPI: options.loginAPI,
      uri: options.uri
    }
  });

  var oauthDb = new OAuthDB(options.oauth_clients, options.authCodes, options.accessTokens);

  server.route([
    {
      method: 'GET',
      path: '/',
      handler(request, h) {
        return h.redirect('/signup');
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
      options: {
        validate: {
          query: {
            client_id: Joi.string().required(),
            response_type: Joi.string().valid('code', 'token'),
            scopes: Joi.string().required(),
            state: Joi.string().required(),
            action: Joi.string().optional().valid('signup', 'signin').default('signin')
          }
        },
        pre: [
          {
            assign: 'user',
            method(request, h) {
              if (request.auth.isAuthenticated) {
                return request.auth.credentials;
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

              return h.redirect(url.format(redirect)).takeover();
            }
          },
          {
            assign: 'client',
            async method(request, h) {
              return await oauthDb.getClient(request.query.client_id, h);
            }
          },
          {
            method(request, h) {
              if (
                request.pre.client.allowed_responses.indexOf(request.query.response_type) === -1
              ) {
                throw Boom.forbidden('Response type forbidden: ' + request.query.response_type);
              }

              return h.continue;
            }
          },
          {
            assign: 'scopes',
            method(request) {
              return request.query.scopes.split(' ');
            }
          },
          {
            assign: 'auth_code',
            async method(request, h) {
              if (request.query.response_type !== 'code') {
                return h.response();
              }

              try {
                return await oauthDb.generateAuthCode(
                  request.pre.client.client_id,
                  request.pre.user.id,
                  request.pre.scopes,
                  new Date(Date.now() + 60 * 1000).toISOString()
                );
              } catch (err) {
                throw Boom.badRequest('An error occurred processing your request', err);
              }
            }
          },
          {
            assign: 'access_token',
            async method(request, h) {
              if (request.query.response_type !== 'token') {
                return h.response();
              }

              return await oauthDb.generateAccessToken(
                request.pre.client.client_id,
                request.pre.user.id,
                request.pre.scopes
              );
            }
          }
        ]
      },
      handler(request, h) {
        var redirectObj = url.parse(request.pre.client.redirect_uri, true);
        redirectObj.search = null;

        if (request.query.response_type === 'token') {
          redirectObj.hash = 'token=' + request.pre.access_token;
        } else {
          redirectObj.query.code = request.pre.auth_code;
          redirectObj.query.client_id = request.query.client_id;
        }
        redirectObj.query.state = request.query.state;

        return h.redirect(url.format(redirectObj));
      }
    },
    {
      method: 'POST',
      path: '/login/oauth/access_token',
      options: {
        validate: {
          payload: {
            grant_type: Joi.any().valid('authorization_code', 'password').required(),
            code: Joi.string().when('grant_type', {
              is: 'authorization_code',
              then: Joi.required(),
              otherwise: Joi.forbidden()
            }),
            client_secret: Joi.string().when('grant_type', {
              is: 'authorization_code',
              then: Joi.required(),
              otherwise: Joi.forbidden()
            }),
            client_id: Joi.string().required(),
            uid: Joi.string().when('grant_type', {
              is: 'password',
              then: Joi.required(),
              otherwise: Joi.forbidden()
            }),
            password: Joi.string().when('grant_type', {
              is: 'password',
              then: Joi.required(),
              otherwise: Joi.forbidden()
            }),
            scopes: Joi.string().when('grant_type', {
              is: 'password',
              then: Joi.required(),
              otherwise: Joi.forbidden()
            })
          },
          failAction(request, h, error) {
            const { source , keys: [ key ] } = error.output.payload.validation;
            throw Boom.badRequest('invalid ' + source + ': ' + key);
          }
        },
        auth: false,
        plugins: {
          crumb: false
        },
        pre: [
          {
            assign: 'grant_type',
            method(request) {
              return request.payload.grant_type;
            }
          },
          {
            assign: 'client',
            async method(request) {
              const client = await oauthDb.getClient(request.payload.client_id);

              if (
                client.allowed_grants.indexOf(request.pre.grant_type) === -1 ||
                (
                  request.pre.grant_type === 'authorization_code' &&
                  client.client_secret !== request.payload.client_secret
                )
              ) {
                throw Boom.forbidden('Invalid Client Credentials');
              }

              return client;
            }
          },
          {
            assign: 'authCode',
            async method(request) {
              if ( request.pre.grant_type === 'password' ) {
                const json = await server.methods.account.verifyPassword(request);

                return {
                  user_id: json.user.id,
                  scopes: request.payload.scopes.split(' ')
                };
              }

              return await oauthDb.verifyAuthCode(request.payload.code, request.pre.client.client_id);
            }
          },
          {
            assign: 'accessToken',
            async method(request) {
              return await oauthDb.generateAccessToken(
                request.pre.client.client_id,
                request.pre.authCode.user_id,
                request.pre.authCode.scopes
              );
            }
          }
        ]
      },
      handler(request) {
        return {
          access_token: request.pre.accessToken,
          scopes: request.pre.authCode.scopes,
          token_type: 'token'
        };
      }
    },
    {
      method: 'POST',
      path: '/login',
      options: {
        pre: [
          {
            assign: 'user',
            async method(request) {
              const json = await server.methods.account.verifyPassword(request);

              return json.user;
            }
          }
        ]
      },
      handler(request) {
        request.cookieAuth.set(request.pre.user);
        return { status: 'Logged In' };
      }
    },
    {
      method: 'POST',
      path: '/request-reset',
      options:{
        auth: false
      },
      async handler(request) {
        return await server.methods.account.requestReset(request);
      }
    },
    {
      method: 'POST',
      path: '/reset-password',
      options:{
        auth: false
      },
      async handler(request) {
        return await server.methods.account.resetPassword(request);
      }
    },
    {
      method: 'POST',
      path: '/create-user',
      options: {
        auth: false,
        plugins: {
          crumb: false
        },
        cors: true,
        validate: {
          payload: {
            username: Joi.string().regex(/^[a-zA-Z0-9\-]{1,20}$/).required(), // eslint-disable-line no-useless-escape
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^\S{8,128}$/).required(),
            feedback: Joi.boolean().required(),
            client_id: Joi.string().required(),
            lang: Joi.string().default('en-US')
          },
          failAction(request, h, error) {
            const { source , keys: [ key ] } = error.output.payload.validation;
            throw Boom.badRequest('invalid ' + source + ': ' + key);
          }
        },
        pre: [
          {
            assign: 'username',
            method(request) {
              return request.payload.username;
            }
          },
          {
            assign: 'password',
            method(request) {
              var password = request.payload.password;
              var result = passTest.test(password);

              if ( !result.strong ) {
                var err = Boom.badRequest('Password not strong enough.', result);
                err.output.payload.details = err.data;
                throw err;
              }

              return password;
            }
          },
          {
            assign: 'client',
            async method(request) {
              return await oauthDb.getClient(request.payload.client_id);
            }
          }
        ]
      },
      async handler(request) {
        let json;

        try {
          json = await server.methods.account.createUser(request);
        } catch (err) {
          err.output.payload.data = err.data;
          throw err;
        }

        if ( json.login_error ) {
          if ( isUniqueError('username', json.login_error) ) {
            throw Boom.badRequest('That username is taken');
          } else if ( isUniqueError('email', json.login_error) ) {
            throw Boom.badRequest('An account exists for that email address');
          }

          throw Boom.badRequest(json.login_error);
        }

        request.cookieAuth.set(json.user);
        return json.user;
      }
    },
    {
      method: 'GET',
      path: '/logout',
      options: {
        auth: false,
        pre: [
          {
            assign: 'redirectUri',
            async method(request) {
              if ( !request.query.client_id ) {
                return 'https://webmaker.org';
              }

              const client = await oauthDb.getClient(request.query.client_id);

              return client.redirect_uri;
            }
          }
        ]
      },
      handler(request, h) {
        request.cookieAuth.clear();

        var redirectObj = url.parse(request.pre.redirectUri, true);
        redirectObj.query.logout = true;
        return h.redirect(url.format(redirectObj))
          .header('cache-control', 'no-cache');
      }
    },
    {
      method: 'GET',
      path: '/user',
      options: {
        auth: false,
        cors: true,
        pre: [
          {
            assign: 'requestToken',
            method(request) {
              var tokenHeader = request.headers.authorization || '';
              tokenHeader = tokenHeader.split(' ');

              if ( tokenHeader[0] !== 'token' || !tokenHeader[1] ) {
                throw Boom.unauthorized('Missing or invalid authorization header');
              }

              return tokenHeader[1];
            }
          },
          {
            assign: 'token',
            async method(request) {
              const token = await oauthDb.lookupAccessToken(request.pre.requestToken);

              if ( token.expires_at <= Date.now() ) {
                throw Boom.unauthorized('Expired token');
              }

              var tokenScopes = token.scopes;

              if ( tokenScopes.indexOf('user') === -1 && tokenScopes.indexOf('email') === -1 ) {
                throw Boom.unauthorized('The token does not have the required scopes');
              }

              return token;
            }
          },
          {
            assign: 'user',
            async method(request) {
              try {
                const json = await server.methods.account.getUser(request.pre.token.user_id);
                return json.user;
              } catch (err) {
                throw Boom.badImplementation(err);
              }
            }
          }
        ]
      },
      handler(request) {
        return Scopes.filterUserForScopes(
          request.pre.user,
          request.pre.token.scopes
        );
      }
    },
    {
      method: 'POST',
      path: '/request-migration-email',
      options: {
        auth: false
      },
      async handler(request) {
        try {
          await server.methods.account.requestMigrateEmail(request);
          return { status: 'migration email sent' };
        } catch (err) {
          throw Boom.badImplementation(err);
        }
      }
    },
    {
      method: 'POST',
      path: '/migrate-user',
      options: {
        auth: false,
        pre: [
          {
            assign: 'uid',
            method(request) {
              return request.payload.uid;
            }
          },
          {
            assign: 'password',
            method(request) {
              var password = request.payload.password;
              if ( !password ) {
                throw Boom.badRequest('No password provided');
              }

              var result = passTest.test(password);

              if ( !result.strong ) {
                throw Boom.badRequest('Password not strong enough');
              }

              return password;
            }
          },
          {
            assign: 'isValidToken',
            async method(request) {
              await server.methods.account.verifyToken(request);
              return true;
            }
          },
          {
            assign: 'user',
            async method(request) {
              const json = await server.methods.account.setPassword(
                request,
                request.pre.uid,
                request.pre.password
              );

              return json.user;
            }
          }
        ]
      },
      handler(request) {
        request.cookieAuth.set(request.pre.user);
        return { status: 'Logged in' };
      }
    },
    {
      method: 'POST',
      path: '/check-username',
      options: {
        auth: false
      },
      async handler(request) {
        return await server.methods.account.checkUsername(request);
      }
    }
  ]);

  return server;
};
