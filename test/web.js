require("habitat").load("tests.env");

var Code = require("code");
var Lab = require("lab");
var lab = exports.lab = Lab.script();

var loginServer = require("./mock-login/server");
var server = require("../web/server");
var testCreds = require("./testCredentials");
var url = require("url");

lab.experiment("OAuth", function() {
  var s, s2, ls;
  const cookieSecret = "test".padEnd(32, "test");

  lab.before(async () => {
    const loginAPI = `http://${process.env.HOST}:3232`;

    s = await server({
      loginAPI: loginAPI,
      cookieSecret,
      oauth_clients: testCreds.clients,
      authCodes: testCreds.authCodes,
      accessTokens: testCreds.accessTokens,
      enableCSRF: false
    });

    s2 = await server({
      loginAPI: loginAPI,
      cookieSecret,
      oauth_clients: testCreds.clients,
      authCodes: testCreds.authCodes,
      accessTokens: testCreds.accessTokens,
      enableCSRF: true
    });

    ls = loginServer();
  });

  lab.beforeEach(async () => {
    try {
      return await ls.start();
    } catch (error) {
      Code.expect(error).to.be.undefined();
    }
  });

  lab.afterEach(async () => await ls.stop());

  lab.test("GET / Redirects to /signup", async () => {
    var request = {
      method: "GET",
      url: "/"
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(302);
    Code.expect(response.headers.location).to.equal("/signup");
  });

  lab.test("GET /signup returns 200, sets csrf cookie, and has security headers", async () => {
    var request = {
      method: "GET",
      url: "/signup"
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
    Code.expect(response.headers["set-cookie"]).to.match(/crumb=/);

    Code.expect(response.headers["strict-transport-security"]).to.equal("max-age=15768000");
    Code.expect(response.headers["x-xss-protection"]).to.equal("1; mode=block");
    Code.expect(response.headers["x-frame-options"]).to.equal("DENY");
    Code.expect(response.headers["x-download-options"]).to.equal("noopen");
    Code.expect(response.headers["x-content-type-options"]).to.equal("nosniff");

    Code.expect(response.headers["content-security-policy"]).to.equal(
      "base-uri 'self';" +
      "connect-src 'self';default-src 'none';font-src 'self' https://fonts.gstatic.com;" +
      "img-src 'self' data: https://www.google-analytics.com http://www.google-analytics.com;" +
      "script-src 'self' 'unsafe-eval' https://www.google-analytics.com http://www.google-analytics.com;" +
      "style-src 'self' https://fonts.googleapis.com"
    );
  });

  lab.test("POST Create User", async () => {
    var request = {
      method: "POST",
      url: "/create-user",
      payload: {
        email: "webmaker@example.com",
        username: "webmaker",
        password: "CantGuessThis1234",
        feedback: true,
        client_id: "test",
        lang: "en-US"
      }
    };

    const response = await s.inject(request);
    console.log(response.result); // eslint-disable-line no-console
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
    Code.expect(response.result.email).to.equal("webmaker@example.com");
    Code.expect(response.result.username).to.equal("webmaker");
  });

  lab.test("POST Create User - with CSRF Token Headers succeeds", async () => {
    var request = {
      method: "POST",
      url: "/create-user",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        email: "webmaker@example.com",
        username: "webmaker",
        password: "CantGuessThis123",
        feedback: true,
        client_id: "test",
        lang: "en-US"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
    Code.expect(response.result.email).to.equal("webmaker@example.com");
    Code.expect(response.result.username).to.equal("webmaker");
  });

  lab.test("POST Create User without lang attribute defaults to en-US", async () => {
    var request = {
      method: "POST",
      url: "/create-user",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        email: "webmaker@example.com",
        username: "webmaker",
        password: "CantGuessThis123",
        feedback: true,
        client_id: "test"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
    Code.expect(response.result.email).to.equal("webmaker@example.com");
    Code.expect(response.result.username).to.equal("webmaker");
    Code.expect(response.result.prefLocale).to.equal("en-US");
  });

  lab.test("POST Create User with lang attribute set", async () => {
    var request = {
      method: "POST",
      url: "/create-user",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        email: "webmaker@example.com",
        username: "webmaker",
        password: "CantGuessThis123",
        feedback: true,
        client_id: "test",
        lang: "it-CH"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
    Code.expect(response.result.email).to.equal("webmaker@example.com");
    Code.expect(response.result.username).to.equal("webmaker");
    Code.expect(response.result.prefLocale).to.equal("it-CH");
  });

  lab.test("POST Create User (invalid response)", async () => {
    var request = {
      method: "POST",
      url: "/create-user",
      payload: {
        email: "webmaker@example.com",
        username: "invalidResponse",
        password: "CantGuessThis1234",
        feedback: true,
        client_id: "test",
        lang: "en-US"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test("POST Create User (login API failure)", async () => {
    var request = {
      method: "POST",
      url: "/create-user",
      payload: {
        email: "webmaker@example.com",
        username: "notgonnawork",
        password: "CantGuessThis1234",
        feedback: true,
        client_id: "test",
        lang: "en-US"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test(
    "POST Create User returns 400 if the user provides a weak password",
    async () => {
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "weakpass",
          password: "password",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      const response = await s.inject(request);
      Code.expect(response.statusCode).to.equal(400);
      Code.expect(response.result.message).to.equal("Password not strong enough.");

    }
  );

  lab.test(
    "POST Create User returns 400 if no email param provided",
    async () => {
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          username: "webmaker",
          password: "CantGuessThis",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      const response = await s.inject(request);
      Code.expect(response.statusCode).to.equal(400);

    }
  );

  lab.test(
    "POST Create User returns 400 if no username param provided",
    async () => {
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          password: "CantGuessThis",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      const response = await s.inject(request);
      Code.expect(response.statusCode).to.equal(400);

    }
  );

  lab.test(
    "POST Create User returns 400 if no password param provided",
    async () => {
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "webmaker",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      const response = await s.inject(request);
      Code.expect(response.statusCode).to.equal(400);

    }
  );

  lab.test(
    "POST Create User returns 400 if no feedback param provided",
    async () => {
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "webmaker",
          password: "CantGuessThis",
          client_id: "test",
          lang: "en-US"
        }
      };

      const response = await s.inject(request);
      Code.expect(response.statusCode).to.equal(400);

    }
  );

  lab.test("POST Request Reset", async () => {
    var request = {
      method: "POST",
      url: "/request-reset",
      payload: {
        uid: "webmaker"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.status).to.equal("created");
  });

  lab.test("POST Request Reset - with CSRF Token Headers succeeds", async () => {
    var request = {
      method: "POST",
      url: "/request-reset",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        uid: "webmaker"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.status).to.equal("created");
  });

  lab.test("POST Request Reset - without CSRF Token Headers returns 403", async () => {
    var request = {
      method: "POST",
      url: "/request-reset",
      payload: {
        uid: "webmaker"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST Request Reset (failure)", async () => {
    var request = {
      method: "POST",
      url: "/request-reset",
      payload: {
        uid: "fail"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test("POST Request Reset (invalid response)", async () => {
    var request = {
      method: "POST",
      url: "/request-reset",
      payload: {
        uid: "invalidResponse"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test("POST Reset Password", async () => {
    var request = {
      method: "POST",
      url: "/reset-password",
      payload: {
        uid: "webmaker",
        resetCode: "resetCode",
        password: "UnguessablePassword"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.status).to.equal("success");
  });

  lab.test("POST Reset Password - With CSRF Token Headers succeeds", async () => {
    var request = {
      method: "POST",
      url: "/reset-password",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        uid: "webmaker",
        resetCode: "resetCode",
        password: "UnguessablePassword"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.status).to.equal("success");
  });

  lab.test("POST Reset Password - Without CSRF Token Headers returns 403", async () => {
    var request = {
      method: "POST",
      url: "/reset-password",
      payload: {
        uid: "webmaker",
        resetCode: "resetCode",
        password: "UnguessablePassword"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST Reset Password (bad code)", async () => {
    var request = {
      method: "POST",
      url: "/reset-password",
      payload: {
        uid: "webmaker",
        resetCode: "invalid",
        password: "UnguessablePassword"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(401);
    Code.expect(response.result.error).to.equal("Unauthorized");
  });

  lab.test("POST Reset Password (bad request)", async () => {
    var request = {
      method: "POST",
      url: "/reset-password",
      payload: {
        uid: "badRequest",
        resetCode: "resetCode",
        password: "UnguessablePassword"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.error).to.equal("Bad Request");
  });

  lab.test("POST Reset Password (invalid response)", async () => {
    var request = {
      method: "POST",
      url: "/reset-password",
      payload: {
        uid: "invalidResponse",
        resetCode: "resetCode",
        password: "UnguessablePassword"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test("POST login", async () => {
    var request = {
      method: "POST",
      url: "/login",
      payload: {
        uid: "webmaker",
        password: "password"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
  });

  lab.test("POST login - With CSRF Token Headers succeeds", async () => {
    var request = {
      method: "POST",
      url: "/login",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        uid: "webmaker",
        password: "password"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
  });

  lab.test("POST login - without CSRF Token headers returns 403", async () => {
    var request = {
      method: "POST",
      url: "/login",
      payload: {
        uid: "webmaker",
        password: "password"
      }
    };

    const response = await s2.inject(request);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST login - x-forwarded-for", async () => {
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

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.headers["set-cookie"]).to.exist();
  });

  lab.test("POST login - invalid json response", async () => {
    var request = {
      method: "POST",
      url: "/login",
      payload: {
        uid: "invalidResponse",
        password: "password"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(500);
    Code.expect(response.headers["set-cookie"]).to.be.undefined();
  });

  lab.test("POST login - unauthorized", async () => {
    var request = {
      method: "POST",
      url: "/login",
      payload: {
        uid: "webmaker",
        password: "fake"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(401);
    Code.expect(response.headers["set-cookie"]).to.be.undefined();
  });

  lab.test("GET logout", async () => {
    var request = {
      method: "GET",
      url: "/logout?client_id=test",
      credentials: {
        uid: "webmaker"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(302);
    Code.expect(response.headers["set-cookie"][0]).to.equal(
      "webmaker=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict; Path=/"
    );

    Code.expect(response.headers.location).to.exist();
    Code.expect(response.headers["cache-control"]).to.equal("no-cache");

    var redirectUri = url.parse(response.headers.location, true);

    Code.expect(redirectUri.protocol).to.equal("http:");
    Code.expect(redirectUri.host).to.equal("example.org");
    Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
    Code.expect(redirectUri.query.logout).to.equal("true");
  });

  lab.test("GET logout - no client_id", async () => {
    var request = {
      method: "GET",
      url: "/logout",
      credentials: {
        uid: "webmaker"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(302);
    Code.expect(response.headers["set-cookie"][0]).to.equal(
      "webmaker=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Strict; Path=/"
    );

    Code.expect(response.headers.location).to.exist();

    var redirectUri = url.parse(response.headers.location, true);

    Code.expect(redirectUri.protocol).to.equal("https:");
    Code.expect(redirectUri.host).to.equal("webmaker.org");
    Code.expect(redirectUri.query.logout).to.equal("true");
  });

  lab.test("GET logout - invalid client_id", async () => {
    var request = {
      method: "GET",
      url: "/logout?client_id=fake",
      credentials: {
        uid: "webmaker"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(400);
  });

  lab.test("GET authorize (response_type=code)", async () => {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user email&state=test&response_type=code",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(302);
    Code.expect(response.headers.location).to.exist();

    var redirectUri = url.parse(response.headers.location, true);

    Code.expect(redirectUri.protocol).to.equal("http:");
    Code.expect(redirectUri.host).to.equal("example.org");
    Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
    Code.expect(redirectUri.query.code).to.be.a.string();
    Code.expect(redirectUri.query.state).to.equal("test");
    Code.expect(redirectUri.query.client_id).to.equal("test");
  });

  lab.test("GET authorize (response_type=token)", async () => {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user email&response_type=token&state=test",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(302);
    Code.expect(response.headers.location).to.exist();

    var redirectUri = url.parse(response.headers.location, true);

    Code.expect(redirectUri.protocol).to.equal("http:");
    Code.expect(redirectUri.host).to.equal("example.org");
    Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
    Code.expect(redirectUri.hash).to.startWith("#token=");
  });

  lab.test("GET authorize (response_type=token), client not allowed to use", async () => {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test2&scopes=user email&state=test&response_type=token",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("GET authorize (response_type=code), client not allowed to use", async () => {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test3&scopes=user email&state=test&response_type=code",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("GET authorize - no session", async () => {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user&state=test&response_type=code"
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(302);
    Code.expect(response.headers.location).to.exist();

    var redirectUri = url.parse(response.headers.location, true);

    Code.expect(redirectUri.pathname).to.equal("/login");
    Code.expect(redirectUri.query.client_id).to.equal("test");
    Code.expect(redirectUri.query.scopes).to.equal("user");
    Code.expect(redirectUri.query.state).to.equal("test");
    Code.expect(redirectUri.query.response_type).to.equal("code");
  });

  lab.test("GET authorize - no session, signup action", async () => {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user&state=test&response_type=code&action=signup",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(302);
    Code.expect(response.headers.location).to.exist();

    var redirectUri = url.parse(response.headers.location, true);

    Code.expect(redirectUri.pathname).to.equal("/signup");
    Code.expect(redirectUri.query.client_id).to.equal("test");
    Code.expect(redirectUri.query.scopes).to.equal("user");
    Code.expect(redirectUri.query.state).to.equal("test");
    Code.expect(redirectUri.query.response_type).to.equal("code");
  });

  lab.test("GET authorize - invalid client_id", async () => {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=invalid&response_type=code&scopes=user&state=test",
      credentials: {
        username: "webmaker",
        email: "webmaker@example.org"
      }
    };

    const response = await s.inject(request);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid client_id");
  });

  lab.test("POST access_token", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&client_secret=test&grant_type=authorization_code&code=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.access_token).to.be.a.string();
    Code.expect(response.result.scopes).to.contain("user");
    Code.expect(response.result.token_type).to.equal("token");
  });

  lab.test("POST access_token - Without CSRF Token succeeds", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&client_secret=test&grant_type=authorization_code&code=test2",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s2.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.access_token).to.be.a.string();
    Code.expect(response.result.scopes).to.contain("user");
    Code.expect(response.result.token_type).to.equal("token");
  });

  lab.test("POST access_token - unknown client_id", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=fake&client_secret=test&grant_type=authorization_code&code=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
  });

  lab.test("POST access_token - mismatched client_id", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&client_secret=test&grant_type=authorization_code&code=mismatched",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST access_token - invalid client_secret", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&client_secret=fake&grant_type=authorization_code&code=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST access_token - invalid auth code", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&client_secret=test&code=fake&grant_type=authorization_code",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST access_token - invalid client id", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test2&client_secret=test2&grant_type=authorization_code&code=test2",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST access_token - invalid grant_type", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&client_secret=test&grant_type=client_credentials&code=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result).to.exist();
    Code.expect(response.result.message).to.equal("invalid payload: grant_type");
  });

  lab.test("POST access_token - missing client_id", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_secret=test&grant_type=authorization_code&code=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: client_id");
  });

  lab.test("POST access_token - missing client_secret", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&grant_type=authorization_code&code=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: client_secret");
  });

  lab.test("POST access_token - missing grant_type", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "client_id=test&client_secret=test&code=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: grant_type");
  });

  lab.test("POST access_token, password grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&password=password&scopes=user%20projects&grant_type=password&client_id=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.access_token).to.be.a.string();
    Code.expect(response.result.scopes).to.contain(["user", "projects"]);
    Code.expect(response.result.token_type).to.equal("token");
  });

  lab.test("POST access_token, password grant fails with invalid credentials", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=fail&password=password&scopes=user%20projects&grant_type=password&client_id=test",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("POST access_token, password grant fails with invalid client_id", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&password=password&scopes=user%20projects&grant_type=password&client_id=fake123",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid client_id");
  });

  lab.test("POST access_token - no code with password grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&password=password&scopes=user&client_id=test&code=test&grant_type=password",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: code");

  });

  lab.test("POST access_token - no client_secret with password grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&password=password&scopes=user&client_id=test&client_secret=test&grant_type=password",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: client_secret");
  });

  lab.test("POST access_token - uid required with password grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "password=password&scopes=user&client_id=test&grant_type=password",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: uid");
  });

  lab.test("POST access_token - password required with password grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&scopes=user&client_id=test&grant_type=password",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: password");
  });

  lab.test("POST access_token - no uid with authorization_code grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&client_id=test&client_secret=test&code=test&grant_type=authorization_code",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: uid");
  });

  lab.test("POST access_token - no password with authorization_code grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "password=password&scopes=user&client_id=test&" +
        "client_secret=test&code=test&grant_type=authorization_code",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: password");
  });

  lab.test("POST access_token - no scope with authorization_code grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "scopes=user&client_id=test&client_secret=test&code=test&grant_type=authorization_code",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: scopes");
  });

  lab.test("POST access_token - no uid with authorization_code grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&password=password&scopes=user&client_id=test&code=test&grant_type=authorization_code",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(400);
    Code.expect(response.result.message).to.equal("invalid payload: client_secret");
  });

  lab.test("POST access_token - client not allowed password grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "uid=webmaker&password=password&scopes=user&client_id=test2&grant_type=password",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(403);
    Code.expect(response.result.message).to.equal("Invalid Client Credentials");
  });

  lab.test("POST access_token - client not allowed authorization_code grant", async () => {
    var accessTokenRequest = {
      method: "POST",
      url: "/login/oauth/access_token",
      payload: "code=test&client_id=test3&client_secret=test3&grant_type=authorization_code",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    const response = await s.inject(accessTokenRequest);
    Code.expect(response.statusCode).to.equal(403);
    Code.expect(response.result.message).to.equal("Invalid Client Credentials");
  });

  lab.test("GET /user", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "token testAccessToken"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.username).to.equal("test");
    Code.expect(response.result.email).to.equal("test@example.com");
    Code.expect(response.result.scope).to.include(["user", "email"]);
  });

  lab.test("GET /user works with additional scopes set on token", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "token testAccessToken2"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.username).to.equal("test");
    Code.expect(response.result.email).to.equal("test@example.com");
    Code.expect(response.result.scope).to.include(["user", "email", "foo"]);
  });

  lab.test("GET /user returns 401 with malformed Authorization header", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "basic nonsenseauthheader"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("GET /user returns 401 with malformed Authorization header", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "token"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("GET /user returns 401 with invalid access token", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "token fakeToken"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("GET /user returns 401 with expired access token", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "token expiredAccessToken"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("GET /user returns 401 with no authorization header", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user"
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("GET /user returns 401 when token has insufficient scope", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "token invalidScope"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("GET /user returns 500 when loginAPI fails", async () => {
    var getUserRequest = {
      method: "GET",
      url: "/user",
      headers: {
        "authorization": "token getUserFail"
      }
    };

    const response = await s.inject(getUserRequest);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test("POST /request-migration-email succeeds", async () => {
    var migrationEmailRequest = {
      method: "POST",
      url: "/request-migration-email",
      payload: {
        uid: "test",
        oauth: {
          oauthy: "params"
        }
      }
    };

    const response = await s.inject(migrationEmailRequest);
    Code.expect(response.statusCode).to.equal(200);
  });

  lab.test("POST /request-migration-email with CSRF Token Headers succeeds", async () => {
    var migrationEmailRequest = {
      method: "POST",
      url: "/request-migration-email",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        uid: "test",
        oauth: {
          oauthy: "params"
        }
      }
    };

    const response = await s2.inject(migrationEmailRequest);
    Code.expect(response.statusCode).to.equal(200);
  });

  lab.test("POST /request-migration-email Without CSRF Token Headers returns 403", async () => {
    var migrationEmailRequest = {
      method: "POST",
      url: "/request-migration-email",
      payload: {
        uid: "test",
        oauth: {
          oauthy: "params"
        }
      }
    };

    const response = await s2.inject(migrationEmailRequest);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST /request-migration-email fails if user not found on loginapi", async () => {
    var migrationEmailRequest = {
      method: "POST",
      url: "/request-migration-email",
      payload: {
        uid: "fakeuser",
        oauth: {
          oauthy: "params"
        }
      }
    };

    const response = await s.inject(migrationEmailRequest);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test("POST /migrate-user", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      payload: {
        uid: "test",
        token: "kakav-nufuk",
        password: "Super-Duper-Strong-Passphrase-9001"
      }
    };

    const response = await s.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(200);
  });

  lab.test("POST /migrate-user - With CSRF Token Headers succeeds", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        uid: "test",
        token: "kakav-nufuk",
        password: "Super-Duper-Strong-Passphrase-9001"
      }
    };

    const response = await s2.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(200);
  });

  lab.test("POST /migrate-user - Without CSRF Token Headers returns 403", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      payload: {
        uid: "test",
        token: "kakav-nufuk",
        password: "Super-Duper-Strong-Passphrase-9001"
      }
    };

    const response = await s2.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST /migrate-user returns 401 if using invalid username", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      payload: {
        uid: "fake",
        token: "kakav-nufuk",
        password: "Super-Duper-Strong-Passphrase-9001"
      }
    };

    const response = await s.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("POST /migrate-user returns 401 if using bad token", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      payload: {
        uid: "test",
        token: "nufuk-kakav",
        password: "Super-Duper-Strong-Passphrase-9001"
      }
    };

    const response = await s.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(401);
  });

  lab.test("POST /migrate-user returns 400 if sent no password", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      payload: {
        uid: "test",
        token: "nufuk-kakav"
      }
    };

    const response = await s.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(400);
  });

  lab.test("POST /migrate-user returns 400 if sent a weak password", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      payload: {
        uid: "test",
        token: "nufuk-kakav",
        password: "password"
      }
    };

    const response = await s.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(400);
  });

  lab.test("POST /migrate-user returns 500 if set password fails on login", async () => {
    var migrateUserRequest = {
      method: "POST",
      url: "/migrate-user",
      payload: {
        uid: "test",
        token: "kakav-nufuk",
        password: "Super-Duper-Strong-Passphrase-9002"
      }
    };

    const response = await s.inject(migrateUserRequest);
    Code.expect(response.statusCode).to.equal(500);
  });

  lab.test("POST /check-username returns 200, exists & usePasswordLogin true", async () => {
    var checkUsernameRequest = {
      method: "POST",
      url: "/check-username",
      payload: {
        uid: "test"
      }
    };

    const response = await s.inject(checkUsernameRequest);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.exists).to.equal(true);
    Code.expect(response.result.usePasswordLogin).to.equal(true);
  });

  lab.test("POST /check-username - With CSRF Token Headers succeeds", async () => {
    var checkUsernameRequest = {
      method: "POST",
      url: "/check-username",
      headers: {
        "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
        "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
      },
      payload: {
        uid: "test"
      }
    };

    const response = await s2.inject(checkUsernameRequest);
    Code.expect(response.statusCode).to.equal(200);
    Code.expect(response.result.exists).to.equal(true);
    Code.expect(response.result.usePasswordLogin).to.equal(true);
  });

  lab.test("POST /check-username - Without CSRF Token Headers returns 403", async () => {
    var checkUsernameRequest = {
      method: "POST",
      url: "/check-username",
      payload: {
        uid: "test"
      }
    };

    const response = await s2.inject(checkUsernameRequest);
    Code.expect(response.statusCode).to.equal(403);
  });

  lab.test("POST /check-username returns 404 for non-existent user", async () => {
    var checkUsernameRequest = {
      method: "POST",
      url: "/check-username",
      payload: {
        uid: "nobody"
      }
    };

    const response = await s.inject(checkUsernameRequest);
    Code.expect(response.statusCode).to.equal(404);
  });
});
