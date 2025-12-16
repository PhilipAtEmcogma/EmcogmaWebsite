-- Fix RLS Policy for Subscriber Deletion
-- Run this in your Supabase SQL Editor

-- 1. First, verify your admin email is in the admin_users table
SELECT * FROM admin_users WHERE email = 'emcogma@gmail.com';

-- 2. If the above returns no results, insert it:
INSERT INTO admin_users (email, active)
VALUES ('emcogma@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET active = true;

-- 3. Fix the is_admin() function to handle email case sensitivity
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verify the function works (should return true)
SELECT is_admin();

-- 5. Test if you can now delete by checking the policy
-- This should show you can delete subscribers
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'subscribers';

-- 6. Manual test: Try to delete a test subscriber
-- (Replace the UUID with your actual subscriber ID)
-- DELETE FROM subscribers WHERE id = 'c567e9de-9b67-4bc2-b27d-8b1fc1c34f2e';
