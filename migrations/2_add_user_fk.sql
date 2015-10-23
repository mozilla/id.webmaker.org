BEGIN;

ALTER TABLE auth_codes
ADD FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE access_tokens
ADD FOREIGN KEY (user_id) REFERENCES users(id);

COMMIT;
