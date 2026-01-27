-- Add is_admin column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- Create policy to allow admins to view all data (optional, simplified for MVP we use Service Role in actions)
-- But we might want RLS for the admin page fetch.
-- For now, the admin page uses Service Role client to fetch stats, which bypasses RLS.
-- So we just need this column to exist for the check.

-- Index for performance if looking up admins
CREATE INDEX IF NOT EXISTS "users_is_admin_idx" ON "users"("is_admin");
