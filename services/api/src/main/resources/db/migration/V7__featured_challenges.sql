-- V7__featured_challenges.sql
--
-- Curator-scheduled daily challenge for the home dashboard.
-- `date` is the primary key so each day can have at most one featured
-- challenge. `challenge_id` is BIGINT to match the BIGSERIAL PK on
-- `challenges` (see V1). ON DELETE CASCADE removes stale rows if the
-- underlying challenge is ever deleted through admin sync.

CREATE TABLE featured_challenges (
    date          DATE PRIMARY KEY,
    challenge_id  BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_featured_challenges_challenge_id
    ON featured_challenges(challenge_id);
