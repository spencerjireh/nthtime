-- GitHub logins are mutable, but until now identity was keyed on the login
-- (user-name-attribute: login -> stored as auth_accounts.provider_account_id). Renaming a
-- GitHub account therefore missed the lookup and minted a brand-new user, silently orphaning
-- the original (streak, attempts, settings, authored packs/tracks). See SPE-231.
--
-- The fix re-keys identity onto GitHub's stable numeric id and keeps the login as a separate
-- display handle.

ALTER TABLE auth_accounts ADD COLUMN login VARCHAR(255);

-- Seed the display handle from the value that currently holds the login.
UPDATE auth_accounts SET login = provider_account_id WHERE login IS NULL;

-- Targeted re-key of the one known real account (the project owner, GitHub login "spencerjireh"
-- -> stable id 58259316) so flipping user-name-attribute to `id` does not orphan it. Other
-- pre-migration accounts are intentionally NOT auto-migrated: re-keying by the mutable, reusable
-- login is an account-takeover vector (a renamed-away username can be reclaimed by someone else),
-- so any remaining legacy user simply re-authenticates as a fresh account. No-op where the row is
-- absent (test/local/CI).
UPDATE auth_accounts
SET provider_account_id = '58259316'
WHERE provider = 'github' AND provider_account_id = 'spencerjireh';
