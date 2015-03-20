var spawn = require('child_process').spawn;

var runCommand = function (cmd) {
  var args = cmd.split(" ");
  console.log( args[0], args.slice(1) );
  var thread = spawn(args[0], args.slice(1));
  thread.stdout.on("data", function(data) { console.log(data.toString("utf-8")); });
  thread.stderr.on("data", function(data) { console.error(data.toString("utf-8")); });
  thread.on("close", function(code) {
    console.log('child process [' + cmd + '] exited with code ' + code);
  });
};

var npm = "npm" + (process.platform === 'win32' ? ".cmd" : "");

runCommand(npm + ' start');
runCommand(npm + ' run watch-css');
runCommand(npm + ' run watch-js');
