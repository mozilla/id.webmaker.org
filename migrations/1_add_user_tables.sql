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

-- bump the nextval in the sequence to 1m, to avoid collisions with old user ids
SELECT setval('users_id_seq', 1000000, true);

CREATE TABLE IF NOT EXISTS "reset_codes"
(
  code varchar NOT NULL,
  valid boolean NOT NULL DEFAULT TRUE,
  user_id bigint NOT NULL REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX reset_codes_idx ON reset_codes (code);

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION generate_reset_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.code = gen_random_uuid();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_reset_code BEFORE INSERT ON reset_codes
FOR EACH ROW EXECUTE PROCEDURE generate_reset_code();

COMMIT;
