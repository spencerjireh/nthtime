-- GitHub logins are mutable, but until now identity was keyed on the login
-- (user-name-attribute: login -> stored as auth_accounts.provider_account_id). Renaming a
-- GitHub account therefore missed the lookup and minted a brand-new user, silently orphaning
-- the original (streak, attempts, settings, authored packs/tracks). See SPE-231.
--
-- The fix re-keys identity onto GitHub's stable numeric id and keeps the login as a separate
-- display handle. The provider_account_id of existing rows still holds a login here; it is
-- re-keyed to the numeric id lazily on each user's next login (UserService.findOrCreateUser),
-- because that mapping needs the GitHub-supplied id and cannot be derived in SQL alone.

ALTER TABLE auth_accounts ADD COLUMN login VARCHAR(255);

-- Seed the display handle from the value that currently holds the login.
UPDATE auth_accounts SET login = provider_account_id WHERE login IS NULL;

-- Supports the login-based fallback match during the re-key window.
CREATE INDEX idx_auth_accounts_provider_login ON auth_accounts(provider, login);
