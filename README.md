# id.webmaker.org

[![Build Status](https://travis-ci.org/mozilla/id.webmaker.org.svg?branch=master)](https://travis-ci.org/mozilla/id.webmaker.org)

OAuth 2.0 identity provider for Webmaker

## To run

```
npm install
npm start
```

Make sure you configure all necessary environment variables (see below) before running. If you simply want the defaults set up for local development, you can use:

```
$> cp sample.env .env
```

Once, after cloning the repo but before running the code.


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

We haven't yet added any utilities to help load environment variables; you can do it yourself by typing in the following in your terminal:

e.g.
```
export HOST=0.0.0.0
export PORT=1234
export LOGINAPI=https://user:password@login.webmaker.org
export COOKIE_SECRET=topSecretPasswordForEncryptingCookies
export SECURE_COOKIES=true
export URI=https://id.webmaker.org
export GA_TRACKING_ID='UA-000000-01'
export GA_DEBUG='on'
export OPTIMIZELY_ID='206878104'
export OPTIMIZELY_ACTIVE='yes'
```

You can configure the following environment variables:

|Variable|About|
|--------|-----|
| HOST | host for this server. defaults to 0.0.0.0 |
| PORT | port of this server, defaults to 0 (a random port above 1024) |
| LOGINAPI | fully qualified login.wm.org URL e.g. https://user:password@login.webmaker.org |
| OAUTH_DB | JSON array of oauth clients e.g. ```[{"client_id":"test", "client_secret":"test", "redirect_uri":"http://localhost:3000/account"}]``` |
| AUTH_CODES | JSON Object containing oauth auth codes for testing purposes e.g. ```{"authcode": {"client_id": "test", "user_id": "test", "scopes":"user", "expiresAt": 1428342423255``` }} |
| ACCESS_TOKENS | JSON array of testing access tokens e.g. ```{access_token: 'testAccessToken', client_id: 'test', user_id: 'test', scopes: 'user', expires_at: 1428342423255 }``` |
| COOKIE_SECRET | A String value used to encrypt session cookies |
| SECURE_COOKIES | set to `true` to indicate that the user agent should transmit the cookie only over a secure channel |
| URI | The URI where the server is reachable at, used for reset email links |
| GA_TRACKING_ID | The tracking ID is a string like UA-000000-01 [more](https://support.google.com/analytics/answer/1032385?hl=en) |
| GA_DEBUG | if set to 'on' will enable debug logging to the console in `react-ga` |
| OPTIMIZELY_ID | Optimizely Project ID (not a secret) e.g. '206878104' |
| OPTIMIZELY_ACTIVE | If set to 'yes' (String) the project will include Optimizely snippet in the page load |

## Using OAuth2

For information on creating an OAuth2 application that relies on this server, see [`docs/oauth.md`](https://github.com/mozilla/id.webmaker.org/blob/develop/docs/oauth.md).
