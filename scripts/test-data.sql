-- Test account passwords (hashed with bcrypt)
-- webmaker - top-secret
-- webmaker2 - mozilla
-- webmaker3 - dontusepasswordasyourpassword
-- webmaker4 = top-secret
INSERT INTO users VALUES
 (1, 'webmaker@example.com', 'webmaker', 'en_US', '$2a$10$IylFUlgN/EiRVJaPEt3nVee401A9c2xz9fiRm8PpL5brvqTHybg5e' ),
 (2, 'webmaker2@example.com', 'webmaker2', 'en_US', '$2a$10$pIE9CHWnn/xYMURAqHtC6Od0XMzMGWKNCRIkvo2zlwV9GD0uUw0re' ),
 (3, 'webmaker3@example.com', 'webmaker3', 'en_US', '$2a$10$20XFnj6Xj6k5Nff57LHzauoGx.liRyjMVlAESu7aQjgqk7fQI4A9m' ),
 (4, 'webmaker4@example.com', 'webmaker4', 'en_US', '$2a$10$IylFUlgN/EiRVJaPEt3nVee401A9c2xz9fiRm8PpL5brvqTHybg5e' );

INSERT INTO clients VALUES
  ('test', 'test', '["password", "authorization_code"]'::jsonb, '["code", "token"]'::JSONB, 'http://example.org/oauth_redirect' ),
  ('test2', 'test2', '["authorization_code"]'::jsonb, '["code"]'::JSONB, 'http://example.org/2/oauth_redirect' ),
  ('test3', 'test3', '["password"]'::jsonb, '["token"]'::JSONB, 'http://example.org/3/oauth_redirect' );

INSERT INTO auth_codes VALUES
  -- 'test'
  ('5f44fbc4ef93be753889cd5a15080da4976adb7decf7fed27aed5310bb945a0b', 'test', 1, '["user"]'::jsonb, CURRENT_TIMESTAMP + INTERVAL '60 seconds' ),
  -- 'test2'
  ('8a368a7f8479c26d2f76b082462c3c14cb54a3250178af4fa0463476f97dd386', 'test', 1, '["user"]'::jsonb, CURRENT_TIMESTAMP + INTERVAL '60 seconds' ),
  -- 'expired'
  ('4f350ba0b172df16cd3e61206e9cf8e77e36a8cebc367feb30d0da251aef61a3', 'test', 2, '["user"]'::jsonb, CURRENT_TIMESTAMP - INTERVAL '60 seconds' ),
  -- 'mismatched'
  ('2fd8eba68a84c21d99eb3c2ab8a2cac961dc37dbcfdbba73804b18aae51e4ba9', 'test2', 3, '["user"]'::jsonb, CURRENT_TIMESTAMP + INTERVAL '60 seconds' );

INSERT INTO access_tokens VALUES
  -- 'testAccessToken'
  ('9cd559c6134517d260bb0c3b216d9c749d7c8904577f63b09bc0a9ed2f3edf1d', 'test', 1, '["user", "email"]'),
  -- 'testAccessToken2'
  ('742cf9c20f0a32ebd50ebe5fe43df1c1779825b9ca30deab8d581a6b19929805', 'test', 1, '["user", "email", "foo"]'),
  -- 'invalidScope'
  ('7fab08b70b1d912f93282bb3ca9e37ab79b81a2102c6b5a06e3d75bababe4564', 'test', 1, '["avatar"]');

INSERT INTO reset_codes VALUES -- (code, valid, user_id, created_at)
 -- 'TestResetCode_expired'
 ('f9854317a476953a0dcbf4b2f26d826d92dc587d060f6c884855ed3438e99b3c', 't', 1, '1990-01-28 22:30:00');
