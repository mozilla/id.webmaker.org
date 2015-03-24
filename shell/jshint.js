require('shelljs/global');
var jsFileString = require('./js-files');

exit(exec('node_modules/jshint/bin/jshint --config node_modules/mofo-style/linters/.jshintrc ' + jsFileString).code);
