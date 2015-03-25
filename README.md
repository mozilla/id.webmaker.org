# id.webmaker.org

[![Build Status](https://travis-ci.org/mozilla/id.webmaker.org.svg?branch=master)](https://travis-ci.org/mozilla/id.webmaker.org)

OAuth 2.0 identity provider for Webmaker

## To run

Make sure you configure all necessary environment variables (see below) before running.

```
npm install
npm start
```

## Tasks

- `npm build` Build project.
- `npm run js-beautify` Run JS Beautifier on all JS files.
- `npm run jscs` Run JSCS on all JS files.
- `npm run jshint` Run JSHint on all JS files.
- `npm run validate` Ensure all JS files pass JSHint and JSCS rules defined in [mofo-style](https://github.com/MozillaFoundation/javascript-style-guide).
- `npm run watch` Build LESS and JS files when they change.
- `npm run watch:css` Build LESS files when they change.
- `npm run watch:js` Build JS files when they change.
- `npm start` Run the app.
- `npm run start:dev` Build JS and LESS files when they change.
- `npm test` Run automated tests.

## Environment

We haven't yet added any utilities to help load environment variables; you can do it yourself by typing in the following in your terminal:

e.g.
```
export HOST=0.0.0.0
export PORT=1234
export LOGINAPI=https://user:password@login.webmaker.org
```

You can configure the following environment variables:

```
HOST - host for this server. defaults to 0.0.0.0
PORT - port of this server, defaults to 0 (a random port above 1024)
LOGINAPI - fully qualified login.wm.org URL e.g. https://user:password@login.webmaker.org
OAUTH_DB - JSON array of oauth clients e.g.
  [{"client_id":"test","secret":"test","redirect_uri":"http://localhost:3000/account"}]
```
