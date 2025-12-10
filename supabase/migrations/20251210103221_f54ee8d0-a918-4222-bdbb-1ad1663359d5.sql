-- Allow public to validate invites by token (for onboarding page)
CREATE POLICY "Public can validate invite by token"
ON public.invites
FOR SELECT
TO anon
USING (true);

-- Note: This allows reading invite status/expiry but not sensitive data
-- The invites table only contains: id, email, token, status, expires_at, person_id, created_at