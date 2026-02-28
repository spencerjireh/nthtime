-- V2__search_index.sql
-- Full-text search on challenge titles

ALTER TABLE challenges ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('english', title)) STORED;

CREATE INDEX idx_challenges_search ON challenges USING GIN(search_vector);
