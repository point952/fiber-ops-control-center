-- Criar tabela de conversas
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_id UUID REFERENCES operations(id),
    technician_id UUID REFERENCES auth.users(id),
    operator_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active'::text,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_operator BOOLEAN DEFAULT false
);

-- Criar tabela de usuários online
CREATE TABLE IF NOT EXISTS online_users (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_online BOOLEAN DEFAULT false,
    user_type TEXT NOT NULL CHECK (user_type IN ('technician', 'operator'))
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversations_technician_id ON conversations(technician_id);
CREATE INDEX IF NOT EXISTS idx_conversations_operator_id ON conversations(operator_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen);

-- Criar políticas de segurança
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- Políticas para conversas
CREATE POLICY "Operadores podem ver suas conversas"
    ON conversations FOR SELECT
    TO authenticated
    USING (operator_id = auth.uid());

CREATE POLICY "Técnicos podem ver suas conversas"
    ON conversations FOR SELECT
    TO authenticated
    USING (technician_id = auth.uid());

CREATE POLICY "Operadores podem criar conversas"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (operator_id = auth.uid());

-- Políticas para mensagens
CREATE POLICY "Usuários podem ver mensagens de suas conversas"
    ON messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.operator_id = auth.uid() OR conversations.technician_id = auth.uid())
        )
    );

CREATE POLICY "Usuários podem enviar mensagens em suas conversas"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.operator_id = auth.uid() OR conversations.technician_id = auth.uid())
        )
    );

-- Políticas para usuários online
CREATE POLICY "Qualquer um pode ver usuários online"
    ON online_users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários podem inserir seu próprio status"
    ON online_users FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio status"
    ON online_users FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Função para atualizar o timestamp de última mensagem
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de última mensagem
CREATE TRIGGER update_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE online_users; 