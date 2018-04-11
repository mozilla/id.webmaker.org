var Boom = require('boom');
var hyperquest = require('hyperquest');
var url = require('url');

function getIPAddress(request) {
  // account for load balancer!
  if (request.headers['x-forwarded-for']) {
    return request.headers['x-forwarded-for'];
  }

  return request.info.remoteAddress;
}

function parseMessage(message, callback) {
  var bodyParts = [];
  var bytes = 0;

  message.on('data', function(c) {
    bodyParts.push(c);
    bytes += c.length;
  });

  message.on('end', function() {
    var body = Buffer.concat(bodyParts, bytes).toString('utf8');
    var json;

    if ( message.statusCode !== 200 ) {
      try {
        json = JSON.parse(body);
      } catch (ex) {
        return callback(new Boom('LoginAPI error', {
          statusCode: message.statusCode,
          data: body
        }));
      }
      return callback(new Boom('LoginAPI error', {
        statusCode: message.statusCode,
        data: json
      }));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return callback(Boom.badImplementation('Error parsing response from Login server', ex));
    }

    callback(null, json);
  });
}

const register = function(server, options) {
  // https://basic:auth@login.server.org
  var loginAPI = options.loginAPI;

  server.method('account.verifyPassword', function(request) {
    return new Promise(function(resolve, reject) {
      var loginRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/verify-password'
      });

      loginRequest.on('error', reject);

      loginRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      loginRequest.end(JSON.stringify({
        password: request.payload.password,
        uid: request.payload.uid,
        user: {}
      }), 'utf8');
    });
  });

  server.method('account.requestReset', function(request) {
    var appURLObj = url.parse(options.uri + '/reset-password', true);
    appURLObj.query = request.payload.oauth;

    return new Promise(function(resolve, reject) {
      var resetRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/request-reset-code'
      });

      resetRequest.on('error', reject);

      resetRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      resetRequest.end(JSON.stringify({
        uid: request.payload.uid,
        appURL: url.format(appURLObj)
      }), 'utf8');
    });
  });

  server.method('account.resetPassword', function(request) {
    return new Promise(function(resolve, reject) {
      var resetRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/reset-password'
      });

      resetRequest.on('error', reject);

      resetRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      resetRequest.end(JSON.stringify({
        uid: request.payload.uid,
        resetCode: request.payload.resetCode,
        newPassword: request.payload.password
      }), 'utf8');
    });
  });

  server.method('account.createUser', function(request) {
    return new Promise(function(resolve, reject) {
      var createRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/create'
      });

      createRequest.on('error', reject);

      createRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      createRequest.end(JSON.stringify({
        user: {
          email: request.payload.email,
          username: request.payload.username,
          mailingList: request.payload.feedback,
          prefLocale: request.payload.lang
        },
        oauth: {
          client_id: request.payload.client_id
        },
        password: request.payload.password,
        audience: options.uri
      }), 'utf8');
    });
  });

  server.method('account.getUser', function(userId, flags) {
    return new Promise(function(resolve, reject) {
      var getRequest = hyperquest({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        uri: loginAPI + '/user/id/' + userId
      });

      getRequest.on('error', function(err) {
        flags.ttl = 0;
        reject(err);
      });

      getRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (json && !json.user) {
            flags.ttl = 0;
          }

          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });
    });
  }, {
    cache: {
      segment: 'accounts.getUser',
      expiresIn: 1000 * 60,
      staleIn:  1000 * 30,
      staleTimeout: 100,
      generateTimeout: 1000
    }
  });

  server.method('account.requestMigrateEmail', function(request) {
    var appURLObj = url.parse(options.uri + '/migrate', true);
    appURLObj.query = request.payload.oauth;

    return new Promise(function(resolve, reject) {
      var migrateRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/request'
      });

      migrateRequest.on('error', reject);

      migrateRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      migrateRequest.end(JSON.stringify({
        uid: request.payload.uid,
        appURL: url.format(appURLObj),
        migrateUser: true
      }), 'utf8');
    });
  });

  server.method('account.verifyToken', function(request) {
    return new Promise(function(resolve, reject) {
      var verifyRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/authenticateToken'
      });

      verifyRequest.on('error', reject);

      verifyRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      verifyRequest.end(JSON.stringify({
        uid: request.pre.uid,
        token: request.payload.token
      }), 'utf8');
    });
  });

  server.method('account.setPassword', function(request, uid, password) {
    return new Promise(function(resolve, reject) {
      var passwordRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/enable-passwords'
      });

      passwordRequest.on('error', reject);

      passwordRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      passwordRequest.end(JSON.stringify({
        uid: uid,
        password: password
      }), 'utf8');
    });
  });

  server.method('account.checkUsername', function(request) {
    return new Promise(function(resolve, reject) {

      var usernameRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/exists'
      });

      usernameRequest.on('error', reject);

      usernameRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          if (err) {
            reject(err);
          } else {
            resolve(json);
          }
        });
      });

      usernameRequest.end(JSON.stringify({
        uid: request.payload.uid
      }), 'utf8');
    });
  });
};

const name = 'login-webmakerorg';

exports.plugin = {
  register,
  name
};
