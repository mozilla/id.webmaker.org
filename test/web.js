var Code = require("code");
var Lab = require("lab");
var lab = exports.lab = Lab.script();
var server = require("../web/server");
var loginServer = require("./mock-login/server");

lab.experiment("OAuth", function() {
  var s = server({
    loginAPI: "http://localhost:3232",
    debug: false
  });

  var ls = loginServer({
    loginAPI: "http://localhost:3232"
  });

  lab.test("GET authorize", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize"
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.equal("ok");

      done();
    });
  });

  lab.test("POST authorize", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login/oauth/authorize",
        payload: {
          uid: "webmaker",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.exist();
        Code.expect(response.result.username).to.equal("webmaker");
        Code.expect(response.result.email).to.equal("webmaker@example.com");

        done();
      });
    });
  });

  lab.test("POST authorize - x-forwarded-for", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login/oauth/authorize",
        headers: {
          "x-forwarded-for": "192.168.1.1",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        payload: "uid=webmaker&password=password"
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.exist();
        Code.expect(response.result.username).to.equal("webmaker");
        Code.expect(response.result.email).to.equal("webmaker@example.com");

        done();
      });
    });
  });

  lab.test("POST authorize - invalid json response", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login/oauth/authorize",
        payload: "uid=invalidResponse&password=password",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);

        done();
      });
    });
  });

  lab.test("POST authorize - unauthorized", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login/oauth/authorize",
        payload: "uid=not%20a%20user&password=password",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        Code.expect(response.result.message).to.equal("Invalid username/email or password");

        done();
      });
    });
  });

  lab.test("GET access_token", function(done) {
    var request = {
      method: "POST",
      url: "/login/oauth/access_token"
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.equal("ok");

      done();
    });
  });
});
