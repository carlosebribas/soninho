-- Confirm all pending users (for development/testing only)
-- This will manually confirm all users that haven't confirmed their email yet

UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- This allows immediate login without email verification
