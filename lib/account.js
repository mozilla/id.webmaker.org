var Boom = require('boom');
var hyperquest = require('hyperquest');
var url = require('url');

module.exports = function(config) {
  // https://basic:auth@login.server.org
  var loginAPI = config.loginAPI;

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
          return callback(Boom.create(message.statusCode, 'LoginAPI error', body));
        }
        return callback(Boom.create(message.statusCode, 'LoginAPI error', json));
      }

      try {
        json = JSON.parse(body);
      } catch (ex) {
        return callback(Boom.badImplementation('Error parsing response from Login server', ex));
      }

      callback(null, json);
    });
  }

  return {
    verifyPassword: function(request, callback) {
      var loginRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/verify-password'
      });

      loginRequest.on('error', callback);

      loginRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      loginRequest.end(JSON.stringify({
        password: request.payload.password,
        uid: request.payload.uid,
        user: {}
      }), 'utf8');
    },
    requestReset: function(request, callback) {
      var appURLObj = url.parse(config.uri + '/reset-password', true);
      appURLObj.query = request.payload.oauth;

      var resetRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/request-reset-code'
      });

      resetRequest.on('error', callback);

      resetRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      resetRequest.end(JSON.stringify({
        uid: request.payload.uid,
        appURL: url.format(appURLObj)
      }), 'utf8');
    },
    resetPassword: function(request, callback) {
      var resetRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/reset-password'
      });

      resetRequest.on('error', callback);

      resetRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      resetRequest.end(JSON.stringify({
        uid: request.payload.uid,
        resetCode: request.payload.resetCode,
        newPassword: request.payload.password
      }), 'utf8');
    },
    createUser: function(request, callback) {
      var createRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/create'
      });

      createRequest.on('error', callback);

      createRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
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
        audience: config.uri,
        teach: request.pre.isTeach
      }), 'utf8');
    },
    getUser: function(username, callback) {
      var getRequest = hyperquest({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        uri: loginAPI + '/user/username/' + username
      });

      getRequest.on('error', callback);

      getRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });
    },
    requestMigrateEmail: function(request, callback) {
      var appURLObj = url.parse(config.uri + '/migrate', true);
      appURLObj.query = request.payload.oauth;

      var migrateRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/request'
      });

      migrateRequest.on('error', callback);

      migrateRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      migrateRequest.end(JSON.stringify({
        uid: request.payload.username,
        appURL: url.format(appURLObj),
        migrateUser: true
      }), 'utf8');
    },
    verifyToken: function(request, callback) {
      var verifyRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/authenticateToken'
      });

      verifyRequest.on('error', callback);

      verifyRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      verifyRequest.end(JSON.stringify({
        uid: request.pre.username,
        token: request.payload.token
      }), 'utf8');
    },
    setPassword: function(request, username, password, callback) {
      var passwordRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/enable-passwords'
      });

      passwordRequest.on('error', callback);

      passwordRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      passwordRequest.end(JSON.stringify({
        uid: username,
        password: password
      }), 'utf8');
    },
    checkUsername: function(request, callback) {
      var usernameRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/exists'
      });

      usernameRequest.on('error', callback);

      usernameRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      usernameRequest.end(JSON.stringify({
        uid: request.payload.uid
      }), 'utf8');
    }
  };
};
