var Hoek = require("hoek");

var options = {
  host: process.env.HOST,
  port: process.env.PORT
};

var server = require("./server")(options);

server.start(function(error) {
  Hoek.assert(!error, error);

  console.log('Server running at: %s', server.info.uri);
});
