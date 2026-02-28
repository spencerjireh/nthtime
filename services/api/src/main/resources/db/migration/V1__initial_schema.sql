-- V1__initial_schema.sql

-- Users
CREATE TABLE app_users (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auth accounts (GitHub OAuth linkage)
CREATE TABLE auth_accounts (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    provider             VARCHAR(50) NOT NULL,
    provider_account_id  VARCHAR(255) NOT NULL,
    name                 VARCHAR(255),
    email                VARCHAR(320),
    image                TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_account_id)
);

CREATE INDEX idx_auth_accounts_user ON auth_accounts(user_id);

-- Packs
CREATE TABLE packs (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT NOT NULL DEFAULT '',
    language        VARCHAR(50) NOT NULL,
    framework       VARCHAR(100),
    version         VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    author          VARCHAR(255) NOT NULL DEFAULT '',
    tags            TEXT[] NOT NULL DEFAULT '{}',
    author_user_id  BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    visibility      VARCHAR(20) NOT NULL DEFAULT 'public',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_packs_slug ON packs(slug);
CREATE INDEX idx_packs_author ON packs(author_user_id);

-- Challenges
CREATE TABLE challenges (
    id                    BIGSERIAL PRIMARY KEY,
    pack_id               BIGINT NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
    slug                  VARCHAR(255) NOT NULL,
    title                 VARCHAR(500) NOT NULL,
    prompt                TEXT NOT NULL DEFAULT '',
    difficulty            VARCHAR(20) NOT NULL DEFAULT 'beginner',
    tags                  TEXT[] NOT NULL DEFAULT '{}',
    time_estimate_seconds INTEGER NOT NULL DEFAULT 300,
    hints                 TEXT[] NOT NULL DEFAULT '{}',
    assertions            JSONB NOT NULL DEFAULT '{"perFile": {}, "crossFile": []}',
    reference_solution    JSONB NOT NULL DEFAULT '[]',
    "order"               INTEGER NOT NULL DEFAULT 1,
    UNIQUE (pack_id, slug),
    UNIQUE (pack_id, "order")
);

CREATE INDEX idx_challenges_pack_order ON challenges(pack_id, "order");
CREATE INDEX idx_challenges_pack_slug ON challenges(pack_id, slug);

-- Attempts
CREATE TABLE attempts (
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    challenge_id      BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    passed            BOOLEAN NOT NULL,
    assertion_results JSONB NOT NULL DEFAULT '[]',
    hints_used        INTEGER NOT NULL DEFAULT 0,
    time_seconds      INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempts_user_challenge ON attempts(user_id, challenge_id);
CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_attempts_challenge ON attempts(challenge_id);

-- User settings
CREATE TABLE user_settings (
    id                     BIGSERIAL PRIMARY KEY,
    user_id                BIGINT NOT NULL UNIQUE REFERENCES app_users(id) ON DELETE CASCADE,
    show_pass_fail         BOOLEAN DEFAULT true,
    show_hints             BOOLEAN DEFAULT true,
    show_assertion_details BOOLEAN DEFAULT true,
    show_diff              BOOLEAN DEFAULT false,
    show_solution          BOOLEAN DEFAULT false,
    keybindings            VARCHAR(20) NOT NULL DEFAULT 'default',
    dark_mode              BOOLEAN NOT NULL DEFAULT true,
    formatter              JSONB NOT NULL DEFAULT '{"defaults":{"enabled":true,"trigger":"manual","tabSize":2,"useTabs":false},"overrides":{}}',
    file_stubs             BOOLEAN DEFAULT true,
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
