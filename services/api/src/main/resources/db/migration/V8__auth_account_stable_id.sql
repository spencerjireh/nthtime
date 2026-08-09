-- GitHub logins are mutable, but until now identity was keyed on the login
-- (user-name-attribute: login -> stored as auth_accounts.provider_account_id). Renaming a
-- GitHub account therefore missed the lookup and minted a brand-new user, silently orphaning
-- the original (streak, attempts, settings, authored packs/tracks). See SPE-231.
--
-- The fix re-keys identity onto GitHub's stable numeric id and keeps the login as a separate
-- display handle.
--
-- Existing rows are NOT auto-re-keyed here: their provider_account_id still holds a login, and
-- re-keying by the mutable, reusable login is an account-takeover vector (a renamed-away
-- username can be reclaimed by someone else). Any pre-migration user re-authenticates as a
-- fresh account; a known real account is re-keyed by a one-off manual UPDATE run against prod.

ALTER TABLE auth_accounts ADD COLUMN login VARCHAR(255);

-- Seed the display handle from the value that currently holds the login.
UPDATE auth_accounts SET login = provider_account_id WHERE login IS NULL;
