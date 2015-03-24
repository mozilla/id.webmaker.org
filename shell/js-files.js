module.exports = (function () {
  var jsFiles = find(['watch.js', 'lib/', 'shell/', 'test/', 'web/']).filter(function(file) { return file.match(/\.js$/); });
  var jsFileString = '';

  jsFiles.forEach(function (file) {
    jsFileString += file + ' ';
  });

  return jsFileString;
})();
