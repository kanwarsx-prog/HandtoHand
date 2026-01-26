-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) NOT NULL,
    user2_id UUID REFERENCES auth.users(id) NOT NULL,
    offer_id UUID REFERENCES offers(id), -- Optional: context for the chat
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user1_id, user2_id, offer_id) -- Prevent duplicate chats for same offer/pair
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can create conversations
CREATE POLICY "Users can create conversations" 
ON conversations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS: Users can view their own conversations
CREATE POLICY "Users can view own conversations" 
ON conversations FOR SELECT 
TO authenticated 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS: Users can insert messages into their conversations
CREATE POLICY "Users can send messages" 
ON messages FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

-- RLS: Users can view messages in their conversations
CREATE POLICY "Users can view messages" 
ON messages FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM conversations 
        WHERE id = conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);
