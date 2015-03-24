var Code = require("code");
var Lab = require("lab");
var lab = exports.lab = Lab.script();

var loginServer = require("./mock-login/server");
var server = require("../web/server");
var url = require("url");

lab.experiment("OAuth", function() {
  var s = server({
    debug: false,
    loginAPI: "http://localhost:3232",
    oauth_clients: [
      {
        client_id: "test",
        client_secret: "test",
        redirect_uri: "http://example.org/oauth_redirect",
      }
    ]
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
          password: "password",
          client_id: "test",
          scopes: "user:email",
          state: "test"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(302);
        Code.expect(response.headers["location"]).to.exist();

        var redirect_uri = url.parse(response.headers["location"], true);

        Code.expect(redirect_uri.protocol).to.equal("http:");
        Code.expect(redirect_uri.host).to.equal("example.org");
        Code.expect(redirect_uri.pathname).to.equal("/oauth_redirect");
        Code.expect(redirect_uri.query.code).to.be.a.string();
        Code.expect(redirect_uri.query.state).to.equal("test");

        ls.stop(done)
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
        payload: "uid=webmaker&password=password&client_id=test&scopes=user:email&state=test"
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(302);
        Code.expect(response.headers["location"]).to.exist();

        var redirect_uri = url.parse(response.headers["location"], true);

        Code.expect(redirect_uri.protocol).to.equal("http:");
        Code.expect(redirect_uri.host).to.equal("example.org");
        Code.expect(redirect_uri.pathname).to.equal("/oauth_redirect");
        Code.expect(redirect_uri.query.code).to.be.a.string();
        Code.expect(redirect_uri.query.state).to.equal("test");

        ls.stop(done)
      });
    });
  });

  lab.test("POST authorize - invalid client_id", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login/oauth/authorize",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        payload: "uid=webmaker&password=password&client_id=invalid&scopes=user:email&state=test"
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid client_id");

        ls.stop(done)
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

        ls.stop(done)
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

        ls.stop(done)
      });
    });
  });

  lab.test("POST access_token", function(done) {
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
