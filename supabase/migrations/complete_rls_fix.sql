-- Complete RLS reset and setup for messaging tables

-- First, disable RLS to clean up
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON conversations';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'conversation_participants') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON conversation_participants';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- For conversations: allow all authenticated users
CREATE POLICY "conversations_select_policy" 
ON conversations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "conversations_insert_policy" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "conversations_update_policy" 
ON conversations FOR UPDATE 
TO authenticated 
USING (true);

-- For conversation_participants: allow all authenticated users
CREATE POLICY "participants_select_policy" 
ON conversation_participants FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "participants_insert_policy" 
ON conversation_participants FOR INSERT 
TO authenticated 
WITH CHECK (true);
