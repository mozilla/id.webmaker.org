var fs = require("fs");
var env = require("path").join(__dirname, "..", ".env");

if (fs.existsSync(env) || process.env.NODE_ENV == "production") process.exit(0);
fs.createReadStream("sample.env").pipe(fs.createWriteStream(env));
