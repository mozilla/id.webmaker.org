CREATE TABLE IF NOT EXISTS "users"
(
  id bigserial NOT NULL,
  email varchar NOT NULL UNIQUE,
  username varchar NOT NULL UNIQUE,
  pref_locale varchar NOT NULL DEFAULT 'en-US',
  salted_hash varchar,
  CONSTRAINT users_id_pk PRIMARY KEY (id)
);

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

CREATE TABLE IF NOT EXISTS "clients"
(
  client_id varchar NOT NULL,
  client_secret varchar NOT NULL,
  allowed_grants jsonb NOT NULL,
  allowed_responses jsonb NOT NULL,
  redirect_uri varchar NOT NULL,
  CONSTRAINT clients_id_pk PRIMARY KEY (client_id)
);

CREATE TABLE IF NOT EXISTS "auth_codes"
(
  auth_code varchar NOT NULL,
  client_id varchar NOT NULL REFERENCES clients(client_id),
  user_id bigint NOT NULL REFERENCES users(id),
  scopes jsonb NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT auth_code_pk PRIMARY KEY (auth_code)
);

CREATE TABLE IF NOT EXISTS "access_tokens"
(
  access_token varchar NOT NULL,
  client_id varchar NOT NULL REFERENCES clients(client_id),
  user_id bigint NOT NULL REFERENCES users(id),
  scopes jsonb NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT salted_token_pk PRIMARY KEY (access_token)
);
