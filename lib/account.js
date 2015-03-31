var Boom = require('boom');
var hyperquest = require('hyperquest');

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
        return callback(Boom.create(message.statusCode, 'LoginAPI error', json));
      }

      try {
        json = JSON.parse(body);
      } catch (ex) {
        return callback(ex);
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
        uid: request.payload.uid
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
        newPassword: request.payload.password,
        appURL: config.uri + '/reset-password'
      }), 'utf8');
    },
    createUser: function(request, callback) {
      var resetRequest = hyperquest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ratelimit-ip': getIPAddress(request)
        },
        uri: loginAPI + '/api/v2/user/create'
      });

      resetRequest.on('error', callback);

      resetRequest.on('response', function(message) {
        parseMessage(message, function(err, json) {
          callback(err, json);
        });
      });

      resetRequest.end(JSON.stringify({
        user: {
          email: request.payload.email,
          username: request.payload.username,
          password: request.payload.password,
          mailingList: request.payload.feedback,
          prefLocale: request.payload.lang
        },
        audience: config.uri
      }), 'utf8');
    }
  };
};
