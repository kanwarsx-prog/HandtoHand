-- Enable RLS on conversations and conversation_participants
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Conversations policies
-- Users can create conversations (we'll validate participants separately)
CREATE POLICY "Users can create conversations" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Users can view conversations they're part of
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

-- Users can update conversations they're part of
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

-- Conversation Participants policies
-- Users can add participants to conversations (we'll validate this in app logic)
CREATE POLICY "Users can add participants" 
ON conversation_participants FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Users can view participants of their conversations
CREATE POLICY "Users can view participants" 
ON conversation_participants FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM conversation_participants cp 
        WHERE cp.conversation_id = conversation_participants.conversation_id 
        AND cp.user_id = auth.uid()
    )
);
