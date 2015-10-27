# id.webmaker.org
> OAuth 2.0 identity provider for Webmaker

[![Build Status](https://travis-ci.org/mozilla/id.webmaker.org.svg?branch=master)](https://travis-ci.org/mozilla/id.webmaker.org)
[![Code Climate](https://codeclimate.com/github/mozilla/id.webmaker.org/badges/gpa.svg)](https://codeclimate.com/github/mozilla/id.webmaker.org)
[![David-DM](https://david-dm.org/mozilla/id.webmaker.org.svg)](https://david-dm.org/mozilla/id.webmaker.org)

`id.webmaker.org` is an application with a [`hapi`](http://hapijs.com) backend and [`react`](http://facebook.github.io/react) frontend that serves as the OAuth 2.0 identity provider for [Webmaker](http://webmaker.org), as well as several other Mozilla Foundation applications.

## Prerequisites

- [Node](https://nodejs.org) and NPM, [installation](https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager)
- [Postgres](http://www.postgresql.org/), [installation](http://www.postgresql.org/download/)

## Up and Running

1. Fork and clone this repository
2. Navigate to the directory of the repository, e.g. `cd id.webmaker.org`
3. `npm install` to install dependencies
4. Set configuration variables, by default `cp sample.env .env` or `copy sample.env .env` on Windows
5. `npm start`
6. Navigate your browser to [`http://localhost:1234`](http://localhost:1234)

## Tests

To run all tests run the following command

```
npm test
```

### Front end tests

Front end tests can be run via mocha-phantom with `npm run test:browser`. You can also see the tests run in a browser if you run the app and visit `/assets/tests`.

#### How to add a new component test

Simply add it to the folder containing your component. The browser test command **automatically requires** all files matching `*.test.jsx` in the `templates/` folder.


## Environment

This project requires several environment variables be configured before it is able to run. It uses a library called [`habitat`](https://github.com/brianloveswords/habitat) to load configuration from a `.env` file, as well as process and cli configuration.

A [`sample.env` file](https://github.com/mozilla/id.webmaker.org/blob/develop/sample.env) is included with this repository. Create a copy of `sample.env` named `.env` to use the default configuration. See the "Up and Running" section above for more instructions on how to do this.

You can customize these variables by editing the `.env` file in the root directory of the repository.

You can configure the following environment variables:

|Variable|About|
|--------|-----|
| HOST | host for this server. defaults to 0.0.0.0 |
| PORT | port of this server, defaults to 0 (a random port above 1024) |
| URI | The URI where the server is reachable at, used for reset email links |
| COOKIE_SECRET | A String value used to encrypt session cookies |
| SECURE_COOKIES | set to `true` to indicate that the user agent should transmit the cookie only over a secure channel |
| REDIS_URL | URL of a redis server to use for caching. If unset, an in-memory cache will be used instead. |
| POSTGRE_CONNECTION_STRING | A connection string to a postgresql database, in the form of `postgre://user:pass@host:port/database` |
| POSTGRE_POOL_MIN | The minimum pool size for the postgresql connection |
| POSTGRE_POOL_MAX | The maximum pool size for the postgresql connection |
| BCRYPT_ROUNDS | The number of rounds to apply when hashing passwords with bcrypt |
| TOKEN_SALT | The server-wide salt to apply to auth codes, access tokens and reset codes for storage in the db |
| RANDOM_BYTE_COUNT | The amount of random bytes to generate when creating tokens/codes |
| RESET_EXPIRY_TIME | The time that a reset code expires in, in milliseconds from the time of the creation of the code |
| GA_TRACKING_ID | The tracking ID is a string like UA-000000-01 [more](https://support.google.com/analytics/answer/1032385?hl=en) |
| GA_DEBUG | if set to 'on' will enable debug logging to the console in `react-ga` |
| OPTIMIZELY_ID | Optimizely Project ID (not a secret) e.g. '206878104' |
| OPTIMIZELY_ACTIVE | If set to 'yes' (String) the project will include Optimizely snippet in the page load |

## Using OAuth2

For information on creating an OAuth2 application that relies on this server, see [`docs/oauth.md`](https://github.com/mozilla/id.webmaker.org/blob/develop/docs/oauth.md).
