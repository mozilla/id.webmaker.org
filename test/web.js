var Code = require("code");
var Lab = require("lab");
var lab = exports.lab = Lab.script();

var loginServer = require("./mock-login/server");
var server = require("../web/server");
var testCreds = require("./testCredentials");
var url = require("url");

lab.experiment("OAuth", function() {
  var s = server({
    debug: false,
    loginAPI: "http://localhost:3232",
    cookieSecret: "test",
    oauth_clients: testCreds.clients,
    authCodes: testCreds.authCodes,
    accessTokens: testCreds.accessTokens
  });

  var ls = loginServer({
    loginAPI: "http://localhost:3232"
  });

  lab.test("POST Create User", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "webmaker",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        Code.expect(response.result.email).to.equal("webmaker@example.com");
        Code.expect(response.result.username).to.equal("webmaker");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Create User (invalid response)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "invalidResponse",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Create User (login API failure)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "notgonnawork",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Request Reset", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        payload: {
          uid: "webmaker"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal("created");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Request Reset (failure)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        payload: {
          uid: "fail"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Request Reset (invalid response)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        payload: {
          uid: "invalidResponse"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "webmaker",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal("success");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password (bad code)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "webmaker",
          resetCode: "invalid",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        Code.expect(response.result.error).to.equal("Unauthorized");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password (bad request)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "badRequest",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.error).to.equal("Bad Request");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password (invalid response)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "invalidResponse",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
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
          password: "fake"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        Code.expect(response.headers["set-cookie"]).to.be.undefined();
        ls.stop(done);
      });
    });
  });

  lab.test("GET logout", function(done) {
    var request = {
      method: "GET",
      url: "/logout?client_id=test",
      credentials: {
        uid: "webmaker"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers["set-cookie"][0]).to.equal(
        "webmaker=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; Path=/"
      );

      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.protocol).to.equal("http:");
      Code.expect(redirectUri.host).to.equal("example.org");
      Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
      Code.expect(redirectUri.query.logout).to.equal("true");

      ls.stop(done);
    });
  });

  lab.test("GET logout - no client_id", function(done) {
    var request = {
      method: "GET",
      url: "/logout",
      credentials: {
        uid: "webmaker"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers["set-cookie"][0]).to.equal(
        "webmaker=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; Path=/"
      );

      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.protocol).to.equal("https:");
      Code.expect(redirectUri.host).to.equal("webmaker.org");
      Code.expect(redirectUri.query.logout).to.equal("true");

      ls.stop(done);
    });
  });

  lab.test("GET logout - invalid client_id", function(done) {
    var request = {
      method: "GET",
      url: "/logout?client_id=fake",
      credentials: {
        uid: "webmaker"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(400);
      ls.stop(done);
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

  lab.test("POST access_token", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.access_token).to.be.a.string();
        Code.expect(response.result.scopes).to.equal("user");
        Code.expect(response.result.token_type).to.equal("bearer");
        done();
      });
    });
  });

  lab.test("POST access_token - unknown client_id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=fake&client_secret=test&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });
    });
  });

  lab.test("POST access_token - invalid client_secret", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=fake&grant_type=authorization_code&code=test",
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

  lab.test("POST access_token - invalid auth code", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&code=fake&grant_type=authorization_code",
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

  lab.test("POST access_token - invalid client id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test2&client_secret=test2&grant_type=authorization_code&code=test2",
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

  lab.test("POST access_token - invalid grant_type", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&grant_type=client_credentials&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result).to.exist();
        Code.expect(response.result.message).to.equal("invalid payload: grant_type");
        done();
      });
    });
  });

  lab.test("POST access_token - missing client_id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_secret=test&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: client_id");
        done();
      });
    });
  });

  lab.test("POST access_token - missing client_secret", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&grant_type=client_credentials&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: client_secret");
        done();
      });
    });
  });

  lab.test("POST access_token - missing grant_type", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: grant_type");
        done();
      });
    });
  });
});
