-- Restore Secure RLS Policy for Subscribers Table
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies on subscribers table
DROP POLICY IF EXISTS "Temp allow all deletes" ON subscribers;
DROP POLICY IF EXISTS "Admin can manage subscribers" ON subscribers;

-- Step 2: Recreate the secure admin-only policy
CREATE POLICY "Admin can manage subscribers" ON subscribers
  FOR ALL USING (is_admin());

-- Step 3: Verify the policy was created correctly
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'subscribers';

-- Expected result:
-- policyname: "Admin can manage subscribers"
-- cmd: "*" (applies to ALL operations)
-- qual: "is_admin()"
-- with_check: "is_admin()"
