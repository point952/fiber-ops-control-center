-- Add operator_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'operations' 
        AND column_name = 'operator_id'
    ) THEN
        ALTER TABLE operations ADD COLUMN operator_id UUID REFERENCES auth.users(id);
    END IF;
END $$; 