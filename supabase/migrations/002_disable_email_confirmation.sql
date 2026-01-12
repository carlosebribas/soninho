-- Disable email confirmation for development/testing
-- This allows users to login immediately after signup without email verification

-- Note: This is a configuration change that needs to be done in the Supabase Dashboard
-- Go to: Authentication → Providers → Email → Turn OFF "Confirm email"

-- Alternatively, you can enable auto-confirm for development by updating auth config
-- This SQL is just a placeholder reminder

-- To manually confirm existing users that are stuck in confirmation:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- For production, you should:
-- 1. Keep email confirmation enabled for security
-- 2. Configure SMTP settings properly (Settings → Auth → SMTP Settings)
-- 3. Use a service like SendGrid, Mailgun, or Resend
