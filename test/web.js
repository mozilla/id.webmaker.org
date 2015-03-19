var Code = require("code");
var Lab = require("lab");
var lab = exports.lab = Lab.script();
var server = require("../web/server");

lab.experiment("OAuth", function() {
  var s = server({});

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
    var request = {
      method: "POST",
      url: "/login/oauth/authorize"
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.result).to.equal("ok");

      done();
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
