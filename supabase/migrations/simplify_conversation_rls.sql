-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

-- Disable RLS temporarily to recreate policies
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Simple policies for conversation_participants (no recursion)
CREATE POLICY "Allow all for conversation_participants" 
ON conversation_participants 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Conversations policies
CREATE POLICY "Users can create conversations" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view all conversations" 
ON conversations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can update conversations" 
ON conversations FOR UPDATE 
TO authenticated 
USING (true);
