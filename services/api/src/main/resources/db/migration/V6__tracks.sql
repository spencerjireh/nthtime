CREATE TABLE tracks (
    id               BIGSERIAL PRIMARY KEY,
    slug             VARCHAR(255) NOT NULL UNIQUE,
    title            VARCHAR(255) NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    long_description TEXT NOT NULL DEFAULT '',
    tags             TEXT[] NOT NULL DEFAULT '{}',
    author_user_id   BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pack_tracks (
    id         BIGSERIAL PRIMARY KEY,
    track_id   BIGINT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    pack_id    BIGINT NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
    position   INTEGER NOT NULL,
    UNIQUE (track_id, pack_id),
    UNIQUE (track_id, position)
);

CREATE INDEX idx_pack_tracks_pack ON pack_tracks(pack_id);
