BEGIN;

CREATE TABLE IF NOT EXISTS "users"
(
  id bigserial NOT NULL,
  email varchar NOT NULL UNIQUE,
  username varchar NOT NULL UNIQUE,
  pref_locale varchar NOT NULL DEFAULT 'en-US',
  salted_hash varchar,
  CONSTRAINT users_id_pk PRIMARY KEY (id)
);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_username_idx ON users(username);

-- bump the nextval in the sequence to 1m, to avoid collisions with old user ids
SELECT setval('users_id_seq', 1000000, true);

CREATE TABLE IF NOT EXISTS "reset_codes"
(
  code varchar NOT NULL,
  valid boolean NOT NULL DEFAULT TRUE,
  user_id bigint NOT NULL REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reset_codes_pk PRIMARY KEY (code)
);

COMMIT;
