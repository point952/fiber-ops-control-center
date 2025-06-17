-- Drop existing tables if they exist
DROP TABLE IF EXISTS operation_history;
DROP TABLE IF EXISTS operations;

-- Create operations table
CREATE TABLE operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('installation', 'cto', 'rma')),
  data JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  technician_id UUID NOT NULL,
  assigned_operator TEXT,
  feedback TEXT,
  technician_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create operation_history table
CREATE TABLE operation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_id UUID NOT NULL REFERENCES operations(id),
  type TEXT NOT NULL CHECK (type IN ('installation', 'cto', 'rma')),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  technician TEXT NOT NULL,
  technician_id UUID NOT NULL,
  operator TEXT,
  feedback TEXT,
  technician_response TEXT
);

-- Create function to clean history daily
CREATE OR REPLACE FUNCTION clean_operation_history()
RETURNS void AS $$
BEGIN
  -- Move completed operations to history
  INSERT INTO operation_history (
    operation_id,
    type,
    data,
    created_at,
    completed_at,
    technician,
    technician_id,
    operator,
    feedback,
    technician_response
  )
  SELECT 
    id,
    type,
    data,
    created_at,
    completed_at,
    technician_id::text,
    technician_id,
    assigned_operator,
    feedback,
    technician_response
  FROM operations
  WHERE status = 'completed'
  AND completed_at < CURRENT_DATE;

  -- Delete completed operations from operations table
  DELETE FROM operations
  WHERE status = 'completed'
  AND completed_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the cleanup daily at midnight
SELECT cron.schedule(
  'clean-operation-history',
  '0 0 * * *',  -- Run at midnight every day
  $$SELECT clean_operation_history()$$
);

-- Enable Row Level Security
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Técnicos podem ver suas próprias operações" ON operations;
DROP POLICY IF EXISTS "Técnicos podem criar operações" ON operations;
DROP POLICY IF EXISTS "Técnicos podem atualizar suas próprias operações" ON operations;
DROP POLICY IF EXISTS "Operadores podem ver todas as operações" ON operations;
DROP POLICY IF EXISTS "Operadores podem atualizar operações" ON operations;
DROP POLICY IF EXISTS "Técnicos podem ver seu próprio histórico" ON operation_history;
DROP POLICY IF EXISTS "Operadores podem ver todo o histórico" ON operation_history;
DROP POLICY IF EXISTS "Sistema pode inserir no histórico" ON operation_history;
DROP POLICY IF EXISTS "Admin pode ver todo o histórico" ON operation_history;

-- Create policies for operations table
CREATE POLICY "Técnicos podem ver suas próprias operações"
  ON operations FOR SELECT
  TO authenticated
  USING (auth.uid() = technician_id);

CREATE POLICY "Técnicos podem criar operações"
  ON operations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Técnicos podem atualizar suas próprias operações"
  ON operations FOR UPDATE
  TO authenticated
  USING (auth.uid() = technician_id);

CREATE POLICY "Operadores podem ver todas as operações"
  ON operations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operadores podem atualizar operações"
  ON operations FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for operation_history table
CREATE POLICY "Técnicos podem ver seu próprio histórico"
  ON operation_history FOR SELECT
  TO authenticated
  USING (auth.uid()::text = technician_id::text);

CREATE POLICY "Operadores podem ver seu próprio histórico"
  ON operation_history FOR SELECT
  TO authenticated
  USING (operator = auth.uid()::text);

CREATE POLICY "Admin pode ver todo o histórico"
  ON operation_history FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Sistema pode inserir no histórico"
  ON operation_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON operations TO authenticated;
GRANT ALL ON operation_history TO authenticated; 