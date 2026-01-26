-- First, drop the problematic policies if they exist
DROP POLICY IF EXISTS "Users can view participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can create conversations" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view own conversations" 
ON conversations FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own conversations" 
ON conversations FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants 
        WHERE conversation_id = conversations.id 
        AND user_id = auth.uid()
    )
);

-- Conversation Participants policies (simplified to avoid recursion)
CREATE POLICY "Users can add participants" 
ON conversation_participants FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can view participants" 
ON conversation_participants FOR SELECT 
TO authenticated 
USING (user_id = auth.uid() OR conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
));
