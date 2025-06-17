-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS online_users CASCADE;

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID REFERENCES operations(id),
    technician_id UUID REFERENCES auth.users(id),
    operator_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    sender_id UUID REFERENCES auth.users(id),
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    is_operator BOOLEAN NOT NULL
);

-- Create online users table
CREATE TABLE online_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT TRUE,
    user_type TEXT NOT NULL CHECK (user_type IN ('technician', 'operator'))
);

-- Create indexes
CREATE INDEX idx_conversations_operation ON conversations(operation_id);
CREATE INDEX idx_conversations_technician ON conversations(technician_id);
CREATE INDEX idx_conversations_operator ON conversations(operator_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conversations"
    ON conversations FOR SELECT
    USING (
        technician_id = auth.uid() OR
        operator_id = auth.uid()
    );

CREATE POLICY "Users can insert their own conversations"
    ON conversations FOR INSERT
    WITH CHECK (
        technician_id = auth.uid() OR
        operator_id = auth.uid()
    );

CREATE POLICY "Users can update their own conversations"
    ON conversations FOR UPDATE
    USING (
        technician_id = auth.uid() OR
        operator_id = auth.uid()
    );

CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.technician_id = auth.uid() OR conversations.operator_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert messages in their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.technician_id = auth.uid() OR conversations.operator_id = auth.uid())
        )
    );

CREATE POLICY "Users can view online users"
    ON online_users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own online status"
    ON online_users FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own online status"
    ON online_users FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Create functions
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW(),
        last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE online_users; 