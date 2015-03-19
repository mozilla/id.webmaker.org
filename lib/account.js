var hyperquest = require("hyperquest");

module.exports = function(config) {
  // https://basic:auth@login.server.org
  var loginAPI = config.loginAPI;

  function getIPAddress(request) {
    // account for load balancer!
    if (options.forceSSL) {
      return request.headers['x-forwarded-for'];
    }

    return request.info.remoteAddress;
  }

  return {
    verifyPassword: function(request, callback) {
      var loginRequest = hyperquest({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ratelimit-ip": getIPAddress(request)
        },
        uri: loginAPI + "/api/v2/user/verify-password"
      });

      loginRequest.on("error", callback);

      loginRequest.on("response", function(message) {
        var bodyParts = [];
        var bytes = 0;

        message.on('data', function (c) {
          bodyParts.push(c);
          bytes += c.length;
        });

        message.on('end', function () {
          var body = Buffer.concat(bodyParts, bytes).toString('utf8');
          var json;

          try {
            json = JSON.parse(body);
          } catch (ex) {
            return callback(ex);
          }

          if ( message.statusCode !== 200 || !json || json.error ) {
            return callback(message);
          }

          callback(null, json.user);
        });
      });

      loginRequest.end(JSON.stringify({
        password: request.payload.password,
        uid: request.payload.uid,
        user: {}
      }), 'utf8');
    }
  }
};
