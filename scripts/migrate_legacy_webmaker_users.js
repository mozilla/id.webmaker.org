/* jshint esnext: true */

// migrate_legacy_webmaker_users.js
// Imports users from a login.webmaker.org mysql database
// run this script between migrations/1_add_user_tables.sql and migrations/2_add_user_fk.sql
//
// execute from the project root
// node scripts/migrate_legacy_webmaker_users.js <WMLOGIN_DB_CONN_STRING> <WEBMAKER_DB_CONNSTRING>

'use strict';

const knex = require('knex');
const Hoek = require('hoek');

const wmloginConnString = process.argv[2];
const webmakerConnString = process.argv[3];

Hoek.assert(wmloginConnString, 'You must provide a connection string to a webmaker login database');
Hoek.assert(webmakerConnString, 'You must provide a connection string to a webmaker database');

let wmloginClient = knex({
  client: 'mysql',
  connection: wmloginConnString
});

let webmakerClient = knex({
  client: 'pg',
  connection: webmakerConnString
});

function insertRow(userRow) {
  let webmakerRow = {
    id: userRow.id,
    email: userRow.email,
    username: userRow.username,
    pref_locale: userRow.prefLocale,
    salted_hash: userRow.saltedHash || null
  };
  console.info('Migrating', webmakerRow.username);
  return webmakerClient('users').insert(webmakerRow);
}

function addToWebmaker(userRows) {
  return webmakerClient.transaction(function(txn) {
    Promise.all(userRows.map(insertRow))
    .then(txn.commit)
    .catch(txn.rollback);
  });
}

wmloginClient('Users')
.join('Passwords', 'Users.id', '=', 'Passwords.UserId')
.select('Users.id', 'Users.email', 'Users.username', 'Users.prefLocale', 'Passwords.saltedHash')
.then(addToWebmaker)
.then(function() {
  console.log('All done!');
  process.exit(0);
})
.catch(function(err) {
  console.error("Error occured: ", err);
  process.exit(1);
});
