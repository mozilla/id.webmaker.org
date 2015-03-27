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
    cookieSecret: "test",
    oauth_clients: [
      {
        client_id: "test",
        client_secret: "test",
        redirect_uri: "http://example.org/oauth_redirect"
      },
      {
        client_id: "test2",
        client_secret: "test2",
        redirect_uri: "http://example2.org/oauth_redirect"
      }
    ]
  });

  var ls = loginServer({
    loginAPI: "http://localhost:3232"
  });

  lab.test("POST login", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        payload: {
          uid: "webmaker",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - x-forwarded-for", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        headers: {
          "x-forwarded-for": "192.168.1.1"
        },
        payload: {
          uid: "webmaker",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - invalid json response", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        payload: {
          uid: "invalidResponse",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        Code.expect(response.headers["set-cookie"]).to.be.undefined();
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - unauthorized", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        payload: {
          uid: "webmaker",
          password: "notThePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        Code.expect(response.headers["set-cookie"]).to.be.undefined();
        ls.stop(done);
      });
    });
  });

  lab.test("GET authorize", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user:email&state=test",
      credentials: {
        username: "webmaker",
        email: "webmaker@example.org"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.protocol).to.equal("http:");
      Code.expect(redirectUri.host).to.equal("example.org");
      Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
      Code.expect(redirectUri.query.code).to.be.a.string();
      Code.expect(redirectUri.query.state).to.equal("test");

      done();
    });
  });

  lab.test("GET authorize - no session", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user&state=test&response_type=code",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.pathname).to.equal("/login");
      Code.expect(redirectUri.query.client_id).to.equal("test");
      Code.expect(redirectUri.query.scopes).to.equal("user");
      Code.expect(redirectUri.query.state).to.equal("test");
      Code.expect(redirectUri.query.response_type).to.equal("code");

      done();
    });
  });

  lab.test("GET authorize - invalid client_id", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?uid=webmaker&password=password&client_id=invalid&scopes=user&state=test",
      credentials: {
        username: "webmaker",
        email: "webmaker@example.org"
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(400);
      Code.expect(response.result.message).to.equal("invalid client_id");

      done();
    });
  });

  var authTokenRequest = {
    method: "GET",
    url: "/login/oauth/authorize?client_id=test&scopes=user&state=test",
    credentials: {
      username: "webmaker",
      email: "webmaker@example.com"
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  lab.test("GET access_token", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "GET",
        url: "/login/oauth/access_token?client_id=test&client_secret=test&scopes=user",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(authTokenRequest, function(authTokResponse) {
        var redirectUri = url.parse(authTokResponse.headers.location, true);
        accessTokenRequest.url += "&code=" + redirectUri.query.code;

        s.inject(accessTokenRequest, function(response) {
          Code.expect(response.statusCode).to.equal(302);
          Code.expect(response.headers.location).to.exist();

          var redirectUri = url.parse(response.headers.location, true);

          Code.expect(redirectUri.protocol).to.equal("http:");
          Code.expect(redirectUri.host).to.equal("example.org");
          Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
          Code.expect(redirectUri.query.access_token).to.be.a.string();
          Code.expect(redirectUri.query.scopes).to.equal("user");
          Code.expect(redirectUri.query.type).to.equal("bearer");

          done();
        });
      });
    });
  });

  lab.test("GET access_token - unknown client_id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "GET",
        url: "/login/oauth/access_token?client_id=fake&client_secret=test&scopes=user",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(authTokenRequest, function(authTokResponse) {
        var redirectUri = url.parse(authTokResponse.headers.location, true);
        accessTokenRequest.url += "&code=" + redirectUri.query.code;

        s.inject(accessTokenRequest, function(response) {
          Code.expect(response.statusCode).to.equal(400);

          done();
        });
      });
    });
  });

  lab.test("GET access_token - invalid client_secret", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "GET",
        url: "/login/oauth/access_token?client_id=test&client_secret=fake&scopes=user",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(authTokenRequest, function(authTokResponse) {
        var redirectUri = url.parse(authTokResponse.headers.location, true);
        accessTokenRequest.url += "&code=" + redirectUri.query.code;

        s.inject(accessTokenRequest, function(response) {
          Code.expect(response.statusCode).to.equal(403);

          done();
        });
      });
    });
  });

  lab.test("GET access_token - invalid auth code", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "GET",
        url: "/login/oauth/access_token?client_id=test&client_secret=test&code=fake&scopes=user",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test("GET access_token - invalid client id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "GET",
        url: "/login/oauth/access_token?client_id=test2&client_secret=test2&scopes=user",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(authTokenRequest, function(authTokResponse) {
        var redirectUri = url.parse(authTokResponse.headers.location, true);
        accessTokenRequest.url += "&code=" + redirectUri.query.code;

        s.inject(accessTokenRequest, function(response) {
          Code.expect(response.statusCode).to.equal(403);
          done();
        });
      });
    });
  });
});
