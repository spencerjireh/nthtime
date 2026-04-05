-- Add optional prerequisites (array of pack slugs) to packs
ALTER TABLE packs ADD COLUMN prerequisites TEXT[] NOT NULL DEFAULT '{}';
